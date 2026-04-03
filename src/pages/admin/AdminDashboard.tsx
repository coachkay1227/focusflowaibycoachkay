import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { Users, CreditCard, Zap, Trophy } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

interface RecentUser {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalSessions: 0,
    totalChallenges: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!rolesLoading && !isAdmin) {
      navigate("/dashboard");
      return;
    }
  }, [user, isAdmin, rolesLoading, navigate]);

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
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      </div>
    </div>
  );
};

export default AdminDashboard;
