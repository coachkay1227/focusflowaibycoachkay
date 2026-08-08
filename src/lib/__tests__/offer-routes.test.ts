import { describe, expect, it } from "vitest";
import { isKnownOfferSlug, offerRoute, SKOOL_URL } from "../offer-routes";

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
      href: "/modules",
      contact: "self_serve",
    });
    expect(offerRoute("studio_mini_story")).toMatchObject({
      href: "/store#mini-story",
      contact: "self_serve",
    });
  });

  it("sends the community door to the hub as an external link", () => {
    const route = offerRoute("focus_flow_elevation_hub");
    expect(route.contact).toBe("community");
    expect(route.external).toBe(true);
    expect(route.href).toBe(SKOOL_URL);
  });

  it("flags Build Studio as opening soon rather than a live checkout", () => {
    expect(offerRoute("build_studio_site").opening_soon).toBe(true);
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
});