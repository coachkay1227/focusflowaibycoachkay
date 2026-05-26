import { useEffect, useState, useCallback } from "react";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPreviewToggle } from "@/components/admin/AdminPreviewToggle";
import { Users, CreditCard, Zap, Trophy, UserPlus, BookOpen, Target, Clock } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

interface RecentUser {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalSessions: 0,
    totalChallenges: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<{ type: string; name: string; detail: string; timestamp: string }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("manage-users", {
          body: { action: "get_stats" },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const statsData = data?.stats;
        setStats({
          totalUsers: statsData?.totalUsers ?? 0,
          activeSubscriptions: statsData?.activeSubscriptions ?? 0,
          totalSessions: statsData?.totalSessions ?? 0,
          totalChallenges: statsData?.totalChallenges ?? 0,
        });

        setRecentUsers(statsData?.recentUsers || []);
      } catch (error) {
        // Stats fetch failed — toast handled by UI
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Fetch activity feed
    const fetchActivity = async () => {
      try {
        const { data } = await supabase.functions.invoke("manage-users", {
          body: { action: "get_recent_activity" },
        });
        if (data?.events) setActivity(data.events);
      } catch {
        // Activity feed fetch failed silently
      }
    };

    fetchActivity();
    const activityInterval = setInterval(fetchActivity, 30000);
    return () => clearInterval(activityInterval);
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading admin dashboard...
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: CreditCard, color: "text-accent" },
    { label: "Total Sessions", value: stats.totalSessions, icon: Zap, color: "text-primary" },
    { label: "Challenges Completed", value: stats.totalChallenges, icon: Trophy, color: "text-accent" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        <AnimatedSection>
          <span className="font-mono-label text-primary tracking-[0.2em]">Admin Panel</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light mt-3">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Platform metrics and recent activity at a glance.
          </p>
        </AnimatedSection>

        <div className="mt-8">
          <AdminNav />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="font-heading text-3xl font-light">{stat.value.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <AdminPreviewToggle />

        <AnimatedSection delay={100} className="mt-10">
          <h2 className="font-heading text-xl font-light mb-4">Recent Signups</h2>
          <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm overflow-hidden">
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No users yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">
                        {u.display_name || "Unnamed User"}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.id.slice(0, 8)}...</p>
                    </div>
                    <span className="font-mono-label text-xs text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Live Activity Feed */}
        <AnimatedSection delay={200} className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-heading text-xl font-light">Live Activity</h2>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm overflow-hidden">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No recent activity.</div>
            ) : (
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {activity.map((event, i) => {
                  const icons: Record<string, typeof UserPlus> = {
                    signup: UserPlus,
                    session: Zap,
                    challenge: Target,
                    enrollment: BookOpen,
                  };
                  const Icon = icons[event.type] || Clock;
                  const ago = getTimeAgo(event.timestamp);
                  return (
                    <div key={i} className="flex items-center gap-4 px-6 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          <span className="font-medium">{event.name}</span>{" "}
                          <span className="text-muted-foreground">{event.detail}</span>
                        </p>
                      </div>
                      <span className="font-mono-label text-xs text-muted-foreground/60 shrink-0">{ago}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default AdminDashboard;
