import type { ClarityAnswers } from "./clarity-engine";
import { supabase } from "@/integrations/supabase/client";

export interface SessionRecord {
  id: string;
  timestamp: number;
  moduleId: string;
  answers: ClarityAnswers;
  insight: {
    truth: string;
    pattern: string;
    action: string;
  } | null;
}

interface SessionStoreData {
  sessions: SessionRecord[];
  challenges: Record<string, {
    entries: Record<number, string>;
    currentDay: number;
    startedAt: number;
  }>;
}

const STORAGE_KEY = "focus-flow-sessions";

function loadStore(): SessionStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* Return default store on parse error */ }
  return { sessions: [], challenges: {} };
}

function saveStore(data: SessionStoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- Local storage functions (kept for anonymous fallback) ---

export function saveSession(session: SessionRecord) {
  const store = loadStore();
  store.sessions.push(session);
  if (store.sessions.length > 20) {
    store.sessions = store.sessions.slice(-20);
  }
  saveStore(store);
}

export function getSessions(): SessionRecord[] {
  return loadStore().sessions;
}

export function getRecentSessions(count = 5): SessionRecord[] {
  const sessions = loadStore().sessions;
  return sessions.slice(-count);
}

export function hasHistory(): boolean {
  return loadStore().sessions.length > 0;
}

export function getChallengeData(challengeType: string) {
  const store = loadStore();
  return store.challenges[challengeType] || null;
}

export function saveChallengeData(challengeType: string, data: { entries: Record<number, string>; currentDay: number; startedAt: number }) {
  const store = loadStore();
  store.challenges[challengeType] = data;
  saveStore(store);
}

// --- Cloud-backed functions for authenticated users ---

async function getAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveSessionCloud(session: SessionRecord): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) {
    saveSession(session);
    return;
  }
  await supabase.from("clarity_sessions").insert({
    user_id: userId,
    module_id: session.moduleId,
    answers: session.answers as unknown as Record<string, unknown>,
    insight_truth: session.insight?.truth ?? null,
    insight_pattern: session.insight?.pattern ?? null,
    insight_action: session.insight?.action ?? null,
  });
  // Also save locally as cache
  saveSession(session);
}

export async function getRecentSessionsCloud(count = 5): Promise<SessionRecord[]> {
  const userId = await getAuthUserId();
  if (!userId) return getRecentSessions(count);

  const { data, error } = await supabase
    .from("clarity_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(count);

  if (error || !data || data.length === 0) return getRecentSessions(count);

  interface ClaritySessionRow {
    id: string;
    created_at: string;
    module_id: string;
    answers: Record<string, unknown>;
    insight_truth: string | null;
    insight_pattern: string | null;
    insight_action: string | null;
  }
  return data.map((row: ClaritySessionRow) => ({
    id: row.id,
    timestamp: new Date(row.created_at).getTime(),
    moduleId: row.module_id,
    answers: row.answers,
    insight: row.insight_truth ? {
      truth: row.insight_truth,
      pattern: row.insight_pattern,
      action: row.insight_action,
    } : null,
  }));
}

export async function hasHistoryCloud(): Promise<boolean> {
  const userId = await getAuthUserId();
  if (!userId) return hasHistory();

  const { count } = await supabase
    .from("clarity_sessions")
    .select("id", { count: "exact", head: true });

  return (count ?? 0) > 0 || hasHistory();
}

export async function getChallengeDataCloud(challengeType: string) {
  const userId = await getAuthUserId();
  if (!userId) return getChallengeData(challengeType);

  const { data, error } = await supabase
    .from("challenge_progress")
    .select("*")
    .eq("challenge_type", challengeType)
    .maybeSingle();

  if (error || !data) return getChallengeData(challengeType);

  return {
    entries: data.entries as Record<number, string>,
    currentDay: data.current_day,
    startedAt: new Date(data.started_at!).getTime(),
  };
}

export async function saveChallengeDataCloud(challengeType: string, challengeData: { entries: Record<number, string>; currentDay: number; startedAt: number }) {
  const userId = await getAuthUserId();
  if (!userId) {
    saveChallengeData(challengeType, challengeData);
    return;
  }

  const { data: existing } = await supabase
    .from("challenge_progress")
    .select("id")
    .eq("challenge_type", challengeType)
    .maybeSingle();

  if (existing) {
    await supabase.from("challenge_progress").update({
      entries: challengeData.entries as unknown as Record<string, unknown>,
      current_day: challengeData.currentDay,
    }).eq("id", existing.id);
  } else {
    await supabase.from("challenge_progress").insert({
      user_id: userId,
      challenge_type: challengeType,
      entries: challengeData.entries as unknown as Record<string, unknown>,
      current_day: challengeData.currentDay,
      started_at: new Date(challengeData.startedAt).toISOString(),
    });
  }

  // Also save locally
  saveChallengeData(challengeType, challengeData);
}
