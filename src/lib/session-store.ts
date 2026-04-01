import type { ClarityAnswers } from "./clarity-engine";

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
  } catch {}
  return { sessions: [], challenges: {} };
}

function saveStore(data: SessionStoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveSession(session: SessionRecord) {
  const store = loadStore();
  store.sessions.push(session);
  // Keep last 20 sessions max
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
