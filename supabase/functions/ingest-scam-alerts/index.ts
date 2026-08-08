// Weekly ingestion of scam and fraud alerts from public government feeds.
//
// The Pause Hub was static because nothing ever created a new alert. This
// worker pulls recent items from published consumer-protection and security
// feeds, rewrites each one in the Coach Kay voice, and stores it as an
// UNPUBLISHED draft. Nothing reaches /pause-hub until an admin publishes it
// from /admin/scam-alerts.
//
// Two rules hold the trust line:
//   1. Every draft carries the real source_url it came from. No source, no row.
//   2. The voice pass may only restate facts present in the source item. It is
//      told to omit anything the source does not state, never to fill gaps.
//
// Authorization matches the other scheduled workers (see _shared/worker-auth.ts):
// the service-role credential the scheduler holds, or a signed-in admin using
// the manual "Run ingestion now" button.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { authorizeWorkerCaller } from "../_shared/worker-auth.ts";
import { generateReport } from "../_shared/generate-report.ts";
import { composeSystemPrompt } from "../_shared/coach-voice.ts";

interface Feed {
  label: string;
  url: string;
  defaultCategory: string;
}

const FEEDS: Feed[] = [
  {
    label: "FTC Consumer Alerts",
    url: "https://consumer.ftc.gov/blog/rss",
    defaultCategory: "Consumer scam",
  },
  {
    label: "CISA Cybersecurity Advisories",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    defaultCategory: "Security advisory",
  },
  {
    label: "FTC Press Releases",
    url: "https://www.ftc.gov/feeds/press-release.xml",
    defaultCategory: "Enforcement",
  },
];

// Keep the volume sane: a handful of drafts a week is reviewable, fifty is not.
const MAX_ITEMS_PER_FEED = 4;
const MAX_DRAFTS_PER_RUN = 6;
const LOOKBACK_DAYS = 21;

function json(body: unknown, status = 200, cors: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  published: string | null;
  feedLabel: string;
  defaultCategory: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(block: string, names: string[]): string {
  for (const name of names) {
    const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
    if (m) return decodeEntities(m[1]);
    // Atom self-closing link: <link href="..." />
    const attr = block.match(new RegExp(`<${name}[^>]*href=["']([^"']+)["']`, "i"));
    if (attr) return decodeEntities(attr[1]);
  }
  return "";
}

/** Minimal RSS/Atom reader. Feeds here are stable, well-formed government XML. */
function parseFeed(xml: string, feed: Feed): FeedItem[] {
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? [];
  const items: FeedItem[] = [];
  for (const block of blocks) {
    const title = pickTag(block, ["title"]);
    const link = pickTag(block, ["link", "id"]);
    const description = pickTag(block, ["description", "summary", "content"]);
    const published = pickTag(block, ["pubDate", "published", "updated", "dc:date"]) || null;
    if (!title || !link.startsWith("http")) continue;
    items.push({
      title: title.slice(0, 300),
      link: link.split(/\s/)[0],
      description: description.slice(0, 2000),
      published,
      feedLabel: feed.label,
      defaultCategory: feed.defaultCategory,
    });
  }
  return items;
}

function withinLookback(published: string | null): boolean {
  if (!published) return true;
  const ts = Date.parse(published);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts <= LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const THREAT_LEVELS = new Set(["red_flag", "caution", "watch", "resolved"]);

const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    body: { type: "string" },
    category: { type: "string" },
    threat_level: { type: "string", enum: ["red_flag", "caution", "watch", "resolved"] },
    action_rules: { type: "array", items: { type: "string" } },
    relevant: { type: "boolean" },
  },
  required: ["title", "summary", "body", "category", "threat_level", "action_rules", "relevant"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = composeSystemPrompt(
  "email-body",
  `ROLE: You are drafting an entry for the P.A.U.S.E. Check safety hub, a scam and hype alert feed for busy people who are new to AI.

You are given one item from a government or agency feed. Rewrite it as a hub alert.

ABSOLUTE FACT RULE: use only what the source item states. Never add a dollar figure, a victim count, a date, a company name, or a mechanism the source does not state. If the source is thin, write a shorter alert. Omission is correct. Invention is not.

Fields:
- title: plain, specific, under 70 characters. Name the scam or the risk, not the agency.
- summary: 1 to 2 sentences. What this is and who it targets.
- body: 3 to 5 short paragraphs. What is happening, how it reaches people, what it costs them in time or money if they fall for it. Direct, warm, no fear hooks, no shame.
- category: short label, 2 to 4 words.
- threat_level: red_flag only for active fraud costing people money right now. caution for a real risk that needs care. watch for something emerging. resolved for an action already taken or shut down.
- action_rules: 3 to 4 imperative one-liners the reader can do today. Concrete, not "be careful".
- relevant: false if this item is not useful to a consumer or small-business reader (internal agency notices, technical CVE bulletins with no consumer angle, unrelated policy news). When false the other fields can be brief.

Do not include the mantra sign-off. Do not include a source link in the body, the hub renders it separately.`,
);

interface Draft {
  title: string;
  summary: string;
  body: string;
  category: string;
  threat_level: string;
  action_rules: string[];
  relevant: boolean;
}

async function draftFromItem(item: FeedItem): Promise<Draft | null> {
  const result = await generateReport({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: [
      `SOURCE FEED: ${item.feedLabel}`,
      `SOURCE TITLE: ${item.title}`,
      `SOURCE PUBLISHED: ${item.published ?? "unknown"}`,
      `SOURCE TEXT: ${item.description || "(no summary text provided by the feed)"}`,
      `SOURCE URL: ${item.link}`,
    ].join("\n"),
    toolName: "draft_scam_alert",
    toolSchema: DRAFT_SCHEMA as unknown as Record<string, unknown>,
  });

  if (!result.ok) {
    console.error(`draft failed for ${item.link}: ${result.error}`);
    return null;
  }

  const d = result.data as Record<string, unknown>;
  const title = typeof d.title === "string" ? d.title.trim() : "";
  const summary = typeof d.summary === "string" ? d.summary.trim() : "";
  if (!title || !summary) return null;

  const rules = Array.isArray(d.action_rules)
    ? d.action_rules
        .filter((r): r is string => typeof r === "string")
        .map((r) => r.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const level = typeof d.threat_level === "string" && THREAT_LEVELS.has(d.threat_level)
    ? d.threat_level
    : "watch";

  return {
    title: title.slice(0, 200),
    summary: summary.slice(0, 600),
    body: typeof d.body === "string" ? d.body.trim() : "",
    category: (typeof d.category === "string" && d.category.trim()) || item.defaultCategory,
    threat_level: level,
    action_rules: rules,
    relevant: d.relevant !== false,
  };
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const auth = await authorizeWorkerCaller(req, supabaseUrl);
  if (!auth.ok) {
    console.warn(`ingest-scam-alerts denied: ${auth.reason}`);
    return json({ error: "Unauthorized" }, 401, cors);
  }

  const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // Existing source URLs and slugs, so a re-run never duplicates an alert.
  const { data: existing, error: existingError } = await supabase
    .from("scam_alerts")
    .select("source_url, slug");
  if (existingError) {
    return json({ error: `Could not read existing alerts: ${existingError.message}` }, 500, cors);
  }
  const seenUrls = new Set(
    (existing ?? []).map((r) => (r.source_url ?? "").trim()).filter(Boolean),
  );
  const seenSlugs = new Set((existing ?? []).map((r) => r.slug as string));

  const feedErrors: string[] = [];
  const candidates: FeedItem[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "FocusFlowAI-PauseHub/1.0 (+https://coachkayai.life/pause-hub)" },
      });
      if (!res.ok) {
        feedErrors.push(`${feed.label}: HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const fresh = parseFeed(xml, feed)
        .filter((i) => withinLookback(i.published))
        .filter((i) => !seenUrls.has(i.link))
        .slice(0, MAX_ITEMS_PER_FEED);
      candidates.push(...fresh);
    } catch (e) {
      feedErrors.push(`${feed.label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const inserted: string[] = [];
  const skipped: string[] = [];

  for (const item of candidates) {
    if (inserted.length >= MAX_DRAFTS_PER_RUN) break;

    const draft = await draftFromItem(item);
    if (!draft) {
      skipped.push(`${item.link} (draft failed)`);
      continue;
    }
    if (!draft.relevant) {
      skipped.push(`${item.link} (not consumer relevant)`);
      continue;
    }

    let slug = slugify(draft.title) || slugify(item.title);
    if (seenSlugs.has(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const { error } = await supabase.from("scam_alerts").insert({
      title: draft.title,
      slug,
      summary: draft.summary,
      body: draft.body,
      threat_level: draft.threat_level,
      category: draft.category,
      action_rules: draft.action_rules,
      source_url: item.link,
      source_feed: item.feedLabel,
      is_published: false,
      published_at: null,
    });

    if (error) {
      skipped.push(`${item.link} (insert failed: ${error.message})`);
      continue;
    }
    seenSlugs.add(slug);
    seenUrls.add(item.link);
    inserted.push(slug);
  }

  console.log(
    JSON.stringify({
      fn: "ingest-scam-alerts",
      candidates: candidates.length,
      drafted: inserted.length,
      skipped: skipped.length,
      feedErrors,
    }),
  );

  return json(
    {
      ok: true,
      candidates: candidates.length,
      drafted: inserted.length,
      drafts: inserted,
      skipped,
      feed_errors: feedErrors,
    },
    200,
    cors,
  );
});
