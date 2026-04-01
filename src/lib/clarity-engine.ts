export interface ClarityAnswers {
  emotionalState: string;
  challenge: string;
  triedSoFar: string;
  holdingBack: string;
  clarityWouldChange: string;
  desiredFeeling: string;
}

interface InsightResult {
  truth: string;
  pattern: string;
  action: string;
}

const truthMap: Record<string, string> = {
  overwhelmed: "You're not broken — you're carrying too much without a system to process it. The overwhelm isn't about capacity, it's about clarity. You have more than enough strength. What you need is direction.",
  stuck: "Being stuck isn't a failure — it's a signal that something deeper needs your attention. You're not behind. You're at the exact point where a breakthrough becomes possible, if you stop forcing and start listening.",
  anxious: "Your anxiety is your intelligence trying to protect you from uncertainty. But here's the truth: you don't need certainty to move. You need clarity about what matters most right now.",
  disconnected: "That sense of disconnection? It's not apathy — it's your soul asking for realignment. You've been operating from obligation, not intention. It's time to come back to yourself.",
  frustrated: "Frustration is unprocessed ambition. You know you're capable of more, and the gap between where you are and where you know you could be is creating friction. That friction is fuel, not a flaw.",
  uncertain: "Uncertainty isn't weakness — it's the space where new possibilities live. You're not lost. You're standing at a crossroads, and the fact that you're here means you're ready to choose.",
};

const patternMap: Record<string, string> = {
  career: "You keep optimizing externally — new roles, new skills, new strategies — but the real bottleneck is internal. The pattern is seeking validation through achievement instead of building from alignment.",
  relationships: "You show up for everyone else before yourself. The pattern is over-giving to feel worthy of love, which leaves you depleted. Your relationships will transform when you stop performing and start being honest.",
  purpose: "You've been waiting for a moment of absolute certainty before you commit. The pattern is perfectionism disguised as patience. Purpose isn't found — it's built through consistent, imperfect action.",
  confidence: "You collect evidence of your inadequacy while dismissing proof of your competence. The pattern is a protection mechanism — if you never fully believe in yourself, rejection can't surprise you.",
  health: "You know what to do. The pattern isn't about information — it's about using busyness as a shield against confronting what's really draining your energy. Your body is keeping score.",
  focus: "You scatter your energy across too many directions because commitment feels risky. The pattern is using variety as a distraction from depth. Real progress requires you to choose one thing and stay.",
};

const actionMap: Record<string, string> = {
  peace: "Start each morning with 2 minutes of silence. Not meditation — just silence. Before the phone, before the plan. Let your mind settle. Then write one sentence about what matters today. Just one.",
  clarity: "Write down the three decisions you've been avoiding. Circle the one that would change everything else if you made it. That's your only job this week. Make that one decision.",
  courage: "Do the thing you've been rehearsing in your head. Today. Not perfectly — just do it. Send the message, make the call, take the step. Courage isn't the absence of fear. It's one action despite it.",
  freedom: "Identify the one obligation, relationship, or commitment that drains you most. Create a boundary around it this week. Freedom isn't about having nothing to do — it's about choosing what you carry.",
  joy: "Schedule 30 minutes this week that exist purely for you. No productivity, no output, no justification. Joy isn't a reward — it's a requirement. You've been treating it as optional.",
  strength: "Write a letter to yourself from the version of you who already has what you're seeking. What does that person tell you? That voice — that's your real voice. Start listening to it.",
};

function findBestMatch(input: string, map: Record<string, string>): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return map[key];
  }
  const keys = Object.keys(map);
  return map[keys[Math.floor(Math.random() * keys.length)]];
}

export function generateInsight(answers: ClarityAnswers): InsightResult {
  return {
    truth: findBestMatch(answers.emotionalState, truthMap),
    pattern: findBestMatch(answers.challenge, patternMap),
    action: findBestMatch(answers.desiredFeeling, actionMap),
  };
}

export const clarityQuestions = [
  {
    id: "emotionalState",
    label: "STEP 01",
    question: "Right now, in this moment — how do you honestly feel?",
    subtitle: "No right answer. Just the truth.",
    type: "options" as const,
    options: [
      { value: "overwhelmed", label: "Overwhelmed", desc: "Too much, too fast" },
      { value: "stuck", label: "Stuck", desc: "Can't seem to move forward" },
      { value: "anxious", label: "Anxious", desc: "Mind won't stop racing" },
      { value: "disconnected", label: "Disconnected", desc: "Going through the motions" },
      { value: "frustrated", label: "Frustrated", desc: "I know I'm capable of more" },
      { value: "uncertain", label: "Uncertain", desc: "I don't know what I want" },
    ],
  },
  {
    id: "challenge",
    label: "STEP 02",
    question: "What area of your life needs the most attention right now?",
    subtitle: "Where does the tension live?",
    type: "options" as const,
    options: [
      { value: "career", label: "Career & Work", desc: "Direction, growth, fulfillment" },
      { value: "relationships", label: "Relationships", desc: "Connection, boundaries, love" },
      { value: "purpose", label: "Purpose & Meaning", desc: "Why am I here?" },
      { value: "confidence", label: "Confidence", desc: "Believing in myself" },
      { value: "health", label: "Health & Energy", desc: "Body, mind, vitality" },
      { value: "focus", label: "Focus & Direction", desc: "Too many paths, no clarity" },
    ],
  },
  {
    id: "triedSoFar",
    label: "STEP 03",
    question: "What have you already tried to change this?",
    subtitle: "Be honest — even if the answer is 'nothing yet.'",
    type: "text" as const,
    placeholder: "I've tried...",
  },
  {
    id: "holdingBack",
    label: "STEP 04",
    question: "What do you think is really holding you back?",
    subtitle: "Not the surface answer. The deeper one.",
    type: "text" as const,
    placeholder: "What's really in the way is...",
  },
  {
    id: "clarityWouldChange",
    label: "STEP 05",
    question: "If you had total clarity right now, what would change first?",
    subtitle: "Paint the picture.",
    type: "text" as const,
    placeholder: "The first thing that would change is...",
  },
  {
    id: "desiredFeeling",
    label: "STEP 06",
    question: "One word. How do you want to feel?",
    subtitle: "Not what you want to have. How you want to feel.",
    type: "options" as const,
    options: [
      { value: "peace", label: "Peace", desc: "Calm, grounded, still" },
      { value: "clarity", label: "Clarity", desc: "Sharp, focused, certain" },
      { value: "courage", label: "Courage", desc: "Bold, fearless, alive" },
      { value: "freedom", label: "Freedom", desc: "Unbound, light, expansive" },
      { value: "joy", label: "Joy", desc: "Present, grateful, full" },
      { value: "strength", label: "Strength", desc: "Rooted, powerful, unshakable" },
    ],
  },
];

export const mirrorPrompts = [
  { day: 1, prompt: "What is one thing you've been avoiding that you already know the answer to?" },
  { day: 2, prompt: "Write about a moment today when you felt most like yourself." },
  { day: 3, prompt: "What would you do differently if no one was watching or judging?" },
  { day: 4, prompt: "Name one belief about yourself that you're ready to let go of." },
  { day: 5, prompt: "What is your body trying to tell you that your mind keeps overriding?" },
  { day: 6, prompt: "If your future self could send you one message, what would it say?" },
  { day: 7, prompt: "Read everything you've written this week. What pattern do you see? What truth emerges?" },
];
