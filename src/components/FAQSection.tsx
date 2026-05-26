import type { FAQItem } from "@/data/faqs";
import { ChevronDown } from "lucide-react";

interface FAQSectionProps {
  /** Section heading (e.g. "Frequently Asked Questions"). */
  title?: string;
  /** Short subtitle/eyebrow shown above the heading. */
  eyebrow?: string;
  /** FAQ items to render. */
  items: FAQItem[];
  /** Optional in-page anchor id (default: "faq"). */
  id?: string;
  /** Optional className for the outer <section>. */
  className?: string;
}

/**
 * Lane-agnostic FAQ section.
 * Uses native <details>/<summary> for zero-dep accordion behavior,
 * progressive enhancement, and good a11y by default.
 */
const FAQSection = ({
  title = "Frequently asked questions",
  eyebrow,
  items,
  id = "faq",
  className = "",
}: FAQSectionProps) => {
  if (!items?.length) return null;

  return (
    <section
      id={id}
      className={`scroll-mt-24 px-6 py-16 max-w-3xl mx-auto ${className}`}
    >
      <div className="text-center mb-10">
        {eyebrow ? (
          <p className="font-mono-label text-primary tracking-[0.28em] text-xs mb-3 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-3xl sm:text-4xl text-foreground">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm p-5 open:border-primary/40 transition-colors"
          >
            <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
              <h3 className="font-heading text-lg text-foreground leading-snug">
                {item.q}
              </h3>
              <ChevronDown
                className="h-5 w-5 mt-1 text-primary shrink-0 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;