import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import AnimatedSection from "@/components/AnimatedSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#E8B931", "#A78BFA", "#34D399", "#F472B6", "#60A5FA"];

const CHALLENGE_DURATIONS: Record<string, number> = {
  "3-day": 3,
  "4-day": 4,
  "7-day": 7,
  "8-day": 8,
  "14-day": 14,
  "30-day": 30,
};

interface ModuleStat {
  module_id: string;
  count: number;
}

interface TierStat {
  tier: string;
  count: number;
}

interface StudioStat {
  event: string;
  count: number;
}

const STUDIO_EVENTS: { event: string; label: string }[] = [
  { event: "studio_lane_view", label: "Lane Views" },
  { event: "studio_intake_open", label: "Intake Opened" },
  { event: "studio_intake_submit", label: "Intake Submitted" },
  { event: "studio_checkout_started", label: "Checkout Started" },
  { event: "studio_checkout_paid", label: "Checkout Paid" },
  { event: "studio_inquiry_submitted", label: "Inquiries Submitted" },
  { event: "studio_checkout_failed", label: "Checkout Failed" },
];

const AdminAnalytics = () => {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const [moduleStats, setModuleStats] = useState<ModuleStat[]>([]);
  const [tierStats, setTierStats] = useState<TierStat[]>([]);
  const [studioStats, setStudioStats] = useState<StudioStat[]>([]);
  const [avgSessions, setAvgSessions] = useState(0);
  const [challengeCompletion, setChallengeCompletion] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAnalytics = async () => {
      try {
        const { data: enrollments } = await supabase
          .from("module_enrollments")
          .select("module_id");

        const moduleCounts: Record<string, number> = {};
        enrollments?.forEach((e) => {
          moduleCounts[e.module_id] = (moduleCounts[e.module_id] || 0) + 1;
        });

        const moduleData: ModuleStat[] = Object.entries(moduleCounts)
          .map(([module_id, count]) => ({ module_id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setModuleStats(moduleData);

        const { data: accessLevels } = await supabase
          .from("user_access_levels")
          .select("tier");

        const tierCounts: Record<string, number> = {};
        accessLevels?.forEach((a) => {
          tierCounts[a.tier] = (tierCounts[a.tier] || 0) + 1;
        });

        const tierData: TierStat[] = Object.entries(tierCounts).map(([tier, count]) => ({
          tier,
          count,
        }));

        setTierStats(tierData);

        const { data: sessions } = await supabase
          .from("clarity_sessions")
          .select("user_id");

        const userSessionCounts: Record<string, number> = {};
        sessions?.forEach((s) => {
          userSessionCounts[s.user_id] = (userSessionCounts[s.user_id] || 0) + 1;
        });

        const sessionValues = Object.values(userSessionCounts);
        const avg = sessionValues.length > 0
          ? sessionValues.reduce((a, b) => a + b, 0) / sessionValues.length
          : 0;
        setAvgSessions(avg);

        const { data: challenges } = await supabase
          .from("challenge_progress")
          .select("challenge_type, current_day");

        const totalChallenges = challenges?.length ?? 0;
        const completedChallenges = challenges?.filter(
          (c) => (c.current_day ?? 0) >= (CHALLENGE_DURATIONS[c.challenge_type] ?? 7)
        ).length ?? 0;
        setChallengeCompletion({ total: totalChallenges, completed: completedChallenges });

        const { data: studioEvents } = await supabase
          .from("analytics_events")
          .select("event")
          .in(
            "event",
            STUDIO_EVENTS.map((s) => s.event)
          );
        const studioCounts: Record<string, number> = {};
        studioEvents?.forEach((e) => {
          studioCounts[e.event] = (studioCounts[e.event] || 0) + 1;
        });
        setStudioStats(
          STUDIO_EVENTS.map((s) => ({ event: s.event, count: studioCounts[s.event] ?? 0 }))
        );
      } catch (error) {
        // Analytics fetch failed
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        <AnimatedSection>
          <span className="font-mono-label text-primary tracking-[0.2em]">Admin Panel</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light mt-3">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Platform usage patterns and engagement metrics.
          </p>
        </AnimatedSection>

        <div className="mt-8">
          <AdminNav />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <AnimatedSection delay={50}>
            <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6">
              <h3 className="font-heading text-lg font-light mb-4">Sessions per Module</h3>
              {moduleStats.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No enrollment data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={moduleStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="module_id" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6">
              <h3 className="font-heading text-lg font-light mb-4">Tier Distribution</h3>
              {tierStats.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No tier data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tierStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="count"
                      label={(props: any) => `${props.tier}: ${props.count}`}
                    >
                      {tierStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6">
              <h3 className="font-heading text-lg font-light mb-4">Engagement Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                    Avg Sessions per User
                  </span>
                  <span className="font-heading text-2xl font-light text-primary">
                    {avgSessions.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                    Challenge Completion Rate
                  </span>
                  <span className="font-heading text-2xl font-light text-accent">
                    {challengeCompletion.total > 0
                      ? ((challengeCompletion.completed / challengeCompletion.total) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                    Total Challenges Started
                  </span>
                  <span className="font-heading text-2xl font-light">{challengeCompletion.total}</span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6">
              <h3 className="font-heading text-lg font-light mb-4">Most Popular Modules</h3>
              {moduleStats.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {moduleStats.slice(0, 5).map((m, i) => (
                    <div key={m.module_id} className="flex items-center gap-3">
                      <span className="font-mono-label text-xs text-muted-foreground w-6">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm truncate">{m.module_id}</span>
                          <span className="font-mono-label text-xs text-muted-foreground ml-2">{m.count}</span>
                        </div>
                        <div className="h-1.5 bg-card/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full transition-all"
                            style={{ width: `${moduleStats.length > 0 ? (m.count / moduleStats[0].count) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={250}>
          <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 mt-6">
            <h3 className="font-heading text-lg font-light mb-1">Studio Funnel</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Story, Legacy &amp; Publishing Studio — lifetime events. Inquiry
              submissions also trigger an email to Coach Kay&apos;s team.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STUDIO_EVENTS.map((s) => {
                const stat = studioStats.find((x) => x.event === s.event);
                return (
                  <div
                    key={s.event}
                    className="rounded-md border border-border/40 bg-background/30 p-4"
                  >
                    <div className="font-mono-label text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="font-heading text-2xl font-light text-primary mt-1">
                      {stat?.count ?? 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default AdminAnalytics;
