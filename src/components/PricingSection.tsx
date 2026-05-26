import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PARTNERSHIP_BOOKING_URL =
  "https://call.coachkayelevates.org/widget/booking/T9DLwsDPEI4rfRHDdhjp";
const PENDING_CHECKOUT_KEY = "pending_checkout_price";

interface Offer {
  title: string;
  price: string;
  description: string;
  cta: string;
  priceId?: string;       // Stripe price id — present on buy-now offers
  bookingUrl?: string;    // present on the Partnership offer
}

interface Group {
  label: string;
  offers: Offer[];
  centerSingle?: boolean;
}

const GROUPS: Group[] = [
  {
    label: "30-Day Resets",
    offers: [
      {
        title: "30-Day Personal Reset",
        price: "$297",
        description:
          "A private 30-day transformation experience for clarity, confidence, mindset, habits, and forward movement. Best for people who feel stuck, overwhelmed, or ready for a personal reset.",
        cta: "Start Personal Reset — $297",
        priceId: "price_1TbAaPBReje0oFcLts5JuE5a",
      },
      {
        title: "30-Day Business Reset",
        price: "$497",
        description:
          "A focused 30-day business transformation experience for entrepreneurs, coaches, and founders who need clarity, structure, stronger execution, and better decision-making.",
        cta: "Start Business Reset — $497",
        priceId: "price_1TbAguBReje0oFcL3Qh5pIiH",
      },
      {
        title: "30-Day AI Reset",
        price: "$997",
        description:
          "A guided 30-day AI transformation experience to help you use AI more intentionally in your life or business for clarity, productivity, systems, and growth.",
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
        description:
          "A deeper private coaching experience for personal growth, emotional clarity, confidence, accountability, and sustainable life change.",
        cta: "Start Personal Transformation — $997",
        priceId: "price_1TbAhtBReje0oFcLscEqWHEK",
      },
      {
        title: "90-Day Business Transformation",
        price: "$1,497",
        description:
          "A private transformation container for entrepreneurs and professionals who want sharper offers, cleaner execution, stronger leadership, and business momentum.",
        cta: "Start Business Transformation — $1,497",
        priceId: "price_1TbAiNBReje0oFcLrit7Ko5x",
      },
      {
        title: "90-Day Full AI Transformation",
        price: "$2,497",
        description:
          "A premium private coaching and strategy experience for people ready to integrate AI into their workflow, business, decision-making, and growth strategy.",
        cta: "Start Full AI Transformation — $2,497",
        priceId: "price_1TbAimBReje0oFcL4Uti8udD",
      },
    ],
  },
  {
    label: "Private Partnership",
    centerSingle: true,
    offers: [
      {
        title: "6-Month Private Transformation Partnership",
        price: "$3,997",
        description:
          "A high-touch private coaching experience for clients who want long-term support, deeper transformation, and personalized guidance across personal growth, business evolution, and AI-powered execution. Book a 60-minute discovery call with Coach Kay to see if it's the right fit.",
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
            cancelPath: "/#pricing",
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
    if (!user) {
      try { sessionStorage.setItem(PENDING_CHECKOUT_KEY, offer.priceId); } catch { /* noop */ }
      navigate(`/auth?next=${encodeURIComponent("/#pricing")}`);
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
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
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

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
                group.centerSingle ? "[&>*]:lg:col-start-2" : ""
              }`}
            >
              {group.offers.map((offer, i) => (
                <AnimatedSection key={offer.title} delay={i * 100}>
                  <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 flex flex-col h-full hover:border-primary/40 transition-colors">
                    <h3 className="font-heading text-lg text-foreground">{offer.title}</h3>
                    <div className="mt-3 text-3xl font-bold text-primary">{offer.price}</div>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">
                      {offer.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOfferClick(offer)}
                      disabled={loadingPriceId === offer.priceId}
                      className="mt-6 w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingPriceId === offer.priceId ? "Opening checkout…" : offer.cta}
                    </button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
