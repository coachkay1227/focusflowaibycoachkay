import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  if (error) {
    console.error("Failed to fetch module enrollments:", error);
    return [];
  }

  interface ModuleEnrollmentRow {
    id: string;
    module_id: string;
    status: string;
    enrolled_at: string;
    completed_at: string | null;
    sessions_count: number;
  }
  return (data ?? []).map((row: ModuleEnrollmentRow) => ({
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
  if (!userId) {
    toast({ title: "Sign in required", description: "Please sign in to enroll.", variant: "destructive" });
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("module_enrollments").upsert(
    { user_id: userId, module_id: moduleId, status: "enrolled" },
    { onConflict: "user_id,module_id" }
  );

  if (error) {
    console.error("Failed to enroll in module:", error);
    toast({ title: "Enrollment failed", description: "Could not enroll. Please try again.", variant: "destructive" });
    throw error;
  }
}

export async function updateModuleProgress(moduleId: string): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  const { data: existing, error: fetchError } = await supabase
    .from("module_enrollments")
    .select("id, sessions_count")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to fetch module progress:", fetchError);
    return;
  }

  if (existing) {
    const { error: updateError } = await supabase.from("module_enrollments").update({
      status: "in_progress",
      sessions_count: (existing.sessions_count ?? 0) + 1,
    }).eq("id", existing.id);

    if (updateError) {
      console.error("Failed to update module progress:", updateError);
    }
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

  if (error) {
    console.error("Failed to fetch challenge enrollments:", error);
    return [];
  }

  interface ChallengeEnrollmentRow {
    id: string;
    challenge_type: string;
    status: string;
    enrolled_at: string;
    completed_at: string | null;
  }
  return (data ?? []).map((row: ChallengeEnrollmentRow) => ({
    id: row.id,
    challengeType: row.challenge_type,
    status: row.status,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
  }));
}

export async function enrollInChallenge(challengeType: string): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) {
    toast({ title: "Sign in required", description: "Please sign in to enroll.", variant: "destructive" });
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("challenge_enrollments").upsert(
    { user_id: userId, challenge_type: challengeType, status: "enrolled" },
    { onConflict: "user_id,challenge_type" }
  );

  if (error) {
    console.error("Failed to enroll in challenge:", error);
    toast({ title: "Enrollment failed", description: "Could not enroll. Please try again.", variant: "destructive" });
    throw error;
  }
}

export async function updateChallengeStatus(challengeType: string, status: "in_progress" | "completed"): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  const update: { status: string; completed_at?: string } = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("challenge_enrollments")
    .update(update)
    .eq("challenge_type", challengeType)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update challenge status:", error);
    toast({ title: "Update failed", description: "Could not update challenge status.", variant: "destructive" });
    throw error;
  }
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

  if (error) {
    console.error("Failed to fetch user preferences:", error);
    return null;
  }
  if (!data) return null;

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
  if (!userId) {
    toast({ title: "Sign in required", description: "Please sign in to save preferences.", variant: "destructive" });
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("user_preferences").upsert({
    id: userId,
    onboarding_completed: true,
    primary_goal: prefs.primaryGoal,
    coaching_style: prefs.coachingStyle,
    selected_modules: prefs.selectedModules,
  }, { onConflict: "id" });

  if (error) {
    console.error("Failed to save user preferences:", error);
    toast({ title: "Save failed", description: "Could not save preferences. Please try again.", variant: "destructive" });
    throw error;
  }
}
