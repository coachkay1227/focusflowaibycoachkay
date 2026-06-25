import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { composeSystemPrompt } from "../_shared/coach-voice.ts";

const SYSTEM_PROMPT = composeSystemPrompt("weekly-insights");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

    // Fetch last 7 days of data
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [sessionsRes, challengeRes, prefsRes] = await Promise.all([
      supabase.from("clarity_sessions")
        .select("module_id, insight_truth, insight_pattern, insight_action, created_at")
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false }),
      supabase.from("challenge_progress")
        .select("challenge_type, current_day, entries")
        .eq("user_id", user.id),
      supabase.from("user_preferences")
        .select("primary_goal, coaching_style")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    const sessions = sessionsRes.data ?? [];
    const challenges = challengeRes.data ?? [];
    const prefs = prefsRes.data;

    // Build a rich context for the AI
    const sessionSummaries = sessions.map(s =>
      `Module: ${s.module_id} | Truth: ${s.insight_truth || "N/A"} | Pattern: ${s.insight_pattern || "N/A"} | Action: ${s.insight_action || "N/A"}`
    ).join("\n");

    const challengeSummaries = challenges.map(c => {
      const entries = c.entries as Record<string, string> | null;
      const entryCount = entries ? Object.keys(entries).length : 0;
      return `Challenge: ${c.challenge_type} | Day ${c.current_day} | Entries: ${entryCount}`;
    }).join("\n");

    const prompt = `User context:
- Primary goal: ${prefs?.primary_goal || "Not specified"}
- Coaching style preference: ${prefs?.coaching_style || "Not specified"}
- Sessions this week: ${sessions.length}

Session details:
${sessionSummaries || "No sessions this week"}

Challenge progress:
${challengeSummaries || "No active challenges"}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const recap = aiData.choices?.[0]?.message?.content || "Unable to generate recap.";

    return new Response(JSON.stringify({
      recap,
      sessionsCount: sessions.length,
      challengesActive: challenges.length,
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-insights error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
