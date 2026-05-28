import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/use-access-level";
import { useSubscription } from "@/hooks/use-subscription";
import { getProgramBySlug, FOCUS_PILLARS, getRecommendedPrograms, getReplacementOffer } from "@/data/programs";
import { enrollInModule } from "@/lib/enrollment-store";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { TIER_RANK, TIER_LABELS } from "@/lib/tier-constants";
import SEOHead from "@/components/SEOHead";
import { programSchema } from "@/lib/seo-schema";
import FloatingOrbs from "@/components/FloatingOrbs";
import MobileNav from "@/components/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Lock, Star, Users, CheckCircle2, Sparkles, ArrowRight, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import ApplyNowDialog from "@/components/ApplyNowDialog";

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const { startCheckout } = useSubscription();
  const [enrolling, setEnrolling] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const program = slug ? getProgramBySlug(slug) : undefined;
  const replacement = program ? getReplacementOffer(program) : undefined;

  // Per-lead-magnet routing — never route to a generic clarity fallback
  const leadMagnetTarget = (slug?: string): string => {
    switch (slug) {
      case "mac-type-assessment":
        return "/assessment";
      case "kpi-roi-tracker":
        return "/starter-kit";
      case "focus-clarity-check":
      default:
        return "/clarity";
    }
  };

  // Retired programs: redirect to closest current offer after a beat
  useEffect(() => {
    if (program?.visibility === "retired" && replacement) {
      const t = setTimeout(() => navigate(`/programs/${replacement.slug}`, { replace: true }), 2500);
      return () => clearTimeout(t);
    }
  }, [program, replacement, navigate]);

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl mb-2">Program not found</h1>
          <button onClick={() => navigate("/modules")} className="text-primary hover:underline text-sm">
            ← Back to Programs
          </button>
        </div>
      </div>
    );
  }

  // Retired: contextual replacement screen
  if (program.visibility === "retired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <span className="font-mono-label text-primary/70 tracking-[0.2em] text-xs">PROGRAM UPDATED</span>
          <h1 className="font-heading text-2xl md:text-3xl font-light mt-3 mb-3">{program.title} has evolved</h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            This program is no longer offered as a standalone purchase. Its core curriculum now lives inside{" "}
            <span className="text-foreground">{replacement?.title ?? "our current transformation paths"}</span>.
          </p>
          {replacement ? (
            <Button onClick={() => navigate(`/programs/${replacement.slug}`)} className="gap-2">
              See {replacement.title} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/modules")} className="gap-2">
              View transformation paths <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const pillar = FOCUS_PILLARS[program.pillar];
  const hasAccess = program.accessTier === "free" || (user && TIER_RANK[tier] >= TIER_RANK[program.accessTier]);
  const canStart = program.type === "assessment";
  const recommended = getRecommendedPrograms(program.id, 3);
  const isBackend = program.visibility === "backend";
  const isLeadMagnet = program.visibility === "lead_magnet";
  const isPublicOffer = program.visibility === "public";
  const backendParent = isBackend ? getReplacementOffer(program) : undefined;

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(true);
    await enrollInModule(program.id);
    setEnrolling(false);
    toast.success("Enrolled! Added to your dashboard.");
  };

  const jsonLd = programSchema(program);

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead
        title={`${program.title} — FocusFlow AI`}
        description={program.tagline}
        path={`/programs/${program.slug}`}
        jsonLd={jsonLd}
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/modules")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Programs
        </button>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </div>

      <main className="relative z-10 px-6 py-8 max-w-3xl mx-auto">
        {/* Pillar & Meta */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold"
            style={{ borderColor: pillar.color, color: pillar.color }}
          >
            {program.pillar}
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {program.pillarFull} Pillar
            </span>
            <div className="flex items-center gap-2">
              {program.isFeatured && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
              {program.isNew && <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">New</Badge>}
              <Badge className="bg-muted text-muted-foreground text-xs capitalize">{program.type}</Badge>
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <h1
          className="font-heading text-3xl md:text-5xl font-light mb-3"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          {program.title}
        </h1>
        <p className="text-primary/80 italic text-base md:text-lg mb-6">{program.tagline}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {program.durationLabel}</span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {program.audience.join(", ")}</span>
          {program.accessTier !== "free" && (
            <Badge className="bg-primary/15 text-primary border-primary/30 capitalize text-xs">
              {TIER_LABELS[program.accessTier]}
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 mb-8">
          <p className="text-foreground/90 leading-relaxed">{program.description}</p>
        </div>

        {/* What You Get */}
        <div className="mb-8">
          <h2 className="font-heading text-xl font-light mb-4">What You Get</h2>
          <ul className="space-y-2">
            {program.whatYouGet.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Transformation */}
        <div className="bg-card/50 border border-primary/20 rounded-xl p-6 mb-8">
          <h2 className="font-heading text-lg font-light mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> The Transformation
          </h2>
          <p className="text-foreground/80 leading-relaxed">{program.transformation}</p>
        </div>

        {/* Coach Note */}
        <div className="border-l-2 border-primary/30 pl-5 mb-8">
          <p className="text-xs uppercase tracking-wider text-primary/60 mb-2">Coach Kay says</p>
          <p className="text-foreground/80 italic leading-relaxed">"{program.coachNote}"</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {program.tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{tag}</span>
          ))}
        </div>

        {/* Try Free Clarity Check — shown for paid non-assessment programs */}
        {program.accessTier !== "free" && program.type !== "assessment" && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Not sure yet? Try a free Clarity Check
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Get a personalized insight session — no subscription needed.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/clarity")}
              className="shrink-0 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" /> Free Clarity Check
            </Button>
          </div>
        )}

        {/* Pricing & CTA */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-3xl font-heading font-light text-foreground">
                {isBackend ? "Included with enrollment" : program.priceDisplay}
              </div>
              {program.paymentPlan && (
                <p className="text-sm text-muted-foreground mt-1">{program.paymentPlan.label}</p>
              )}
              {isBackend && backendParent && (
                <p className="text-sm text-muted-foreground mt-1">
                  Part of <span className="text-primary">{backendParent.title}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {isPublicOffer ? (
                <Button onClick={() => setApplyOpen(true)} className="gap-2">
                  <Sparkles className="h-4 w-4" /> Apply for {program.title}
                </Button>
              ) : isLeadMagnet ? (
                <Button onClick={() => navigate(leadMagnetTarget(program.slug))} className="gap-2">
                  <Download className="h-4 w-4" /> {program.price === 0 ? "Get it free" : "Start now"}
                </Button>
              ) : isBackend && backendParent ? (
                <>
                  <Button onClick={() => setApplyOpen(true)} className="gap-2">
                    <Sparkles className="h-4 w-4" /> Apply for {backendParent.title}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Unlocked when you enroll in the parent offer</p>
                </>
              ) : !hasAccess ? (
                <>
                  {user ? (
                    <Button
                      onClick={async () => {
                        const tierConfigs = STRIPE_TIERS[program.accessTier as keyof typeof STRIPE_TIERS];
                        const tierConfig = tierConfigs?.[0];
                        if (tierConfig) {
                          try {
                            await startCheckout(tierConfig.price_id);
                          } catch (e) {
                            toast.error("Could not start checkout. Please try again.");
                          }
                        } else {
                          navigate("/modules");
                        }
                      }}
                      className="gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      {(() => {
                        const tc = STRIPE_TIERS[program.accessTier as keyof typeof STRIPE_TIERS]?.[0];
                        return tc ? (tc.interval === "month" ? `Subscribe — $${tc.price}/mo` : `Purchase — $${tc.price}`) : "Get Access";
                      })()}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/auth")} className="gap-2">
                      <Lock className="h-4 w-4" /> Sign In to Access
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">Requires {TIER_LABELS[program.accessTier]} access</p>
                </>
              ) : program.isGated && program.cohortCode ? (
                <Button variant="outline" className="gap-2" disabled>
                  <Lock className="h-4 w-4" /> Cohort Code Required
                </Button>
              ) : program.isGated ? (
                <Button variant="outline" className="gap-2" disabled>
                  <CheckCircle2 className="h-4 w-4" /> Application Required
                </Button>
              ) : canStart ? (
                <div className="flex gap-3">
                  <Button onClick={() => navigate(leadMagnetTarget(program.slug))} className="gap-2">
                    <Sparkles className="h-4 w-4" /> Start Session
                  </Button>
                  {user && (
                    <Button variant="outline" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? "Enrolling..." : "Enroll"}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={handleEnroll} disabled={enrolling} className="gap-2">
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-light mb-4">Related Programs</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {recommended.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => navigate(`/programs/${rec.slug}`)}
                  className="text-left bg-card/30 border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="text-xs text-muted-foreground mb-1">{rec.durationLabel} · {rec.type}</div>
                  <div className="text-sm font-medium text-foreground mb-1">{rec.title}</div>
                  <div className="flex items-center gap-1 text-xs text-primary/60">
                    View <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <ApplyNowDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        mode="application"
        programName={isBackend && backendParent ? backendParent.title : program.title}
      />
    </div>
  );
};

export default ProgramDetail;
