import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Wind, Eye, Compass, Sparkles, Pause as PauseIcon } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import MobileNav from "@/components/MobileNav";
import AnimatedSection from "@/components/AnimatedSection";
import { webPage, breadcrumb } from "@/lib/seo-schema";

const RITUALS = [
  {
    icon: Wind,
    name: "Box Breath",
    duration: "60 seconds",
    body:
      "In for 4. Hold for 4. Out for 4. Hold for 4. Three rounds. Your nervous system catches up to the moment.",
  },
  {
    icon: Eye,
    name: "Name It",
    duration: "30 seconds",
    body:
      "Out loud or in your head: \"Right now I'm feeling _______.\" The thing you name loses its grip on you.",
  },
  {
    icon: Compass,
    name: "Next Right Thing",
    duration: "2 minutes",
    body:
      "Forget the plan. What is the single next action that moves you forward? Write it down. Then do that one thing.",
  },
  {
    icon: Sparkles,
    name: "Mirror Question",
    duration: "3 minutes",
    body:
      "If a friend you loved was standing where you are, what would you tell them? Now apply it to yourself.",
  },
];

const PROMPTS = [
  "What am I avoiding because it feels too big?",
  "Where am I performing instead of being honest?",
  "What would I do if I trusted myself completely?",
  "What's the smallest version of the thing I'm putting off?",
  "What am I tolerating that's quietly draining me?",
  "What would I say yes to if fear wasn't running the show?",
  "Who am I becoming by the choices I make this week?",
  "What does my body know that my mind keeps overriding?",
];

function BreathOrb() {
  const [phase, setPhase] = useState<"in" | "hold1" | "out" | "hold2">("in");

  useEffect(() => {
    const cycle = ["in", "hold1", "out", "hold2"] as const;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % cycle.length;
      setPhase(cycle[i]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const label =
    phase === "in" ? "Breathe in" : phase === "out" ? "Breathe out" : "Hold";
  const scale =
    phase === "in" ? "scale-100" : phase === "out" ? "scale-50" : phase === "hold1" ? "scale-100" : "scale-50";

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative h-48 w-48 flex items-center justify-center">
        <div
          aria-hidden
          className={`absolute h-40 w-40 rounded-full bg-primary/15 border border-primary/30 transition-all duration-[4000ms] ease-in-out ${scale}`}
          style={{ boxShadow: "0 0 60px hsl(43 75% 52% / 0.25)" }}
        />
        <span className="relative text-sm uppercase tracking-[0.28em] text-primary/90">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground tracking-wide">
        4 in · 4 hold · 4 out · 4 hold
      </p>
    </div>
  );
}

function DailyPrompt() {
  // Stable per day using day-of-year so it doesn't shift on rerender.
  const dayIndex = Math.floor(Date.now() / 86_400_000) % PROMPTS.length;
  return (
    <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 sm:p-8">
      <span className="text-[10px] tracking-[0.28em] uppercase text-primary/90">Today's Pause Prompt</span>
      <p className="font-heading text-2xl sm:text-3xl font-light leading-snug mt-4 text-foreground">
        {PROMPTS[dayIndex]}
      </p>
      <p className="mt-5 text-xs text-muted-foreground">
        Sit with it for 60 seconds before you answer. The first answer is rarely the honest one.
      </p>
    </div>
  );
}

export default function PauseHub() {
  const jsonLd = [
    webPage("/pause-hub", "The Pause Hub — Reset Your Nervous System in 60 Seconds", "WebPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Pause Hub", path: "/pause-hub" },
      ],
      "/pause-hub"
    ),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SEOHead
        title="The Pause Hub — Reset in 60 Seconds | FocusFlow AI"
        description="Free guided pauses, breath rituals, and clarity prompts. Built by Coach Kay to slow you down on purpose so you can move forward with intention."
        path="/pause-hub"
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden className="text-primary font-medium">Focus</span>
          <span aria-hidden className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-6 max-w-4xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs inline-flex items-center gap-2">
          <PauseIcon className="h-3 w-3" strokeWidth={1.75} /> THE PAUSE HUB
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
        >
          Slow down on purpose. Move with intention.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Most people don't need more hustle. They need a real pause — long enough for the
          honest answer to surface. Use this room any time you feel scattered, stuck, or about
          to react when you should respond.
        </p>
      </section>

      {/* BREATH */}
      <section className="relative z-10 px-6 sm:px-10 max-w-3xl mx-auto py-6">
        <AnimatedSection>
          <div className="rounded-2xl border border-border/40 bg-card/30 p-6 sm:p-10">
            <div className="text-center mb-2">
              <span className="text-[10px] tracking-[0.28em] uppercase text-primary/90">Box Breath · Live</span>
            </div>
            <BreathOrb />
            <p className="text-center text-sm text-muted-foreground max-w-md mx-auto">
              Follow the orb. Three rounds is enough to drop your heart rate and bring your
              prefrontal cortex back online.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* DAILY PROMPT */}
      <section className="relative z-10 px-6 sm:px-10 max-w-3xl mx-auto py-8">
        <AnimatedSection>
          <DailyPrompt />
        </AnimatedSection>
      </section>

      {/* RITUALS */}
      <section className="relative z-10 px-6 sm:px-10 max-w-5xl mx-auto py-10">
        <AnimatedSection>
          <div className="text-center mb-8">
            <span className="font-mono-label text-primary tracking-[0.28em] text-xs">FOUR PAUSE RITUALS</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light mt-3">
              Pick the one your body needs.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RITUALS.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.name}
                  className="rounded-xl border border-border/40 bg-card/40 p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {r.duration}
                    </span>
                  </div>
                  <p className="font-heading text-xl font-light mb-2">{r.name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 sm:px-10 max-w-3xl mx-auto pb-20 pt-4 text-center">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-light mb-3">
            Ready for more than a pause?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            A full Clarity Session takes 90 seconds and gives you a real next step — not just a
            breath. Free, no signup required to start.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/clarity"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Start a Clarity Session <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 text-foreground px-5 py-2.5 text-sm font-medium tracking-wide hover:border-primary/40 transition-colors"
            >
              Browse Challenges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}