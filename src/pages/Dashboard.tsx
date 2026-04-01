import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getModuleEnrollments, getChallengeEnrollments, type ModuleEnrollment, type ChallengeEnrollment } from "@/lib/enrollment-store";
import { getRecentSessionsCloud, type SessionRecord } from "@/lib/session-store";
import { coachingModules } from "@/lib/modules";
import { programs } from "@/data/programs";
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
import { useAccessLevel } from "@/hooks/use-access-level";
import { useSubscription } from "@/hooks/use-subscription";

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
  const [moduleEnrollments, setModuleEnrollments] = useState<ModuleEnrollment[]>([]);
  const [challengeEnrollments, setChallengeEnrollments] = useState<ChallengeEnrollment[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    Promise.all([
      getModuleEnrollments().then(setModuleEnrollments),
      getChallengeEnrollments().then(setChallengeEnrollments),
      getRecentSessionsCloud(5).then(setRecentSessions),
    ]).finally(() => setLoading(false));
  }, [user, navigate]);

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

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "You";

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead title="Dashboard — FocusFlow AI" description="Track your clarity journey. View your score, enrolled modules, challenge progress, and personalized weekly insights." path="/dashboard" />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="font-heading text-xl font-light cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/modules")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Modules</button>
          <button onClick={() => navigate("/challenges")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Challenges</button>
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
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
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
                    const mod = coachingModules.find((m) => m.id === enrollment.moduleId);
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
                        <p className="text-muted-foreground text-sm mb-3">{mod?.subtitle}</p>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
