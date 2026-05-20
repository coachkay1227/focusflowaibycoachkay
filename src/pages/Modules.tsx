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
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PILLARS: FocusPillar[] = ["F", "O", "C", "U", "S"];

const Modules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const { isAdmin } = useRoles();
  const { userView } = useAdminView();
  const { toast } = useToast();
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
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
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
          <p className="text-muted-foreground/70 mt-4 text-xs">
            Looking for pricing?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:underline"
            >
              See all transformation paths on the home page.
            </button>
          </p>
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
    </div>
  );
};

export default Modules;
