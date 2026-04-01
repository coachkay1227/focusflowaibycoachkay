import { supabase } from "@/integrations/supabase/client";

export interface ClarityScore {
  total: number; // 0-100
  breakdown: {
    sessions: number;    // 0-30 points
    challenges: number;  // 0-25 points
    consistency: number; // 0-25 points
    depth: number;       // 0-20 points
  };
  level: string;
  levelIndex: number;
  streak: number;
  totalSessions: number;
  totalChallengeDays: number;
  evolution: { date: string; score: number }[];
}

const LEVELS = [
  { name: "Awakening", min: 0 },
  { name: "Seeking", min: 15 },
  { name: "Reflecting", min: 30 },
  { name: "Shifting", min: 50 },
  { name: "Aligned", min: 70 },
  { name: "Flowing", min: 90 },
];

export function getLevelForScore(score: number): { name: string; index: number } {
  let level = LEVELS[0];
  let index = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) {
      level = LEVELS[i];
      index = i;
      break;
    }
  }
  return { name: level.name, index };
}

export function getNextLevel(currentIndex: number): { name: string; min: number } | null {
  return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
}

export async function computeClarityScore(): Promise<ClarityScore | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch all data in parallel
  const [sessionsRes, modulesRes, challengesRes, challengeProgressRes] = await Promise.all([
    supabase.from("clarity_sessions").select("created_at, module_id").order("created_at", { ascending: true }),
    supabase.from("module_enrollments").select("status, sessions_count"),
    supabase.from("challenge_enrollments").select("status"),
    supabase.from("challenge_progress").select("current_day, entries"),
  ]);

  const sessions = sessionsRes.data ?? [];
  const modules = modulesRes.data ?? [];
  const challenges = challengesRes.data ?? [];
  const challengeProgress = challengeProgressRes.data ?? [];

  // --- Sessions score (0-30): based on total sessions completed ---
  const totalSessions = sessions.length;
  const sessionsScore = Math.min(30, totalSessions * 3); // 10 sessions = max

  // --- Challenges score (0-25): based on challenge completion ---
  const completedChallenges = challenges.filter(c => c.status === "completed").length;
  const totalChallengeDays = challengeProgress.reduce((sum, cp) => {
    const entries = cp.entries as Record<string, string> | null;
    return sum + (entries ? Object.keys(entries).length : 0);
  }, 0);
  const challengesScore = Math.min(25, completedChallenges * 8 + Math.min(9, totalChallengeDays));

  // --- Consistency score (0-25): based on streak and regularity ---
  const streak = computeStreak(sessions.map(s => s.created_at!));
  const consistencyScore = Math.min(25, streak * 5);

  // --- Depth score (0-20): based on module variety and session count per module ---
  const uniqueModules = new Set(sessions.map(s => s.module_id)).size;
  const modulesInProgress = modules.filter(m => m.status === "in_progress" || m.status === "completed").length;
  const depthScore = Math.min(20, uniqueModules * 4 + modulesInProgress * 2);

  const total = Math.min(100, sessionsScore + challengesScore + consistencyScore + depthScore);
  const { name: level, index: levelIndex } = getLevelForScore(total);

  // Build evolution (group sessions by date for a trend line)
  const evolution = buildEvolution(sessions);

  return {
    total,
    breakdown: {
      sessions: sessionsScore,
      challenges: challengesScore,
      consistency: consistencyScore,
      depth: depthScore,
    },
    level,
    levelIndex,
    streak,
    totalSessions,
    totalChallengeDays,
    evolution,
  };
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const daySet = new Set(dates.map(d => new Date(d).toISOString().split("T")[0]));
  const sortedDays = [...daySet].sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak must start from today or yesterday
  if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function buildEvolution(sessions: { created_at: string | null }[]): { date: string; score: number }[] {
  if (sessions.length === 0) return [];

  const byDate: Record<string, number> = {};
  sessions.forEach(s => {
    const day = new Date(s.created_at!).toISOString().split("T")[0];
    byDate[day] = (byDate[day] || 0) + 1;
  });

  const sortedDates = Object.keys(byDate).sort();
  let cumulative = 0;
  return sortedDates.map(date => {
    cumulative += byDate[date];
    // Simple cumulative score approximation
    const approxScore = Math.min(100, cumulative * 5);
    return { date, score: approxScore };
  });
}
