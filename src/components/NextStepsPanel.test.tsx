import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(async () => {}) }));

vi.mock("@/hooks/use-booking-links", () => ({
  useBookingLinks: () => ({
    freeClarityUrl: "https://booking.test/free-clarity",
    paidStrategyUrl: "https://booking.test/paid-strategy",
    loading: false,
  }),
}));

import { NextStepsPanel } from "./NextStepsPanel";

const renderPanel = (props: Partial<React.ComponentProps<typeof NextStepsPanel>>) =>
  render(
    <MemoryRouter>
      <NextStepsPanel headline="Payment Confirmed" lede="Here's what to do now." {...props} />
    </MemoryRouter>,
  );

describe("NextStepsPanel booking tier", () => {
  it("offers the free clarity call for the $47 audit", () => {
    renderPanel({ amountSubtotalCents: 4700, amountTotalCents: 4700, mode: "payment" });
    const link = screen.getByRole("link", { name: /free 15-minute clarity call/i });
    expect(link.getAttribute("href")).toContain("https://booking.test/free-clarity?");
    expect(link.getAttribute("href")).toContain("session_type=free_clarity");
  });

  it("offers the paid strategy call at $297 and above", () => {
    renderPanel({ amountSubtotalCents: 29700, amountTotalCents: 29700, mode: "payment" });
    const link = screen.getByRole("link", { name: /60-minute strategy session/i });
    expect(link.getAttribute("href")).toContain("https://booking.test/paid-strategy?");
    expect(link.getAttribute("href")).toContain("session_type=paid_strategy");
  });

  it("offers the paid strategy call for a $497 purchase", () => {
    renderPanel({ amountSubtotalCents: 49700, amountTotalCents: 49700, mode: "payment" });
    expect(
      screen.getByRole("link", { name: /60-minute strategy session/i }),
    ).toBeInTheDocument();
  });

  it("ignores coupons: a $47 audit discounted to $0 still gets the free call", () => {
    // Mirrors the real FFTEST100 run: amount_total 0, amount_subtotal 4700.
    renderPanel({ amountSubtotalCents: 4700, amountTotalCents: 0, mode: "payment" });
    expect(
      screen.getByRole("link", { name: /free 15-minute clarity call/i }),
    ).toBeInTheDocument();
  });

  it("ignores coupons: a $497 purchase discounted to $0 still gets the paid call", () => {
    renderPanel({ amountSubtotalCents: 49700, amountTotalCents: 0, mode: "payment" });
    expect(
      screen.getByRole("link", { name: /60-minute strategy session/i }),
    ).toBeInTheDocument();
  });

  it("always offers a strategy call for subscriptions regardless of first charge", () => {
    renderPanel({ amountSubtotalCents: 0, amountTotalCents: 0, mode: "subscription" });
    expect(
      screen.getByRole("link", { name: /60-minute strategy session/i }),
    ).toBeInTheDocument();
  });

  it("still renders both actions when the product cannot be named", () => {
    renderPanel({ productName: null, amountSubtotalCents: null, amountTotalCents: null });
    expect(screen.getByRole("link", { name: /clarity call/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /choose your first challenge/i })).toBeInTheDocument();
  });

  it("shows the receipt email the backend reported", () => {
    renderPanel({ customerEmail: "buyer@example.com", amountTotalCents: 4700 });
    expect(screen.getAllByText(/buyer@example\.com/).length).toBeGreaterThan(0);
  });
});