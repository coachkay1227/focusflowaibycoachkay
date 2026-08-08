import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(async () => {}) }));

vi.mock("@/hooks/use-booking-links", () => ({
  useBookingLinks: () => ({
    freeClarityUrl: "https://booking.test/free-clarity",
    paidStrategyUrl: "https://booking.test/paid-strategy",
    loading: false,
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

const navigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

const state = {
  loading: false,
  audit: null as unknown,
  purchase: null as unknown,
  empty: false,
  completed: false,
  markCompleted: vi.fn(async () => {}),
};

vi.mock("@/hooks/use-buyer-onboarding", () => ({
  useBuyerOnboarding: () => state,
}));

import Start from "./Start";

const AUDIT_WITH_REPORT = {
  id: "audit-1",
  hasIntake: true,
  recommendedOffer: "rent_agent_pro",
  report: {
    executive_snapshot: "You are closer than you think.",
    where_youre_leaking: "Every lead waits three days for a reply.",
    focus_diagnostic: {
      foundation: { score: 7, note: "Solid" },
      opportunity: { score: 5, note: "Untapped" },
      create: { score: 6, note: "Inconsistent" },
      uplift: { score: 8, note: "Strong" },
      support: { score: 4, note: "Carrying too much" },
    },
    seven_day_plan: [
      { day: 1, title: "Name the bottleneck", action: "Write down where leads stall." },
    ],
    next_best_move: {
      offer_slug: "rent_agent_pro",
      offer_name: "Rent-an-Agent Pro",
      why_this_one: "Your follow-up is the leak.",
      what_youll_get: "A managed team answering every lead.",
      investment: "Scoped on our call.",
    },
  },
};

const renderStart = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Start />
      </MemoryRouter>
    </HelmetProvider>,
  );

const next = async () => {
  await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
};

beforeEach(() => {
  navigate.mockClear();
  state.loading = false;
  state.audit = null;
  state.purchase = null;
  state.empty = false;
  state.completed = false;
  state.markCompleted = vi.fn(async () => {});
});

describe("/start buyer onboarding", () => {
  it("shows the leak, the scores and the first action for an audit with a report", async () => {
    state.audit = AUDIT_WITH_REPORT;
    renderStart();

    expect(screen.getByRole("heading", { name: /here's what we found/i })).toBeInTheDocument();
    expect(screen.getByText(/every lead waits three days/i)).toBeInTheDocument();
    expect(screen.getByText(/your f\.o\.c\.u\.s\. scores/i)).toBeInTheDocument();
    expect(screen.getByText(/name the bottleneck/i)).toBeInTheDocument();

    await next();
    expect(screen.getByRole("heading", { name: /rent-an-agent pro/i })).toBeInTheDocument();
    expect(screen.getByText(/your follow-up is the leak/i)).toBeInTheDocument();

    await next();
    // Application-based recommendation, $47 audit only: the free clarity call.
    const cta = screen.getByRole("link", { name: /free 15-minute clarity call/i });
    // buildBookingUrl appends verified order proof, so compare the base and the
    // params rather than the whole string.
    const ctaUrl = new URL(cta.getAttribute("href")!);
    expect(`${ctaUrl.origin}${ctaUrl.pathname}`).toBe("https://booking.test/free-clarity");
    expect(ctaUrl.searchParams.get("session_type")).toBe("free_clarity");
    expect(ctaUrl.searchParams.get("order_ref")).toBe("audit-1");
    expect(ctaUrl.searchParams.get("order_source")).toBe("business_audits");
  });

  it("says the report is still being written instead of showing an empty box", () => {
    state.audit = { id: "audit-2", report: null, recommendedOffer: null, hasIntake: true };
    renderStart();
    expect(screen.getByText(/still being written/i)).toBeInTheDocument();
    expect(screen.queryByText(/your f\.o\.c\.u\.s\. scores/i)).not.toBeInTheDocument();
  });

  it("asks an audit buyer who skipped intake to finish it", () => {
    state.audit = { id: "audit-3", report: null, recommendedOffer: null, hasIntake: false };
    renderStart();
    expect(screen.getByRole("link", { name: /complete my intake/i })).toHaveAttribute(
      "href",
      "/audit/intake/audit-3",
    );
  });

  it("confirms access and offers the paid session for a high-ticket non-audit purchase", async () => {
    state.purchase = {
      source: "one_time_orders",
      productName: "AI Strategy Intensive",
      amountCents: 49700,
      status: "paid",
      createdAt: "2026-01-01T00:00:00Z",
    };
    renderStart();

    expect(screen.getByRole("heading", { name: /your access is active/i })).toBeInTheDocument();
    expect(screen.getByText("AI Strategy Intensive")).toBeInTheDocument();

    await next();
    await next();
    const paidCta = screen.getByRole("link", { name: /60-minute strategy session/i });
    const paidUrl = new URL(paidCta.getAttribute("href")!);
    expect(`${paidUrl.origin}${paidUrl.pathname}`).toBe("https://booking.test/paid-strategy");
    expect(paidUrl.searchParams.get("session_type")).toBe("paid_strategy");
    expect(paidUrl.searchParams.get("plan")).toBe("AI Strategy Intensive");
    expect(paidUrl.searchParams.get("order_source")).toBe("one_time_orders");
  });

  it("sends someone with no purchase to the dashboard instead of an empty flow", async () => {
    state.empty = true;
    renderStart();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
  });

  it("marks the flow finished when it is skipped", async () => {
    state.audit = AUDIT_WITH_REPORT;
    renderStart();
    await userEvent.click(screen.getByRole("button", { name: /skip for now/i }));
    expect(state.markCompleted).toHaveBeenCalled();
  });

  it("marks the flow finished when the primary button is taken", async () => {
    state.audit = AUDIT_WITH_REPORT;
    renderStart();
    await next();
    await next();
    await userEvent.click(screen.getByRole("link", { name: /free 15-minute clarity call/i }));
    expect(state.markCompleted).toHaveBeenCalled();
  });
});