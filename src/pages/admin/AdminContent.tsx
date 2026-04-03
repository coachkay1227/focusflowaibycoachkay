import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import AnimatedSection from "@/components/AnimatedSection";
import { BookOpen, Layers, Trophy, Users } from "lucide-react";
import { coachingModules } from "@/lib/modules";
import { programs } from "@/data/programs";

const challengeTypes = [
  { type: "3-day", durationDays: 3 },
  { type: "4-day", durationDays: 4 },
  { type: "7-day", durationDays: 7 },
  { type: "8-day", durationDays: 8 },
  { type: "14-day", durationDays: 14 },
  { type: "30-day", durationDays: 30 },
];

interface ModuleEnrollmentCount {
  module_id: string;
  count: number;
}

interface ChallengeStat {
  type: string;
  total: number;
  completed: number;
}

const AdminContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles();
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [challengeStats, setChallengeStats] = useState<ChallengeStat[]>([]);
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

    const fetchContentStats = async () => {
      try {
        const { data: enrollments } = await supabase
          .from("module_enrollments")
          .select("module_id");

        const counts: Record<string, number> = {};
        enrollments?.forEach((e) => {
          counts[e.module_id] = (counts[e.module_id] || 0) + 1;
        });
        setEnrollmentCounts(counts);

        const { data: challenges } = await supabase
          .from("challenge_progress")
          .select("challenge_type, current_day");

        const stats: ChallengeStat[] = challengeTypes.map((ct) => {
          const typeChallenges = challenges?.filter((c) => c.challenge_type === ct.type) ?? [];
          return {
            type: ct.type,
            total: typeChallenges.length,
            completed: typeChallenges.filter((c) => (c.current_day ?? 0) >= ct.durationDays).length,
          };
        });
        setChallengeStats(stats);
      } catch (error) {
        console.error("Failed to fetch content stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading content overview...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        <AnimatedSection>
          <span className="font-mono-label text-primary tracking-[0.2em]">Admin Panel</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light mt-3">Content Overview</h1>
          <p className="text-muted-foreground mt-2">
            All modules, programs, and challenges with enrollment data.
          </p>
        </AnimatedSection>

        <div className="mt-8">
          <AdminNav />
        </div>

        <AnimatedSection delay={50} className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-light">Coaching Modules</h2>
            <span className="font-mono-label text-xs text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full">
              {coachingModules.length} modules
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coachingModules.map((mod) => (
              <div
                key={mod.id}
                className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading text-base font-light">{mod.title}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-mono-label text-xs">{enrollmentCounts[mod.id] ?? 0}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{mod.subtitle}</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono-label text-xs text-muted-foreground/60">
                    {mod.sessions.length} sessions
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="font-mono-label text-xs text-muted-foreground/60">
                    Week {mod.week}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100} className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-light">Programs</h2>
            <span className="font-mono-label text-xs text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full">
              {programs.length} programs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5"
              >
                <h3 className="font-heading text-base font-light mb-1">{program.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{program.tagline}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {program.modules.map((modId) => (
                    <span
                      key={modId}
                      className="font-mono-label text-xs bg-primary/10 text-primary/80 px-2 py-0.5 rounded"
                    >
                      {modId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={150} className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-light">Challenges</h2>
            <span className="font-mono-label text-xs text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full">
              {challengeTypes.length} types
            </span>
          </div>
          <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Challenge
                    </th>
                    <th className="text-center px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-center px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Started
                    </th>
                    <th className="text-center px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {challengeStats.map((cs) => (
                    <tr key={cs.type} className="hover:bg-card/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{cs.type}</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {challengeTypes.find((ct) => ct.type === cs.type)?.durationDays ?? 0} days
                      </td>
                      <td className="px-6 py-4 text-center font-mono-label">{cs.total}</td>
                      <td className="px-6 py-4 text-center font-mono-label text-primary">
                        {cs.completed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-6 text-xs text-muted-foreground">
          Content is managed in code. To modify modules, programs, or challenges, edit the source files directly.
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
