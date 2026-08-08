// ============================================================
// Shareable offer links — the source of truth for QR codes.
//
// Every offer that can be printed on a flyer, a slide, or a workshop handout
// appears here exactly once. Build Studio entries are derived from
// build-studio-catalog so a new offer there cannot go missing here. Slugs are
// PERMANENT once published: a printed QR code outlives any redesign.
// ============================================================

import { BUILD_STUDIO_TIERS } from "@/lib/build-studio-catalog";

export interface ShareableOffer {
  /** Permanent slug. Never rename after a code has been printed. */
  slug: string;
  label: string;
  /** Group heading in the admin QR console. */
  group: string;
  /** App-relative path including any anchor. */
  path: string;
  /** True when the visitor can pay immediately. */
  directPurchase: boolean;
}

const STATIC_OFFERS: ShareableOffer[] = [
  // Front doors — the "reveal a problem" entry points.
  { slug: "ai_business_audit", label: "AI Business Audit", group: "Front doors", path: "/audit", directPurchase: true },
  { slug: "assessment", label: "F.O.C.U.S. Assessment", group: "Front doors", path: "/assessment", directPurchase: false },
  { slug: "starter_kit", label: "Quick Start Report", group: "Front doors", path: "/starter-kit", directPurchase: false },
  { slug: "clarity_session", label: "Clarity Session", group: "Front doors", path: "/clarity-session", directPurchase: false },
  { slug: "ai_tools_directory", label: "AI Tools Directory", group: "Front doors", path: "/ai-tools", directPurchase: false },
  { slug: "community_hub", label: "Focus Flow Elevation Hub", group: "Front doors", path: "/community", directPurchase: false },

  // Rent-an-Agent.
  { slug: "rent_agent_starter", label: "Rent-an-Agent · Starter", group: "Rent-an-Agent", path: "/rent-an-agent#starter", directPurchase: true },
  { slug: "rent_agent_pro", label: "Rent-an-Agent · Pro", group: "Rent-an-Agent", path: "/rent-an-agent#pro", directPurchase: true },
  { slug: "rent_agent_dreamteam", label: "Rent-an-Agent · Dream Team", group: "Rent-an-Agent", path: "/rent-an-agent#dreamteam", directPurchase: true },
  { slug: "rent_agent_enterprise", label: "Rent-an-Agent · Enterprise", group: "Rent-an-Agent", path: "/rent-an-agent#enterprise", directPurchase: false },
  { slug: "lead_engine", label: "AI Lead Engine", group: "Rent-an-Agent", path: "/rent-an-agent#lead-engine", directPurchase: false },

  // Advisory and training.
  { slug: "advisory_strategy_intensive", label: "AI Strategy Intensive", group: "Advisory", path: "/advisory#strategy-intensive", directPurchase: true },
  { slug: "advisory_executive", label: "Executive Coaching", group: "Advisory", path: "/advisory#executive", directPurchase: false },
  { slug: "advisory_speaking", label: "Speaking", group: "Advisory", path: "/advisory#speaking", directPurchase: false },
  { slug: "advisory_corporate", label: "Corporate Training", group: "Advisory", path: "/advisory#corporate", directPurchase: false },
  { slug: "advisory_university", label: "AI University", group: "Advisory", path: "/advisory#university", directPurchase: false },

  // Publishing studio and books.
  { slug: "store", label: "Publishing Studio", group: "Books & Publishing", path: "/store", directPurchase: true },
  { slug: "autism_social_stories", label: "Autism & Social Stories", group: "Books & Publishing", path: "/autism-social-stories", directPurchase: true },

  // Programs.
  { slug: "programs", label: "Transformation Programs", group: "Programs", path: "/modules", directPurchase: true },
  { slug: "challenges", label: "Challenges", group: "Programs", path: "/challenges", directPurchase: false },

  // Positioning.
  { slug: "ai_task_force", label: "The Collective (AI task force)", group: "Positioning", path: "/collective", directPurchase: false },
  { slug: "start_a_build", label: "Start a build (inquiry)", group: "Positioning", path: "/start-a-build", directPurchase: false },
];

/** Build Studio offers, derived so the catalog stays the single definition. */
const buildStudioOffers = (): ShareableOffer[] =>
  BUILD_STUDIO_TIERS.flatMap((tier) =>
    tier.offers.map((offer) => ({
      slug: `build_${offer.key}`,
      label: `${tier.label} · ${offer.name}`,
      group: "Build Studio",
      path: `/build-studio?offer=${offer.key}`,
      directPurchase: !!offer.priceId,
    })),
  );

export const SHAREABLE_OFFERS: ShareableOffer[] = [...STATIC_OFFERS, ...buildStudioOffers()];

export const SHAREABLE_GROUPS = Array.from(new Set(SHAREABLE_OFFERS.map((o) => o.group)));

export const findShareableOffer = (slug: string) =>
  SHAREABLE_OFFERS.find((o) => o.slug === slug);

/** Absolute, taggable link for print. `source` records where the code lives
 *  (for example a workshop name) so leads can be attributed later. */
export function shareableUrl(
  offer: ShareableOffer,
  opts: { origin: string; source?: string; medium?: string; campaign?: string } = { origin: "" },
): string {
  const base = new URL(offer.path, opts.origin || "https://coachkayai.life");
  if (opts.source) base.searchParams.set("utm_source", opts.source);
  if (opts.medium) base.searchParams.set("utm_medium", opts.medium);
  if (opts.campaign) base.searchParams.set("utm_campaign", opts.campaign);
  return base.toString();
}
