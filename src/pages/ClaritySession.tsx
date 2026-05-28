import { useState, useRef, useEffect } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clarityQuestions, type ClarityAnswers } from "@/lib/clarity-engine";
import { getModule } from "@/lib/modules";
import type { ModuleQuestion } from "@/lib/modules";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { trackClarityStart } from "@/lib/gtag";
import RetiredScreen from "@/components/RetiredScreen";
import { isAdminPreviewArmed } from "@/lib/admin-preview";

/**
 * Legacy /clarity/:moduleId slugs that should no longer render their own quiz.
 * Each maps to the canonical current flow + a friendly destination label.
 */
const LEGACY_CLARITY_REDIRECTS: Record<
  string,
  { legacyName: string; redirectTo: string; redirectLabel: string; reason?: string }
> = {
  // Old standalone modules — now folded into the Personal Clarity Check
  "emotional-reset": {
    legacyName: "Emotional Reset",
    redirectTo: "/clarity",
    redirectLabel: "the Personal Clarity Check",
  },
  "focus-flow": {
    legacyName: "Focus Flow",
    redirectTo: "/clarity",
    redirectLabel: "the Personal Clarity Check",
  },
  "purpose-happiness": {
    legacyName: "Purpose & Happiness",
    redirectTo: "/clarity",
    redirectLabel: "the Personal Clarity Check",
  },
  "goal-shift": {
    legacyName: "Goal Shift",
    redirectTo: "/clarity",
    redirectLabel: "the Personal Clarity Check",
  },
  // Business assessment slug — moved to its own route
  "mac-type-assessment": {
    legacyName: "M.A.C. Type Assessment",
    redirectTo: "/assessment",
    redirectLabel: "the Business Clarity Assessment",
  },
  // AI starter slug — moved to the Starter Kit
  "kpi-roi-tracker": {
    legacyName: "KPI & ROI Tracker",
    redirectTo: "/starter-kit",
    redirectLabel: "the AI Transformation Starter Kit",
  },
};

const ClaritySession = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId?: string }>();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useRoles();
  const { toast } = useToast();

  // Decide up-front whether this URL should show the unified "has evolved"
  // retired screen instead of running a quiz. Renders are predictable —
  // no silent in-place fallbacks to the default Personal quiz.
  const legacyRedirect =
    moduleId && moduleId !== "clarity-check"
      ? LEGACY_CLARITY_REDIRECTS[moduleId] ?? null
      : null;

  const isUnknownModule =
    !!moduleId &&
    moduleId !== "clarity-check" &&
    !legacyRedirect &&
    (() => {
      const mod = getModule(moduleId);
      return !mod || mod.questions.length === 0;
    })();

  // Resolve module + questions (after guard above, moduleId is always valid or undefined)
  const resolvedModuleId = moduleId || "clarity-check";
  const mod = getModule(resolvedModuleId);
  const questions: ModuleQuestion[] =
    mod && mod.questions.length > 0 ? mod.questions : clarityQuestions;
  const moduleTitle = mod?.title || "Personal Clarity Check";

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [animState, setAnimState] = useState<"enter" | "exit" | "idle">("enter");
  const [textValue, setTextValue] = useState("");
  const [showGate, setShowGate] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState<Record<string, string> | null>(null);
  const [gateName, setGateName] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const canProceed = question.type === "options" ? !!answers[question.id] : textValue.trim().length > 0;

  useMouseGlow(containerRef);

  // Render the unified retired screen for legacy / unknown slugs.
  if (legacyRedirect) {
    return <RetiredScreen {...legacyRedirect} />;
  }
  if (isUnknownModule) {
    return (
      <RetiredScreen
        legacyName="That assessment"
        redirectTo="/clarity"
        redirectLabel="the Personal Clarity Check"
        reason="The link you followed is no longer part of the public catalog. Here's the current entry point."
      />
    );
  }

  // GA4: fire clarity_session_start once per real session mount
  useEffect(() => {
    if (!legacyRedirect && !isUnknownModule) {
      trackClarityStart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin-only preview: ?preview=1 prefills answers with the first option of each question
  // and immediately routes to the result screen — no public exposure.
  useEffect(() => {
    if (!isAdmin) return;
    if (searchParams.get("preview") !== "1") return;
    // Hardened: ?preview=1 only works when admin preview mode is explicitly
    // armed for this tab via the Admin Dashboard toggle.
    if (!isAdminPreviewArmed()) return;
    const prefilled: Record<string, string> = {};
    for (const q of questions) {
      if (q.type === "options" && q.options && q.options.length > 0) {
        prefilled[q.id] = q.options[0].value;
      } else {
        prefilled[q.id] = "Preview answer — admin dev mode.";
      }
    }
    navigate("/result", {
      state: { answers: prefilled as unknown as ClarityAnswers, moduleId: resolvedModuleId },
      replace: true,
    });
  }, [isAdmin, searchParams, questions, navigate, resolvedModuleId]);

  const finishSession = (finalAnswers: Record<string, string>) => {
    // Funnel: clarity (Personal Clarity Check) completed
    void trackEvent(
      "clarity_completed",
      { moduleId: resolvedModuleId, questionCount: questions.length },
      "personal"
    );
    // Auth users skip the gate — they've already given us their email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/result", { state: { answers: finalAnswers as unknown as ClarityAnswers, moduleId: resolvedModuleId } });
      } else {
        setPendingAnswers(finalAnswers);
        setShowGate(true);
      }
    });
  };

  const submitGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateEmail.trim() || !pendingAnswers) return;
    setGateSubmitting(true);
    const email = gateEmail.trim().toLowerCase();
    const firstName = gateName.trim() || null;
    try {
      await supabase.from("cohort_registrations").insert({
        email,
        first_name: firstName,
        cohort_name: "Clarity Code — Free Check",
        source: resolvedModuleId,
      });
    } catch (err) {
      console.warn("cohort_registrations insert failed", err);
    }
    navigate("/result", {
      state: {
        answers: pendingAnswers as unknown as ClarityAnswers,
        moduleId: resolvedModuleId,
        guestEmail: email,
        guestName: firstName,
      },
    });
  };

  const goNext = () => {
    if (!canProceed) return;
    if (question.type === "text") {
      setAnswers((prev) => ({ ...prev, [question.id]: textValue }));
    }
    if (currentStep === questions.length - 1) {
      const finalAnswers = { ...answers };
      if (question.type === "text") finalAnswers[question.id] = textValue;
      finishSession(finalAnswers);
      return;
    }
    setAnimState("exit");
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setTextValue(answers[questions[currentStep + 1]?.id] || "");
      setAnimState("enter");
    }, 300);
  };

  const goBack = () => {
    if (currentStep === 0) {
      navigate(moduleId ? "/modules" : "/");
      return;
    }
    if (question.type === "text" && textValue.trim()) {
      setAnswers((prev) => ({ ...prev, [question.id]: textValue }));
    }
    setAnimState("exit");
    setTimeout(() => {
      setCurrentStep((s) => s - 1);
      const prevQ = questions[currentStep - 1];
      if (prevQ.type === "text") setTextValue(answers[prevQ.id] || "");
      setAnimState("enter");
    }, 300);
  };

  const selectOption = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setTimeout(() => {
      if (currentStep === questions.length - 1) {
        const finalAnswers = { ...answers, [question.id]: value };
        finishSession(finalAnswers);
        return;
      }
      setAnimState("exit");
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setTextValue(answers[questions[currentStep + 1]?.id] || "");
        setAnimState("enter");
      }, 300);
    }, 400);
  };

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead
        title={`${moduleTitle} — FocusFlow AI`}
        description={`Begin the ${moduleTitle} clarity check. Answer honest questions and receive personalized insights about your patterns, blockers, and next clear action.`}
        path={moduleId ? `/clarity/${moduleId}` : "/clarity"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: moduleTitle,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          url: `https://coachkayai.life/clarity/${resolvedModuleId}`,
          description: `Interactive clarity assessment: ${moduleTitle}. Answer reflective questions and receive personalized AI-guided insights from Coach Kay.`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          creator: { "@type": "Person", name: "Coach Kay" },
        }}
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">{moduleTitle}</span>
        </div>
        <span className="font-mono-label text-muted-foreground/60">
          {currentStep + 1} / {questions.length}
        </span>
      </div>

      <div className="relative z-10 px-6 md:px-12">
        <Progress value={progress} className="h-[2px] bg-border" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div
          className={`w-full max-w-2xl ${animState === "enter" ? "animate-question-enter" : animState === "exit" ? "animate-question-exit" : ""}`}
          style={{ willChange: "transform, opacity" }}
        >
          <h1 className="sr-only">{moduleTitle} — Clarity Session with Coach Kay</h1>
          <span className="font-mono-label text-primary/60 tracking-[0.2em]">{question.label}</span>

          <h2
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-light mt-4 mb-3 leading-tight"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
          >
            {question.question}
          </h2>

          <p className="text-muted-foreground mb-10 text-base">{question.subtitle}</p>

          {question.type === "options" && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  className={`option-card text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5 ${
                    answers[question.id] === opt.value ? "selected" : ""
                  }`}
                >
                  <span className="block text-foreground font-medium">{opt.label}</span>
                  <span className="block text-muted-foreground text-sm mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === "text" && (
            <div className="space-y-6">
              <Textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={question.placeholder}
                aria-label={question.question}
                className="bg-card/30 border-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground/70 min-h-[120px] text-base resize-none focus:border-primary/40"
                autoFocus
              />
              <div className="flex justify-end">
                <Button
                  onClick={goNext}
                  disabled={!canProceed}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email gate — shown after final answer for anon users */}
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
              Your Clarity Code is ready.
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your email and I'll unlock it now — and send you a copy you can come back to.
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
              disabled={gateSubmitting || !gateEmail.trim()}
              className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base"
            >
              {gateSubmitting ? "Unlocking..." : "Unlock My Clarity Code"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 font-mono-label text-muted-foreground/60 text-[10px] tracking-[0.15em]">
              <Zap className="h-3 w-3" />
              NO SPAM · NO CARD · UNSUBSCRIBE ANY TIME
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClaritySession;
