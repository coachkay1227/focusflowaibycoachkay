import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OfferCard from "./OfferCard";

function renderCard(props: Partial<React.ComponentProps<typeof OfferCard>> = {}) {
  return render(
    <MemoryRouter>
      <OfferCard
        eyebrow="TEST"
        title="Test offer"
        tagline="Test tagline"
        features={["A", "B"]}
        price="$99"
        primaryCta={{ label: "Buy", onClick: () => {} }}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("OfferCard symmetry invariants", () => {
  it("root article carries the locked-symmetry classes", () => {
    const { container } = renderCard();
    const article = container.querySelector("[data-offer-card]") as HTMLElement;
    expect(article).not.toBeNull();
    const cls = article.className;
    expect(cls).toMatch(/\bh-full\b/);
    expect(cls).toMatch(/\bflex\b/);
    expect(cls).toMatch(/\bflex-col\b/);
  });

  it("CTA wrapper is anchored to the bottom via mt-auto", () => {
    const { container } = renderCard();
    const ctaWrap = container.querySelector("[data-offer-card] .mt-auto");
    expect(ctaWrap).not.toBeNull();
  });

  it("CTA wrapper still bottom-anchors when only a secondary CTA is present", () => {
    const { container } = renderCard({
      primaryCta: undefined,
      secondaryCta: { label: "Learn more", onClick: () => {} },
    });
    const ctaWrap = container.querySelector("[data-offer-card] .mt-auto");
    expect(ctaWrap).not.toBeNull();
  });

  it("default-density title and tagline keep their locked min-heights", () => {
    const { container } = renderCard();
    const article = container.querySelector("[data-offer-card]") as HTMLElement;
    const html = article.innerHTML;
    // Locked title min-height keeps 2-line headers aligned across siblings.
    expect(html).toContain("min-h-[3.6rem]");
    // Locked tagline min-height keeps the divider line on the same y across siblings.
    expect(html).toContain("min-h-[2.6rem]");
  });

  it("renders a flex-1 spacer when features is empty so CTAs still bottom-anchor", () => {
    const { container } = renderCard({ features: [] });
    const article = container.querySelector("[data-offer-card]") as HTMLElement;
    // Either the <ul> with flex-1 (when features exist) or the spacer div with flex-1.
    const spacer = article.querySelector(":scope > div.flex-1");
    expect(spacer).not.toBeNull();
  });

  it("two siblings with wildly different feature counts both render h-full", () => {
    const { container } = render(
      <MemoryRouter>
        <div className="grid grid-cols-2 items-stretch">
          <OfferCard
            eyebrow="A"
            title="Short"
            tagline="t"
            features={["one"]}
            price="$1"
            primaryCta={{ label: "Go", onClick: () => {} }}
          />
          <OfferCard
            eyebrow="B"
            title="Tall"
            tagline="t"
            features={["1", "2", "3", "4", "5", "6"]}
            price="$2"
            primaryCta={{ label: "Go", onClick: () => {} }}
          />
        </div>
      </MemoryRouter>,
    );
    const articles = container.querySelectorAll("[data-offer-card]");
    expect(articles).toHaveLength(2);
    articles.forEach((a) => {
      expect((a as HTMLElement).className).toMatch(/\bh-full\b/);
    });
  });
});