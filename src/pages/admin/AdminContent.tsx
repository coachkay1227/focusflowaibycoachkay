import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import AnimatedSection from "@/components/AnimatedSection";
import { BookOpen, Layers, Trophy, Users, Star } from "lucide-react";
import { coachingModules } from "@/lib/modules";
import { programs } from "@/data/programs";
import { toast } from "sonner";

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
  const { isAdmin, loading: rolesLoading } = useRoles();
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [challengeStats, setChallengeStats] = useState<ChallengeStat[]>([]);
  const [contentSettings, setContentSettings] = useState<Record<string, { enabled: boolean; featured: boolean }>>({});
  const [loading, setLoading] = useState(true);

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
        // Content stats fetch failed
      } finally {
        setLoading(false);
      }
    };

    fetchContentStats();

    // Fetch content settings (may fail if table not created yet)
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.functions.invoke("manage-users", {
          body: { action: "get_content_settings" },
        });
        const map: Record<string, { enabled: boolean; featured: boolean }> = {};
        (data?.settings ?? []).forEach((s: { id: string; enabled: boolean; featured: boolean }) => {
          map[s.id] = { enabled: s.enabled, featured: s.featured };
        });
        setContentSettings(map);
      } catch {
        // Content settings table may not exist yet
      }
    };
    fetchSettings();
  }, [isAdmin]);

  const toggleSetting = async (contentId: string, field: "enabled" | "featured") => {
    const current = contentSettings[contentId] ?? { enabled: true, featured: false };
    const updated = { ...current, [field]: !current[field] };
    setContentSettings((prev) => ({ ...prev, [contentId]: updated }));
    try {
      await supabase.functions.invoke("manage-users", {
        body: { action: "update_content_setting", content_id: contentId, ...updated },
      });
      toast.success(`${contentId} ${field} ${updated[field] ? "on" : "off"}`);
    } catch {
      setContentSettings((prev) => ({ ...prev, [contentId]: current }));
      toast.error("Failed to update. Run the content_settings migration first.");
    }
  };

  const isEnabled = (id: string) => contentSettings[id]?.enabled ?? true;
  const isFeatured = (id: string) => contentSettings[id]?.featured ?? false;

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        Loading content overview...
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden grain-overlay">
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
                className={`clarity-card rounded-lg border backdrop-blur-sm p-5 transition-opacity ${
                  isEnabled(mod.id) ? "border-border bg-card/30" : "border-border/50 bg-card/10 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading text-base font-light">{mod.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-mono-label text-xs">{enrollmentCounts[mod.id] ?? 0}</span>
                    </div>
                    <button
                      onClick={() => toggleSetting(mod.id, "featured")}
                      className={`transition-colors ${isFeatured(mod.id) ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                      title={isFeatured(mod.id) ? "Unfeature" : "Feature"}
                    >
                      <Star className="h-4 w-4" fill={isFeatured(mod.id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => toggleSetting(mod.id, "enabled")}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isEnabled(mod.id) ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        isEnabled(mod.id) ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{mod.subtitle}</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono-label text-xs text-muted-foreground/60">
                    {mod.questions.length} questions
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="font-mono-label text-xs text-muted-foreground/60">
                    {mod.duration}
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
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono-label text-xs bg-primary/10 text-primary/80 px-2 py-0.5 rounded"
                    >
                      {tag}
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
          Toggle visibility and feature status above. Run the <code className="font-mono bg-card/50 px-1 rounded">content_settings</code> migration in Supabase to persist changes. Full content editing (titles, descriptions) is managed in code.
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
