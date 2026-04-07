import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/use-access-level";
import { programs, FOCUS_PILLARS, type FocusPillar, getProgramsByPillar } from "@/data/programs";
import { getModuleEnrollments, enrollInModule, type ModuleEnrollment } from "@/lib/enrollment-store";
import { TIER_RANK } from "@/lib/tier-constants";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import ProgramCard from "@/components/ProgramCard";
import AccessGate from "@/components/AccessGate";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";

const PILLARS: FocusPillar[] = ["F", "O", "C", "U", "S"];

const Modules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const { toast } = useToast();
  const { startCheckout } = useSubscription();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState<FocusPillar | "all">("all");
  const [enrollments, setEnrollments] = useState<ModuleEnrollment[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    if (user) getModuleEnrollments().then(setEnrollments);
    // Handle Stripe checkout cancelled redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      toast({ title: "No worries", description: "You can start a plan anytime you're ready." });
      window.history.replaceState({}, "", "/modules");
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useMouseGlow(containerRef);

  const getEnrollment = (programId: string) => {
    const e = enrollments.find((en) => en.moduleId === programId);
    return e ? { status: e.status } : null;
  };

  const handleEnroll = async (programId: string) => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(programId);
    await enrollInModule(programId);
    const updated = await getModuleEnrollments();
    setEnrollments(updated);
    setEnrolling(null);
    toast({ title: "Enrolled!", description: "Program added to your dashboard." });
  };

  const filteredPrograms = activePillar === "all"
    ? [...programs].sort((a, b) => a.order - b.order)
    : getProgramsByPillar(activePillar);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FocusFlow Coaching Programs",
    itemListElement: filteredPrograms.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Course", name: p.title, description: p.description },
    })),
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead
        title="Coaching Programs — FocusFlow by Coach Kay"
        description="Explore the full F.O.C.U.S. program catalog — assessments, challenges, courses, sprints, and signature programs powered by Coach Kay's framework."
        path="/modules"
        jsonLd={jsonLd}
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <MobileNav />
      </div>

      <div className="relative z-10 px-6 py-8 md:py-12 max-w-6xl mx-auto">
        {/* Hero */}
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.2em]">F.O.C.U.S. PROGRAMS</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Choose your path
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">
            Foundation · Opportunity · Create · Uplift · Support — each program maps to a pillar. Pick the one that matches where you are right now.
          </p>
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection delay={100} className="mb-14">
          <div className="text-center mb-6">
            <span className="font-mono-label text-primary tracking-[0.2em]">PLANS</span>
            <h2 className="font-heading text-2xl md:text-3xl font-light mt-2">
              Find your level
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Free", price: "$0", period: "", desc: "Clarity Check + Mirror Challenge entry", priceId: null, highlight: false },
              { name: "Monthly", price: "$27", period: "/mo", desc: "All modules, coach chat, weekly insights", priceId: STRIPE_TIERS.subscriber?.[0]?.price_id, highlight: false },
              { name: "30-Day Package", price: "$497", period: "", desc: "4 sessions (60 min) + full platform access", priceId: STRIPE_TIERS.premium?.find(c => c.price === 497)?.price_id, highlight: true },
              { name: "8-Week Cohort", price: "$997", period: "", desc: "Coach Kay-led cohort + all modules", priceId: STRIPE_TIERS.cohort?.[0]?.price_id, highlight: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`clarity-card rounded-lg backdrop-blur-sm p-6 flex flex-col border ${
                  plan.highlight ? "border-primary/60 bg-card/60" : "border-border bg-card/30"
                }`}
              >
                {plan.highlight && (
                  <span className="font-mono-label text-[10px] tracking-wider text-primary mb-2">MOST POPULAR</span>
                )}
                <h3 className="font-heading text-lg font-medium">{plan.name}</h3>
                <div className="mt-2 mb-3">
                  <span className="font-heading text-3xl font-light text-primary">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed flex-1">{plan.desc}</p>
                {plan.priceId ? (
                  <Button
                    onClick={() => user ? startCheckout(plan.priceId!) : navigate("/auth")}
                    size="sm"
                    className={`mt-4 ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card border border-border text-foreground hover:border-primary/40"}`}
                  >
                    {user ? "Get Started" : "Sign In to Start"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/clarity")}
                    variant="outline"
                    size="sm"
                    className="mt-4 border-border hover:border-primary/40"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Try Free
                  </Button>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Pillar Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActivePillar("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activePillar === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All ({programs.length})
          </button>
          {PILLARS.map((p) => {
            const meta = FOCUS_PILLARS[p];
            const isActive = activePillar === p;
            const count = getProgramsByPillar(p).length;
            return (
              <button
                key={p}
                onClick={() => setActivePillar(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  isActive
                    ? "text-primary-foreground"
                    : "bg-card/50 text-muted-foreground hover:text-foreground border-border"
                }`}
                style={isActive ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
              >
                <span className="font-bold">{p}</span>
                <span className="hidden sm:inline ml-1">· {meta.full}</span>
                <span className="ml-1 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Program Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrograms.map((program, i) => {
            const needsGate = program.isGated && program.accessTier !== "free" && (!user || TIER_RANK[tier] < TIER_RANK[program.accessTier]);
            return (
              <AnimatedSection key={program.id} delay={Math.min(i * 60, 600)}>
                {needsGate ? (
                  <AccessGate requiredTier={program.accessTier}>
                    <ProgramCard
                      program={program}
                      enrollment={getEnrollment(program.id)}
                      onEnroll={handleEnroll}
                      enrolling={enrolling === program.id}
                    />
                  </AccessGate>
                ) : (
                  <ProgramCard
                    program={program}
                    enrollment={getEnrollment(program.id)}
                    onEnroll={handleEnroll}
                    enrolling={enrolling === program.id}
                  />
                )}
              </AnimatedSection>
            );
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">No programs found for this pillar.</p>
        )}
      </div>
    </div>
  );
};

export default Modules;
