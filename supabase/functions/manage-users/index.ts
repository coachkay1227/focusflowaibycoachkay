import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[MANAGE-USERS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabaseClient = createClient(
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

    const adminEmailsEnv = Deno.env.get("ADMIN_EMAILS") ?? "hello@coachkayelevates.org";
    const ADMIN_EMAILS = adminEmailsEnv.split(",").map((e: string) => e.trim());
    let adminVerified = ADMIN_EMAILS.includes(user.email ?? "");

    if (!adminVerified) {
      const { data: isAdmin, error: roleError } = await supabaseClient.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (roleError) throw new Error(`Role check error: ${roleError.message}`);
      adminVerified = !!isAdmin;
    }

    if (!adminVerified) throw new Error("Admin access required");
    logStep("Admin access confirmed");

    const body = await req.json();
    const { action } = body;

    if (!action) throw new Error("Missing action in request body");

    switch (action) {
      case "list_users": {
        logStep("Action: list_users");

        const { data: profiles, error: profilesError } = await supabaseClient
          .from("profiles")
          .select("id, display_name, created_at");

        if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);

        // Fetch emails from auth.users via admin API
        const { data: authData } = await supabaseClient.auth.admin.listUsers();
        const emailMap = new Map((authData?.users ?? []).map((u: { id: string; email?: string }) => [u.id, u.email ?? null]));

        const { data: accessLevels } = await supabaseClient
          .from("user_access_levels")
          .select("id, tier");

        const accessMap = new Map(accessLevels?.map((a: { id: string; tier: string }) => [a.id, a.tier]) ?? []);

        const userIds = (profiles ?? []).map((p: { id: string }) => p.id);

        const sessionCounts: Record<string, number> = {};
        if (userIds.length > 0) {
          const { data: sessionData } = await supabaseClient
            .from("clarity_sessions")
            .select("user_id")
            .in("user_id", userIds);

          sessionData?.forEach((s: { user_id: string }) => {
            sessionCounts[s.user_id] = (sessionCounts[s.user_id] ?? 0) + 1;
          });
        }

        const challengeCounts: Record<string, number> = {};
        if (userIds.length > 0) {
          const { data: challengeData } = await supabaseClient
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
          email: emailMap.get(p.id) ?? null,
          tier: (accessMap.get(p.id) as string) ?? "free",
          created_at: p.created_at,
          session_count: sessionCounts[p.id] ?? 0,
          challenge_count: challengeCounts[p.id] ?? 0,
        }));

        return new Response(JSON.stringify({ users }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "update_tier": {
        const { user_id, tier } = body;
        logStep("Action: update_tier", { user_id, tier });

        if (!user_id || !tier) throw new Error("Missing user_id or tier");

        const validTiers = ["free", "subscriber", "cohort", "premium", "corporate"];
        if (!validTiers.includes(tier)) throw new Error(`Invalid tier: ${tier}`);

        const { error: upsertError } = await supabaseClient
          .from("user_access_levels")
          .upsert({ id: user_id, tier }, { onConflict: "id" });

        if (upsertError) throw new Error(`Failed to update tier: ${upsertError.message}`);

        logStep("Tier updated successfully", { user_id, tier });

        return new Response(JSON.stringify({ success: true, user_id, tier }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_user_detail": {
        const { user_id } = body;
        logStep("Action: get_user_detail", { user_id });

        if (!user_id) throw new Error("Missing user_id");

        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user_id)
          .single();

        if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);

        // Get email from auth
        const { data: authUserData } = await supabaseClient.auth.admin.getUserById(user_id);
        const email = authUserData?.user?.email ?? null;

        const { data: accessLevel } = await supabaseClient
          .from("user_access_levels")
          .select("tier")
          .eq("id", user_id)
          .single();

        const { data: sessions, error: sessionsError } = await supabaseClient
          .from("clarity_sessions")
          .select("id, module_id, created_at")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (sessionsError) throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);

        const { data: challenges } = await supabaseClient
          .from("challenge_progress")
          .select("challenge_type, current_day, started_at")
          .eq("user_id", user_id);

        const { data: moduleEnrollments } = await supabaseClient
          .from("module_enrollments")
          .select("module_id, status, enrolled_at")
          .eq("user_id", user_id);

        const detail = {
          profile: { ...profile, email },
          tier: accessLevel?.tier ?? "free",
          recent_sessions: sessions ?? [],
          challenges: challenges ?? [],
          enrollments: moduleEnrollments ?? [],
        };

        return new Response(JSON.stringify({ user: detail }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_recent_activity": {
        logStep("Action: get_recent_activity");

        const [signupsRes, sessionsRes, challengesRes, enrollmentsRes] = await Promise.all([
          supabaseClient.from("profiles").select("id, display_name, created_at").order("created_at", { ascending: false }).limit(10),
          supabaseClient.from("clarity_sessions").select("user_id, module_id, created_at").order("created_at", { ascending: false }).limit(10),
          supabaseClient.from("challenge_progress").select("user_id, challenge_type, current_day, started_at").order("started_at", { ascending: false }).limit(10),
          supabaseClient.from("module_enrollments").select("user_id, module_id, status, enrolled_at").order("enrolled_at", { ascending: false }).limit(10),
        ]);

        // Build a combined profile name lookup
        const allUserIds = new Set<string>();
        sessionsRes.data?.forEach((s: { user_id: string }) => allUserIds.add(s.user_id));
        challengesRes.data?.forEach((c: { user_id: string }) => allUserIds.add(c.user_id));
        enrollmentsRes.data?.forEach((e: { user_id: string }) => allUserIds.add(e.user_id));

        const { data: nameProfiles } = await supabaseClient
          .from("profiles")
          .select("id, display_name")
          .in("id", [...allUserIds]);

        const nameMap = new Map((nameProfiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name ?? "User"]));

        type ActivityEvent = { type: string; name: string; detail: string; timestamp: string };
        const events: ActivityEvent[] = [];

        (signupsRes.data ?? []).forEach((p: { display_name: string | null; created_at: string | null }) => {
          if (p.created_at) events.push({ type: "signup", name: p.display_name ?? "New User", detail: "joined FocusFlow", timestamp: p.created_at });
        });

        (sessionsRes.data ?? []).forEach((s: { user_id: string; module_id: string; created_at: string | null }) => {
          if (s.created_at) events.push({ type: "session", name: nameMap.get(s.user_id) ?? "User", detail: `completed ${s.module_id}`, timestamp: s.created_at });
        });

        (challengesRes.data ?? []).forEach((c: { user_id: string; challenge_type: string; current_day: number; started_at: string | null }) => {
          if (c.started_at) events.push({ type: "challenge", name: nameMap.get(c.user_id) ?? "User", detail: `${c.challenge_type} day ${c.current_day}`, timestamp: c.started_at });
        });

        (enrollmentsRes.data ?? []).forEach((e: { user_id: string; module_id: string; status: string; enrolled_at: string | null }) => {
          if (e.enrolled_at) events.push({ type: "enrollment", name: nameMap.get(e.user_id) ?? "User", detail: `enrolled in ${e.module_id}`, timestamp: e.enrolled_at });
        });

        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return new Response(JSON.stringify({ events: events.slice(0, 20) }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_content_settings": {
        logStep("Action: get_content_settings");

        const { data, error } = await supabaseClient
          .from("content_settings")
          .select("*");

        return new Response(JSON.stringify({ settings: data ?? [], error: error?.message }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: error ? 500 : 200,
        });
      }

      case "update_content_setting": {
        const { content_id, enabled, featured, custom_tagline } = body;
        logStep("Action: update_content_setting", { content_id, enabled, featured });

        if (!content_id) throw new Error("Missing content_id");

        const { error: upsertError } = await supabaseClient
          .from("content_settings")
          .upsert({
            id: content_id,
            enabled: enabled ?? true,
            featured: featured ?? false,
            custom_tagline: custom_tagline ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });

        if (upsertError) throw new Error(`Failed to update content setting: ${upsertError.message}`);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_stats": {
        logStep("Action: get_stats");

        const [usersRes, subsRes, sessionsRes, challengesRes] = await Promise.all([
          supabaseClient.from("profiles").select("id", { count: "exact", head: true }),
          supabaseClient.from("user_access_levels").select("id", { count: "exact", head: true }).neq("tier", "free"),
          supabaseClient.from("clarity_sessions").select("id", { count: "exact", head: true }),
          supabaseClient.from("challenge_progress").select("id", { count: "exact", head: true }),
        ]);

        const { data: recentProfiles } = await supabaseClient
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
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
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
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status,
    });
  }
});
