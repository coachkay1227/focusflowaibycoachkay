import { useState, useRef, useEffect } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate, useParams } from "react-router-dom";
import { clarityQuestions, type ClarityAnswers } from "@/lib/clarity-engine";
import { getModule } from "@/lib/modules";
import type { ModuleQuestion } from "@/lib/modules";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ClaritySession = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId?: string }>();
  const { toast } = useToast();
  
  // Get questions from module or default
  const resolvedModuleId = moduleId || "clarity-check";
  const mod = getModule(resolvedModuleId);
  const questions: ModuleQuestion[] = (mod && mod.questions.length > 0) ? mod.questions : clarityQuestions;
  const moduleTitle = mod?.title || "Clarity Check";

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

  const finishSession = (finalAnswers: Record<string, string>) => {
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
    try {
      await supabase.from("cohort_registrations").insert({
        email: gateEmail.trim().toLowerCase(),
        first_name: gateName.trim() || null,
        cohort_name: "Clarity Code — Free Check",
        source: resolvedModuleId,
      });
    } catch (err) {
      // Non-blocking — still let them see their result
      console.warn("cohort_registrations insert failed", err);
    }
    navigate("/result", { state: { answers: pendingAnswers as unknown as ClarityAnswers, moduleId: resolvedModuleId } });
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
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead title={`${moduleTitle} — FocusFlow AI`} description="Begin your guided clarity check. Answer honest questions and receive personalized insights about your patterns and potential." path="/clarity" jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Clarity Session", provider: { "@type": "Person", name: "Coach Kay", jobTitle: "Master Certified Life Coach" }, description: "Guided self-reflection session" }} />
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
          <span className="font-mono-label text-primary/60 tracking-[0.2em]">{question.label}</span>

          <h2
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-light mt-4 mb-3 leading-tight"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
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
                className="bg-card/30 border-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground/40 min-h-[120px] text-base resize-none focus:border-primary/40"
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
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                className="bg-background/50 border-border"
              />
              <Input
                type="email"
                required
                autoFocus
                placeholder="you@email.com"
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
