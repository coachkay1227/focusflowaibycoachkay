import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useRoles } from "@/hooks/use-roles";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Sparkles, Zap } from "lucide-react";
import ApplyNowDialog from "@/components/ApplyNowDialog";
import { trackEvent, trackCta } from "@/lib/analytics";
import { isAdminPreviewArmed } from "@/lib/admin-preview";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReportView from "@/components/reports/ReportView";
import PillarStrip from "@/components/PillarStrip";
import PillarBadge from "@/components/PillarBadge";

// ──────────────────────────────────────────────────────────────────────────────
// Operator × Bottleneck Map
// 6 forced-choice scenarios. 3 reveal HOW you operate (M/A/C archetype),
// 3 reveal WHERE you're stuck (F.O.C.U.S.-aligned bucket).
// ──────────────────────────────────────────────────────────────────────────────

type Axis = "operator" | "bottleneck";
type Dimension = "M" | "A" | "C";
type Bucket = "CLARITY" | "FOCUS" | "UPLEVEL" | "OWNERSHIP";

interface OperatorOption {
  archetype: string; // single letter, e.g. "V"
  label: string;
  desc: string;
}
interface BottleneckOption {
  bucket: Bucket;
  label: string;
  desc: string;
}
type AnyOption = OperatorOption | BottleneckOption;

interface OperatorQuestion {
  id: string;
  axis: "operator";
  dimension: Dimension;
  label: string;
  question: string;
  subtitle: string;
  options: OperatorOption[];
}
interface BottleneckQuestion {
  id: string;
  axis: "bottleneck";
  label: string;
  question: string;
  subtitle: string;
  options: BottleneckOption[];
}
type Question = OperatorQuestion | BottleneckQuestion;

const MIND_LABELS: Record<string, string> = { A: "Analyst", V: "Visionary", S: "Strategist", E: "Empath" };
const ACTION_LABELS: Record<string, string> = { B: "Builder", M: "Mover", R: "Refiner", C: "Connector" };
const CHARACTER_LABELS: Record<string, string> = { N: "Anchor", T: "Catalyst", G: "Guardian", P: "Pioneer" };

const BUCKET_LABEL: Record<Bucket, string> = {
  CLARITY: "Clarity",
  FOCUS: "Focus",
  UPLEVEL: "Uplevel",
  OWNERSHIP: "Ownership",
};
const BUCKET_PLAIN: Record<Bucket, string> = {
  CLARITY: "You don't know what to build, sell, or say next.",
  FOCUS: "You know what to do. You just can't get it done.",
  UPLEVEL: "The work is good. No one is seeing it.",
  OWNERSHIP: "Money, systems, and time are leaking.",
};

// Deterministic combo → primary path map.
type PathKey = "clarity" | "reset30" | "uplevel60" | "rentAgent" | "advisory";
const PATHS: Record<PathKey, { name: string; tagline: string; route: string; ctaLabel: string }> = {
  clarity: {
    name: "Free Clarity Check",
    tagline: "One question. Sharper than a week of journaling. Free.",
    route: "/clarity",
    ctaLabel: "Start the Clarity Check",
  },
  reset30: {
    name: "30-Day Business Reset",
    tagline: "Cohort. 30 days. You ship what you've been stalling on.",
    route: "/programs/30-day-business-reset",
    ctaLabel: "Apply for the Reset",
  },
  uplevel60: {
    name: "Uplevel 60 · 1:1 with Coach Kay",
    tagline: "60 days, direct line, custom build. For operators ready to be seen.",
    route: "/coach-kay",
    ctaLabel: "See if Uplevel 60 fits",
  },
  rentAgent: {
    name: "Rent-an-Agent",
    tagline: "Borrow a fractional operator. Plug the leaks. Keep the receipts.",
    route: "/rent-an-agent",
    ctaLabel: "Explore Rent-an-Agent",
  },
  advisory: {
    name: "Advisory",
    tagline: "Quarterly advisory for founders running real revenue.",
    route: "/advisory",
    ctaLabel: "See Advisory",
  },
};

const COMBO_TO_PATH: Record<Bucket, { primary: PathKey; alternates: PathKey[] }> = {
  CLARITY: { primary: "clarity", alternates: ["reset30", "uplevel60"] },
  FOCUS: { primary: "reset30", alternates: ["clarity", "uplevel60"] },
  UPLEVEL: { primary: "uplevel60", alternates: ["reset30", "advisory"] },
  OWNERSHIP: { primary: "rentAgent", alternates: ["advisory", "reset30"] },
};

// ──────────────────────────────────────────────────────────────────────────────
// The 6 questions (hand-authored, zero repetition)
// ──────────────────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  // ── OPERATOR · MIND ────────────────────────────────────────────────────────
  {
    id: "op_mind",
    axis: "operator",
    dimension: "M",
    label: "OPERATOR · 01 / 03",
    question: "You have 90 minutes before a client call you haven't prepped. What actually happens?",
    subtitle: "Honest reflex, not the disciplined version.",
    options: [
      { archetype: "A", label: "Pull the file, re-read every note", desc: "You won't speak until the logic holds." },
      { archetype: "V", label: "Sit with the bigger picture for 20 minutes", desc: "You want to walk in with a frame, not facts." },
      { archetype: "S", label: "Sketch a 3-step path for the call", desc: "Goal at the top, route to it underneath." },
      { archetype: "E", label: "Tune into how they sounded last time", desc: "You read the human before the agenda." },
    ],
  },
  // ── OPERATOR · ACTION ──────────────────────────────────────────────────────
  {
    id: "op_action",
    axis: "operator",
    dimension: "A",
    label: "OPERATOR · 02 / 03",
    question: "A launch you planned for 6 weeks just lost its hero asset 48 hours out. Your move?",
    subtitle: "Reflex, not press release.",
    options: [
      { archetype: "B", label: "Build a replacement tonight", desc: "Sleeves up. Done beats perfect." },
      { archetype: "M", label: "Ship something rough and adjust live", desc: "Momentum first, polish in motion." },
      { archetype: "R", label: "Rework what already exists into the hero slot", desc: "Edit your way out of it." },
      { archetype: "C", label: "Call three people who can rescue it with you", desc: "You move through your room, not alone." },
    ],
  },
  // ── OPERATOR · CHARACTER ───────────────────────────────────────────────────
  {
    id: "op_char",
    axis: "operator",
    dimension: "C",
    label: "OPERATOR · 03 / 03",
    question: "Your most loyal client just left for a cheaper competitor. First thing that rises in you?",
    subtitle: "The first feeling, not the second response.",
    options: [
      { archetype: "N", label: "Quiet acceptance, already running the math", desc: "Steady. You don't flinch in public." },
      { archetype: "T", label: "A burst of energy to chase the next ten", desc: "Pain becomes fuel inside an hour." },
      { archetype: "G", label: "A protective instinct for the rest of your roster", desc: "You guard who's still here first." },
      { archetype: "P", label: "An impulse to build something they can't copy", desc: "You'd rather invent than defend." },
    ],
  },
  // ── BOTTLENECK · 1 ─────────────────────────────────────────────────────────
  {
    id: "bn_friction",
    axis: "bottleneck",
    label: "BOTTLENECK · 01 / 03",
    question: "When you sit down to work this week, the friction shows up as…",
    subtitle: "What actually slows the first hour.",
    options: [
      { bucket: "CLARITY", label: "I'm not sure what to work on first", desc: "Too many open loops, no clear north." },
      { bucket: "FOCUS", label: "I know the task, I just drift off it", desc: "Tabs, errands, anything but the page." },
      { bucket: "UPLEVEL", label: "I post and it lands in a quiet room", desc: "The work is shipping. The audience isn't growing." },
      { bucket: "OWNERSHIP", label: "I'm doing admin I should've handed off months ago", desc: "Time bleeds before the real work starts." },
    ],
  },
  // ── BOTTLENECK · 2 ─────────────────────────────────────────────────────────
  {
    id: "bn_break",
    axis: "bottleneck",
    label: "BOTTLENECK · 02 / 03",
    question: "If a $10K month landed tomorrow, the part that breaks first is…",
    subtitle: "Where your business cracks under success.",
    options: [
      { bucket: "CLARITY", label: "I don't know what to sell them next", desc: "There's no Offer 2. There's barely an Offer 1." },
      { bucket: "FOCUS", label: "I can't deliver and sell at the same time", desc: "Execution capacity hits a wall fast." },
      { bucket: "UPLEVEL", label: "I have no pipeline behind this month", desc: "It's a spike, not a curve." },
      { bucket: "OWNERSHIP", label: "Operations: invoicing, contracts, onboarding", desc: "Money in, paperwork everywhere." },
    ],
  },
  // ── BOTTLENECK · 3 ─────────────────────────────────────────────────────────
  {
    id: "bn_avoid",
    axis: "bottleneck",
    label: "BOTTLENECK · 03 / 03",
    question: "The thing you keep avoiding in your business is…",
    subtitle: "The one you'd rather not type out loud.",
    options: [
      { bucket: "CLARITY", label: "Naming what I actually do, in one sentence", desc: "Positioning. The thing that won't sit still." },
      { bucket: "FOCUS", label: "Sitting down with the hard task for 90 minutes", desc: "Deep work without escape routes." },
      { bucket: "UPLEVEL", label: "Putting myself in front of bigger rooms", desc: "Pitches, partnerships, paid visibility." },
      { bucket: "OWNERSHIP", label: "Looking at the numbers and naming what's broken", desc: "P&L, pricing, leaks, refunds." },
    ],
  },
];

function topCode<T extends string>(counts: Record<string, number>, fallback: T): T {
  let best: T = fallback;
  let bestN = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestN) {
      bestN = v;
      best = k as T;
    }
  }
  return best;
}
function rankBuckets(counts: Record<string, number>): Bucket[] {
  const order: Bucket[] = ["CLARITY", "FOCUS", "UPLEVEL", "OWNERSHIP"];
  return [...order].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
}

const Assessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useRoles();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  useMouseGlow(containerRef);

  const [questions] = useState<Question[]>(() => QUESTIONS);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [animState, setAnimState] = useState<"enter" | "exit" | "idle">("enter");
  const [applyOpen, setApplyOpen] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [gateName, setGateName] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [elaborating, setElaborating] = useState(false);
  const [insight, setInsight] = useState<{
    archetype_name: string;
    combo_line?: string;
    pattern_line?: string;
    combo_reason?: string;
    mind: string;
    action: string;
    character: string;
    strength: string;
    growth_edge: string;
  } | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  // Admin preview shortcut — fill every question with the first option.
  useEffect(() => {
    if (!isAdmin) return;
    if (searchParams.get("preview") !== "1") return;
    if (!isAdminPreviewArmed()) return;
    const prefilled: Record<string, string> = {};
    for (const q of questions) {
      const first = q.options[0] as AnyOption | undefined;
      if (!first) continue;
      prefilled[q.id] = "archetype" in first ? first.archetype : first.bucket;
    }
    setAnswers(prefilled);
    setDone(true);
  }, [isAdmin, searchParams, questions]);

  const total = questions.length;
  const current = questions[step];
  const progress = done ? 100 : ((step + 1) / total) * 100;
  const selected = current ? answers[current.id] : undefined;

  const tallies = () => {
    const m: Record<string, number> = {};
    const a: Record<string, number> = {};
    const c: Record<string, number> = {};
    const b: Record<string, number> = {};
    questions.forEach((q) => {
      const v = answers[q.id];
      if (!v) return;
      if (q.axis === "operator") {
        const bucket = q.dimension === "M" ? m : q.dimension === "A" ? a : c;
        bucket[v] = (bucket[v] || 0) + 1;
      } else {
        b[v] = (b[v] || 0) + 1;
      }
    });
    return { m, a, c, b };
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

  let result:
    | {
        mind: string;
        action: string;
        character: string;
        code: string;
        primaryBucket: Bucket;
        secondaryBucket: Bucket;
        primaryPath: PathKey;
        alternatePaths: PathKey[];
      }
    | null = null;
  if (done) {
    const { m, a, c, b } = tallies();
    const mind = topCode(m, "V");
    const action = topCode(a, "B");
    const character = topCode(c, "N");
    const ranked = rankBuckets(b);
    const primaryBucket = ranked[0] ?? "CLARITY";
    const secondaryBucket = ranked[1] ?? primaryBucket;
    const map = COMBO_TO_PATH[primaryBucket];
    result = {
      mind,
      action,
      character,
      code: `${mind}-${action}-${character}`,
      primaryBucket,
      secondaryBucket,
      primaryPath: map.primary,
      alternatePaths: map.alternates,
    };
  }

  // Fire completion event once.
  useEffect(() => {
    if (!done || !result) return;
    void trackEvent(
      "assessment_completed",
      {
        code: result.code,
        mind: result.mind,
        action: result.action,
        character: result.character,
        primary_bucket: result.primaryBucket,
        secondary_bucket: result.secondaryBucket,
      },
      "business",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (!done || !result || insight || elaborating) return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user?.email) {
        setAuthedEmail(session.user.email);
        await runElaborate(null, null);
      } else {
        setShowGate(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const runElaborate = async (email: string | null, name: string | null) => {
    if (!result) return;
    setElaborating(true);
    try {
      const { data, error } = await supabase.functions.invoke("mac-elaborate", {
        body: {
          code: result.code,
          answers,
          primaryBucket: result.primaryBucket,
          secondaryBucket: result.secondaryBucket,
          email: email ?? undefined,
          name: name ?? undefined,
        },
      });
      if (error) throw error;
      if (data?.insight) {
        setInsight(data.insight);
        setGeneratedAt(new Date());
      } else {
        throw new Error("No insight returned");
      }
    } catch (err) {
      console.error("mac-elaborate failed", err);
      toast({
        title: "Couldn't generate your report",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setElaborating(false);
    }
  };

  const submitGate = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = gateEmail.trim().toLowerCase();
    if (!email) return;
    const name = gateName.trim() || null;
    setShowGate(false);
    void supabase
      .from("cohort_registrations")
      .insert({
        email,
        first_name: name,
        cohort_name: "Operator × Bottleneck Map",
        source: "assessment",
      })
      .then(() => undefined, () => undefined);
    await runElaborate(email, name);
  };

  const handleEmailReport = async () => {
    const recipient = authedEmail ?? gateEmail.trim().toLowerCase();
    if (!recipient) throw new Error("No recipient");
    const { error } = await supabase.functions.invoke("client-notify", {
      body: {
        action: "clarity_complete",
        data: { source: "operator-bottleneck-map", code: result?.code, bucket: result?.primaryBucket },
      },
    });
    if (error) throw error;
  };

  const archetypeName =
    insight?.archetype_name ??
    (result
      ? `${MIND_LABELS[result.mind]}-${CHARACTER_LABELS[result.character]}`
      : "");

  const comboHeadline =
    insight?.combo_line ??
    (result
      ? `You're a ${archetypeName} stuck at ${result.primaryBucket}.`
      : "");

  const primaryPath = result ? PATHS[result.primaryPath] : null;
  const alternatePaths = result ? result.alternatePaths.map((k) => PATHS[k]) : [];

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay grid-overlay">
      <SEOHead
        title="Operator × Bottleneck Map — FocusFlow AI"
        description="Six business scenarios. One named pattern. Discover the exact combination of how you operate and where you're stuck — and the one move that unlocks it. Free, ~3 minutes."
        path="/assessment"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Operator × Bottleneck Map",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: "https://coachkayai.life/assessment",
          description:
            "6-scenario diagnostic mapping your operator type (Mind/Action/Character) against your current business bottleneck (Clarity/Focus/Uplevel/Ownership). Personalised next-move recommendation in about 3 minutes.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          creator: { "@type": "Person", name: "Coach Kay" },
        }}
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
            OPERATOR × BOTTLENECK MAP
          </span>
        </div>

        {!done && (
          <div className="mb-10">
            <Progress value={progress} className="h-1 bg-border" />
            <div className="mt-2 font-mono-label text-[10px] tracking-wider text-muted-foreground/70 flex justify-between">
              <span>~{Math.max(1, Math.ceil(((total - step) * 25) / 60))} MIN LEFT</span>
              <span>{step + 1} / {total}</span>
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
              style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.12)" }}
            >
              {current.question}
            </h1>
            <p className="text-muted-foreground mt-2">{current.subtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {current.options.map((opt) => {
                const value = "archetype" in opt ? opt.archetype : opt.bucket;
                const isSel = selected === value;
                return (
                  <button
                    key={value}
                    onClick={() => select(value)}
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
                {step === total - 1 ? "Reveal My Map" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {done && result && primaryPath && (
          <div className="animate-fade-in">
            <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
              YOUR OPERATOR × BOTTLENECK MAP
            </span>
            <h1
              className="font-heading text-4xl md:text-6xl font-light mt-3 text-primary leading-tight"
              style={{ textShadow: "0 0 50px hsl(var(--primary) / 0.25)" }}
            >
              {comboHeadline}
            </h1>
            <p className="text-muted-foreground mt-4 text-base">
              {MIND_LABELS[result.mind]} · {ACTION_LABELS[result.action]} ·{" "}
              {CHARACTER_LABELS[result.character]}
              <span className="mx-2 text-primary/40">·</span>
              Primary: {BUCKET_LABEL[result.primaryBucket]} · Secondary:{" "}
              {BUCKET_LABEL[result.secondaryBucket]}
            </p>
            <div className="mt-5">
              <PillarBadge pillar={result.primaryBucket.charAt(0) as "C" | "F" | "U" | "O"} />
            </div>

            {/* AI pattern line (or fallback) */}
            <div className="mt-10 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm p-6 md:p-8">
              <span className="font-mono-label text-[10px] tracking-wider text-primary/80">
                THE PATTERN
              </span>
              {elaborating && !insight ? (
                <div className="mt-3 space-y-3">
                  <div className="h-5 rounded bg-card/60 animate-pulse" />
                  <div className="h-5 rounded bg-card/60 animate-pulse w-11/12" />
                  <div className="h-5 rounded bg-card/60 animate-pulse w-3/4" />
                  <p className="text-center text-sm text-muted-foreground pt-3">
                    Coach Kay is reading your map…
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-foreground/95 leading-relaxed text-lg font-heading font-light">
                    {insight?.pattern_line ?? BUCKET_PLAIN[result.primaryBucket]}
                  </p>
                  {insight?.combo_reason && (
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {insight.combo_reason}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* THE next move — single decisive card */}
            <div className="mt-8">
              <span className="font-mono-label text-[10px] tracking-wider text-primary/70">
                YOUR NEXT MOVE
              </span>
              <button
                onClick={() => {
                  trackCta("assessment_primary_path", "business", {
                    code: result?.code,
                    bucket: result?.primaryBucket,
                    path: result?.primaryPath,
                  });
                  navigate(primaryPath.route);
                }}
                className="mt-3 w-full text-left rounded-xl border border-primary/60 bg-gradient-to-br from-primary/15 to-primary/5 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-primary hover:shadow-[0_0_40px_hsl(43_75%_52%/0.25)] group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-heading text-2xl md:text-3xl text-foreground font-light">
                      {primaryPath.name}
                    </div>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {primaryPath.tagline}
                    </p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-primary shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-5 inline-flex items-center gap-2 font-mono-label text-[11px] tracking-[0.2em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {primaryPath.ctaLabel.toUpperCase()}
                </div>
              </button>
            </div>

            {/* Alternates */}
            {alternatePaths.length > 0 && (
              <div className="mt-8">
                <span className="font-mono-label text-[10px] tracking-wider text-muted-foreground/70">
                  OR EXPLORE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {alternatePaths.map((p, i) => (
                    <button
                      key={p.route}
                      onClick={() => {
                        trackCta("assessment_alternate_path", "business", {
                          code: result?.code,
                          bucket: result?.primaryBucket,
                          path: result?.alternatePaths[i],
                        });
                        navigate(p.route);
                      }}
                      className="text-left rounded-lg border border-border bg-card/40 backdrop-blur-sm p-4 transition-all hover:border-primary/40"
                    >
                      <div className="font-heading text-base text-foreground">{p.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{p.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI-generated long-form report (kept, fed by the same insight fields) */}
            {insight && generatedAt && (
              <div className="mt-12">
                <ReportView
                  title={insight.archetype_name}
                  subtitle={`${archetypeName} · Primary bottleneck: ${BUCKET_LABEL[result.primaryBucket]}`}
                  generatedAt={generatedAt}
                  userEmail={authedEmail ?? (gateEmail.trim().toLowerCase() || undefined)}
                  onEmail={authedEmail ? handleEmailReport : undefined}
                  sections={[
                    { heading: `Mind · ${MIND_LABELS[result.mind]}`, body: insight.mind },
                    { heading: `Action · ${ACTION_LABELS[result.action]}`, body: insight.action },
                    { heading: `Character · ${CHARACTER_LABELS[result.character]}`, body: insight.character },
                    { heading: `Strength against ${BUCKET_LABEL[result.primaryBucket]}`, body: insight.strength },
                    { heading: `Growth edge for ${BUCKET_LABEL[result.primaryBucket]}`, body: insight.growth_edge },
                  ]}
                />
              </div>
            )}

            <div className="mt-12 flex flex-col sm:flex-row gap-3 no-print">
              <Button
                onClick={() => {
                  trackCta("apply_business_reset", "business", { code: result?.code, bucket: result?.primaryBucket });
                  setApplyOpen(true);
                }}
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/40 text-foreground hover:text-primary"
              >
                Apply for the 30-Day Business Reset
              </Button>
              <Button
                onClick={restart}
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Retake the map
              </Button>
            </div>
            <div className="mt-16">
              <PillarStrip />
            </div>
          </div>
        )}
      </div>

      {/* Email gate */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6">
          <form
            onSubmit={submitGate}
            className="w-full max-w-md rounded-xl border border-primary/30 bg-card/95 backdrop-blur-md p-8 shadow-2xl"
          >
            <div className="flex items-center gap-2 font-mono-label text-primary tracking-[0.2em] text-xs mb-3">
              <Sparkles className="h-4 w-4" />
              ONE LAST STEP
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-light leading-tight mb-2">
              Your map is ready.
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your email and Coach Kay will name the pattern and route you to your next move.
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="First name (optional)"
                aria-label="First name (optional)"
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                className="bg-background/50 border-border"
              />
              <Input
                type="email"
                required
                autoFocus
                placeholder="you@email.com"
                aria-label="Email address"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={!gateEmail.trim()}
              className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base"
            >
              Unlock My Map
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 font-mono-label text-muted-foreground/60 text-[10px] tracking-[0.15em]">
              <Zap className="h-3 w-3" />
              NO SPAM · NO CARD · UNSUBSCRIBE ANY TIME
            </div>
          </form>
        </div>
      )}
      <ApplyNowDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        mode="application"
        programName="30-Day Business Reset"
      />
    </div>
  );
};

export default Assessment;
