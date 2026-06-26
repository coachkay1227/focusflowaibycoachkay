import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { type ClarityScore, computeClarityScore } from "@/lib/clarity-score";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MobileNav from "@/components/MobileNav";
import SEOHead from "@/components/SEOHead";
import ClarityScoreCard from "@/components/ClarityScoreCard";
import { ArrowLeft, Save, User, Camera } from "lucide-react";
import { toast } from "sonner";

const COACHING_STYLES = [
  { id: "direct", label: "Direct & Bold", desc: "No fluff. Tell me what I need to hear." },
  { id: "gentle", label: "Gentle & Supportive", desc: "Warm encouragement with soft nudges" },
  { id: "analytical", label: "Analytical & Strategic", desc: "Data-driven, pattern-focused coaching" },
  { id: "motivational", label: "Motivational & Energizing", desc: "High energy, action-oriented push" },
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coachingStyle, setCoachingStyle] = useState("");
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<ClarityScore | null>(null);
  const [stats, setStats] = useState({ sessions: 0, modules: 0, challenges: 0 });

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const [profileRes, prefsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single(),
      supabase.from("user_preferences").select("coaching_style").eq("id", user.id).single(),
    ]);
    if (profileRes.data) {
      setDisplayName(profileRes.data.display_name || "");
      setAvatarUrl(profileRes.data.avatar_url || "");
    }
    if (prefsRes.data) {
      setCoachingStyle(prefsRes.data.coaching_style || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadProfile();
    loadStats();
  }, [user, loadProfile, navigate]);

  const loadStats = async () => {
    const [clarityScore, sessionsRes, modulesRes, challengesRes] = await Promise.all([
      computeClarityScore(),
      supabase.from("clarity_sessions").select("id", { count: "exact", head: true }),
      supabase.from("module_enrollments").select("id", { count: "exact", head: true }),
      supabase.from("challenge_enrollments").select("id", { count: "exact", head: true }),
    ]);
    setScore(clarityScore);
    setStats({
      sessions: sessionsRes.count ?? 0,
      modules: modulesRes.count ?? 0,
      challenges: challengesRes.count ?? 0,
    });
  };

  const sanitizeAvatarUrl = (url: string): string => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch {
      return "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const safeAvatar = sanitizeAvatarUrl(avatarUrl);
    try {
      const [profileRes, prefsRes] = await Promise.all([
        supabase.from("profiles").update({ display_name: displayName, avatar_url: safeAvatar }).eq("id", user.id),
        supabase.from("user_preferences").upsert({ id: user.id, coaching_style: coachingStyle }, { onConflict: "id" }),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (prefsRes.error) throw prefsRes.error;
      toast.success("Profile updated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead title="Profile — FocusFlow AI" description="Manage your FocusFlow AI profile, update your coaching preferences, and view your clarity stats." path="/profile" noIndex />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="pt-20 pb-16 px-4 max-w-2xl mx-auto space-y-8">
        {/* Avatar & Name Section */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/30">
              {sanitizeAvatarUrl(avatarUrl) ? (
                <img src={sanitizeAvatarUrl(avatarUrl)} alt="Your account profile picture" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Edit Form */}
        <div className="space-y-5 bg-card rounded-xl border border-border p-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-3">
            <Label>Coaching Style</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COACHING_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCoachingStyle(style.id)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    coachingStyle === style.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  <div className="text-sm font-medium">{style.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Sessions", value: stats.sessions },
            { label: "Modules", value: stats.modules },
            { label: "Challenges", value: stats.challenges },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Clarity Score */}
        {score && <ClarityScoreCard />}

        {/* Sign Out */}
        <Button variant="outline" onClick={() => { signOut(); navigate("/"); }} className="w-full">
          Sign Out
        </Button>
      </main>
    </div>
  );
};

export default Profile;
