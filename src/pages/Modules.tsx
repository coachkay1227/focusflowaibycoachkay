import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { programs, PILLAR_META, type FocusPillar, getProgramsByPillar } from "@/data/programs";
import { getModuleEnrollments, enrollInModule, type ModuleEnrollment } from "@/lib/enrollment-store";
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
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState<FocusPillar | "all">("all");
  const [enrollments, setEnrollments] = useState<ModuleEnrollment[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    if (user) getModuleEnrollments().then(setEnrollments);
  }, [user]);

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
    ? programs
    : getProgramsByPillar(activePillar);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FocusFlow AI Programs",
    itemListElement: filteredPrograms.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Course", name: p.title, description: p.description },
    })),
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead
        title="Modules — FocusFlow AI"
        description="Explore guided clarity modules designed to help you build self-awareness, emotional resilience, and purposeful focus."
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

      <div className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
        {/* Hero */}
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.2em]">Programs & Modules</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Choose your path
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Each program maps to a pillar of the F.O.C.U.S. framework. Pick the one that matches where you are right now.
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
            All
          </button>
          {PILLARS.map((p) => {
            const meta = PILLAR_META[p];
            const isActive = activePillar === p;
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
                <span className="font-bold">{meta.label}</span>
                <span className="hidden sm:inline ml-1">· {meta.full}</span>
              </button>
            );
          })}
        </div>

        {/* Program Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program, i) => (
            <AnimatedSection key={program.id} delay={i * 80}>
              <AccessGate requiredTier={program.accessTier}>
                <ProgramCard
                  program={program}
                  enrollment={getEnrollment(program.id)}
                  onEnroll={handleEnroll}
                  enrolling={enrolling === program.id}
                />
              </AccessGate>
            </AnimatedSection>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">No programs found for this pillar.</p>
        )}
      </div>
    </div>
  );
};

export default Modules;
