import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, ShieldCheck, Eye, CheckCircle2, ExternalLink, Bell, Radio } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import MobileNav from "@/components/MobileNav";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { webPage, breadcrumb, SITE_URL } from "@/lib/seo-schema";
import { toast } from "@/hooks/use-toast";
import NewsletterWaitlist from "@/components/NewsletterWaitlist";

type ThreatLevel = "red_flag" | "caution" | "watch" | "resolved";

interface ScamAlert {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  threat_level: ThreatLevel;
  category: string;
  action_rules: string[];
  source_url: string | null;
  published_at: string | null;
}

type Filter = "all" | ThreatLevel;

const THREAT_META: Record<ThreatLevel, { label: string; chip: string; ring: string; icon: typeof ShieldAlert }> = {
  red_flag: {
    label: "Red Flag",
    chip: "bg-destructive/15 text-destructive border-destructive/40",
    ring: "ring-destructive/30",
    icon: ShieldAlert,
  },
  caution: {
    label: "Caution",
    chip: "bg-primary/15 text-primary border-primary/40",
    ring: "ring-primary/30",
    icon: Eye,
  },
  watch: {
    label: "Watch",
    chip: "bg-muted text-muted-foreground border-border",
    ring: "ring-border",
    icon: Bell,
  },
  resolved: {
    label: "Resolved",
    chip: "bg-card text-muted-foreground/70 border-border/60 line-through",
    ring: "ring-border/40",
    icon: ShieldCheck,
  },
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "red_flag", label: "Red Flag" },
  { id: "caution", label: "Caution" },
  { id: "watch", label: "Watch" },
  { id: "resolved", label: "Resolved" },
];

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function PauseHub() {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [flashing, setFlashing] = useState<Set<string>>(new Set());
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [tick, setTick] = useState(0);

  // Tick every 10s so "updated Xs ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const flashCard = (id: string) => {
    setFlashing((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setFlashing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("scam_alerts")
        .select("id, title, slug, summary, body, threat_level, category, action_rules, source_url, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false });
      if (cancelled) return;
      if (error) {
        console.error("Failed to load scam alerts", error);
      } else {
        setAlerts((data ?? []) as ScamAlert[]);
        setLastUpdate(Date.now());
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime subscription — new published alerts slide in live.
  useEffect(() => {
    const channel = supabase
      .channel("scam_alerts_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scam_alerts" },
        (payload) => {
          const row = payload.new as ScamAlert & { is_published: boolean };
          if (!row.is_published) return;
          setAlerts((prev) => (prev.some((a) => a.id === row.id) ? prev : [row, ...prev]));
          setLastUpdate(Date.now());
          flashCard(row.id);
          toast({ title: "New alert published", description: row.title });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scam_alerts" },
        (payload) => {
          const row = payload.new as ScamAlert & { is_published: boolean };
          setAlerts((prev) => {
            const without = prev.filter((a) => a.id !== row.id);
            return row.is_published ? [row, ...without] : without;
          });
          setLastUpdate(Date.now());
          if (row.is_published) flashCard(row.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "scam_alerts" },
        (payload) => {
          const row = payload.old as { id: string };
          setAlerts((prev) => prev.filter((a) => a.id !== row.id));
          setLastUpdate(Date.now());
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(
    () => (active === "all" ? alerts : alerts.filter((a) => a.threat_level === active)),
    [alerts, active]
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: alerts.length, red_flag: 0, caution: 0, watch: 0, resolved: 0 };
    alerts.forEach((a) => {
      c[a.threat_level] += 1;
    });
    return c;
  }, [alerts]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const jsonLd = [
    webPage("/pause-hub", "P.A.U.S.E. Check — AI Scam & Safety Hub", "CollectionPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "P.A.U.S.E. Check", path: "/pause-hub" },
      ],
      "/pause-hub"
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/pause-hub#alerts`,
      name: "Coach Kay P.A.U.S.E. Check Alerts",
      numberOfItems: alerts.length,
      itemListElement: alerts.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="P.A.U.S.E. Check — AI Scams, Traps & Safety Alerts"
        description="Before you click, swipe, or pay — the P.A.U.S.E. Check tracks active AI scams, overhyped trends, and productivity traps targeting working families."
        path="/pause-hub"
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden className="text-primary font-medium">Focus</span>
          <span aria-hidden className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-8 max-w-4xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
          P.A.U.S.E. CHECK · LIVE SAFETY HUB
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Before you click, swipe, or pay.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Active AI scams, overhyped trends, and productivity traps — tracked in plain English for
          single parents, second-chance seekers, and working families. Updated live. No paywall.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-primary"
            aria-label="Live feed"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <Radio className="h-3 w-3" strokeWidth={2} />
            Live · auto-updating
          </span>
          <span className="text-[11px] text-muted-foreground/70" key={tick}>
            {alerts.length} active · updated {timeAgo(new Date(lastUpdate).toISOString()) || "just now"}
          </span>
        </div>
      </section>

      {/* FILTERS */}
      <section className="relative z-10 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {FILTERS.map((f) => {
            const isActive = f.id === active;
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={
                  isActive
                    ? "rounded-full border border-primary/60 bg-primary/15 text-primary px-3.5 py-1.5 text-xs tracking-wide transition-all"
                    : "rounded-full border border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:border-primary/30 px-3.5 py-1.5 text-xs tracking-wide transition-all"
                }
              >
                {f.label}
                <span className="ml-1.5 text-muted-foreground/70">{counts[f.id]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEED */}
      <section className="relative z-10 px-6 sm:px-10 max-w-4xl mx-auto py-10">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-card/30 p-6 h-40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">No alerts in this category right now.</p>
          </div>
        ) : (
          <AnimatedSection>
            <div className="space-y-4">
              {filtered.map((a) => {
                const meta = THREAT_META[a.threat_level];
                const Icon = meta.icon;
                const isOpen = expanded.has(a.id);
                const isFlashing = flashing.has(a.id);
                return (
                  <article
                    key={a.id}
                    className={`rounded-xl border bg-card/40 p-5 sm:p-6 transition-all hover:border-primary/30 ring-1 ${meta.ring} ${
                      isFlashing
                        ? "border-primary/80 shadow-[0_0_24px_hsl(43_75%_52%/0.35)] animate-pulse"
                        : "border-border/40"
                    }`}
                  >
                    <header className="flex items-start gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase ${meta.chip}`}>
                        <Icon className="h-3 w-3" strokeWidth={2} />
                        {meta.label}
                      </span>
                      <span className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground/80 pt-1">
                        {a.category}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60 pt-1">
                        {timeAgo(a.published_at)}
                      </span>
                    </header>
                    <h2 className="font-heading text-xl sm:text-2xl font-light leading-snug mb-2">
                      {a.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.summary}</p>

                    {a.action_rules && a.action_rules.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {a.action_rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {isOpen && a.body && (
                      <div className="mt-4 pt-4 border-t border-border/40 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {a.body}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs">
                      {a.body && (
                        <button
                          onClick={() => toggle(a.id)}
                          className="text-primary hover:underline tracking-wide"
                        >
                          {isOpen ? "Hide details" : "Read full alert"}
                        </button>
                      )}
                      {a.source_url && (
                        <a
                          href={a.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Source <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </AnimatedSection>
        )}
      </section>

      {/* Email Capture CTA */}
      <section className="relative z-10 px-6 sm:px-10 max-w-3xl mx-auto pb-20 text-center">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-light mb-3">
            Stay ahead of every AI threat.
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get real-time scam alerts and safety insights delivered to your inbox.
          </p>
          <NewsletterWaitlist source="pause-hub" />
        </div>
      </section>
    </div>
  );
}