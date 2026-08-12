import { describe, expect, it } from "vitest";
import { isKnownOfferSlug, KNOWN_OFFER_SLUGS, offerRoute, SKOOL_URL } from "../offer-routes";

const MODEL_OFFER_SLUGS = [
  "transform_30_personal", "transform_30_business", "transform_30_ai",
  "transform_90_personal", "transform_90_business", "transform_90_ai",
  "transform_6mo_partnership", "rent_agent_starter", "rent_agent_pro",
  "rent_agent_dreamteam", "rent_agent_enterprise", "lead_engine_essentials",
  "lead_engine_pro", "lead_engine_growth", "lead_engine_scale",
  "lead_engine_enterprise", "advisory_strategy_intensive", "advisory_executive",
  "advisory_speaking", "advisory_corporate", "advisory_university",
  "group_programs", "studio_mini_story", "studio_storybook_pro", "studio_other",
  "build_studio_landing", "build_studio_site", "build_studio_dashboard",
  "focus_flow_elevation_hub",
];

describe("offerRoute", () => {
  it("marks high-touch offers as application-based so the CTA books a call", () => {
    for (const slug of [
      "rent_agent_pro",
      "rent_agent_enterprise",
      "lead_engine_growth",
      "advisory_strategy_intensive",
      "advisory_corporate",
      "group_programs",
      "transform_90_business",
      "transform_6mo_partnership",
    ]) {
      expect(offerRoute(slug).contact, slug).toBe("application");
    }
  });

  it("marks self-serve offers so the CTA links straight to the offer", () => {
    expect(offerRoute("transform_30_personal")).toMatchObject({
      href: "/programs/30-day-personal-reset",
      contact: "self_serve",
    });
    expect(offerRoute("studio_mini_story")).toMatchObject({
      href: "/store?package=children-mini-story-starter",
      contact: "self_serve",
    });
  });

  it("sends the community door to the hub as an external link", () => {
    const route = offerRoute("focus_flow_elevation_hub");
    expect(route.contact).toBe("community");
    expect(route.external).toBe(true);
    expect(route.href).toBe(SKOOL_URL);
  });

  it("routes live Build Studio offers to real packages", () => {
    expect(offerRoute("build_studio_landing")).toMatchObject({
      href: "/build-studio?offer=landing_page",
      contact: "self_serve",
    });
    expect(offerRoute("build_studio_site")).toMatchObject({
      href: "/build-studio?offer=marketing_site",
      contact: "application",
    });
  });

  it("falls back to the store instead of a dead link for unknown or missing slugs", () => {
    expect(offerRoute("something_we_never_shipped")).toEqual({
      href: "/store",
      contact: "self_serve",
    });
    expect(offerRoute(null).href).toBe("/store");
    expect(offerRoute(undefined).href).toBe("/store");
  });

  it("reports whether a slug is known", () => {
    expect(isKnownOfferSlug("rent_agent_pro")).toBe(true);
    expect(isKnownOfferSlug("nope")).toBe(false);
    expect(isKnownOfferSlug(null)).toBe(false);
  });

  it("never returns an empty href", () => {
    for (const slug of ["rent_agent_pro", "studio_other", "focus_flow_elevation_hub", "x"]) {
      expect(offerRoute(slug).href.length).toBeGreaterThan(0);
    }
  });

  it("covers every slug the audit model is allowed to return", () => {
    expect([...KNOWN_OFFER_SLUGS].sort()).toEqual([...MODEL_OFFER_SLUGS].sort());
    for (const slug of MODEL_OFFER_SLUGS) {
      const route = offerRoute(slug);
      expect(route.href, slug).not.toBe("#");
      expect(route.href, slug).not.toBe("");
    }
  });

  it("uses live deep links for every tiered recommendation", () => {
    expect(offerRoute("rent_agent_dreamteam").href).toBe("/rent-an-agent#dreamteam");
    expect(offerRoute("lead_engine_scale").href).toBe("/agents/lead-engine#lead-engine-scale");
    expect(offerRoute("advisory_university").href).toBe("/advisory#university");
    expect(offerRoute("group_programs").href).toBe("/advisory#cohorts");
  });
});
