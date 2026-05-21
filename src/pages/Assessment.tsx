import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

type Dimension = "M" | "A" | "C";

interface MacOption {
  value: string; // archetype code, e.g. "V"
  label: string;
  desc: string;
}

interface MacQuestion {
  id: string;
  dimension: Dimension;
  label: string;
  question: string;
  subtitle: string;
  options: MacOption[];
}

// Mind archetypes: Analyst (A), Visionary (V), Strategist (S), Empath (E)
// Action archetypes: Builder (B), Mover (M), Refiner (R), Connector (C)
// Character archetypes: Anchor (N), Catalyst (T), Guardian (G), Pioneer (P)

const MIND_OPTIONS: MacOption[] = [
  { value: "A", label: "Analyst", desc: "I break things down to understand them" },
  { value: "V", label: "Visionary", desc: "I see the bigger picture first" },
  { value: "S", label: "Strategist", desc: "I map the path between today and the goal" },
  { value: "E", label: "Empath", desc: "I feel the room before I think it" },
];

const ACTION_OPTIONS: MacOption[] = [
  { value: "B", label: "Builder", desc: "I create the thing brick by brick" },
  { value: "M", label: "Mover", desc: "I act fast and adjust mid-flight" },
  { value: "R", label: "Refiner", desc: "I improve what already exists" },
  { value: "C", label: "Connector", desc: "I make things happen through people" },
];

const CHARACTER_OPTIONS: MacOption[] = [
  { value: "N", label: "Anchor", desc: "Steady, dependable, calm under pressure" },
  { value: "T", label: "Catalyst", desc: "I bring energy that moves the room" },
  { value: "G", label: "Guardian", desc: "I protect what matters most" },
  { value: "P", label: "Pioneer", desc: "I'd rather go first than wait" },
];

const MIND_LABELS: Record<string, string> = { A: "Analyst", V: "Visionary", S: "Strategist", E: "Empath" };
const ACTION_LABELS: Record<string, string> = { B: "Builder", M: "Mover", R: "Refiner", C: "Connector" };
const CHARACTER_LABELS: Record<string, string> = { N: "Anchor", T: "Catalyst", G: "Guardian", P: "Pioneer" };

const MIND_DESC: Record<string, string> = {
  A: "You lead with reason. You don't move until the logic holds — and when it does, you move with conviction.",
  V: "You see what isn't there yet. Your gift is naming the future before others can picture it.",
  S: "You're the one who turns vision into a sequence of moves. You think in routes, not destinations.",
  E: "You read what's underneath words. Your intelligence is human-first — and that's a competitive edge.",
};
const ACTION_DESC: Record<string, string> = {
  B: "You finish things. Your power is compounding effort — steady hands beat flashy starts.",
  M: "You act, then refine. Momentum is your operating system — standing still feels like going backwards.",
  R: "You take the rough draft and make it sing. Mastery lives in your edits.",
  C: "You move through relationships. Doors open for you because you remember the human on the other side.",
};
const CHAR_DESC: Record<string, string> = {
  N: "You are the steady ground others stand on. Your calm is a leadership style.",
  T: "You change the temperature of a room by walking into it. Use that on purpose.",
  G: "You protect people, standards, and missions. Your loyalty is your moral compass.",
  P: "You move first. The cost of being early is loneliness — the reward is the territory you claim.",
};

function buildQuestions(): MacQuestion[] {
  const mindPrompts = [
    { q: "When you face a new problem, what do you do first?", s: "First instinct, not best practice." },
    { q: "How do you make sense of a chaotic situation?", s: "There's no wrong answer here." },
    { q: "When someone shares an idea with you, you naturally...", s: "Notice your default reaction." },
    { q: "What feels most satisfying to figure out?", s: "Where does your mind want to go?" },
    { q: "When you read a long article, what sticks with you?", s: "Be honest about what your brain holds onto." },
    { q: "Your favorite kind of conversation is one that...", s: "Where do you come alive intellectually?" },
  ];
  const actionPrompts = [
    { q: "When you start something new, you...", s: "What's your true rhythm?" },
    { q: "Under a tight deadline, your default mode is to...", s: "Not what you wish — what actually happens." },
    { q: "You'd rather be known as someone who...", s: "Pick the version closest to true." },
    { q: "When the plan changes mid-project, you...", s: "Your reflex matters more than your strategy." },
    { q: "Your best work tends to happen when you...", s: "Recall a recent win." },
    { q: "Looking at a half-finished thing, your urge is to...", s: "What pulls at you?" },
  ];
  const charPrompts = [
    { q: "People who know you best would say you are...", s: "What's the word that keeps coming back?" },
    { q: "In a crisis, you tend to become...", s: "Pressure reveals truth." },
    { q: "The role you keep getting pulled into is...", s: "Patterns are signals." },
    { q: "What you protect most fiercely is...", s: "What you'd defend without hesitation." },
    { q: "When a group is uncertain, you...", s: "Your instinct in the silence." },
    { q: "The quality you most want to be remembered for is...", s: "The legacy version." },
  ];

  const qs: MacQuestion[] = [];
  mindPrompts.forEach((p, i) =>
    qs.push({
      id: `m${i + 1}`,
      dimension: "M",
      label: `MIND · ${String(i + 1).padStart(2, "0")} / 06`,
      question: p.q,
      subtitle: p.s,
      options: MIND_OPTIONS,
    })
  );
  actionPrompts.forEach((p, i) =>
    qs.push({
      id: `a${i + 1}`,
      dimension: "A",
      label: `ACTION · ${String(i + 1).padStart(2, "0")} / 06`,
      question: p.q,
      subtitle: p.s,
      options: ACTION_OPTIONS,
    })
  );
  charPrompts.forEach((p, i) =>
    qs.push({
      id: `c${i + 1}`,
      dimension: "C",
      label: `CHARACTER · ${String(i + 1).padStart(2, "0")} / 06`,
      question: p.q,
      subtitle: p.s,
      options: CHARACTER_OPTIONS,
    })
  );
  return qs;
}

function topCode(counts: Record<string, number>, fallback: string): string {
  let best = fallback;
  let bestN = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestN) {
      bestN = v;
      best = k;
    }
  }
  return best;
}

const Assessment = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  useMouseGlow(containerRef);

  const [questions] = useState<MacQuestion[]>(() => buildQuestions());
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [animState, setAnimState] = useState<"enter" | "exit" | "idle">("enter");

  const total = questions.length;
  const current = questions[step];
  const progress = done ? 100 : ((step + 1) / total) * 100;
  const selected = current ? answers[current.id] : undefined;

  const tallies = () => {
    const m: Record<string, number> = {};
    const a: Record<string, number> = {};
    const c: Record<string, number> = {};
    questions.forEach((q) => {
      const v = answers[q.id];
      if (!v) return;
      const bucket = q.dimension === "M" ? m : q.dimension === "A" ? a : c;
      bucket[v] = (bucket[v] || 0) + 1;
    });
    return { m, a, c };
  };

  const goNext = () => {
    if (!selected) return;
    if (step === total - 1) {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAnimState("exit");
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimState("enter");
    }, 250);
  };

  const goBack = () => {
    if (step === 0) {
      navigate("/");
      return;
    }
    setAnimState("exit");
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimState("enter");
    }, 250);
  };

  const select = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
    setAnimState("enter");
  };

  let result: { mind: string; action: string; character: string; code: string } | null = null;
  if (done) {
    const { m, a, c } = tallies();
    const mind = topCode(m, "V");
    const action = topCode(a, "B");
    const character = topCode(c, "N");
    result = { mind, action, character, code: `${mind}-${action}-${character}` };
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden grain-overlay grid-overlay"
    >
      <SEOHead
        title="Business Clarity Assessment — FocusFlow AI"
        description="Discover how your Mind, Action, and Character drive your business decisions. 18 questions. A personalized clarity profile from Coach Kay."
        path="/assessment"
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 && !done ? "Home" : "Back"}
          </button>
          <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
            BUSINESS CLARITY ASSESSMENT
          </span>
        </div>

        {!done && (
          <div className="mb-10">
            <Progress value={progress} className="h-1 bg-border" />
            <div className="mt-2 font-mono-label text-[10px] tracking-wider text-muted-foreground/70 text-right">
              {step + 1} / {total}
            </div>
          </div>
        )}

        {!done && current && (
          <div
            className="transition-all duration-300"
            style={{
              opacity: animState === "exit" ? 0 : 1,
              transform: animState === "exit" ? "translateY(8px)" : "translateY(0)",
            }}
          >
            <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
              {current.label}
            </span>
            <h1
              className="font-heading text-3xl md:text-4xl font-light mt-3 leading-tight"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.12)" }}
            >
              {current.question}
            </h1>
            <p className="text-muted-foreground mt-2">{current.subtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {current.options.map((opt) => {
                const isSel = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className={`text-left rounded-lg border p-4 transition-all backdrop-blur-sm ${
                      isSel
                        ? "border-primary/70 bg-primary/10 shadow-[0_0_30px_hsl(43_75%_52%/0.15)]"
                        : "border-border bg-card/40 hover:border-primary/40"
                    }`}
                  >
                    <div className="font-heading text-lg text-foreground">{opt.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex justify-end">
              <Button
                onClick={goNext}
                disabled={!selected}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {step === total - 1 ? "Reveal My Clarity Profile" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {done && result && (
          <div className="animate-fade-in">
            <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
              YOUR CLARITY PROFILE
            </span>
            <h1
              className="font-heading text-5xl md:text-7xl font-light mt-3 text-primary"
              style={{ textShadow: "0 0 50px hsl(43 75% 52% / 0.25)" }}
            >
              {result.code}
            </h1>
            <p className="text-muted-foreground mt-3">
              {MIND_LABELS[result.mind]} · {ACTION_LABELS[result.action]} ·{" "}
              {CHARACTER_LABELS[result.character]}
            </p>

            <div className="mt-10 space-y-6">
              <div className="clarity-card rounded-lg border border-border bg-card/40 backdrop-blur-sm p-6">
                <span className="font-mono-label text-[10px] tracking-wider text-primary/70">
                  MIND — {MIND_LABELS[result.mind]}
                </span>
                <p className="text-foreground/90 mt-2 leading-relaxed">{MIND_DESC[result.mind]}</p>
              </div>
              <div className="clarity-card rounded-lg border border-border bg-card/40 backdrop-blur-sm p-6">
                <span className="font-mono-label text-[10px] tracking-wider text-primary/70">
                  ACTION — {ACTION_LABELS[result.action]}
                </span>
                <p className="text-foreground/90 mt-2 leading-relaxed">
                  {ACTION_DESC[result.action]}
                </p>
              </div>
              <div className="clarity-card rounded-lg border border-border bg-card/40 backdrop-blur-sm p-6">
                <span className="font-mono-label text-[10px] tracking-wider text-primary/70">
                  CHARACTER — {CHARACTER_LABELS[result.character]}
                </span>
                <p className="text-foreground/90 mt-2 leading-relaxed">
                  {CHAR_DESC[result.character]}
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/clarity")}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Take the Clarity Check
              </Button>
              <Button
                onClick={() => navigate("/modules")}
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/40 text-foreground hover:text-primary"
              >
                Explore Pathways
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={restart}
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Retake
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;