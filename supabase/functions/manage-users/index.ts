import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[MANAGE-USERS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { data: isAdmin, error: roleError } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError) throw new Error(`Role check error: ${roleError.message}`);
    if (!isAdmin) throw new Error("Admin access required");
    logStep("Admin access confirmed");

    const body = await req.json();
    const { action } = body;

    if (!action) throw new Error("Missing action in request body");

    switch (action) {
      case "list_users": {
        logStep("Action: list_users");

        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from("profiles")
          .select("id, display_name, created_at");

        if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);

        const { data: accessLevels } = await supabaseAdmin
          .from("user_access_levels")
          .select("id, tier");

        const accessMap = new Map(accessLevels?.map((a: { id: string; tier: string }) => [a.id, a.tier]) ?? []);

        const userIds = (profiles ?? []).map((p: { id: string }) => p.id);

        const sessionCounts: Record<string, number> = {};
        if (userIds.length > 0) {
          const { data: sessionData } = await supabaseAdmin
            .from("clarity_sessions")
            .select("user_id")
            .in("user_id", userIds);

          sessionData?.forEach((s: { user_id: string }) => {
            sessionCounts[s.user_id] = (sessionCounts[s.user_id] ?? 0) + 1;
          });
        }

        const challengeCounts: Record<string, number> = {};
        if (userIds.length > 0) {
          const { data: challengeData } = await supabaseAdmin
            .from("challenge_progress")
            .select("user_id")
            .in("user_id", userIds);

          challengeData?.forEach((c: { user_id: string }) => {
            challengeCounts[c.user_id] = (challengeCounts[c.user_id] ?? 0) + 1;
          });
        }

        const users = (profiles ?? []).map((p: { id: string; display_name: string | null; created_at: string | null }) => ({
          id: p.id,
          display_name: p.display_name,
          tier: (accessMap.get(p.id) as string) ?? "free",
          created_at: p.created_at,
          session_count: sessionCounts[p.id] ?? 0,
          challenge_count: challengeCounts[p.id] ?? 0,
        }));

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "update_tier": {
        const { user_id, tier } = body;
        logStep("Action: update_tier", { user_id, tier });

        if (!user_id || !tier) throw new Error("Missing user_id or tier");

        const validTiers = ["free", "subscriber", "cohort", "premium", "corporate"];
        if (!validTiers.includes(tier)) throw new Error(`Invalid tier: ${tier}`);

        const { error: upsertError } = await supabaseAdmin
          .from("user_access_levels")
          .upsert({ id: user_id, tier }, { onConflict: "id" });

        if (upsertError) throw new Error(`Failed to update tier: ${upsertError.message}`);

        logStep("Tier updated successfully", { user_id, tier });

        return new Response(JSON.stringify({ success: true, user_id, tier }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_user_detail": {
        const { user_id } = body;
        logStep("Action: get_user_detail", { user_id });

        if (!user_id) throw new Error("Missing user_id");

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", user_id)
          .single();

        if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);

        const { data: accessLevel } = await supabaseAdmin
          .from("user_access_levels")
          .select("tier")
          .eq("id", user_id)
          .single();

        const { data: sessions, error: sessionsError } = await supabaseAdmin
          .from("clarity_sessions")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (sessionsError) throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);

        const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
          .from("challenge_progress")
          .select("*, challenges(*)")
          .eq("user_id", user_id);

        if (enrollmentsError) throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`);

        const { data: sessionCount, error: sessionCountError } = await supabaseAdmin
          .from("clarity_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user_id);

        if (sessionCountError) throw new Error(`Failed to count sessions: ${sessionCountError.message}`);

        const { data: challengeCount, error: challengeCountError } = await supabaseAdmin
          .from("challenge_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user_id);

        if (challengeCountError) throw new Error(`Failed to count challenges: ${challengeCountError.message}`);

        const detail = {
          profile,
          tier: accessLevel?.tier ?? "free",
          session_count: sessionCount?.count ?? 0,
          challenge_count: challengeCount?.count ?? 0,
          recent_sessions: sessions ?? [],
          enrollments: enrollments ?? [],
        };

        return new Response(JSON.stringify({ user: detail }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_stats": {
        logStep("Action: get_stats");

        const [usersRes, subsRes, sessionsRes, challengesRes] = await Promise.all([
          supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
          supabaseAdmin.from("user_access_levels").select("id", { count: "exact", head: true }).neq("tier", "free"),
          supabaseAdmin.from("clarity_sessions").select("id", { count: "exact", head: true }),
          supabaseAdmin.from("challenge_progress").select("id", { count: "exact", head: true }),
        ]);

        const { data: recentProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, display_name, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        const stats = {
          totalUsers: usersRes.count ?? 0,
          activeSubscriptions: subsRes.count ?? 0,
          totalSessions: sessionsRes.count ?? 0,
          totalChallenges: challengesRes.count ?? 0,
          recentUsers: recentProfiles ?? [],
        };

        logStep("Stats retrieved", stats);

        return new Response(JSON.stringify({ stats }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    const status = msg.includes("Admin access required") || msg.includes("No authorization") || msg.includes("not authenticated")
      ? 403
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
