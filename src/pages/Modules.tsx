import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/use-access-level";
import { programs, FOCUS_PILLARS, type FocusPillar, getProgramsByPillar } from "@/data/programs";
import { getModuleEnrollments, enrollInModule, type ModuleEnrollment } from "@/lib/enrollment-store";
import { TIER_RANK } from "@/lib/tier-constants";
import { useRoles } from "@/hooks/use-roles";
import { useAdminView } from "@/contexts/AdminViewContext";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import ProgramCard from "@/components/ProgramCard";
import AccessGate from "@/components/AccessGate";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import ApplyNowDialog from "@/components/ApplyNowDialog";

const PILLARS: FocusPillar[] = ["F", "O", "C", "U", "S"];

const Modules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const { isAdmin } = useRoles();
  const { userView } = useAdminView();
  const { toast } = useToast();
  const { startCheckout } = useSubscription();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState<FocusPillar | "all">("all");
  const [enrollments, setEnrollments] = useState<ModuleEnrollment[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [applyDialog, setApplyDialog] = useState<{ open: boolean; mode: "application" | "inquiry"; programName?: string }>({ open: false, mode: "application" });

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

  interface PricingPlan {
    name: string; price: string; period: string; desc: string;
    priceId: string | null | undefined; highlight: boolean; apply: boolean;
  }

  const renderPricingCard = (plan: PricingPlan) => (
    <div
      key={plan.name}
      className={`clarity-card rounded-lg backdrop-blur-sm p-6 flex flex-col border ${
        plan.highlight ? "border-primary/60 bg-card/60" : "border-border bg-card/30"
      }`}
    >
      {plan.highlight && (
        <span className="font-mono-label text-[10px] tracking-wider text-primary mb-2">MOST POPULAR</span>
      )}
      {plan.apply && !plan.highlight && (
        <span className="font-mono-label text-[10px] tracking-wider text-muted-foreground mb-2">APPLICATION REQUIRED</span>
      )}
      <h3 className="font-heading text-lg font-medium">{plan.name}</h3>
      <div className="mt-2 mb-3">
        <span className="font-heading text-3xl font-light text-primary">{plan.price}</span>
        {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed flex-1">{plan.desc}</p>
      {plan.apply ? (
        <Button
          onClick={() => setApplyDialog({ open: true, mode: "application", programName: plan.name })}
          size="sm"
          className={`mt-4 ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card border border-border text-foreground hover:border-primary/40"}`}
        >
          Apply Now
        </Button>
      ) : plan.priceId ? (
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
  );

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
          <div className="text-center mb-8">
            <span className="font-mono-label text-primary tracking-[0.2em]">YOUR JOURNEY</span>
            <h2 className="font-heading text-2xl md:text-3xl font-light mt-2">
              Choose your path
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">Every transformation starts somewhere. Pick the level that matches where you are right now.</p>
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            {/* ── Start Here ── */}
            <div>
              <h3 className="font-mono-label text-primary/60 tracking-[0.15em] text-xs mb-4">START HERE</h3>
              <div className="grid sm:grid-cols-1 max-w-md gap-4">
                {renderPricingCard({ name: "Free", price: "$0", period: "", desc: "Clarity Check + Mirror Challenge entry — no commitment required", priceId: null, highlight: false, apply: false })}
              </div>
            </div>

            {/* ── Go Deeper ── */}
            <div>
              <h3 className="font-mono-label text-primary/60 tracking-[0.15em] text-xs mb-4">GO DEEPER</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {renderPricingCard({ name: "Monthly Subscriber", price: "$27", period: "/mo", desc: "Ongoing access — all modules, coach chat, weekly insights", priceId: STRIPE_TIERS.subscriber?.[0]?.price_id, highlight: false, apply: false })}
                {renderPricingCard({ name: "30-Day F.O.C.U.S. Reset", price: "$297", period: "", desc: "Structured 30-day clarity reset with full platform access", priceId: STRIPE_TIERS.premium?.find(c => c.price === 297)?.price_id, highlight: false, apply: false })}
              </div>
            </div>

            {/* ── Full Transformation ── */}
            <div>
              <h3 className="font-mono-label text-primary/60 tracking-[0.15em] text-xs mb-4">FULL TRANSFORMATION</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderPricingCard({ name: "30-Day Intensive", price: "$497", period: "", desc: "4 private sessions (60 min) + full platform access", priceId: STRIPE_TIERS.premium?.find(c => c.price === 497)?.price_id, highlight: true, apply: true })}
                {renderPricingCard({ name: "8-Week Cohort", price: "$997", period: "", desc: "Coach Kay-led group cohort + all modules + community", priceId: STRIPE_TIERS.cohort?.[0]?.price_id, highlight: false, apply: false })}
                {renderPricingCard({ name: "12-Week Mastery", price: "$1,997", period: "", desc: "Deep transformation program — application required", priceId: STRIPE_TIERS.premium?.find(c => c.price === 1997)?.price_id, highlight: false, apply: true })}
              </div>
            </div>

            {/* ── Custom Solutions ── */}
            <div>
              <h3 className="font-mono-label text-primary/60 tracking-[0.15em] text-xs mb-4">CUSTOM SOLUTIONS</h3>
              <div className="clarity-card rounded-lg backdrop-blur-sm p-6 border border-border bg-card/30 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-heading text-lg font-medium">Corporate & Private Coaching</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                    Custom transformation programs for teams, organizations, or private 1:1 engagements with Coach Kay.
                  </p>
                </div>
                <Button
                  onClick={() => setApplyDialog({ open: true, mode: "inquiry" })}
                  size="sm"
                  className="bg-card border border-border text-foreground hover:border-primary/40 shrink-0"
                >
                  <Mail className="mr-1 h-3 w-3" />
                  Contact Coach Kay
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Social Proof */}
        <AnimatedSection delay={200} className="mb-14">
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { quote: "Coach Kay helped me see patterns I'd been blind to for years. The Clarity Check alone changed how I start my mornings.", name: "Tamara R.", role: "Entrepreneur" },
              { quote: "I went from scattered to strategic in 30 days. The F.O.C.U.S. framework isn't just a method — it's a mirror.", name: "David M.", role: "Corporate Leader" },
              { quote: "This isn't fluff coaching. It's honest, direct, and it actually moves the needle. Worth every penny.", name: "Keisha L.", role: "Career Changer" },
            ].map((t) => (
              <div key={t.name} className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-5">
                <p className="text-xs text-foreground/70 leading-relaxed italic mb-3">"{t.quote}"</p>
                <div className="text-xs">
                  <span className="font-medium text-foreground">{t.name}</span>
                  <span className="text-muted-foreground ml-1">· {t.role}</span>
                </div>
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
            const adminBypass = isAdmin && !userView;
            const needsGate = !adminBypass && program.isGated && program.accessTier !== "free" && (!user || TIER_RANK[tier] < TIER_RANK[program.accessTier]);
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

      <ApplyNowDialog
        open={applyDialog.open}
        onOpenChange={(open) => setApplyDialog((prev) => ({ ...prev, open }))}
        mode={applyDialog.mode}
        programName={applyDialog.programName}
      />
    </div>
  );
};

export default Modules;
