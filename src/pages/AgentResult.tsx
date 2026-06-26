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

  const [kbAddon, setKbAddon] = useState<'none' | 'basic' | 'full'>('none');
  const [applyOpen, setApplyOpen] = useState(false);

  useMouseGlow(containerRef);

  // Guard — if no state, redirect back
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
  const kbText = kbAddon !== 'none' ? ` Knowledge Base: ${kbAddon === 'basic' ? 'Basic ($197)' : 'Full ($397)'}.` : '';
  const totalText = recommendation.isCustomQuote
    ? 'Custom Quote'
    : recommendation.totalMonthly > 0 && recommendation.totalOneTime > 0
    ? `$${recommendation.totalOneTime} one-time + $${recommendation.totalMonthly}/mo`
    : recommendation.totalMonthly > 0
    ? `$${recommendation.totalMonthly}/mo`
    : `$${recommendation.totalOneTime} one-time`;
  const kbAddAmount = kbAddon === 'basic' ? 197 : kbAddon === 'full' ? 397 : 0;
  const finalOneTime = recommendation.totalOneTime + kbAddAmount;

  const applyMessage = recommendation.isCustomQuote
    ? `Requesting a custom quote for a GoHighLevel (GHL) agent. Agents needed: ${answers.agentCount}. Ownership: ${answers.ownershipPref}.${kbText} I need real-time / phone / SMS capability.`
    : `Agent Type: ${pathLabel(recommendation.path)}. Agents needed: ${answers.agentCount}. Ownership: ${answers.ownershipPref}.${kbText} Total: ${totalText}`;

  const primaryButtonLabel = recommendation.isCustomQuote
    ? 'Request My Custom Quote'
    : 'Secure My Agent →';

  // Knowledge base addon toggle handler
  const toggleKb = (tier: 'basic' | 'full') => {
    setKbAddon((prev) => prev === tier ? 'none' : tier);
  };

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead
        title="Your Agent Recommendation — FocusFlow AI"
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
          <span className="text-primary">FocusFlow</span> AI
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
            <span className="font-mono-label text-primary/60 tracking-[0.15em] text-xs">
              INVESTMENT
            </span>

            {recommendation.isCustomQuote ? (
              <div className="mt-4">
                <p className="font-heading text-2xl font-light text-primary">
                  Custom Quote — based on your scope
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  GHL agents are priced based on your call volume, integrations, and workflows. Request a quote and we'll scope it together.
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

                {/* KB addon if selected */}
                {kbAddon !== 'none' && (
                  <div className="flex items-center justify-between gap-4 text-sm border-t border-border/50 pt-3">
                    <span className="text-amber-400/90">
                      Knowledge Base ({kbAddon === 'basic' ? 'Basic' : 'Full'})
                    </span>
                    <span className="text-amber-400 font-medium">
                      {formatCurrency(kbAddon === 'basic' ? 197 : 397)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border/50 pt-4 mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">Your investment</span>
                    <div className="text-right">
                      {recommendation.totalOneTime > 0 && (
                        <div className="text-primary font-heading text-xl">
                          {formatCurrency(finalOneTime)} one-time
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
            <span className="font-mono-label text-primary/60 tracking-[0.15em] text-xs">
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

        {/* Knowledge base callout */}
        {recommendation.knowledgeBaseFlag && !recommendation.isCustomQuote && (
          <AnimatedSection delay={500} className="mb-8">
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 backdrop-blur-sm p-8">
              <span className="font-mono-label text-amber-400/80 tracking-[0.15em] text-xs">
                KNOWLEDGE BASE ADD-ON
              </span>
              <h3 className="font-heading text-xl font-light text-amber-300 mt-3 mb-2">
                Add a Knowledge Base
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                Since you have existing documents, we recommend training your agent on your business. This is what makes it actually sound like you.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Basic */}
                <button
                  type="button"
                  onClick={() => toggleKb('basic')}
                  className={`text-left rounded-lg border p-5 transition-all ${
                    kbAddon === 'basic'
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-border/60 bg-card/20 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground">Knowledge Base Basic</span>
                    {kbAddon === 'basic' && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                        <Check className="h-3 w-3 text-background" />
                      </div>
                    )}
                  </div>
                  <span className="text-amber-400 font-medium text-sm">$197</span>
                  <p className="text-muted-foreground text-xs mt-1">Up to 10 documents</p>
                </button>

                {/* Full */}
                <button
                  type="button"
                  onClick={() => toggleKb('full')}
                  className={`text-left rounded-lg border p-5 transition-all ${
                    kbAddon === 'full'
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-border/60 bg-card/20 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground">Knowledge Base Full</span>
                    {kbAddon === 'full' && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                        <Check className="h-3 w-3 text-background" />
                      </div>
                    )}
                  </div>
                  <span className="text-amber-400 font-medium text-sm">$397</span>
                  <p className="text-muted-foreground text-xs mt-1">Up to 30 docs + custom system prompt</p>
                </button>
              </div>
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
            Submit your details and Coach Kay's team will get started within 1 business day.
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
        programName={`${pathLabel(recommendation.path)} — ${recommendation.isCustomQuote ? 'Custom Quote' : totalText}${kbText}`}
      />
    </div>
  );
};

export default AgentResult;
