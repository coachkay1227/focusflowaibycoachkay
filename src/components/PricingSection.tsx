import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

interface Offer {
  title: string;
  price: string;
  description: string;
  cta: string;
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
        cta: "Start Personal Reset",
      },
      {
        title: "30-Day Business Reset",
        price: "$497",
        description:
          "A focused 30-day business transformation experience for entrepreneurs, coaches, and founders who need clarity, structure, stronger execution, and better decision-making.",
        cta: "Start Business Reset",
      },
      {
        title: "30-Day AI Reset",
        price: "$997",
        description:
          "A guided 30-day AI transformation experience to help you use AI more intentionally in your life or business for clarity, productivity, systems, and growth.",
        cta: "Start AI Reset",
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
        cta: "Apply for Personal Coaching",
      },
      {
        title: "90-Day Business Transformation",
        price: "$1,497",
        description:
          "A private transformation container for entrepreneurs and professionals who want sharper offers, cleaner execution, stronger leadership, and business momentum.",
        cta: "Apply for Business Coaching",
      },
      {
        title: "90-Day Full AI Transformation",
        price: "$2,497",
        description:
          "A premium private coaching and strategy experience for people ready to integrate AI into their workflow, business, decision-making, and growth strategy.",
        cta: "Apply for AI Transformation",
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
          "A high-touch private coaching experience for clients who want long-term support, deeper transformation, and personalized guidance across personal growth, business evolution, and AI-powered execution.",
        cta: "Apply for Private Partnership",
      },
    ],
  },
];

export default function PricingSection() {
  const navigate = useNavigate();

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
                group.centerSingle ? "max-w-md mx-auto md:grid-cols-1 lg:grid-cols-1" : ""
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
                      onClick={() => navigate("/apply")}
                      className="mt-6 w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {offer.cta}
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
