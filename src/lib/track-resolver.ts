// ============================================================
// FocusFlow — Track Resolver
// Lightweight recommendation engine that classifies user signals
// into a primary support path and returns phase-aware recommendations.
// Pure function — no API calls, no DB, no side effects.
// ============================================================

export type SupportTrack =
  | "women-transition-support"
  | "mens-midlife-reset"
  | "life-reset-reinvention";

export type LifePhase =
  | "burnout"
  | "identity-shift"
  | "reinvention"
  | "overwhelm"
  | "transition"
  | "seeking";

export interface TrackResult {
  primaryTrack: SupportTrack;
  likelyPhase: LifePhase;
  phaseLabel: string;
  phaseDescription: string;
  recommendedModuleIds: string[];
  recommendedChallengeType: string;
  recommendedProgramSlugs: string[];
  supportMessage: string;
}

// ── Theme tags for existing modules ──
const MODULE_THEMES: Record<string, string[]> = {
  "clarity-check": ["clarity", "awareness", "entry", "overwhelm"],
  "emotional-reset": ["energy", "emotional", "burnout", "transition", "healing"],
  "focus-flow": ["focus", "productivity", "overwhelm", "purpose", "burnout"],
  "purpose-happiness": ["purpose", "identity", "meaning", "reinvention", "seeking"],
  "goal-shift": ["identity", "alignment", "reinvention", "transition", "self-trust"],
};

// ── Keyword dictionaries ──
const PHASE_KEYWORDS: Record<LifePhase, string[]> = {
  burnout: ["burnout", "exhausted", "drained", "tired", "depleted", "running on empty", "no energy", "can't keep going", "overwhelmed", "breaking point"],
  "identity-shift": ["who am i", "don't know myself", "lost myself", "identity", "used to be", "not the same", "changed", "don't recognize", "outgrown"],
  reinvention: ["start over", "rebuild", "reinvent", "new chapter", "next phase", "career change", "starting fresh", "pivot", "new direction"],
  overwhelm: ["overwhelm", "too much", "can't focus", "scattered", "drowning", "everything at once", "paralyzed", "stuck", "frozen"],
  transition: ["transition", "divorce", "move", "loss", "empty nest", "retirement", "midlife", "perimenopause", "menopause", "life change", "setback", "major change"],
  seeking: ["purpose", "meaning", "direction", "lost", "searching", "empty", "what's next", "why am i here", "fulfillment"],
};

const TRACK_SIGNALS: Record<SupportTrack, string[]> = {
  "women-transition-support": ["perimenopause", "menopause", "empty nest", "motherhood", "hormonal", "women", "she", "her body", "cycle"],
  "mens-midlife-reset": ["midlife", "provider", "man", "his", "career plateau", "masculinity", "performance", "legacy"],
  "life-reset-reinvention": [], // default fallback
};

function scoreText(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
}

function detectPhase(blob: string): LifePhase {
  let best: LifePhase = "seeking";
  let bestScore = 0;
  for (const [phase, kws] of Object.entries(PHASE_KEYWORDS)) {
    const s = scoreText(blob, kws);
    if (s > bestScore) { bestScore = s; best = phase as LifePhase; }
  }
  return best;
}

function detectTrack(blob: string, lifeStage?: string): SupportTrack {
  // Life stage from onboarding can hint at track
  const combined = `${blob} ${lifeStage || ""}`;
  let best: SupportTrack = "life-reset-reinvention";
  let bestScore = 0;
  for (const [track, kws] of Object.entries(TRACK_SIGNALS)) {
    if (kws.length === 0) continue;
    const s = scoreText(combined, kws);
    if (s > bestScore) { bestScore = s; best = track as SupportTrack; }
  }
  return best;
}

function modulesForPhase(phase: LifePhase): string[] {
  const themeMap: Record<LifePhase, string[]> = {
    burnout: ["energy", "emotional", "burnout"],
    "identity-shift": ["identity", "self-trust", "alignment"],
    reinvention: ["reinvention", "purpose", "meaning"],
    overwhelm: ["focus", "clarity", "overwhelm"],
    transition: ["transition", "healing", "emotional"],
    seeking: ["purpose", "meaning", "awareness"],
  };
  const desiredThemes = themeMap[phase];
  const scored = Object.entries(MODULE_THEMES).map(([id, themes]) => ({
    id,
    score: themes.filter((t) => desiredThemes.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.id);
}

function challengeForPhase(phase: LifePhase): string {
  switch (phase) {
    case "burnout": return "3-day";
    case "overwhelm": return "3-day";
    case "identity-shift": return "7-day";
    case "transition": return "7-day";
    case "reinvention": return "14-day";
    case "seeking": return "7-day";
    default: return "7-day";
  }
}

export function programsForPhase(phase: LifePhase): string[] {
  switch (phase) {
    case "burnout":        return ["30-day-personal-reset"];
    case "identity-shift": return ["90-day-personal-transformation"];
    case "reinvention":    return ["90-day-personal-transformation", "6-month-private-partnership"];
    case "overwhelm":      return ["30-day-personal-reset"];
    case "transition":     return ["30-day-personal-reset", "90-day-personal-transformation"];
    case "seeking":        return ["90-day-personal-transformation"];
    default:               return ["30-day-personal-reset"];
  }
}

const PHASE_LABELS: Record<LifePhase, string> = {
  burnout: "You may be in a recovery phase",
  "identity-shift": "You may be in an identity transition",
  reinvention: "You may be entering a reinvention phase",
  overwhelm: "You may be carrying too much right now",
  transition: "You may be navigating a major life transition",
  seeking: "You may be in a discovery phase",
};

const PHASE_DESCRIPTIONS: Record<LifePhase, string> = {
  burnout:
    "Your answers suggest you've been running on empty for a while. This isn't weakness. It's a signal that something needs to shift. The right support can help you rebuild energy and clarity from the inside out.",
  "identity-shift":
    "It sounds like the version of you that got you here may not be the version that takes you forward. That's not a crisis. It's growth. Let's explore who you're becoming.",
  reinvention:
    "You're ready for something new. The old playbook doesn't fit anymore, and that's a powerful place to be. This is about building what comes next, intentionally.",
  overwhelm:
    "Right now everything feels like it's happening at once. That's not a character flaw. It's a sign you need a clearer system for what gets your energy and what doesn't.",
  transition:
    "Life is shifting in a big way. Whether chosen or unexpected, transitions demand a different kind of support: one that meets you where you are and helps you move forward with clarity.",
  seeking:
    "You're searching for something deeper: meaning, direction, a sense of purpose. That search is itself a sign of readiness. Let's channel it into something concrete.",
};

const SUPPORT_MESSAGES: Record<LifePhase, string> = {
  burnout: "Coach Kay has helped hundreds of people rebuild after burnout. You don't have to figure this out alone.",
  "identity-shift": "Identity work is Coach Kay's specialty. Let's explore this together, on your terms.",
  reinvention: "Ready to build what's next? Coach Kay can help you design a reinvention path that actually fits your life.",
  overwhelm: "Let's simplify. Coach Kay can help you cut through the noise and find your one next step.",
  transition: "Transitions are Coach Kay's arena. Let's navigate this shift with clarity and support.",
  seeking: "The fact that you're seeking means you're ready. Coach Kay can help you find what you're looking for.",
};

/**
 * Resolve a user's clarity answers and preferences into a recommended track + phase.
 */
export function resolveTrack(
  answers: Record<string, string>,
  preferences?: { primaryGoal?: string; lifeStage?: string }
): TrackResult {
  // Build a single text blob from all answers
  const blob = Object.values(answers).join(" ") + " " + (preferences?.primaryGoal || "");

  const likelyPhase = detectPhase(blob);
  const primaryTrack = detectTrack(blob, preferences?.lifeStage);

  return {
    primaryTrack,
    likelyPhase,
    phaseLabel: PHASE_LABELS[likelyPhase],
    phaseDescription: PHASE_DESCRIPTIONS[likelyPhase],
    recommendedModuleIds: modulesForPhase(likelyPhase),
    recommendedChallengeType: challengeForPhase(likelyPhase),
    recommendedProgramSlugs: programsForPhase(likelyPhase),
    supportMessage: SUPPORT_MESSAGES[likelyPhase],
  };
}
