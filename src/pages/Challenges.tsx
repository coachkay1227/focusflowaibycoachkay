import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";

const challengeTypes = [
  {
    type: "3-day",
    title: "3-Day Spark",
    subtitle: "Quick clarity reset",
    description: "Three focused days to break through mental fog and reconnect with your truth.",
    days: 3,
  },
  {
    type: "4-day",
    title: "4-Day Shift",
    subtitle: "Identify and interrupt patterns",
    description: "Four days designed to surface your deepest patterns and begin the work of shifting them.",
    days: 4,
  },
  {
    type: "7-day",
    title: "7-Day Mirror Challenge",
    subtitle: "The original deep dive",
    description: "Seven days of honest reflection. The challenge that started it all. Look inward. Write honestly.",
    days: 7,
  },
  {
    type: "8-day",
    title: "8-Day Alignment",
    subtitle: "Reconnect purpose with action",
    description: "Eight days bridging the gap between what you say matters and what you actually do.",
    days: 8,
  },
  {
    type: "14-day",
    title: "14-Day Transformation",
    subtitle: "Build new patterns",
    description: "Two weeks of guided coaching to dismantle old patterns and build new ones that serve you.",
    days: 14,
  },
  {
    type: "30-day",
    title: "30-Day Evolution",
    subtitle: "The complete journey",
    description: "A full month of daily coaching, reflection, and growth. For those ready to truly transform.",
    days: 30,
  },
];

const Challenges = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    el.addEventListener("mousemove", handler, { passive: true });
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span> Flow
        </div>
        <div />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">Challenge Programs</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Commit to the work
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Guided daily prompts with adaptive coaching. Pick a duration that matches your readiness.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challengeTypes.map((challenge, i) => (
            <AnimatedSection key={challenge.type} delay={i * 100}>
              <button
                onClick={() => navigate(`/challenges/${challenge.type}`)}
                className="clarity-card w-full text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-mono-label text-primary/60">{challenge.days} days</span>
                </div>
                <h3 className="font-heading text-lg md:text-xl font-light mb-1">{challenge.title}</h3>
                <p className="text-primary/80 text-sm mb-3">{challenge.subtitle}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{challenge.description}</p>
                <span className="flex items-center gap-2 text-sm text-primary/60 group-hover:text-primary transition-colors">
                  Begin challenge <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
