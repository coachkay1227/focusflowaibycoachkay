import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send } from "lucide-react";

interface UserDetailModalProps {
  userId: string | null;
  onClose: () => void;
  onTierChange: (userId: string, tier: string) => void;
}

interface Session {
  module_id: string;
  created_at: string;
}

interface Challenge {
  challenge_type: string;
  current_day: number;
  started_at: string;
}

interface Enrollment {
  module_id: string;
  status: string;
}

interface UserDetail {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
  tier: string;
  sessions: Session[];
  challenges: Challenge[];
  enrollments: Enrollment[];
}

const TIERS = ["free", "subscriber", "cohort", "premium", "corporate"] as const;

const tierColorMap: Record<string, string> = {
  free: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  subscriber: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cohort: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  premium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  corporate: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitial(name: string | undefined | null): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

export function UserDetailModal({
  userId,
  onClose,
  onTierChange,
}: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke(
        "manage-users",
        {
          body: { action: "get_user_detail", user_id: userId },
        }
      );

      if (cancelled) return;

      if (fnError) {
        setError(fnError.message ?? "Failed to load user details");
        setLoading(false);
        return;
      }

      // Map edge function response shape to our interface
      const detail = data?.user ?? data;
      const mapped: UserDetail = {
        id: userId!,
        display_name: detail?.profile?.display_name ?? "Unnamed User",
        email: detail?.profile?.email ?? "",
        created_at: detail?.profile?.created_at ?? "",
        tier: detail?.tier ?? "free",
        sessions: detail?.recent_sessions ?? [],
        challenges: detail?.challenges ?? [],
        enrollments: detail?.enrollments ?? [],
      };
      setUser(mapped);
      setLoading(false);
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleTierChange = (newTier: string) => {
    if (!userId) return;
    onTierChange(userId, newTier);
    // Optimistically update local state
    setUser((prev) => (prev ? { ...prev, tier: newTier } : prev));
  };

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/30 backdrop-blur-sm border-border">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && user && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                  <span className="text-xl font-heading text-primary">
                    {getInitial(user.display_name)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <DialogTitle className="font-heading text-foreground text-lg">
                    {user.display_name || "Unnamed User"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Tier Section */}
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono-label text-muted-foreground">
                    Current Tier
                  </span>
                  <Badge
                    className={
                      tierColorMap[user.tier] ??
                      "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
                    }
                  >
                    {user.tier}
                  </Badge>
                </div>

                <select
                  value={user.tier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  className="rounded-md border border-border bg-card/30 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  {TIERS.map((tier) => (
                    <option key={tier} value={tier} className="bg-background">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sessions Section */}
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <h3 className="text-sm font-heading text-foreground mb-3">
                Sessions
              </h3>
              {user.sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No sessions recorded.
                </p>
              ) : (
                <ul className="space-y-2">
                  {user.sessions.slice(0, 10).map((session, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono-label text-foreground">
                        {session.module_id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Challenges Section */}
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <h3 className="text-sm font-heading text-foreground mb-3">
                Challenges
              </h3>
              {user.challenges.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No active challenges.
                </p>
              ) : (
                <ul className="space-y-2">
                  {user.challenges.map((challenge, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono-label text-foreground">
                          {challenge.challenge_type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Day {challenge.current_day}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Started {formatDate(challenge.started_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Enrollments Section */}
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <h3 className="text-sm font-heading text-foreground mb-3">
                Enrollments
              </h3>
              {user.enrollments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No enrollments found.
                </p>
              ) : (
                <ul className="space-y-2">
                  {user.enrollments.map((enrollment, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono-label text-foreground">
                        {enrollment.module_id}
                      </span>
                      <Badge
                        variant={
                          enrollment.status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {enrollment.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Email Triggers Section */}
            <EmailTriggers userId={userId!} userName={user.display_name} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmailTriggers({ userId, userName }: { userId: string; userName: string }) {
  const [sending, setSending] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState("");
  const [customSubj, setCustomSubj] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const send = async (template: string, extra?: Record<string, unknown>) => {
    setSending(template);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { template, user_id: userId, ...extra },
      });
      if (error) throw error;
      setResult(data?.method === "resend" ? `Sent to ${data.sent_to}` : `Queued (configure RESEND_API_KEY to send)`);
    } catch {
      setResult("Failed to send email");
    }
    setSending(null);
  };

  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-heading text-foreground">Send Email</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Button size="sm" variant="outline" className="text-xs" disabled={!!sending} onClick={() => send("welcome")}>
          {sending === "welcome" ? "Sending..." : "Welcome"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs" disabled={!!sending} onClick={() => send("reengagement")}>
          {sending === "reengagement" ? "Sending..." : "Re-engage"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs" disabled={!!sending} onClick={() => send("challenge_reminder", { challenge_type: "Mirror Challenge", day: 1 })}>
          {sending === "challenge_reminder" ? "Sending..." : "Challenge Reminder"}
        </Button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Subject line..."
          value={customSubj}
          onChange={(e) => setCustomSubj(e.target.value)}
          className="w-full px-3 py-1.5 rounded-md border border-border bg-card/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <textarea
          placeholder="Custom message to send..."
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          rows={3}
          className="w-full px-3 py-1.5 rounded-md border border-border bg-card/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
        />
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
          disabled={!customSubj.trim() || !customMsg.trim() || !!sending}
          onClick={() => send("custom", { subject: customSubj, message: customMsg })}
        >
          <Send className="mr-1 h-3 w-3" />
          {sending === "custom" ? "Sending..." : "Send Custom Email"}
        </Button>
      </div>

      {result && (
        <p className="mt-2 text-xs text-muted-foreground">{result}</p>
      )}
    </div>
  );
}
