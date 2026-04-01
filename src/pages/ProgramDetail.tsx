import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/use-access-level";
import { getProgramBySlug, PILLAR_META, type Program } from "@/data/programs";
import { enrollInModule } from "@/lib/enrollment-store";
import SEOHead from "@/components/SEOHead";
import FloatingOrbs from "@/components/FloatingOrbs";
import MobileNav from "@/components/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Lock, Star, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TIER_RANK: Record<string, number> = { free: 0, subscriber: 1, cohort: 2, premium: 3, corporate: 4 };
const TIER_LABELS: Record<string, string> = { free: "Free", subscriber: "Subscriber", cohort: "Cohort", premium: "Premium", corporate: "Corporate" };

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const [enrolling, setEnrolling] = useState(false);

  const program = slug ? getProgramBySlug(slug) : undefined;

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

  const pillar = PILLAR_META[program.pillar];
  const hasAccess = program.accessTier === "free" || (user && TIER_RANK[tier] >= TIER_RANK[program.accessTier]);
  const canStart = program.category === "module" || program.category === "assessment";

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(true);
    await enrollInModule(program.id);
    setEnrolling(false);
    toast.success("Enrolled! Added to your dashboard.");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.description,
    provider: { "@type": "Organization", name: "FocusFlow AI" },
    ...(program.price > 0 && {
      offers: {
        "@type": "Offer",
        price: (program.price / 100).toFixed(2),
        priceCurrency: "USD",
      },
    }),
  };

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead
        title={`${program.title} — FocusFlow AI`}
        description={program.description}
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
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <MobileNav />
      </div>

      <main className="relative z-10 px-6 py-8 max-w-3xl mx-auto">
        {/* Pillar & Featured */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold"
            style={{ borderColor: pillar.color, color: pillar.color }}
          >
            {pillar.label}
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {pillar.full} Pillar
            </span>
            <div className="flex items-center gap-2">
              {program.isFeatured && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
              <Badge className="bg-muted text-muted-foreground text-xs capitalize">{program.category}</Badge>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-heading text-3xl md:text-5xl font-light mb-4"
          style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
        >
          {program.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {program.durationLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {program.audience}
          </span>
          {program.accessTier !== "free" && (
            <Badge className="bg-primary/15 text-primary border-primary/30 capitalize text-xs">
              {TIER_LABELS[program.accessTier]}
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 mb-8">
          <p className="text-foreground/90 leading-relaxed text-base md:text-lg">{program.description}</p>
        </div>

        {/* Coach Note */}
        <div className="border-l-2 border-primary/30 pl-5 mb-8">
          <p className="text-xs uppercase tracking-wider text-primary/60 mb-2">Coach Kay says</p>
          <p className="text-foreground/80 italic leading-relaxed">"{program.coachNote}"</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {program.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Pricing & CTA Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Price */}
            <div>
              {program.price === 0 ? (
                <div className="text-3xl font-heading font-light text-accent">Free</div>
              ) : (
                <>
                  <div className="text-3xl font-heading font-light text-foreground">
                    ${(program.price / 100).toLocaleString()}
                    {program.category === "subscription" && (
                      <span className="text-base text-muted-foreground">/mo</span>
                    )}
                  </div>
                  {program.paymentPlan && (
                    <p className="text-sm text-muted-foreground mt-1">{program.paymentPlan}</p>
                  )}
                </>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2">
              {!hasAccess ? (
                <>
                  <Button
                    onClick={() => navigate(user ? "/modules" : "/auth")}
                    className="gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {user ? "Upgrade to Unlock" : "Sign In to Access"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Requires {TIER_LABELS[program.accessTier]} access
                  </p>
                </>
              ) : program.isGated ? (
                <Button variant="outline" className="gap-2" disabled>
                  <CheckCircle2 className="h-4 w-4" />
                  Application Required
                </Button>
              ) : canStart ? (
                <div className="flex gap-3">
                  <Button onClick={() => navigate(`/clarity/${program.id}`)} className="gap-2">
                    Start Session
                  </Button>
                  {user && (
                    <Button variant="outline" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? "Enrolling..." : "Enroll"}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={() => navigate("/auth")} className="gap-2">
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgramDetail;
