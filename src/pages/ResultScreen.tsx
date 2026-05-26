import { useEffect, useRef, useState, useMemo } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useLocation, useNavigate } from "react-router-dom";
import { generateInsight, type ClarityAnswers } from "@/lib/clarity-engine";
import { saveSessionCloud, getRecentSessionsCloud, hasHistoryCloud, type SessionRecord } from "@/lib/session-store";
import { updateModuleProgress, getUserPreferences } from "@/lib/enrollment-store";
import { resolveTrack, type TrackResult } from "@/lib/track-resolver";
import { getModule } from "@/lib/modules";
import { getProgramBySlug } from "@/data/programs";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Trophy, ArrowLeft, TrendingUp, MessageCircle, Compass, ArrowRight, Zap, Mail, CheckCircle2, Share2, Copy, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";
import ApplyNowDialog from "@/components/ApplyNowDialog";
import { trackCta } from "@/lib/analytics";
import PillarBadge from "@/components/PillarBadge";
import PillarStrip from "@/components/PillarStrip";

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
  const state = location.state as { answers: ClarityAnswers; moduleId?: string; guestEmail?: string; guestName?: string | null } | undefined;
  const answers = state?.answers;
  const moduleId = state?.moduleId || "clarity-check";
  const guestEmail = state?.guestEmail;
  const guestName = state?.guestName ?? null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [patterns, setPatterns] = useState<PatternResult | null>(null);
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "skipped" | "failed">("idle");
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!answers) {
      navigate("/clarity");
      return;
    }
    fetchInsight();
  }, [answers, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useMouseGlow(containerRef);

  const fetchInsight = async () => {
    if (!answers) return;

    // Generate a stable session id up-front so the server-side email
    // dedupes correctly (idempotency key) and so we can save the same id
    // to history below.
    const sessionId = crypto.randomUUID();

    let insightData: InsightResult;
    try {
      const { data, error } = await supabase.functions.invoke("clarity-insight", {
        body: {
          answers,
          moduleId,
          sessionId,
          // Server resolves authed user from JWT; only pass guest fields when
          // we actually have them (anon flow).
          guest_email: guestEmail,
          guest_name: guestName,
        },
      });

      if (error || data?.error) {
        insightData = generateInsight(answers);
      } else {
        insightData = data as InsightResult;
      }
    } catch {
      insightData = generateInsight(answers);
    }

    setInsight(insightData);
    setReady(true);

    // Save session with the local insightData variable (not stale React state)
    const session: SessionRecord = {
      id: sessionId,
      timestamp: Date.now(),
      moduleId,
      answers,
      insight: insightData,
    };
    saveSessionCloud(session);

    // Email + GHL webhook are dispatched server-side by clarity-insight
    // (to either the authed user's verified email OR the guest_email we
    // just captured in the gate). Reflect that in the UI status.
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const recipientEmail = authSession?.user?.email ?? guestEmail ?? null;
    if (recipientEmail) {
      setSentToEmail(recipientEmail);
      setEmailStatus("sent");
    } else {
      setEmailStatus("skipped");
    }

    // Resolve track recommendation
    let resolvedTrack: TrackResult | null = null;
    try {
      const prefs = await getUserPreferences();
      const answersRecord: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) {
        answersRecord[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      resolvedTrack = resolveTrack(
        answersRecord,
        { primaryGoal: prefs?.primaryGoal || undefined, lifeStage: undefined }
      );
      setTrackResult(resolvedTrack);
    } catch {
      const answersRecord: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) {
        answersRecord[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      resolvedTrack = resolveTrack(answersRecord);
      setTrackResult(resolvedTrack);
    }

    // Fetch patterns only for authenticated users (requires JWT)
    const currentSession = authSession;
    if (currentSession) {
      const hasHist = await hasHistoryCloud();
      if (hasHist) {
        fetchPatterns();
      }
    }

    // Update module enrollment progress
    updateModuleProgress(moduleId);

    // Clarity-session GHL webhook is fired by the client-notify wrapper
    // above (server-side, with the user identity verified).
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
    } catch {
      // Pattern detection failed silently
    }
    setLoadingPatterns(false);
  };

  // Get recommended module info for display
  const recommendedModule = useMemo(() => {
    if (!trackResult?.recommendedModuleIds?.[0]) return null;
    return getModule(trackResult.recommendedModuleIds[0]);
  }, [trackResult]);

  const recommendedProgram = useMemo(() => {
    if (!trackResult?.recommendedProgramSlugs?.[0]) return null;
    return getProgramBySlug(trackResult.recommendedProgramSlugs[0]);
  }, [trackResult]);

  const challengeLabel = useMemo(() => {
    if (!trackResult) return "Start a Challenge";
    const type = trackResult.recommendedChallengeType;
    return `${type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())} Challenge`;
  }, [trackResult]);

  // Mirror the user's own words back at them — premium clarity tools always do this.
  const mirroredAnswers = useMemo(() => {
    if (!answers) return [];
    const items: { label: string; value: string }[] = [];
    if (answers.triedSoFar?.trim()) items.push({ label: "What you've tried", value: answers.triedSoFar.trim() });
    if (answers.holdingBack?.trim()) items.push({ label: "What's really in the way", value: answers.holdingBack.trim() });
    if (answers.clarityWouldChange?.trim()) items.push({ label: "What clarity would change first", value: answers.clarityWouldChange.trim() });
    return items;
  }, [answers]);

  const handleShare = async () => {
    const url = `${window.location.origin}/clarity?ref=share`;
    const text = "I just took the Clarity Check by Coach Kay — 5 minutes, no sign-up. It cut through more than I expected.";
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ title: "Clarity Check by Coach Kay", text, url });
        return;
      } catch {
        // user dismissed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      toast({ title: "Link copied", description: "Send it to someone who needs clarity." });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Couldn't copy", description: "Long-press the link to share it manually." });
    }
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
      <SEOHead title="Your Clarity Report — FocusFlow AI" description="Review your personalized clarity insights, patterns, and action steps from your session with Coach Kay." path="/result" noIndex />
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Go back home">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">FocusFlow</span> AI
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
            <div className="mt-5 flex justify-center">
              <PillarBadge pillar="F" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono-label text-primary tracking-[0.15em]">+5 CLARITY SCORE EARNED</span>
            </div>
          </AnimatedSection>

          {/* "What you told me" — mirror the user's own words */}
          {mirroredAnswers.length > 0 && (
            <AnimatedSection delay={50} className="mb-10">
              <div className="clarity-card rounded-lg border border-border bg-card/20 backdrop-blur-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <Quote className="h-5 w-5 text-primary/70" />
                  <span className="font-mono-label text-primary/70 tracking-[0.15em] text-xs">WHAT YOU TOLD ME</span>
                </div>
                <div className="space-y-5">
                  {mirroredAnswers.map((m) => (
                    <div key={m.label} className="border-l-2 border-primary/30 pl-4">
                      <p className="font-mono-label text-muted-foreground/70 text-[10px] tracking-[0.18em] uppercase mb-1.5">
                        {m.label}
                      </p>
                      <p className="text-foreground/85 italic leading-relaxed">"{m.value}"</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground/60">
                  Your words. Read them again before you read what I see below.
                </p>
              </div>
            </AnimatedSection>
          )}

          {emailStatus !== "idle" && emailStatus !== "skipped" && (
            <AnimatedSection delay={100} className="mb-10">
              <div
                className={`clarity-card rounded-lg border p-6 backdrop-blur-sm ${
                  emailStatus === "sent"
                    ? "border-primary/30 bg-primary/5"
                    : emailStatus === "failed"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-card/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {emailStatus === "sent" ? (
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono-label text-primary/70 tracking-[0.15em] text-xs">
                      {emailStatus === "sent"
                        ? "Clarity Code Emailed"
                        : emailStatus === "failed"
                        ? "Email Couldn't Send"
                        : "Sending Your Clarity Code…"}
                    </span>
                    <p className="text-foreground/80 text-sm mt-1">
                      {emailStatus === "sent" && sentToEmail && (
                        <>
                          We just sent your personalized Clarity Code to{" "}
                          <span className="text-primary">{sentToEmail}</span>. Check your inbox (and spam, just in case).
                        </>
                      )}
                      {emailStatus === "sending" && "Hold tight — your Clarity Code is on its way to your inbox."}
                      {emailStatus === "failed" &&
                        "Your report is right here on this page. We couldn't email a copy — you can still take your next step below."}
                    </p>

                    {emailStatus === "sent" && (
                      <div className="mt-5">
                        <p className="font-mono-label text-primary/60 tracking-[0.15em] text-xs mb-3">
                          Your Next Move
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => setApplyOpen(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Calendar className="h-4 w-4" />
                            Book a coaching call
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              navigate(
                                trackResult
                                  ? `/challenges/${trackResult.recommendedChallengeType}`
                                  : "/challenges"
                              )
                            }
                            className="border-primary/30 hover:bg-primary/10"
                          >
                            <Trophy className="h-4 w-4" />
                            Join a challenge
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}



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

          {/* ── Track-Based Recommendation Section ── */}
          {trackResult && (
            <>
              <AnimatedSection delay={900} className="my-12">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </AnimatedSection>

              {/* Phase Card */}
              <AnimatedSection delay={950}>
                <div className="clarity-card rounded-lg border border-primary/25 bg-card/30 backdrop-blur-sm p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Compass className="h-5 w-5 text-primary" />
                    <span className="font-mono-label text-primary tracking-[0.15em]">What Phase You May Be In</span>
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl font-light text-primary mb-3">
                    {trackResult.phaseLabel}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed mb-4">{trackResult.phaseDescription}</p>
                  <p className="text-muted-foreground/50 text-xs italic">
                    This is a coaching reflection, not a diagnosis. It's based on the patterns in your answers.
                  </p>
                </div>
              </AnimatedSection>

              {/* Recommended Path */}
              <AnimatedSection delay={1050} className="mt-8">
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8">
                  <span className="font-mono-label text-primary/60 tracking-[0.15em]">Your Recommended Path</span>
                  <p className="text-muted-foreground text-sm mt-2 mb-6">Based on your answers, here's where to start.</p>

                  <div className="grid gap-4">
                    {/* Recommended module */}
                    {recommendedModule && (
                      <button
                        onClick={() => navigate("/clarity", { state: { moduleId: recommendedModule.id } })}
                        className="w-full text-left p-5 rounded-lg border border-border/50 bg-card/20 hover:border-primary/30 transition-all group"
                      >
                        <span className="font-mono-label text-primary/50 text-xs">Recommended Module</span>
                        <h4 className="font-heading text-lg font-light mt-1 group-hover:text-primary transition-colors">{recommendedModule.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{recommendedModule.subtitle}</p>
                        <span className="inline-flex items-center gap-1 text-primary/60 text-xs mt-2 group-hover:text-primary transition-colors">
                          Start session <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    )}

                    {/* Recommended challenge */}
                    <button
                      onClick={() => navigate(`/challenges/${trackResult.recommendedChallengeType}`)}
                      className="w-full text-left p-5 rounded-lg border border-border/50 bg-card/20 hover:border-primary/30 transition-all group"
                    >
                      <span className="font-mono-label text-primary/50 text-xs">Recommended Challenge</span>
                      <h4 className="font-heading text-lg font-light mt-1 group-hover:text-primary transition-colors">
                        {challengeLabel}
                      </h4>
                      <p className="text-muted-foreground text-sm mt-1">A structured daily coaching experience matched to your current phase.</p>
                      <span className="inline-flex items-center gap-1 text-primary/60 text-xs mt-2 group-hover:text-primary transition-colors">
                        Begin challenge <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>

                    {/* Recommended program */}
                    {recommendedProgram && (
                      <button
                        onClick={() => navigate(`/programs/${recommendedProgram.slug}`)}
                        className="w-full text-left p-5 rounded-lg border border-border/50 bg-card/20 hover:border-primary/30 transition-all group"
                      >
                        <span className="font-mono-label text-primary/50 text-xs">Recommended Program</span>
                        <h4 className="font-heading text-lg font-light mt-1 group-hover:text-primary transition-colors">
                          {recommendedProgram.title}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">{recommendedProgram.tagline}</p>
                        <span className="inline-flex items-center gap-1 text-primary/60 text-xs mt-2 group-hover:text-primary transition-colors">
                          Learn more <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedSection>

              {/* Coach Kay support message */}
              <AnimatedSection delay={1150} className="mt-8">
                <div className="p-6 rounded-lg bg-primary/5 border border-primary/15 text-center">
                  <p className="text-foreground/80 italic leading-relaxed">{trackResult.supportMessage}</p>
                </div>
              </AnimatedSection>
            </>
          )}

          {/* Gold divider */}
          <AnimatedSection delay={1200} className="my-16">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection delay={1300} className="text-center space-y-6">
            <h3 className="font-heading text-2xl md:text-3xl font-light mb-2">Your path forward</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              This pattern won't change on its own — here's where to start.
            </p>

            {/* Primary CTA — apply for the 30-Day Personal Reset */}
            <Button
              onClick={() => {
                trackCta("apply_personal_reset", "personal", { moduleId });
                setApplyOpen(true);
              }}
              className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform px-10 py-6 text-lg shadow-lg shadow-primary/20"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Apply for the 30-Day Personal Reset
            </Button>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap pt-2">
              <Button
                variant="outline"
                className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-6 py-4"
                onClick={() => navigate("/coach", { state: { context: { ...insight, answers } } })}
              >
                <Zap className="mr-2 h-4 w-4" />
                Talk to Coach Kay
              </Button>
              <Button
                variant="outline"
                className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-6 py-4"
                onClick={() => window.open("https://call.coachkayelevates.org/widget/booking/d93xqjlytvCCkndwqJmu", "_blank")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book a Live Session
              </Button>
              {trackResult && (
                <Button
                  variant="outline"
                  className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-6 py-4"
                  onClick={() => navigate(`/challenges/${trackResult.recommendedChallengeType}`)}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  {challengeLabel}
                </Button>
              )}
              {recommendedProgram && (
                <Button
                  variant="outline"
                  className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-6 py-4"
                  onClick={() => navigate(`/programs/${recommendedProgram.slug}`)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {recommendedProgram.title}
                </Button>
              )}
            </div>

            {/* Soft upsell to full programs */}
            <div className="pt-4">
              <button
                onClick={() => navigate("/modules")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                Explore all transformation paths →
              </button>
            </div>
          </AnimatedSection>

          {/* Share block — turn the result into a referral moment */}
          <AnimatedSection delay={1350} className="mt-12">
            <div className="clarity-card rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center">
              <Share2 className="h-6 w-6 text-primary mx-auto mb-3" />
              <h3 className="font-heading text-xl md:text-2xl font-light mb-2">
                Know someone who needs this clarity?
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-5">
                The Clarity Check is free, takes under 5 minutes, and lands deeper than most paid
                assessments. Pass it on.
              </p>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Link copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Share the Clarity Check
                  </>
                )}
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={1400} className="mt-16">
            <PillarStrip />
          </AnimatedSection>
        </div>
      )}

      <ApplyNowDialog open={applyOpen} onOpenChange={setApplyOpen} mode="application" programName="30-Day Personal Reset" />
    </div>
  );
};

export default ResultScreen;
