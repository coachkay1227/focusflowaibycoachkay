import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getModuleEnrollments, getChallengeEnrollments, type ModuleEnrollment, type ChallengeEnrollment } from "@/lib/enrollment-store";
import { getRecentSessionsCloud, type SessionRecord } from "@/lib/session-store";
import { coachingModules, type CoachingModule } from "@/lib/modules";
import { programs, type Program } from "@/data/programs";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, BookOpen, Trophy, Sparkles, LogOut, Plus } from "lucide-react";
import ClarityScoreCard from "@/components/ClarityScoreCard";
import WeeklyInsights from "@/components/WeeklyInsights";
import MobileNav from "@/components/MobileNav";
import YourProgramPanel from "@/components/dashboard/YourProgramPanel";
import CurriculumSection from "@/components/dashboard/CurriculumSection";
import { useAccessLevel } from "@/hooks/use-access-level";
import { useSubscription } from "@/hooks/use-subscription";
import { useRoles } from "@/hooks/use-roles";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AUDIT_OFFER_NAMES: Record<string, string> = {
  // Door 1 — Transformation
  transform_30_personal: "30-Day Personal Reset",
  transform_30_business: "30-Day Business Reset",
  transform_30_ai: "30-Day AI Reset",
  transform_90_personal: "90-Day Personal Transformation",
  transform_90_business: "90-Day Business Transformation",
  transform_90_ai: "90-Day Full AI Transformation",
  transform_6mo_partnership: "6-Month Private Partnership",
  // Door 2 — Build For Me
  rent_agent_starter: "Rent-an-Agent Starter",
  rent_agent_pro: "Rent-an-Agent Pro",
  rent_agent_dreamteam: "Rent-an-Agent Dream Team",
  rent_agent_enterprise: "Rent-an-Agent Enterprise",
  lead_engine_essentials: "Lead Engine Essentials",
  lead_engine_pro: "Lead Engine Pro",
  lead_engine_growth: "Lead Engine Growth",
  lead_engine_scale: "Lead Engine Scale",
  lead_engine_enterprise: "Lead Engine Enterprise",
  // Door 3 — Advisory
  advisory_strategy_intensive: "AI Strategy Intensive",
  advisory_executive: "Executive Advisory",
  advisory_speaking: "Speaking & Workshops",
  advisory_corporate: "Corporate, EAP & Workforce Learning",
  advisory_university: "AI University Roadmap",
  group_programs: "Group Programs",
  // Door 4 — Studio
  studio_mini_story: "Mini-Story Starter",
  studio_storybook_pro: "The Storybook Pro",
  studio_other: "Publishing Studio",
  // Build Studio (Phase 3.5 — opening soon)
  build_studio_landing: "Build Studio: Landing Page (Opening Soon)",
  build_studio_site: "Build Studio: Business Site (Opening Soon)",
  build_studio_dashboard: "Build Studio: Dashboard (Opening Soon)",
  // Community / free
  focus_flow_elevation_hub: "FocusFlow Elevation Hub (Free)",
};

type AuditRow = {
  id: string;
  created_at: string;
  generated_at: string | null;
  recommended_offer: string | null;
  report: unknown;
  intake: unknown;
};

const statusColors: Record<string, string> = {
  enrolled: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-accent/20 text-accent border-accent/30",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { tier, loading: tierLoading } = useAccessLevel();
  const { subscribed, subscriptionEnd, openPortal } = useSubscription();
  const { isAdmin } = useRoles();
  const { toast } = useToast();
  const [moduleEnrollments, setModuleEnrollments] = useState<ModuleEnrollment[]>([]);
  const [challengeEnrollments, setChallengeEnrollments] = useState<ChallengeEnrollment[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Handle Stripe checkout success redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({ title: "Welcome aboard!", description: "Your payment was successful. Your access has been upgraded." });
      window.history.replaceState({}, "", "/dashboard");
    }
    if (params.get("welcome") === "program") {
      toast({
        title: "You're in 🎉",
        description: "Your program is now active. Scroll down to see what's included and your next step.",
      });
      window.history.replaceState({}, "", "/dashboard");
    }
    Promise.all([
      getModuleEnrollments().then(setModuleEnrollments),
      getChallengeEnrollments().then(setChallengeEnrollments),
      getRecentSessionsCloud(5).then(setRecentSessions),
      supabase
        .from("business_audits")
        .select("id, created_at, generated_at, recommended_offer, report, intake")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setAudits((data as AuditRow[]) ?? [])),
    ]).finally(() => setLoading(false));
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useMouseGlow(containerRef);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "You";

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead title="Dashboard — FocusFlow AI" description="Track your clarity journey. View your score, enrolled modules, challenge progress, and personalized weekly insights." path="/dashboard" noIndex />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="font-heading text-xl font-light cursor-pointer bg-transparent border-0 p-0"
          aria-label="FocusFlow AI — go to home"
        >
          <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </button>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button onClick={() => navigate("/admin")} className="text-sm text-primary hover:text-primary/80 transition-colors hidden md:block">Admin</button>
          )}
          <button onClick={() => navigate("/modules")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Modules</button>
          <button onClick={() => navigate("/challenges")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Challenges</button>
          <button onClick={() => navigate("/store")} className="text-sm text-primary hover:text-primary/80 transition-colors hidden md:block font-medium">Studio</button>
          <Avatar className="h-8 w-8 border border-primary/30">
            <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {(user?.email?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            <LogOut className="h-4 w-4" />
          </button>
          <MobileNav />
        </div>
      </nav>

      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        {/* Welcome */}
        <AnimatedSection className="mb-12">
          <span className="font-mono-label text-primary tracking-[0.2em]">Dashboard</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-3"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
          >
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your clarity journey at a glance.
            {!tierLoading && (
              <Badge className="ml-3 bg-primary/15 text-primary border-primary/30 text-xs capitalize">{tier} tier</Badge>
            )}
          </p>
          {subscribed && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Subscription active{subscriptionEnd ? ` until ${new Date(subscriptionEnd).toLocaleDateString()}` : ""}
              </span>
              <Button variant="outline" size="sm" onClick={openPortal} className="text-xs h-7">
                Manage Subscription
              </Button>
            </div>
          )}
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading your journey...</div>
        ) : (
          <div className="space-y-12">
            {/* Your Program (only renders for reset_30 / transformation_90 tiers) */}
            {!tierLoading && (tier === "reset_30" || tier === "transformation_90") && (
              <AnimatedSection delay={25}>
                <YourProgramPanel tier={tier} />
              </AnimatedSection>
            )}

            {/* F.O.C.U.S. Curriculum — visible to paid tiers */}
            {!tierLoading && (tier === "reset_30" || tier === "transformation_90" || tier === "premium" || tier === "corporate") && (
              <AnimatedSection delay={50}>
                <CurriculumSection />
              </AnimatedSection>
            )}

            {/* Clarity Score */}
            <AnimatedSection delay={50}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-light flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" /> Clarity Score
                </h2>
              </div>
              <ClarityScoreCard />
            </AnimatedSection>

            {/* My Modules */}
            <AnimatedSection delay={100}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-light flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" /> My Modules
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/modules")} className="text-primary hover:text-primary/80">
                  <Plus className="h-4 w-4 mr-1" /> Enroll More
                </Button>
              </div>
              {moduleEnrollments.length === 0 ? (
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any modules yet.</p>
                  <Button onClick={() => navigate("/modules")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Modules <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {moduleEnrollments.map((enrollment) => {
                    const mod = coachingModules.find((m) => m.id === enrollment.moduleId) || programs.find((p) => p.id === enrollment.moduleId || p.slug === enrollment.moduleId);
                    return (
                      <button
                        key={enrollment.id}
                        onClick={() => navigate(`/clarity/${enrollment.moduleId}`)}
                        className="clarity-card text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-heading text-lg font-light">{mod?.title || enrollment.moduleId}</h3>
                          <Badge className={statusColors[enrollment.status]}>{enrollment.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{("subtitle" in (mod || {})) ? (mod as CoachingModule).subtitle : (mod as Program)?.tagline}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-label text-muted-foreground/60">{enrollment.sessionsCount} sessions</span>
                          <span className="text-sm text-primary/60 group-hover:text-primary transition-colors flex items-center gap-1">
                            Continue <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </AnimatedSection>

            {/* My Challenges */}
            <AnimatedSection delay={200}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-light flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" /> My Challenges
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/challenges")} className="text-primary hover:text-primary/80">
                  <Plus className="h-4 w-4 mr-1" /> Enroll More
                </Button>
              </div>
              {challengeEnrollments.length === 0 ? (
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 text-center">
                  <p className="text-muted-foreground mb-4">No challenges enrolled yet. Ready to commit?</p>
                  <Button onClick={() => navigate("/challenges")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Challenges <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challengeEnrollments.map((enrollment) => (
                    <button
                      key={enrollment.id}
                      onClick={() => navigate(`/challenges/${enrollment.challengeType}`)}
                      className="clarity-card text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-heading text-lg font-light">{enrollment.challengeType} Challenge</h3>
                        <Badge className={statusColors[enrollment.status]}>{enrollment.status.replace("_", " ")}</Badge>
                      </div>
                      <span className="text-sm text-primary/60 group-hover:text-primary transition-colors flex items-center gap-1">
                        {enrollment.status === "completed" ? "View" : "Continue"} <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </AnimatedSection>

            {/* Recent Sessions */}
            <AnimatedSection delay={300}>
              <h2 className="font-heading text-2xl font-light flex items-center gap-3 mb-6">
                <Sparkles className="h-5 w-5 text-primary" /> Recent Sessions
              </h2>
              {recentSessions.length === 0 ? (
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 text-center">
                  <p className="text-muted-foreground mb-4">Complete your first clarity session to see insights here.</p>
                  <Button onClick={() => navigate("/clarity")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Session <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => {
                    const mod = coachingModules.find((m) => m.id === session.moduleId);
                    return (
                      <div key={session.id} className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5 flex items-center justify-between">
                        <div>
                          <h4 className="font-heading text-base font-light">{mod?.title || session.moduleId}</h4>
                          {session.insight && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{session.insight.truth}</p>
                          )}
                        </div>
                        <span className="font-mono-label text-muted-foreground/50 shrink-0 ml-4">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </AnimatedSection>

            {/* Weekly Insights */}
            <AnimatedSection delay={400}>
              <WeeklyInsights />
            </AnimatedSection>

            {/* AI Business Audits */}
            <AnimatedSection delay={450}>
              <h2 className="font-heading text-2xl font-light flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-primary" /> Your AI Business Audits
              </h2>
              {audits.length === 0 ? (
                <div className="clarity-card rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm p-8 text-center">
                  <h3 className="font-heading text-xl font-light mb-2">Get Your AI Business Audit</h3>
                  <p className="text-muted-foreground mb-5 max-w-xl mx-auto text-sm">
                    A personalized $47 diagnostic of your business with a 7-day action plan and your next best move, generated in under 2 minutes.
                  </p>
                  <Button onClick={() => navigate("/rent-an-agent")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Take the Audit <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">Your purchased audits and their reports</p>
                  <div className="space-y-3">
                    {audits.map((a) => {
                      const hasReport = !!a.report;
                      const intakeEmpty =
                        !a.intake ||
                        (typeof a.intake === "object" && Object.keys(a.intake as object).length === 0);
                      const offerName = a.recommended_offer
                        ? AUDIT_OFFER_NAMES[a.recommended_offer] ?? "—"
                        : "—";
                      let label: string;
                      if (hasReport) {
                        label = `Audit from ${new Date(a.generated_at ?? a.created_at).toLocaleDateString()}`;
                      } else if (intakeEmpty) {
                        label = `Audit purchased ${new Date(a.created_at).toLocaleDateString()}, intake pending`;
                      } else {
                        label = "Audit in progress";
                      }
                      const [btnLabel, btnHref] = hasReport
                        ? ["View Report", `/audit/report/${a.id}`]
                        : intakeEmpty
                          ? ["Complete Intake", `/audit/intake?audit_id=${a.id}`]
                          : ["Generation Failed. Retry", `/audit/intake?audit_id=${a.id}&retry=1`];
                      return (
                        <div
                          key={a.id}
                          className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h4 className="font-heading text-base font-light">{label}</h4>
                            {hasReport && (
                              <p className="text-xs text-muted-foreground mt-1">Next best move: {offerName}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate(btnHref)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                          >
                            {btnLabel}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </AnimatedSection>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
