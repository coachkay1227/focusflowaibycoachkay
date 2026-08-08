import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, FileText, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingLinks } from "@/hooks/use-booking-links";
import { useBuyerOnboarding } from "@/hooks/use-buyer-onboarding";
import { offerRoute } from "@/lib/offer-routes";
import { wantsStrategyCall } from "@/lib/booking-thresholds";
import { trackEvent } from "@/lib/analytics";

const PILLARS = ["foundation", "opportunity", "create", "uplift", "support"] as const;
const TOTAL_STEPS = 3;

type CtaKind = "paid_call" | "free_call" | "offer" | "community" | "waitlist" | "dashboard";

interface ResolvedCta {
  kind: CtaKind;
  label: string;
  href: string;
  external: boolean;
  note: string;
}

/**
 * Buyer onboarding at /start.
 *
 * Three short steps: what the results say, the one offer that fits next, and a
 * single button to move. Shows once, then the dashboard stops nudging.
 */
export default function Start() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { freeClarityUrl, paidStrategyUrl } = useBookingLinks();
  const { loading, audit, purchase, empty, markCompleted } = useBuyerOnboarding(token);
  const [step, setStep] = useState(1);

  const report = audit?.report ?? null;
  const nextMove = report?.next_best_move ?? null;
  const recommendedSlug = nextMove?.offer_slug ?? audit?.recommendedOffer ?? null;

  // Nothing to onboard from: send them somewhere useful instead of an empty flow.
  useEffect(() => {
    if (!loading && empty) navigate(user ? "/dashboard" : "/audit", { replace: true });
  }, [loading, empty, navigate, user]);

  useEffect(() => {
    if (loading || empty) return;
    void trackEvent("buyer_onboarding_view", {
      has_audit: !!audit,
      has_report: !!report,
      recommended_offer: recommendedSlug,
      purchase_source: purchase?.source ?? null,
    });
  }, [loading, empty, audit, report, recommendedSlug, purchase]);

  const cta = useMemo<ResolvedCta>(() => {
    const route = offerRoute(recommendedSlug);
    // Anyone already above the strategy-call line gets the paid session; the
    // $47 audit on its own gets the free clarity call.
    const earnedPaidCall = wantsStrategyCall({
      amountSubtotalCents: purchase?.amountCents ?? null,
    });

    if (route.opening_soon) {
      return {
        kind: "waitlist",
        label: route.label ?? "Get notified when it opens",
        href: "/rent-an-agent",
        external: false,
        note: "This one is not open yet. Add your name and you'll hear from me first.",
      };
    }

    if (route.contact === "community") {
      return {
        kind: "community",
        label: route.label ?? "Join the community",
        href: route.href,
        external: true,
        note: "Free to join. Fiscally sponsored, so no one gets left behind.",
      };
    }

    if (route.contact === "application") {
      return earnedPaidCall
        ? {
            kind: "paid_call",
            label: "Book your 60-minute strategy session",
            href: paidStrategyUrl,
            external: true,
            note: "We scope it together on the call. Pick a time that works for you.",
          }
        : {
            kind: "free_call",
            label: "Book your free 15-minute clarity call",
            href: freeClarityUrl,
            external: true,
            note: "No charge, no pitch. Bring the one thing you're stuck on.",
          };
    }

    return {
      kind: "offer",
      label: nextMove?.offer_name ? `Start ${nextMove.offer_name}` : "See your next step",
      href: route.href,
      external: !!route.external,
      note: "You can start this on your own, today.",
    };
  }, [recommendedSlug, purchase, nextMove, paidStrategyUrl, freeClarityUrl]);

  const handlePrimary = () => {
    void trackEvent("buyer_onboarding_cta", {
      cta: cta.kind,
      recommended_offer: recommendedSlug,
    });
    void markCompleted();
  };

  const goToStep = (next: number) => {
    setStep(next);
    void trackEvent("buyer_onboarding_step", { step: next, recommended_offer: recommendedSlug });
  };

  const skip = async () => {
    await markCompleted();
    navigate(user ? "/dashboard" : "/audit");
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Getting your results
      </div>
    );
  }

  if (empty) return null;

  const firstAction = report?.seven_day_plan?.[0] ?? null;

  return (
    <div className="min-h-dvh bg-background px-5 py-12 sm:py-16">
      <SEOHead
        title="Start Here"
        description="Your results, your recommended next move, and one step to take now."
        path="/start"
        noIndex
      />

      <div className="mx-auto w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </span>
            <button
              type="button"
              onClick={skip}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Skip for now
            </button>
          </div>
          <div className="h-1 w-full rounded-full bg-border/60 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1 — what we found */}
        {step === 1 && (
          <section className="animate-in fade-in duration-300">
            <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-3">
              {audit ? "Here's what we found" : "Your access is active"}
            </h1>

            {audit && report ? (
              <>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {report.executive_snapshot ||
                    "Your audit is ready. Here's the short version."}
                </p>

                {report.where_youre_leaking && (
                  <div className="rounded-lg border border-primary/40 bg-card/50 p-6 mb-6">
                    <h2 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      Where you're leaking
                    </h2>
                    <p className="text-foreground/90 leading-relaxed">
                      {report.where_youre_leaking}
                    </p>
                  </div>
                )}

                {report.focus_diagnostic && (
                  <div className="rounded-lg border border-border/60 bg-card/40 p-6 mb-6">
                    <h2 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-4">
                      Your F.O.C.U.S. scores
                    </h2>
                    <ul className="space-y-3">
                      {PILLARS.map((key) => {
                        const d = report.focus_diagnostic?.[key];
                        if (!d) return null;
                        return (
                          <li key={key}>
                            <div className="flex items-baseline justify-between gap-4 mb-1">
                              <span className="text-sm capitalize text-foreground">{key}</span>
                              <span className="text-sm text-primary font-medium">
                                {d.score}/10
                              </span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-border/60 overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${Math.min(100, Math.max(0, d.score * 10))}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {firstAction && (
                  <div className="rounded-lg border border-border/60 bg-card/40 p-6">
                    <h2 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      Your first action
                    </h2>
                    <p className="text-foreground font-medium mb-2">{firstAction.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {firstAction.action}
                    </p>
                  </div>
                )}
              </>
            ) : audit ? (
              <div className="rounded-lg border border-border/60 bg-card/40 p-6">
                <p className="text-foreground/90 leading-relaxed mb-2">
                  Your payment is confirmed and your report is still being written.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {audit.hasIntake
                    ? "This usually takes under two minutes. I'll email you the moment it's ready, and your place here is saved."
                    : "One step left. Finish your intake questions and your report generates right after."}
                </p>
                {!audit.hasIntake && (
                  <Button asChild variant="outline" className="mt-5 border-primary/40 text-primary hover:bg-primary/10">
                    <Link to={`/audit/intake/${audit.id}${token ? `?token=${encodeURIComponent(token)}` : ""}`}>
                      Complete my intake
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 bg-card/40 p-6">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Check className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Nothing is pending on your side.</span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">Purchased</dt>
                    <dd className="text-foreground font-medium text-right break-words">
                      {purchase?.productName}
                    </dd>
                  </div>
                </dl>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                  Your access is live in your dashboard. I review every new order myself, so
                  anything that needs my hands is already in my queue.
                </p>
              </div>
            )}

            <div className="mt-10">
              <Button
                onClick={() => goToStep(2)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 2 — recommended next move */}
        {step === 2 && (
          <section className="animate-in fade-in duration-300">
            <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-3">
              Your recommended next move
            </h1>

            {nextMove?.offer_name ? (
              <>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Out of every door I have open, this is the one that fits where you are.
                </p>
                <div className="rounded-lg border border-primary/40 bg-card/50 p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <h2 className="font-heading text-2xl text-foreground">
                      {nextMove.offer_name}
                    </h2>
                  </div>
                  {nextMove.why_this_one && (
                    <div>
                      <h3 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Why this one
                      </h3>
                      <p className="text-foreground/90 leading-relaxed">{nextMove.why_this_one}</p>
                    </div>
                  )}
                  {nextMove.what_youll_get && (
                    <div>
                      <h3 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        What you'll get
                      </h3>
                      <p className="text-foreground/90 leading-relaxed">
                        {nextMove.what_youll_get}
                      </p>
                    </div>
                  )}
                  {nextMove.investment && (
                    <div>
                      <h3 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Investment
                      </h3>
                      <p className="text-foreground/90 leading-relaxed">{nextMove.investment}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {audit
                    ? "Your recommendation lands with your report. Until then, the fastest thing you can do is talk it through with me."
                    : "You're in. The next step is a short conversation so we set this up around your actual week, not a template."}
                </p>
                <div className="rounded-lg border border-border/60 bg-card/40 p-6">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-foreground/90 leading-relaxed">
                      Bring one bottleneck. We name it, then we pick the smallest change that
                      moves it.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => goToStep(3)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => goToStep(1)}
                className="text-muted-foreground hover:text-foreground"
              >
                Back
              </Button>
            </div>
          </section>
        )}

        {/* Step 3 — one button */}
        {step === 3 && (
          <section className="animate-in fade-in duration-300">
            <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-3">
              One step, then you're moving
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">{cta.note}</p>

            <div className="rounded-lg border border-primary/40 bg-card/50 p-6">
              {cta.external ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePrimary}
                >
                  <a href={cta.href} target="_blank" rel="noopener noreferrer">
                    {cta.label}
                  </a>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePrimary}
                >
                  <Link to={cta.href}>{cta.label}</Link>
                </Button>
              )}
            </div>

            {!user && (
              <div className="mt-6 rounded-lg border border-border/60 bg-card/40 p-6">
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                  Create your account and this audit, plus everything you do next, follows you.
                </p>
                <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                  <Link to="/auth">Create my account</Link>
                </Button>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {audit && report && (
                <Link
                  to={`/audit/report/${audit.id}${token ? `?token=${encodeURIComponent(token)}` : ""}`}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-4 w-4" /> Read the full report
                </Link>
              )}
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                Go to dashboard
              </Link>
              <Link to="/challenges" className="text-muted-foreground hover:text-foreground">
                Pick a challenge
              </Link>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            </div>

            <p className="mt-10 font-heading text-sm text-primary">
              Where Focus Goes, Energy Flows.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}