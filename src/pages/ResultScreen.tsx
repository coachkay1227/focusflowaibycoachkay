import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateInsight, type ClarityAnswers } from "@/lib/clarity-engine";
import { saveSessionCloud, getRecentSessionsCloud, hasHistoryCloud, type SessionRecord } from "@/lib/session-store";
import { updateModuleProgress } from "@/lib/enrollment-store";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Trophy, ArrowLeft, TrendingUp, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";

interface InsightResult {
  truth: string;
  pattern: string;
  action: string;
}

interface PatternResult {
  summary: string;
  recurring: string;
  growth: string;
  callout: string;
}

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as { answers: ClarityAnswers; moduleId?: string } | undefined;
  const answers = state?.answers;
  const moduleId = state?.moduleId || "clarity-check";
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [patterns, setPatterns] = useState<PatternResult | null>(null);
  const [loadingPatterns, setLoadingPatterns] = useState(false);

  useEffect(() => {
    if (!answers) {
      navigate("/clarity");
      return;
    }
    fetchInsight();
  }, [answers, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const fetchInsight = async () => {
    if (!answers) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("clarity-insight", {
        body: { answers, moduleId },
      });

      if (error || data?.error) {
        console.warn("AI insight failed, using local fallback:", error || data?.error);
        setInsight(generateInsight(answers));
      } else {
        setInsight(data as InsightResult);
      }
    } catch (e) {
      console.warn("AI insight error, using local fallback:", e);
      setInsight(generateInsight(answers));
    }

    setReady(true);

    // Save session
    const session: SessionRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      moduleId,
      answers,
      insight: null,
    };

    // Fetch patterns if returning user
    const hasHist = await hasHistoryCloud();
    if (hasHist) {
      fetchPatterns();
    }

    // Save with insight after state update
    setTimeout(() => {
      session.insight = insight;
      saveSessionCloud(session);
    }, 100);

    // Update module enrollment progress
    updateModuleProgress(moduleId);
  };

  const fetchPatterns = async () => {
    setLoadingPatterns(true);
    try {
      const sessions = await getRecentSessionsCloud(5);
      const { data, error } = await supabase.functions.invoke("pattern-detect", {
        body: { sessions },
      });
      if (!error && !data?.error) {
        setPatterns(data as PatternResult);
      }
    } catch (e) {
      console.warn("Pattern detection failed:", e);
    }
    setLoadingPatterns(false);
  };

  if (!answers) return null;

  const sections = insight
    ? [
        { label: "THE TRUTH", title: "Here's what's really going on", content: insight.truth, color: "text-primary" },
        { label: "THE PATTERN", title: "Here's what keeps showing up", content: insight.pattern, color: "text-accent" },
        { label: "THE ACTION", title: "Here's your next move", content: insight.action, color: "text-primary" },
      ]
    : [];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <MobileNav />
      </div>

      {!ready ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-8 rounded-full border border-primary/30 flex items-center justify-center"
              style={{ animation: "pulse-glow 1.5s ease-in-out infinite" }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="font-heading text-2xl font-light text-foreground/80">Generating your clarity...</p>
            <p className="text-muted-foreground text-sm mt-2">Coach Kay is reading your answers</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="font-mono-label text-primary tracking-[0.2em]">Your Clarity Report</span>
            <h1
              className="font-heading text-3xl md:text-5xl font-light mt-4"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
            >
              Here's what I see.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              This isn't a diagnosis. It's a mirror. Read slowly. Let it land.
            </p>
          </AnimatedSection>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <AnimatedSection key={section.label} delay={i * 200}>
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8">
                  <span className="font-mono-label text-primary/60 tracking-[0.15em]">{section.label}</span>
                  <h3 className={`font-heading text-xl md:text-2xl font-light mt-2 mb-4 ${section.color}`}>
                    {section.title}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">{section.content}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Pattern Evolution Section */}
          {(patterns || loadingPatterns) && (
            <>
              <AnimatedSection delay={700} className="my-12">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </AnimatedSection>

              <AnimatedSection delay={800}>
                <div className="clarity-card rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-mono-label text-primary tracking-[0.15em]">Pattern Evolution</span>
                  </div>
                  {loadingPatterns ? (
                    <p className="text-muted-foreground text-sm">Analyzing your patterns across sessions...</p>
                  ) : patterns ? (
                    <div className="space-y-4">
                      <p className="text-foreground/80 leading-relaxed">{patterns.summary}</p>
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 rounded-lg bg-card/20 border border-border/50">
                          <span className="font-mono-label text-primary/60 text-xs">Recurring</span>
                          <p className="text-foreground/70 text-sm mt-2">{patterns.recurring}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-card/20 border border-border/50">
                          <span className="font-mono-label text-primary/60 text-xs">Growth</span>
                          <p className="text-foreground/70 text-sm mt-2">{patterns.growth}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/15">
                        <span className="font-mono-label text-primary/80 text-xs">Coach Kay's Call-Out</span>
                        <p className="text-foreground/80 text-sm mt-2 italic">{patterns.callout}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </AnimatedSection>
            </>
          )}

          {/* Gold divider */}
          <AnimatedSection delay={800} className="my-16">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection delay={900} className="text-center space-y-4">
            <h3 className="font-heading text-2xl md:text-3xl font-light mb-8">What's your next move?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Button
                onClick={() => navigate("/coach", { state: { context: { ...insight, answers } } })}
                className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform px-8 py-6"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Continue with AI Coach
              </Button>
              <Button
                variant="outline"
                className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-8 py-6"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Session with Coach Kay
              </Button>
              <Button
                variant="outline"
                className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-8 py-6"
                onClick={() => navigate("/challenges")}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Start a Challenge
              </Button>
            </div>
          </AnimatedSection>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
