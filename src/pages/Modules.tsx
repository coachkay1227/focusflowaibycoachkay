import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/use-access-level";
import { getPublicPrograms, getProgramsByPath, FOCUS_PILLARS, type PublicPath, PUBLIC_PATHS, type FocusPillar } from "@/data/programs";
import { getModuleEnrollments, enrollInModule, type ModuleEnrollment } from "@/lib/enrollment-store";
import { TIER_RANK } from "@/lib/tier-constants";
import { useRoles } from "@/hooks/use-roles";
import { useAdminView } from "@/contexts/AdminViewContext";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { webPage, breadcrumb } from "@/lib/seo-schema";
import ProgramCard from "@/components/ProgramCard";
import AccessGate from "@/components/AccessGate";
import MobileNav from "@/components/MobileNav";
import PillarStrip from "@/components/PillarStrip";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSymmetricGridClass } from "@/lib/grid";

const PATHS: PublicPath[] = ["personal", "business", "ai"];
const PILLAR_ORDER: FocusPillar[] = ["F", "O", "C", "U", "S"];

const Modules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const { isAdmin } = useRoles();
  const { userView } = useAdminView();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePath, setActivePath] = useState<PublicPath | "all">("all");
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

  const allPublic = getPublicPrograms();
  const filteredPrograms = activePath === "all"
    ? allPublic
    : getProgramsByPath(activePath);

  // Group programs by F.O.C.U.S. pillar so the framework is visible end-to-end.
  const grouped = PILLAR_ORDER.map((pillar) => ({
    pillar,
    meta: FOCUS_PILLARS[pillar],
    items: filteredPrograms.filter((p) => p.pillar === pillar),
  })).filter((g) => g.items.length > 0);

  const jsonLd = [
    webPage("/modules", "Transformation Paths", "CollectionPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Paths", path: "/modules" },
      ],
      "/modules"
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": "https://coachkayai.life/modules#itemlist",
      name: "FocusFlow Coaching Programs",
      itemListElement: filteredPrograms.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://coachkayai.life/programs/${p.slug}`,
        item: { "@type": "Course", name: p.title, description: p.description },
      })),
    },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead
        title="Transformation Paths — FocusFlow by Coach Kay"
        description="Three transformation paths — Personal, Business, and Full AI — plus free clarity entries to find your starting point with Coach Kay."
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
          <span className="font-mono-label text-primary tracking-[0.2em]">TRANSFORMATION PATHS</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
          >
            Personal · Business · Full AI
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">
            Start with a free clarity entry, then choose the 30-day reset, 90-day transformation, or private partnership that fits where you are right now.
          </p>
        </AnimatedSection>

        {/* Path Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActivePath("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activePath === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All ({allPublic.length})
          </button>
          {PATHS.map((p) => {
            const meta = PUBLIC_PATHS[p];
            const isActive = activePath === p;
            const count = getProgramsByPath(p).length;
            return (
              <button
                key={p}
                onClick={() => setActivePath(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card/50 text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {meta.label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Programs grouped by F.O.C.U.S. pillar */}
        <div className="space-y-14">
          {grouped.map((group) => (
            <section key={group.pillar} aria-labelledby={`pillar-${group.pillar}`}>
              <div className="flex items-end justify-between flex-wrap gap-3 mb-5 border-b border-border/50 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold"
                    style={{ borderColor: group.meta.color, color: group.meta.color }}
                    aria-hidden="true"
                  >
                    {group.pillar}
                  </span>
                  <div>
                    <h2
                      id={`pillar-${group.pillar}`}
                      className="font-heading text-xl md:text-2xl font-light leading-tight"
                      style={{ color: group.meta.color }}
                    >
                      {group.meta.full}
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl">{group.meta.description}</p>
                  </div>
                </div>
                <span className="font-mono-label text-[10px] tracking-[0.18em] text-muted-foreground/70">
                  {group.items.length} {group.items.length === 1 ? "PROGRAM" : "PROGRAMS"}
                </span>
              </div>
              <div className={`${getSymmetricGridClass(group.items.length)} gap-5 items-stretch`}>
                {group.items.map((program, i) => {
                  const adminBypass = isAdmin && !userView;
                  const needsGate = !adminBypass && program.isGated && program.accessTier !== "free" && (!user || TIER_RANK[tier] < TIER_RANK[program.accessTier]);
                  return (
                    <AnimatedSection key={program.id} delay={Math.min(i * 60, 400)}>
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
            </section>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">No programs found for this path.</p>
        )}

        <div className="mt-16">
          <PillarStrip />
        </div>
      </div>
    </div>
  );
};

export default Modules;
