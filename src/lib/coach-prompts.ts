/**
 * Legacy import shim. The canonical voice + prompts now live in
 * src/lib/coach-voice.ts. Update imports going forward.
 */
import { composeSystemPrompt, COACH_KAY_IDENTITY, COACH_KAY_VOICE } from "./coach-voice";

export const COACH_KAY_SYSTEM_PROMPT = `${COACH_KAY_IDENTITY}\n\n${COACH_KAY_VOICE}`;
export const CLARITY_INSIGHT_PROMPT = composeSystemPrompt("clarity-report");
export const PATTERN_DETECT_PROMPT = composeSystemPrompt("pattern-detect");
export const COACH_CHAT_PROMPT = composeSystemPrompt("live-chat");
