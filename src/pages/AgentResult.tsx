import { AIDisclaimer } from "@/components/AIDisclaimer";
import { useRef, useState } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { type AgentAnswers, type AgentRecommendation } from "@/lib/agent-router";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, MessageCircle, RotateCcw, Check } from "lucide-react";
import ApplyNowDialog from "@/components/ApplyNowDialog";
import MobileNav from "@/components/MobileNav";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function pathLabel(path: string): string {
  if (path === 'gpt') return 'Custom GPT Agent';
  if (path === 'claude') return 'Claude Project Agent';
  if (path === 'ghl') return 'GHL (GoHighLevel) Agent';
  return path;
}

// ── Component ─────────────────────────────────────────────────────────────────

const AgentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const state = location.state as
    | { answers: AgentAnswers; recommendation: AgentRecommendation }
    | undefined;

  const recommendation = state?.recommendation;
  const answers = state?.answers;

  const [applyOpen, setApplyOpen] = useState(false);

  useMouseGlow(containerRef);

  // Guard, if no state, redirect back
  if (!recommendation || !answers) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center bg-background text-foreground px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No recommendation found.</p>
          <Link to="/agent-builder" className="text-primary underline">
            Take the assessment
          </Link>
        </div>
      </div>
    );
  }

  // Build the apply dialog pre-fill message
  const totalText = recommendation.isCustomQuote
    ? 'Custom Quote'
    : recommendation.totalMonthly > 0 && recommendation.totalOneTime > 0
    ? `$${recommendation.totalOneTime} one-time + $${recommendation.totalMonthly}/mo`
    : recommendation.totalMonthly > 0
    ? `$${recommendation.totalMonthly}/mo`
    : `$${recommendation.totalOneTime} one-time`;
  const scopeLabel = `${pathLabel(recommendation.path)} · ${answers.agentCount} agent${answers.agentCount === '1' ? '' : 's'} · ${answers.ownershipPref}`;

  const primaryButtonLabel = recommendation.isCustomQuote
    ? 'Start My Agent Intake'
    : 'Secure My Agent →';

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead
        title="Your Agent Recommendation: Coach Kay Elevates"
        description="Your personalized AI agent recommendation from Coach Kay. See exactly what to build and how much it costs."
        path="/agent-result"
        noIndex
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/agent-builder')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back to agent builder"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Coach Kay</span> Elevates
        </div>
        <MobileNav />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto">

        {/* Top label + headline */}
        <AnimatedSection className="text-center mb-12">
          <span className="font-mono-label text-primary tracking-[0.2em]">
            YOUR AGENT RECOMMENDATION
          </span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4 leading-tight"
            style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.15)' }}
          >
            {recommendation.headline}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            {recommendation.description}
          </p>
        </AnimatedSection>

        {/* Price card */}
        <AnimatedSection delay={200} className="mb-8">
          <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm p-8">
            <span className="font-mono-label text-primary tracking-[0.15em] text-xs">
              INVESTMENT
            </span>

            {recommendation.isCustomQuote ? (
              <div className="mt-4">
                <p className="font-heading text-2xl font-light text-primary">
                  Scoped before payment
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  {recommendation.priceNote}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recommendation.priceLines.map((line, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-foreground/80">{line.label}</span>
                    <span className="text-foreground font-medium shrink-0">
                      {line.amount === 0 ? 'Included' : `${formatCurrency(line.amount)}${line.isMonthly ? '/mo' : ''}`}
                    </span>
                  </div>
                ))}

                <div className="border-t border-border/50 pt-4 mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">Your investment</span>
                    <div className="text-right">
                      {recommendation.totalOneTime > 0 && (
                        <div className="text-primary font-heading text-xl">
                          {formatCurrency(recommendation.totalOneTime)} one-time
                        </div>
                      )}
                      {recommendation.totalMonthly > 0 && (
                        <div className={`font-heading text-xl ${recommendation.totalOneTime > 0 ? 'text-muted-foreground text-base' : 'text-primary'}`}>
                          {formatCurrency(recommendation.totalMonthly)}/mo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* What's included */}
        <AnimatedSection delay={350} className="mb-8">
          <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm p-8">
            <span className="font-mono-label text-primary tracking-[0.15em] text-xs">
              WHAT'S INCLUDED
            </span>
            <ul className="mt-5 space-y-3">
              {recommendation.includes.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/85 text-sm">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>

        {/* Existing documents strengthen the required AI Brain foundation. */}
        {recommendation.knowledgeBaseFlag && (
          <AnimatedSection delay={500} className="mb-8">
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 backdrop-blur-sm p-8">
              <span className="font-mono-label text-amber-400/80 tracking-[0.15em] text-xs">
                YOUR DOCUMENTS ARE AN ADVANTAGE
              </span>
              <h3 className="font-heading text-xl font-light text-amber-300 mt-3 mb-2">
                They go into your AI Brain
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed">
                Every agent build starts with the $197 AI Brain. Your SOPs, guides, and brand material become the shared foundation so each agent sounds like you and follows the same rules. This is part of the scope, not a surprise add-on after you apply.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* Gold divider */}
        <AnimatedSection delay={600} className="my-12">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </AnimatedSection>

        {/* CTAs */}
        <AnimatedSection delay={700} className="text-center space-y-5">
          <h2 className="font-heading text-2xl md:text-3xl font-light mb-2">
            Ready to build your agent?
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Submit your details and Coach Kay's specialist partners will review the scope within one business day.
          </p>

          <Button
            onClick={() => setApplyOpen(true)}
            className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform px-10 py-6 text-lg shadow-lg shadow-primary/20"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {primaryButtonLabel}
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-6 py-4"
              onClick={() => navigate('/coach')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Talk to Coach Kay
            </Button>
            <Button
              variant="outline"
              className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-6 py-4"
              onClick={() => navigate('/agent-builder')}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Assessment
            </Button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/rent-an-agent')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Explore all AI agent services →
            </button>
          </div>
        </AnimatedSection>

        <AIDisclaimer />

      </div>

      <ApplyNowDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        mode="application"
        programName={recommendation.isCustomQuote ? scopeLabel : `${scopeLabel} · ${totalText}`}
      />
    </div>
  );
};

export default AgentResult;
