import { supabase } from "@/integrations/supabase/client";

async function getAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// --- Module Enrollments ---

export interface ModuleEnrollment {
  id: string;
  moduleId: string;
  status: "enrolled" | "in_progress" | "completed";
  enrolledAt: string;
  completedAt: string | null;
  sessionsCount: number;
}

export async function getModuleEnrollments(): Promise<ModuleEnrollment[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("module_enrollments")
    .select("*")
    .order("enrolled_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    moduleId: row.module_id,
    status: row.status,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
    sessionsCount: row.sessions_count,
  }));
}

export async function enrollInModule(moduleId: string): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  await supabase.from("module_enrollments").upsert(
    { user_id: userId, module_id: moduleId, status: "enrolled" },
    { onConflict: "user_id,module_id" }
  );
}

export async function updateModuleProgress(moduleId: string): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  const { data: existing } = await supabase
    .from("module_enrollments")
    .select("id, sessions_count")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (existing) {
    await supabase.from("module_enrollments").update({
      status: "in_progress",
      sessions_count: (existing.sessions_count ?? 0) + 1,
    }).eq("id", existing.id);
  }
}

// --- Challenge Enrollments ---

export interface ChallengeEnrollment {
  id: string;
  challengeType: string;
  status: "enrolled" | "in_progress" | "completed";
  enrolledAt: string;
  completedAt: string | null;
}

export async function getChallengeEnrollments(): Promise<ChallengeEnrollment[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("challenge_enrollments")
    .select("*")
    .order("enrolled_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    challengeType: row.challenge_type,
    status: row.status,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
  }));
}

export async function enrollInChallenge(challengeType: string): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  await supabase.from("challenge_enrollments").upsert(
    { user_id: userId, challenge_type: challengeType, status: "enrolled" },
    { onConflict: "user_id,challenge_type" }
  );
}

export async function updateChallengeStatus(challengeType: string, status: "in_progress" | "completed"): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  const update: any = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();

  await supabase.from("challenge_enrollments")
    .update(update)
    .eq("challenge_type", challengeType)
    .eq("user_id", userId);
}

// --- User Preferences ---

export interface UserPreferences {
  onboardingCompleted: boolean;
  primaryGoal: string | null;
  coachingStyle: string | null;
  selectedModules: string[];
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    onboardingCompleted: data.onboarding_completed ?? false,
    primaryGoal: data.primary_goal,
    coachingStyle: data.coaching_style,
    selectedModules: (data.selected_modules as string[]) ?? [],
  };
}

export async function saveUserPreferences(prefs: {
  primaryGoal: string;
  coachingStyle: string;
  selectedModules: string[];
}): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  await supabase.from("user_preferences").upsert({
    id: userId,
    onboarding_completed: true,
    primary_goal: prefs.primaryGoal,
    coaching_style: prefs.coachingStyle,
    selected_modules: prefs.selectedModules,
  }, { onConflict: "id" });
}
