import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OfferCard from "@/components/offers/OfferCard";
import { getSymmetricGridClass } from "@/lib/grid";
import { trackCheckoutStart } from "@/lib/gtag";

// Partnership offer copy explicitly says "Begins with a 60-min discovery call",
// so this card uses the 60-min strategy call. The free 15-min Clarity Call is
// used on lower-intent surfaces (assessment result, etc.).
const PARTNERSHIP_BOOKING_URL =
  "https://call.coachkayelevates.org/widget/bookings/60min-discover-call";
const PENDING_CHECKOUT_KEY = "pending_checkout_price";

interface Offer {
  title: string;
  price: string;
  tagline?: string;
  features?: string[];
  description: string;
  cta: string;
  priceId?: string;       // Stripe price id — present on buy-now offers
  bookingUrl?: string;    // present on the Partnership offer
}

interface Group {
  label: string;
  offers: Offer[];
}

const GROUPS: Group[] = [
  {
    label: "30-Day Resets",
    offers: [
      {
        title: "30-Day Personal Reset",
        price: "$297",
        tagline: "A private 30-day reset for clarity, confidence, and forward movement.",
        features: [
          "Private 1:1 coaching container",
          "Mindset, habits, and emotional clarity",
          "Best for people who feel stuck or overwhelmed",
          "Daily structure + accountability rhythm",
        ],
        description: "",
        cta: "Start Personal Reset — $297",
        priceId: "price_1TbAaPBReje0oFcLts5JuE5a",
      },
      {
        title: "30-Day Business Reset",
        price: "$497",
        tagline: "A focused 30-day business reset for entrepreneurs, coaches, and founders.",
        features: [
          "Clarity on offers, audience, and direction",
          "Stronger execution and decision-making",
          "Structure your week around what moves the needle",
          "Private strategy + accountability",
        ],
        description: "",
        cta: "Start Business Reset — $497",
        priceId: "price_1TbAguBReje0oFcL3Qh5pIiH",
      },
      {
        title: "30-Day AI Reset",
        price: "$997",
        tagline: "Use AI intentionally in your life or business: clarity, systems, growth.",
        features: [
          "Personalized AI workflow audit",
          "Custom prompts and automations",
          "Productivity and decision systems",
          "Private guidance from Coach Kay",
        ],
        description: "",
        cta: "Start AI Reset — $997",
        priceId: "price_1TbAhOBReje0oFcL87MVrKFy",
      },
    ],
  },
  {
    label: "90-Day Transformation",
    offers: [
      {
        title: "90-Day Personal Transformation",
        price: "$997",
        tagline: "Deeper private coaching for personal growth and sustainable life change.",
        features: [
          "Weekly 1:1 sessions over 90 days",
          "Emotional clarity, confidence, accountability",
          "Tools that outlast the program",
          "Best for committed personal evolution",
        ],
        description: "",
        cta: "Start Personal Transformation — $997",
        priceId: "price_1TbAhtBReje0oFcLscEqWHEK",
      },
      {
        title: "90-Day Business Transformation",
        price: "$1,497",
        tagline: "Sharper offers, cleaner execution, stronger leadership, real momentum.",
        features: [
          "Private business transformation container",
          "Offer + positioning refinement",
          "Leadership and execution discipline",
          "Built for entrepreneurs and operators",
        ],
        description: "",
        cta: "Start Business Transformation — $1,497",
        priceId: "price_1TbAiNBReje0oFcLrit7Ko5x",
      },
      {
        title: "90-Day Full AI Transformation",
        price: "$2,497",
        tagline: "Premium private coaching + strategy for AI-integrated growth.",
        features: [
          "End-to-end AI integration into your work",
          "Workflow + decision-making systems",
          "Growth strategy powered by AI",
          "Highest-touch 90-day container",
        ],
        description: "",
        cta: "Start Full AI Transformation — $2,497",
        priceId: "price_1TbAimBReje0oFcL4Uti8udD",
      },
    ],
  },
  {
    label: "Private Partnership",
    offers: [
      {
        title: "6-Month Private Transformation Partnership",
        price: "$3,997",
        tagline: "Long-term, high-touch partnership across life, business, and AI.",
        features: [
          "6 months of private 1:1 partnership",
          "Personal growth + business evolution + AI execution",
          "Direct access and deep personalization",
          "Begins with a 60-min discovery call",
        ],
        description: "",
        cta: "Book Discovery Call",
        bookingUrl: PARTNERSHIP_BOOKING_URL,
      },
    ],
  },
];

export default function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (priceId: string) => {
      setLoadingPriceId(priceId);
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            priceId,
            successPath: "/dashboard?welcome=program",
            cancelPath: "/modules#plans",
          },
        });
        if (error) throw error;
        const url = (data as { url?: string } | null)?.url;
        if (!url) throw new Error("No checkout URL returned");
        window.location.href = url;
      } catch (e) {
        toast({
          title: "Couldn't start checkout",
          description: e instanceof Error ? e.message : "Please try again.",
          variant: "destructive",
        });
        setLoadingPriceId(null);
      }
    },
    [toast],
  );

  // Resume a pending checkout after the user signs in / signs up.
  useEffect(() => {
    if (!user) return;
    let pending: string | null = null;
    try { pending = sessionStorage.getItem(PENDING_CHECKOUT_KEY); } catch { /* noop */ }
    if (!pending) return;
    try { sessionStorage.removeItem(PENDING_CHECKOUT_KEY); } catch { /* noop */ }
    void startCheckout(pending);
  }, [user, startCheckout]);

  const handleOfferClick = (offer: Offer) => {
    if (offer.bookingUrl) {
      window.open(offer.bookingUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!offer.priceId) return;
    // GA4: fire begin_checkout with tier name and numeric price
    const numericPrice = parseFloat(offer.price.replace(/[^0-9.]/g, "")) || 0;
    trackCheckoutStart(offer.title, numericPrice);
    if (!user) {
      try { sessionStorage.setItem(PENDING_CHECKOUT_KEY, offer.priceId); } catch { /* noop */ }
      navigate(`/auth?next=${encodeURIComponent("/modules#plans")}`);
      return;
    }
    void startCheckout(offer.priceId);
  };

  return (
    <section className="relative z-10 py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2
              className="font-heading text-3xl md:text-5xl font-light"
              style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
            >
              Choose Your Transformation Path
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose the level of support that matches where you are right now. Every path is designed to help you create real transformation through clarity, coaching, and AI-powered support.
            </p>
          </div>
        </AnimatedSection>

        {GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-16 pt-16 border-t border-border/40" : ""}>
            <AnimatedSection>
              <div className="text-center mb-8">
                <span className="text-xs tracking-widest uppercase text-primary/60 font-mono-label">
                  {group.label}
                </span>
              </div>
            </AnimatedSection>

            <div className={`${getSymmetricGridClass(group.offers.length)} gap-6 items-stretch`}>
              {group.offers.map((offer, i) => {
                const busy = !!offer.priceId && loadingPriceId === offer.priceId;
                const isPartnership = !!offer.bookingUrl;
                return (
                  <AnimatedSection key={offer.title} delay={i * 100} className="h-full">
                    <OfferCard
                      eyebrow={group.label}
                      badge={isPartnership ? "Invitation" : undefined}
                      title={offer.title}
                      tagline={offer.tagline ?? offer.description}
                      features={offer.features ?? []}
                      price={offer.price}
                      variant={isPartnership ? "premium" : "standard"}
                      primaryCta={{
                        label: busy ? "Opening checkout…" : offer.cta,
                        onClick: () => handleOfferClick(offer),
                      }}
                    />
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
