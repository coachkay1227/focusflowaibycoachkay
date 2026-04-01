export interface ModuleQuestion {
  id: string;
  label: string;
  question: string;
  subtitle: string;
  type: "options" | "text";
  options?: { value: string; label: string; desc: string }[];
  placeholder?: string;
}

export interface CoachingModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  toneMode: "supportive" | "reflective" | "direct" | "strategic";
  questions: ModuleQuestion[];
  duration: string;
}

export const coachingModules: CoachingModule[] = [
  {
    id: "clarity-check",
    title: "Clarity Check",
    subtitle: "See what's really going on",
    description: "The foundational session. Cut through noise, identify your emotional state, surface your patterns, and get one clear next step.",
    icon: "eye",
    toneMode: "reflective",
    duration: "5 min",
    questions: [], // Uses default clarityQuestions from clarity-engine.ts
  },
  {
    id: "emotional-reset",
    title: "Emotional Reset",
    subtitle: "Process what you're carrying",
    description: "When emotions are running high and you need to come back to center. This module helps you name it, feel it, and release it.",
    icon: "heart",
    toneMode: "supportive",
    duration: "5 min",
    questions: [
      {
        id: "currentEmotion",
        label: "STEP 01",
        question: "What emotion is loudest right now?",
        subtitle: "Don't filter it. Name it honestly.",
        type: "options",
        options: [
          { value: "anger", label: "Anger", desc: "Something feels unfair" },
          { value: "sadness", label: "Sadness", desc: "A heaviness I can't shake" },
          { value: "fear", label: "Fear", desc: "Something ahead scares me" },
          { value: "shame", label: "Shame", desc: "I feel not good enough" },
          { value: "grief", label: "Grief", desc: "I'm mourning something" },
          { value: "numbness", label: "Numbness", desc: "I can't feel anything" },
        ],
      },
      {
        id: "emotionSource",
        label: "STEP 02",
        question: "Where in your life is this emotion showing up most?",
        subtitle: "Give it a home.",
        type: "options",
        options: [
          { value: "work", label: "Work", desc: "Career, projects, colleagues" },
          { value: "relationship", label: "Relationships", desc: "Partner, family, friends" },
          { value: "self", label: "Myself", desc: "My inner world" },
          { value: "past", label: "The Past", desc: "Something unresolved" },
          { value: "future", label: "The Future", desc: "What's coming next" },
        ],
      },
      {
        id: "bodyResponse",
        label: "STEP 03",
        question: "Where do you feel this in your body?",
        subtitle: "Close your eyes for a moment. Then answer.",
        type: "text",
        placeholder: "I feel it in my...",
      },
      {
        id: "whatNeeded",
        label: "STEP 04",
        question: "What does this emotion actually need from you?",
        subtitle: "Not what you think you should do. What it needs.",
        type: "text",
        placeholder: "It needs me to...",
      },
      {
        id: "releaseAction",
        label: "STEP 05",
        question: "If you could release just 10% of this weight right now, what would you let go of?",
        subtitle: "Small is fine. Honest is everything.",
        type: "text",
        placeholder: "I'd let go of...",
      },
    ],
  },
  {
    id: "focus-flow",
    title: "Focus Flow",
    subtitle: "Cut through the noise",
    description: "When everything feels urgent and nothing feels clear. This module helps you identify what actually matters and eliminate the rest.",
    icon: "target",
    toneMode: "strategic",
    duration: "5 min",
    questions: [
      {
        id: "currentPriority",
        label: "STEP 01",
        question: "How many things are you trying to do right now?",
        subtitle: "Be honest about how scattered you feel.",
        type: "options",
        options: [
          { value: "too-many", label: "Too many to count", desc: "I'm drowning in tasks" },
          { value: "several", label: "3-5 big things", desc: "Multiple priorities competing" },
          { value: "couple", label: "1-2 clear things", desc: "But I can't focus on them" },
          { value: "none", label: "Nothing feels important", desc: "I've lost my drive" },
        ],
      },
      {
        id: "biggestDrain",
        label: "STEP 02",
        question: "What's draining the most energy but giving the least return?",
        subtitle: "The thing you do out of obligation, not intention.",
        type: "text",
        placeholder: "The biggest drain is...",
      },
      {
        id: "oneThingMatters",
        label: "STEP 03",
        question: "If you could only accomplish ONE thing this week, what would make everything else easier?",
        subtitle: "Not the most urgent. The most impactful.",
        type: "text",
        placeholder: "The one thing is...",
      },
      {
        id: "focusBlocker",
        label: "STEP 04",
        question: "What keeps pulling you away from that one thing?",
        subtitle: "Name the distraction or the fear.",
        type: "options",
        options: [
          { value: "perfectionism", label: "Perfectionism", desc: "I want it to be perfect before I start" },
          { value: "others-needs", label: "Other people's needs", desc: "I keep saying yes to others" },
          { value: "overwhelm", label: "Overwhelm", desc: "I don't know where to begin" },
          { value: "fear", label: "Fear of failure", desc: "What if I try and it doesn't work?" },
          { value: "distraction", label: "Distraction", desc: "Phone, news, busywork" },
        ],
      },
      {
        id: "commitAction",
        label: "STEP 05",
        question: "What's the smallest next step you can take in the next 24 hours?",
        subtitle: "Make it so small you can't say no.",
        type: "text",
        placeholder: "My next step is...",
      },
    ],
  },
  {
    id: "purpose-happiness",
    title: "Purpose & Happiness",
    subtitle: "Reconnect with what matters",
    description: "When you've achieved things but still feel empty. This module reconnects you with your deeper why and what actually brings you alive.",
    icon: "sun",
    toneMode: "reflective",
    duration: "6 min",
    questions: [
      {
        id: "happinessLevel",
        label: "STEP 01",
        question: "On a scale from empty to overflowing, where is your happiness right now?",
        subtitle: "No judgment. Just honesty.",
        type: "options",
        options: [
          { value: "empty", label: "Running on empty", desc: "Going through the motions" },
          { value: "low", label: "Flickering", desc: "Moments of joy but mostly flat" },
          { value: "moderate", label: "Decent", desc: "Good days and bad days" },
          { value: "searching", label: "Searching", desc: "I know it's there, can't find it" },
        ],
      },
      {
        id: "lastAlive",
        label: "STEP 02",
        question: "When was the last time you felt truly alive?",
        subtitle: "Not productive. Not successful. Alive.",
        type: "text",
        placeholder: "I last felt alive when...",
      },
      {
        id: "purposeBlocker",
        label: "STEP 03",
        question: "What are you doing out of obligation that your soul doesn't want to carry anymore?",
        subtitle: "The thing that costs you more than it gives.",
        type: "text",
        placeholder: "What I'm carrying is...",
      },
      {
        id: "childSelf",
        label: "STEP 04",
        question: "What did the 10-year-old version of you love doing?",
        subtitle: "Before the world told you to be practical.",
        type: "text",
        placeholder: "I used to love...",
      },
      {
        id: "purposeVision",
        label: "STEP 05",
        question: "If purpose found you tomorrow, what would your life look like?",
        subtitle: "Describe it as if it's already happening.",
        type: "text",
        placeholder: "My life looks like...",
      },
      {
        id: "purposeFeeling",
        label: "STEP 06",
        question: "What word captures the feeling you're seeking?",
        subtitle: "Not what you want to achieve. What you want to feel.",
        type: "options",
        options: [
          { value: "meaning", label: "Meaning", desc: "My life matters" },
          { value: "aliveness", label: "Aliveness", desc: "I feel every moment" },
          { value: "connection", label: "Connection", desc: "I belong somewhere" },
          { value: "impact", label: "Impact", desc: "I'm making a difference" },
          { value: "peace", label: "Peace", desc: "I'm at home in myself" },
        ],
      },
    ],
  },
  {
    id: "goal-shift",
    title: "Goal Shift",
    subtitle: "Realign your direction",
    description: "When your goals don't feel right anymore. This module helps you separate what you truly want from what you think you should want.",
    icon: "compass",
    toneMode: "direct",
    duration: "5 min",
    questions: [
      {
        id: "goalMisalignment",
        label: "STEP 01",
        question: "Which of your current goals feels most out of alignment?",
        subtitle: "The one you pursue but your heart isn't in it.",
        type: "text",
        placeholder: "The goal that doesn't fit anymore is...",
      },
      {
        id: "goalOrigin",
        label: "STEP 02",
        question: "Where did that goal actually come from?",
        subtitle: "Was it yours, or was it inherited?",
        type: "options",
        options: [
          { value: "society", label: "Society / culture", desc: "What I'm supposed to want" },
          { value: "family", label: "Family expectations", desc: "What they wanted for me" },
          { value: "fear", label: "Fear / scarcity", desc: "Playing it safe" },
          { value: "ego", label: "Ego / comparison", desc: "Keeping up with others" },
          { value: "past-self", label: "A past version of me", desc: "I've outgrown it" },
        ],
      },
      {
        id: "trueDesire",
        label: "STEP 03",
        question: "If nobody knew what you chose — what would you actually go after?",
        subtitle: "Remove the audience. What's left?",
        type: "text",
        placeholder: "What I'd actually choose is...",
      },
      {
        id: "fearOfShift",
        label: "STEP 04",
        question: "What's the scariest part of letting go of the old goal?",
        subtitle: "Name the fear. It loses power when you do.",
        type: "text",
        placeholder: "I'm afraid that...",
      },
      {
        id: "newDirection",
        label: "STEP 05",
        question: "What does your aligned direction feel like?",
        subtitle: "Not what it looks like. What it feels like.",
        type: "options",
        options: [
          { value: "expansive", label: "Expansive", desc: "Like I can breathe again" },
          { value: "grounded", label: "Grounded", desc: "Like I'm standing on solid ground" },
          { value: "electric", label: "Electric", desc: "Like I'm finally alive" },
          { value: "peaceful", label: "Peaceful", desc: "Like I can stop fighting" },
          { value: "purposeful", label: "Purposeful", desc: "Like everything makes sense" },
        ],
      },
    ],
  },
];

export function getModule(moduleId: string): CoachingModule | undefined {
  return coachingModules.find((m) => m.id === moduleId);
}
