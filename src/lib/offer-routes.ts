// ============================================================
// Where each recommended offer slug sends someone, and how that offer is
// actually bought.
//
// The audit report's `next_best_move.offer_slug` is written by the model, so
// this table is the single place that turns a slug into a real destination.
// `contact` says how the offer is entered: application-based offers start with
// a conversation, self-serve offers go straight to their page, and the
// community door is free. The buyer onboarding flow reads `contact` to decide
// its one primary button, so that choice stays data instead of a second switch
// statement drifting out of sync with this one.
// ============================================================

export const SKOOL_URL = "https://www.skool.com/focusflow-elevation-hub";

/** How the offer is entered. */
export type OfferContact = "application" | "self_serve" | "community";

export interface OfferRoute {
  /** Where the CTA points. In-app path, anchor, or absolute URL. */
  href: string;
  /** True when `href` leaves the app. */
  external?: boolean;
  /** Offer is announced but not open yet; callers render waitlist UI. */
  opening_soon?: boolean;
  /** Overrides the default CTA label when the offer needs its own wording. */
  label?: string;
  contact: OfferContact;
}

const ROUTES: Record<string, OfferRoute> = {
  // Door 1. Transformation lane. Short resets are self-serve; the long
  // programs and the private partnership start with a conversation.
  transform_30_personal: { href: "/programs/30-day-personal-reset", contact: "self_serve" },
  transform_30_business: { href: "/programs/30-day-business-reset", contact: "self_serve" },
  transform_30_ai: { href: "/programs/30-day-ai-reset", contact: "self_serve" },
  transform_90_personal: { href: "/programs/90-day-personal-transformation", contact: "application" },
  transform_90_business: { href: "/programs/90-day-business-transformation", contact: "application" },
  transform_90_ai: { href: "/programs/90-day-full-ai-transformation", contact: "application" },
  transform_6mo_partnership: { href: "/programs/6-month-private-partnership", contact: "application" },

  // Door 2. Rent-an-Agent. Managed builds, always scoped on a call.
  rent_agent_starter: { href: "/rent-an-agent#starter", contact: "application" },
  rent_agent_pro: { href: "/rent-an-agent#pro", contact: "application" },
  rent_agent_dreamteam: { href: "/rent-an-agent#dreamteam", contact: "application" },
  rent_agent_enterprise: { href: "/rent-an-agent#enterprise", contact: "application" },

  // Door 2. Lead Engine has its own live tier page.
  lead_engine_essentials: { href: "/agents/lead-engine#lead-engine-essentials", contact: "application" },
  lead_engine_pro: { href: "/agents/lead-engine#lead-engine-pro", contact: "application" },
  lead_engine_growth: { href: "/agents/lead-engine#lead-engine-growth", contact: "application" },
  lead_engine_scale: { href: "/agents/lead-engine#lead-engine-scale", contact: "application" },
  lead_engine_enterprise: { href: "/agents/lead-engine#lead-engine-enterprise", contact: "application" },

  // Door 3. Advisory, speaking, corporate. Proposal or call first.
  advisory_strategy_intensive: { href: "/advisory#strategy-intensive", contact: "application" },
  advisory_executive: { href: "/advisory#executive", contact: "application" },
  advisory_speaking: { href: "/advisory#speaking", contact: "application" },
  advisory_corporate: { href: "/advisory#corporate", contact: "application" },
  advisory_university: { href: "/advisory#university", contact: "application" },
  group_programs: { href: "/advisory#cohorts", contact: "application" },

  // Door 4. Publishing studio, bought in the store.
  studio_mini_story: { href: "/store?package=children-mini-story-starter", contact: "self_serve" },
  studio_storybook_pro: { href: "/store?package=children-storybook-pro", contact: "self_serve" },
  studio_other: { href: "/store#packages", contact: "self_serve" },

  // Build Studio is live. The landing-page package has direct checkout;
  // larger builds start with scope and approval before payment.
  build_studio_landing: { href: "/build-studio?offer=landing_page", contact: "self_serve" },
  build_studio_site: { href: "/build-studio?offer=marketing_site", contact: "application" },
  build_studio_dashboard: { href: "/build-studio?offer=ops_dashboard", contact: "application" },

  // Community door, free, fiscally sponsored lane.
  focus_flow_elevation_hub: {
    href: SKOOL_URL,
    external: true,
    label: "Forward Focus Elevation Community · Free Access",
    contact: "community",
  },
};

/** Every model-allowed offer slug in the live catalog. */
export const KNOWN_OFFER_SLUGS = Object.freeze(Object.keys(ROUTES));

/** Fallback for a slug this build does not know. Never a dead link. */
const FALLBACK: OfferRoute = { href: "/store", contact: "self_serve" };

/** Resolve a recommended offer slug to its destination and entry style. */
export function offerRoute(slug?: string | null): OfferRoute {
  if (!slug) return FALLBACK;
  return ROUTES[slug] ?? FALLBACK;
}

/** True when this build recognises the slug. Useful for analytics and tests. */
export function isKnownOfferSlug(slug?: string | null): boolean {
  return !!slug && slug in ROUTES;
}
