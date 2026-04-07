// ============================================================
// FocusFlow AI — Master Program Data
// src/data/programs.ts
// Coach K Elevates | Shield Her Elevation LLC
// Framework: F.O.C.U.S. (Foundation · Opportunity · Create · Uplift · Support)
// "Where Focus Goes, Energy Flows."
// ============================================================

export type FocusPillar = "F" | "O" | "C" | "U" | "S";
export type AccessTier = "free" | "subscriber" | "cohort" | "premium" | "corporate";
export type Audience = "general" | "reentry" | "corporate" | "youth" | "nonprofit";
export type ProgramType = "assessment" | "challenge" | "course" | "sprint" | "reset" | "workshop";
export type Duration = "5min" | "1day" | "2day" | "5day" | "7day" | "8day" | "30day" | "8week" | "12week";

export interface PaymentPlan {
  installments: number;
  amountPerInstallment: number;
  label: string;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  pillar: FocusPillar;
  pillarFull: string;
  type: ProgramType;
  category: string;
  duration: Duration;
  durationLabel: string;
  tagline: string;
  description: string;
  coachNote: string;
  whatYouGet: string[];
  transformation: string;
  accessTier: AccessTier;
  price: number;
  priceDisplay: string;
  paymentPlan: PaymentPlan | null;
  cohortCode: boolean;
  tags: string[];
  audience: Audience[];
  isFeatured: boolean;
  isGated: boolean;
  isNew: boolean;
  wrdLink: boolean;
  order: number;
}

export const FOCUS_PILLARS: Record<FocusPillar, { full: string; color: string; description: string }> = {
  F: {
    full: "Foundation",
    color: "#C9973A",
    description: "Identity, mindset, and inner work. Clear what's blocking you so you can build on solid ground.",
  },
  O: {
    full: "Opportunity",
    color: "#4A7FC1",
    description: "Recognize open doors, align with purpose, shift from survival mode to strategic clarity.",
  },
  C: {
    full: "Create",
    color: "#7B5EA7",
    description: "Take aligned action, design your life by intention, and build what you were made to build.",
  },
  U: {
    full: "Uplift",
    color: "#2E9E75",
    description: "Elevate your standards, habits, and environment. Become the version of yourself that sustains success.",
  },
  S: {
    full: "Support",
    color: "#D4527E",
    description: "Community, accountability, and ongoing coaching. You don't grow alone — this is where it compounds.",
  },
};

export const programs: Program[] = [

  // ─────────────────────────────────────────────
  // FREE TIER — Assessment & Quick Tools
  // ─────────────────────────────────────────────

  {
    id: "clarity-check",
    title: "F.O.C.U.S. Clarity Check",
    slug: "focus-clarity-check",
    pillar: "F",
    pillarFull: "Foundation",
    type: "assessment",
    category: "Assessment",
    duration: "5min",
    durationLabel: "5 minutes",
    tagline: "Know exactly where you are — so you know where to go.",
    description:
      "Your first step into the FocusFlow ecosystem. This personalized intake assessment reads your current state across all five F.O.C.U.S. pillars and delivers a personalized insight report in Coach Kay's voice. No fluff — just honest clarity about what's working, what's blocked, and what your next move is.",
    coachNote:
      "I built this because most people don't know what they actually need — they just know something isn't working. This tool names it. That's where transformation begins.",
    whatYouGet: [
      "15-question F.O.C.U.S. intake assessment",
      "Personalized insight report personalized to your answers",
      "Your primary pillar + your biggest block identified",
      "Coach Kay's recommended next program for your journey",
      "Instant access — no sign-up required at events",
    ],
    transformation:
      "You stop guessing what's wrong and start seeing exactly where your energy is leaking — and where to invest it.",
    accessTier: "free",
    price: 0,
    priceDisplay: "Free",
    paymentPlan: null,
    cohortCode: false,
    tags: ["assessment", "intake", "ai", "quick-win", "entry-point"],
    audience: ["general", "reentry", "youth", "corporate", "nonprofit"],
    isFeatured: true,
    isGated: false,
    isNew: false,
    wrdLink: true,
    order: 1,
  },

  {
    id: "mac-type-assessment",
    title: "MAC Type Assessment",
    slug: "mac-type-assessment",
    pillar: "F",
    pillarFull: "Foundation",
    type: "assessment",
    category: "Assessment",
    duration: "5min",
    durationLabel: "5–7 minutes",
    tagline: "Discover your Mind-Action-Character type and get your personalized path.",
    description:
      "This proprietary self-scored assessment types you across three dimensions — Mind, Action, and Character — then delivers a fully personalized coaching path. Think of it as your personality GPS. It tells you how you process, how you move, and who you're becoming. No generic buckets — your type is uniquely yours.",
    coachNote:
      "This is the assessment I use in every single cohort intake. It changes how people see themselves in 7 minutes flat. The follow-up is what makes it magical — it doesn't just type you, it coaches you from that type.",
    whatYouGet: [
      "Self-scored MAC type assessment (20 questions)",
      "Your unique 3-dimension type profile",
      "Coaching response personalized to your MAC type",
      "Recommended programs matched to how you learn and grow",
      "Shareable type card for your community profile",
    ],
    transformation:
      "You stop trying to change who you are and start building on who you already are — smarter, faster, with less resistance.",
    accessTier: "free",
    price: 0,
    priceDisplay: "Free",
    paymentPlan: null,
    cohortCode: false,
    tags: ["assessment", "personality", "ai", "intake", "self-knowledge"],
    audience: ["general", "reentry", "youth", "corporate"],
    isFeatured: true,
    isGated: false,
    isNew: false,
    wrdLink: true,
    order: 2,
  },

  // ─────────────────────────────────────────────
  // F — FOUNDATION (Core Inner Work)
  // ─────────────────────────────────────────────

  {
    id: "letting-go",
    title: "Master the Skill of Letting Go",
    slug: "master-letting-go",
    pillar: "F",
    pillarFull: "Foundation",
    type: "challenge",
    category: "Core Inner Work",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Release what's holding you hostage — so you can finally move.",
    description:
      "Holding on feels safe. But it's the thing that's costing you the most. This 7-day guided challenge uses daily coaching prompts and reflective exercises to help you identify exactly what you're gripping — people, outcomes, identities, stories — and build the emotional skill to release it. Not in a toxic-positivity way. In a real, honest, lasting way.",
    coachNote:
      "Every client I've ever worked with had something they needed to let go of before the real work could start. This challenge does that work — gently but completely.",
    whatYouGet: [
      "7 daily coaching sessions (10-15 min each)",
      "Release audit: what you're holding, why, and what it costs",
      "Guided journaling prompts with personalized feedback",
      "Emotional pattern identification tool",
      "Day 7 identity reset ritual",
    ],
    transformation:
      "You move from stuck and heavy to clear and ready — with specific language for what you're releasing and what you're choosing instead.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["letting-go", "mindset", "healing", "inner-work", "emotional-intelligence"],
    audience: ["general", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 10,
  },

  {
    id: "mirror-challenge",
    title: "The Mirror Challenge",
    slug: "mirror-challenge",
    pillar: "F",
    pillarFull: "Foundation",
    type: "challenge",
    category: "Core Inner Work",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Face the version of yourself you've been avoiding.",
    description:
      "This is not a feel-good challenge. It's a truth challenge. Over 7 days, you'll confront the identity stories you've built about yourself — the ones that feel like facts but are actually just old programming. Each day delivers a coaching prompt, a mirror exercise, and a reframe designed to replace what's false with what's actually true about who you are.",
    coachNote:
      "Day 4 breaks something open in almost everyone. I've seen it happen hundreds of times. Stick with it — what comes out on the other side is you, unfiltered.",
    whatYouGet: [
      "7 daily mirror exercises with guided coaching debrief",
      "Identity audit: beliefs that are running you vs. serving you",
      "Personalized self-perception reframe report",
      "Daily accountability check-in with Coach Kay",
      "Final day: written declaration of your real identity",
    ],
    transformation:
      "You stop operating from the person you were told you were and start living as the person you actually are.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["identity", "self-perception", "mirror", "mindset", "healing"],
    audience: ["general", "reentry", "youth"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 11,
  },

  {
    id: "private-reflection-challenge",
    title: "Private Reflection Challenge",
    slug: "private-reflection-challenge",
    pillar: "F",
    pillarFull: "Foundation",
    type: "challenge",
    category: "Core Inner Work",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "The self-audit that shows you everything you've been avoiding seeing.",
    description:
      "This is your honest conversation with yourself — with a trusted guide. Over 5 days, you'll complete a structured self-audit across your relationships, habits, finances, mental state, and purpose alignment. The coaching doesn't judge. It just reflects back what's really there — so you can finally decide what to do about it.",
    coachNote:
      "I use this as a post-event follow-up for everyone who takes the Clarity Check. It's the bridge between 'I see the problem' and 'I'm ready to do something about it.'",
    whatYouGet: [
      "5-day guided self-audit across all life areas",
      "Coaching session after each daily reflection",
      "Honest gap analysis: where you are vs. where you said you wanted to be",
      "Pattern report delivered at the end of Day 5",
      "Recommended next F.O.C.U.S. module based on your audit",
    ],
    transformation:
      "You close the gap between the life you're living and the one you keep saying you want.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["reflection", "self-audit", "honesty", "clarity", "foundation"],
    audience: ["general", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 12,
  },

  {
    id: "mastering-peace-purpose",
    title: "Mastering Peace and Purpose",
    slug: "mastering-peace-purpose",
    pillar: "F",
    pillarFull: "Foundation",
    type: "course",
    category: "Core Inner Work",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Connect the calm you crave to the direction you've been missing.",
    description:
      "Most people chase purpose while drowning in chaos. This program flips that. Over 7 days, you'll build a daily peace practice first — then anchor it to a clear sense of direction. Because you can't hear your purpose when everything is loud. Coach Kay guides each session with emotionally intelligent prompts designed to quiet the noise and light the path.",
    coachNote:
      "Peace isn't the absence of problems — it's the presence of a foundation strong enough to hold them. That's what we build here.",
    whatYouGet: [
      "Daily peace practice ritual (10 min) with guided coaching",
      "Purpose clarification framework: values → vision → direction",
      "Noise audit: what's stealing your peace and why",
      "7-day personalized peace + purpose roadmap",
      "Guided audio meditation (Coach Kay's voice)",
    ],
    transformation:
      "You stop running from yourself and start moving toward something — with a sense of calm that doesn't depend on your circumstances.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["peace", "purpose", "mindfulness", "direction", "calm"],
    audience: ["general", "reentry", "nonprofit"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 13,
  },

  {
    id: "unshakable-self-assurance",
    title: "Achieve Unshakable Self-Assurance",
    slug: "unshakable-self-assurance",
    pillar: "F",
    pillarFull: "Foundation",
    type: "course",
    category: "Core Inner Work",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Rebuild the confidence that burnout, betrayal, or failure took from you.",
    description:
      "Confidence isn't a personality trait — it's a skill. And like any skill, it can be rebuilt. This 7-day program uses evidence-based confidence-building techniques layered with Coach Kay's coaching methodology to help you recover your self-trust after setbacks, burnout, or anyone who told you who you were. No pep talks. Just proven practice.",
    coachNote:
      "I designed this specifically for the people who used to believe in themselves — and then life happened. You haven't lost it. You've just been away from it.",
    whatYouGet: [
      "7 daily confidence-building exercises with guided coaching",
      "Evidence audit: proof of who you actually are",
      "Self-talk pattern analysis and rewrite",
      "Confidence anchor ritual (science-backed)",
      "Personal power statement you'll actually believe",
    ],
    transformation:
      "You stop waiting to feel ready and start operating from a self-assurance that no one and nothing can take from you.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["confidence", "self-assurance", "burnout-recovery", "resilience", "inner-work"],
    audience: ["general", "reentry", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 14,
  },

  {
    id: "alignment-accelerator",
    title: "The Alignment Accelerator",
    slug: "alignment-accelerator",
    pillar: "F",
    pillarFull: "Foundation",
    type: "sprint",
    category: "Core Inner Work",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "When your values, actions, and environment match — everything accelerates.",
    description:
      "You can work hard and still feel empty. That's what misalignment does. This 5-day sprint maps the distance between your stated values and your actual life — then closes it. Using personalized alignment coaching, you'll identify where you're out of integrity with yourself and build a concrete plan to get back on track.",
    coachNote:
      "Misalignment is the silent killer of motivation. It's why people who 'should' be thriving feel stuck. Once you close that gap, the energy comes back — fast.",
    whatYouGet: [
      "Values inventory and ranking exercise",
      "Life alignment audit across 6 areas",
      "Gap analysis: where you are vs. your values",
      "5 daily micro-actions to close each gap",
      "Alignment score + personalized accountability plan",
    ],
    transformation:
      "You stop feeling like you're performing your life and start actually living it — with clarity, integrity, and momentum.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["alignment", "values", "integrity", "clarity", "foundation"],
    audience: ["general", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 15,
  },

  {
    id: "discover-energy-patterns",
    title: "Discover Energy Patterns Holding You Back",
    slug: "discover-energy-patterns",
    pillar: "F",
    pillarFull: "Foundation",
    type: "assessment",
    category: "Core Inner Work",
    duration: "5min",
    durationLabel: "5–10 minutes",
    tagline: "Find the invisible drain — and turn it into fuel.",
    description:
      "Your energy isn't random. It follows patterns — and those patterns are either working for you or against you. This guided energy pattern assessment identifies exactly where and why your energy drains throughout your day, week, and life — then gives you a personalized report with specific shifts to reclaim it.",
    coachNote:
      "This is one of my favorite tools because it immediately shows people something they've felt but couldn't name. Once you see the pattern, you can't unsee it.",
    whatYouGet: [
      "Personalized energy pattern assessment",
      "Your top 3 energy drains identified",
      "Personalized energy recovery strategy",
      "Daily energy audit template",
      "Recommended program based on your pattern type",
    ],
    transformation:
      "You stop wondering why you're exhausted and start making choices that actually refuel you.",
    accessTier: "free",
    price: 0,
    priceDisplay: "Free",
    paymentPlan: null,
    cohortCode: false,
    tags: ["energy", "patterns", "assessment", "recovery", "awareness"],
    audience: ["general", "reentry", "corporate"],
    isFeatured: false,
    isGated: false,
    isNew: false,
    wrdLink: true,
    order: 16,
  },

  {
    id: "empower-your-mind",
    title: "Empower Your Mind",
    slug: "empower-your-mind",
    pillar: "F",
    pillarFull: "Foundation",
    type: "course",
    category: "Core Inner Work",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Upgrade the operating system running your life.",
    description:
      "Survival mode is a mindset — and it runs on a loop that was installed long before you had a say in it. This 7-day program is a full mindset elevation protocol for people who are ready to stop reacting and start operating from power. Each day delivers a coaching session, a mindset reframe, and a practical upgrade you can apply immediately.",
    coachNote:
      "This is for the person who's been in fight-or-flight so long they forgot what it feels like to be in choice. That ends here.",
    whatYouGet: [
      "7-day mindset elevation protocol",
      "Survival mode vs. thriving mode diagnostic",
      "Daily coaching session and mindset upgrade",
      "Limiting belief audit and rewrite",
      "New operating principles: your personal mind manual",
    ],
    transformation:
      "You graduate from surviving to leading — your thoughts, your responses, your life.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["mindset", "empowerment", "survival-mode", "elevation", "inner-work"],
    audience: ["general", "reentry", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 17,
  },

  {
    id: "growth-mindset",
    title: "Cultivating a Growth Mindset for Personal Success",
    slug: "growth-mindset-personal-success",
    pillar: "F",
    pillarFull: "Foundation",
    type: "course",
    category: "Core Inner Work",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Shift from 'I can't' to 'I haven't yet' — permanently.",
    description:
      "The fixed mindset isn't a flaw. It's a protection mechanism. This 5-day program uses Dr. Carol Dweck's research layered with Coach Kay's real-world coaching framework to help you identify where you're fixed, understand why, and build the neural pathways of a growth mindset through daily practice — not motivation.",
    coachNote:
      "Motivation is temporary. Practice is permanent. That's what this does — it builds the habit of growth thinking, not just the feeling of it.",
    whatYouGet: [
      "Fixed vs. growth mindset diagnostic",
      "5 daily growth mindset challenges with guided coaching",
      "Failure reframe toolkit",
      "Success evidence journal (guided prompts)",
      "30-day growth habit installation plan",
    ],
    transformation:
      "You stop seeing your limits as permanent and start treating every challenge as data — not defeat.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["growth-mindset", "mindset-shift", "resilience", "learning", "foundation"],
    audience: ["general", "youth", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 18,
  },

  {
    id: "superpower-of-perspective",
    title: "The Superpower of Perspective",
    slug: "superpower-of-perspective",
    pillar: "F",
    pillarFull: "Foundation",
    type: "challenge",
    category: "Core Inner Work",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Your story isn't what happened — it's how you're holding it.",
    description:
      "Every limitation you believe is real was once a story someone told you — or you told yourself. This 5-day reframing challenge teaches you the coaching skill of perspective shift using guided practice. You'll bring in your actual challenges and leave with completely different relationships to them. Not because the facts changed. Because your lens did.",
    coachNote:
      "Perspective is the most underrated coaching tool. It costs nothing and changes everything. I teach it first for a reason.",
    whatYouGet: [
      "5 daily perspective-shift exercises with Coach Kay",
      "Your top 3 current limiting stories identified",
      "Reframe toolkit: 7 powerful reframing techniques",
      "Real-scenario practice with personalized feedback",
      "Personal perspective upgrade statement",
    ],
    transformation:
      "What used to feel like walls start feeling like information — and you start moving through your life with a whole new level of agency.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["perspective", "reframing", "stories", "mindset", "agency"],
    audience: ["general", "reentry", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 19,
  },

  {
    id: "clarity-energy-creativity",
    title: "Clarity, Energy, and Creativity Challenge",
    slug: "clarity-energy-creativity",
    pillar: "F",
    pillarFull: "Foundation",
    type: "challenge",
    category: "Core Inner Work",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "The trifecta that unstucks everything.",
    description:
      "When you're stuck, something in this trifecta is missing: you either can't see clearly, don't have the energy to move, or can't access the creative thinking to find a new path. This 5-day challenge targets all three simultaneously using guided daily sessions that restore your mental bandwidth, physical vitality, and creative access.",
    coachNote:
      "This is the challenge I give people who say 'I don't even know where to start.' By Day 3, they always know.",
    whatYouGet: [
      "Clarity diagnostic: what's actually clouding your thinking",
      "Energy recovery protocol (sustainable, not hype-based)",
      "Creativity activation exercises (guided)",
      "5-day integrated daily practice",
      "Personalized unstuck action plan",
    ],
    transformation:
      "You move from frozen and overwhelmed to clear, energized, and in flow — in 5 days.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["clarity", "energy", "creativity", "unstuck", "flow"],
    audience: ["general", "reentry", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 20,
  },

  {
    id: "path-to-greatness",
    title: "Path to Greatness: Reflect, Set, Ignite",
    slug: "path-to-greatness",
    pillar: "F",
    pillarFull: "Foundation",
    type: "sprint",
    category: "Core Inner Work",
    duration: "2day",
    durationLabel: "2 days",
    tagline: "Vision and goal-setting with the emotional activation to actually follow through.",
    description:
      "Most goal-setting fails because it lives in the head but never reaches the heart. This 2-day sprint combines deep reflection with emotionally activated goal-setting — so the goals you walk away with aren't just written down, they're wired in. Guided coaching takes you through the entire process, ending with a personal ignition statement that becomes your anchor.",
    coachNote:
      "I've watched people set the same goals for 10 years. The problem isn't the goal — it's the emotional connection to it. That's what this fixes.",
    whatYouGet: [
      "Day 1: Deep reflection — who you've been, who you're becoming",
      "Day 2: Vision activation + goal architecture session",
      "Emotional 'why' excavation exercise",
      "guided goal reality-testing",
      "Your personal ignition statement",
    ],
    transformation:
      "You stop setting goals you abandon and start committing to the ones that actually matter — because you know exactly why they matter.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["goal-setting", "vision", "reflection", "ignition", "purpose"],
    audience: ["general", "reentry", "corporate", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 21,
  },

  // ─────────────────────────────────────────────
  // O — OPPORTUNITY (Stressed / Overwhelmed)
  // ─────────────────────────────────────────────

  {
    id: "power-hour-challenge",
    title: "Power Hour Challenge",
    slug: "power-hour-challenge",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "challenge",
    category: "Stress & Overwhelm",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Reclaim one focused hour a day — and watch what's possible.",
    description:
      "When you're overwhelmed, your time gets hijacked by everything urgent and nothing important. The Power Hour Challenge trains you to protect and own one high-leverage hour every single day — and use it strategically. Coaching helps you design your hour, protect it, and debrief what happened so you compound the results.",
    coachNote:
      "One hour of intentional work beats three hours of reactive busy-ness every single time. This challenge proves it to you — in real time.",
    whatYouGet: [
      "Power Hour design framework (your version, not a template)",
      "7-day guided accountability sessions",
      "Daily debrief: what worked, what to adjust",
      "Distraction audit and elimination plan",
      "Power Hour ritual that sticks beyond Day 7",
    ],
    transformation:
      "You stop drowning in your to-do list and start leading your day — one focused, protected hour at a time.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["focus", "time-management", "overwhelm", "productivity", "daily-practice"],
    audience: ["general", "corporate", "nonprofit"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 30,
  },

  {
    id: "daily-minimalist-challenge",
    title: "Daily Minimalist Challenge",
    slug: "daily-minimalist-challenge",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "challenge",
    category: "Stress & Overwhelm",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Clear the noise — physical, digital, mental — and see what's left.",
    description:
      "Decision fatigue is real, and it's stealing your mental energy before the day even starts. This challenge takes you through a systematic declutter of your environment, your digital space, your calendar, and your mind — one layer at a time. Each day's simplification is guided by coaching that helps you make decisions faster and protect your mental bandwidth.",
    coachNote:
      "People think minimalism is about stuff. It's actually about capacity. When you clear the external noise, you create room for what actually matters.",
    whatYouGet: [
      "7-day declutter protocol (space → digital → schedule → mind)",
      "Decision fatigue diagnostic and recovery plan",
      "Coaching sessions on what to keep vs. release",
      "Simplified daily structure template",
      "Mental load inventory and reduction strategy",
    ],
    transformation:
      "You move through your day with less friction, more clarity, and the mental space to actually think — instead of just react.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["minimalism", "declutter", "clarity", "decision-fatigue", "simplify"],
    audience: ["general", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 31,
  },

  {
    id: "complete-incomplete-challenge",
    title: "Complete the Incomplete Challenge",
    slug: "complete-incomplete-challenge",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "challenge",
    category: "Stress & Overwhelm",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Stop carrying the weight of everything you haven't finished.",
    description:
      "Unfinished things create a mental tax that compounds daily. Every incomplete project, unanswered email, broken relationship, and abandoned goal takes up invisible bandwidth. This 5-day challenge is a systematic completion process — you'll finish what matters, consciously release what doesn't, and clear your internal ledger so you can move without that low-grade weight.",
    coachNote:
      "The mental backlog is usually heavier than the actual work. This challenge proves it — most of what people are carrying, they don't actually need to complete.",
    whatYouGet: [
      "Full incomplete inventory across all life areas",
      "guided completion vs. release decision framework",
      "5-day completion sprint with daily accountability",
      "Conscious release ritual for things you're letting go",
      "Clear-plate ceremony at Day 5",
    ],
    transformation:
      "You stop dragging your past into your present and start operating with a clean slate — lighter, faster, freer.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["completion", "overwhelm", "mental-load", "release", "clarity"],
    audience: ["general", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 32,
  },

  {
    id: "self-control-mastery",
    title: "Mastering the Skill of Self-Control",
    slug: "mastering-self-control",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "course",
    category: "Stress & Overwhelm",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Impulse and emotion are data — not destiny.",
    description:
      "Self-control isn't willpower — it's a trained skill rooted in emotional intelligence. This 7-day program teaches the neuroscience of impulse regulation alongside practical daily exercises for managing reactions, delaying gratification, and choosing response over reflex. Coaching provides real-time feedback on your patterns and progress.",
    coachNote:
      "Most people were never taught how to regulate — they were just punished for not doing it. This teaches it properly. Finally.",
    whatYouGet: [
      "Impulse pattern audit: your triggers and your responses",
      "Neuroscience of self-regulation (applied, not academic)",
      "7 daily regulation practices with guided debrief",
      "Emotional escalation interrupt protocol",
      "30-day self-control habit plan",
    ],
    transformation:
      "You stop being at the mercy of your reactions and start choosing who you are in every situation — especially the hard ones.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["self-control", "emotional-regulation", "impulse", "discipline", "neuroscience"],
    audience: ["general", "reentry", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 33,
  },

  {
    id: "art-of-getting-ahead",
    title: "The Art of Getting Things Done Ahead of Time",
    slug: "art-of-getting-ahead",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "course",
    category: "Stress & Overwhelm",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Stop putting out fires. Start preventing them.",
    description:
      "Reactive living is exhausting. This 5-day program is a systematic shift from always-behind to consistently-ahead — using proactive planning systems, guided scheduling, and a complete restructure of how you relate to time. You'll leave with a personal proactivity architecture that makes being ahead the default, not the exception.",
    coachNote:
      "The people who look effortlessly on top of things aren't naturally different. They just installed the right systems. That's what this builds.",
    whatYouGet: [
      "Reactive vs. proactive audit across your life",
      "Weekly and daily architecture redesign",
      "guided time blocking and prioritization",
      "Proactivity triggers: habits that pull you forward",
      "Personal proactivity blueprint",
    ],
    transformation:
      "You move from perpetually catching up to consistently ahead — and the stress of your life drops dramatically as a result.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["proactivity", "time-management", "planning", "stress-prevention", "systems"],
    audience: ["general", "corporate", "nonprofit"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 34,
  },

  {
    id: "4-90-1-challenge",
    title: "4/90/1 Challenge",
    slug: "4-90-1-challenge",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "challenge",
    category: "Stress & Overwhelm",
    duration: "8day",
    durationLabel: "8 days",
    tagline: "4 goals. 90 days. 1 focus. Convert overwhelm into unstoppable momentum.",
    description:
      "The 4/90/1 framework is Coach Kay's proprietary discipline system: 4 goals, 90-day execution window, 1 non-negotiable daily action. Over 8 days you'll identify, set, and launch your 4/90/1 plan with coaching support that stress-tests each goal, validates your daily action, and ensures your plan is built to actually work — not just feel good on paper.",
    coachNote:
      "I designed this because most people have too many goals and too little commitment to any of them. The constraint is the point. Pick 4. Commit for 90. Do the 1 thing every day. Watch what happens.",
    whatYouGet: [
      "4/90/1 framework deep-dive with Coach Kay",
      "Goal selection and stress-testing with guided coaching",
      "Daily non-negotiable identification process",
      "90-day execution calendar template",
      "Weekly check-in protocol for the full 90 days",
    ],
    transformation:
      "You go from scattered and overwhelmed to locked-in and moving — with a 90-day plan that actually has a shot.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["discipline", "focus", "goals", "90-day", "momentum"],
    audience: ["general", "corporate", "reentry"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 35,
  },

  {
    id: "sugar-reset",
    title: "Sugar Reset: 8-Week Nervous System Reboot",
    slug: "sugar-reset-8-week",
    pillar: "O",
    pillarFull: "Opportunity",
    type: "reset",
    category: "Stress & Overwhelm",
    duration: "8week",
    durationLabel: "8 weeks",
    tagline: "Regulate from the inside out — starting with what you eat.",
    description:
      "Stress coaching that ignores the body is incomplete. This 8-week program addresses the physical component of emotional dysregulation — specifically how blood sugar instability drives anxiety, mood swings, and mental fog. Weekly guided coaching sessions combine nutritional guidance with emotional wellness practices to help you find a baseline of calm that no supplement or meditation alone can create.",
    coachNote:
      "I added this to the platform because I kept watching clients do all the inner work and still feel terrible. Turns out, the body has a vote. This program respects that.",
    whatYouGet: [
      "8-week guided sugar reset protocol",
      "Weekly coaching sessions on nutrition + emotions",
      "Nervous system regulation practices",
      "Meal planning guide (simple, real-life applicable)",
      "Energy and mood tracking dashboard",
    ],
    transformation:
      "You create a physiological foundation for emotional stability — so your inner work actually has somewhere solid to land.",
    accessTier: "premium",
    price: 297,
    priceDisplay: "$297",
    paymentPlan: { installments: 2, amountPerInstallment: 167, label: "2 payments of $167" },
    cohortCode: false,
    tags: ["nutrition", "nervous-system", "stress", "body", "wellness"],
    audience: ["general", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 36,
  },

  // ─────────────────────────────────────────────
  // C — CREATE (Transformation & Identity)
  // ─────────────────────────────────────────────

  {
    id: "integrity-alignment-challenge",
    title: "The Integrity Alignment Challenge",
    slug: "integrity-alignment-challenge",
    pillar: "C",
    pillarFull: "Create",
    type: "challenge",
    category: "Transformation & Identity",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Who are you actually being — and is that who you said you'd be?",
    description:
      "Integrity isn't a moral issue — it's an identity issue. When you don't do what you said you'd do, it costs you self-trust. This 7-day challenge confronts that gap with radical honesty and practical tools for closing it. Coaching holds the mirror and helps you build accountability as a core part of your identity — not something you summon through discipline alone.",
    coachNote:
      "The question I ask every client in session 1: 'Are you who you say you are?' This challenge builds the answer into your daily life.",
    whatYouGet: [
      "Integrity audit: promises made vs. kept (to yourself and others)",
      "Self-trust rebuilding protocol",
      "7 daily coaching sessions on identity-based accountability",
      "Your personal integrity code",
      "Day 7 recommitment ceremony",
    ],
    transformation:
      "You become someone who does what they say — and your self-trust, confidence, and results transform as a result.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["integrity", "accountability", "identity", "self-trust", "character"],
    audience: ["general", "reentry", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 40,
  },

  {
    id: "accountability-as-skill",
    title: "Unlocking Accountability as a Skill",
    slug: "unlocking-accountability-skill",
    pillar: "C",
    pillarFull: "Create",
    type: "course",
    category: "Transformation & Identity",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Accountability isn't a punishment — it's a practice.",
    description:
      "Most people learned accountability through shame and consequences. No wonder they avoid it. This 5-day program reframes and rebuilds accountability as a learnable, shame-free skill using Coach Kay's coaching methodology. Coaching guides you through daily accountability practices that feel empowering, not punishing — and stick long after the 5 days end.",
    coachNote:
      "I've never met a client who didn't want to be accountable. They just needed to be taught how without the shame that usually comes with it.",
    whatYouGet: [
      "Accountability origin story: where your patterns came from",
      "Shame-free accountability framework",
      "5 daily accountability practice sessions with guided coaching",
      "Personal accountability structure design",
      "Accountability partner protocol (optional digital partner included)",
    ],
    transformation:
      "You transform from someone who avoids accountability to someone who uses it as a daily superpower.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["accountability", "skill-building", "shame-free", "practice", "identity"],
    audience: ["general", "reentry", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 41,
  },

  {
    id: "personal-growth-leadership",
    title: "The Personal Growth & Leadership Challenge",
    slug: "personal-growth-leadership",
    pillar: "C",
    pillarFull: "Create",
    type: "challenge",
    category: "Transformation & Identity",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "You can't lead others until you've led yourself.",
    description:
      "Leadership starts before the title. This 7-day challenge runs you through a personal growth arc that builds the internal foundation all great leaders operate from — self-awareness, clear values, intentional communication, and emotional resilience. Coaching makes it personal to your actual situation, not generic leadership theory.",
    coachNote:
      "Every leader I've worked with had to do this internal work first. The external results followed automatically.",
    whatYouGet: [
      "Leadership readiness self-assessment",
      "7 daily guided leadership development sessions",
      "Personal leadership manifesto",
      "Communication and influence audit",
      "30-day leadership growth plan",
    ],
    transformation:
      "You become the kind of leader who inspires through who you are — not just what you do.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["leadership", "growth", "identity", "influence", "self-awareness"],
    audience: ["general", "corporate", "nonprofit"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 42,
  },

  {
    id: "transform-skilled-leader",
    title: "Transform Yourself into a Skilled Leader",
    slug: "transform-skilled-leader",
    pillar: "C",
    pillarFull: "Create",
    type: "course",
    category: "Transformation & Identity",
    duration: "8day",
    durationLabel: "8 days",
    tagline: "Leadership is learned. Here's where you learn it.",
    description:
      "This 8-day intensive is for the person who needs to step into leadership in their own life before they can do it anywhere else. It's structured around Coach Kay's leadership transformation model: clarity of self → clarity of vision → clarity of action → clarity of communication. Every session is personalized to your current leadership gaps.",
    coachNote:
      "Most leadership programs teach you how to manage people. This one teaches you how to lead yourself — which is actually the harder and more important skill.",
    whatYouGet: [
      "Leadership transformation model walkthrough",
      "8-day guided leadership skill-building program",
      "Personal leadership gap analysis",
      "Communication style assessment and upgrade",
      "Leadership declaration and 90-day action plan",
    ],
    transformation:
      "You move from uncertain and reactive to confident and intentional — a leader in your own story before anywhere else.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["leadership", "transformation", "skills", "confidence", "identity"],
    audience: ["general", "corporate", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 43,
  },

  {
    id: "confidence-wealth-building",
    title: "The Self-Confidence & Wealth-Building Challenge",
    slug: "self-confidence-wealth-building",
    pillar: "C",
    pillarFull: "Create",
    type: "challenge",
    category: "Transformation & Identity",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Inner work that pays — literally.",
    description:
      "Confidence and money are more connected than most people realize. Your relationship with your own worth directly shapes what you charge, what you accept, and what you build. This 7-day challenge bridges the internal work of self-confidence with the practical work of wealth-building — designed specifically for Coach Kay's audience of underrepresented builders and earners.",
    coachNote:
      "I've worked with people who were brilliant and broke because they didn't believe they deserved more. This challenge addresses the root, not the symptom.",
    whatYouGet: [
      "Confidence + money belief audit",
      "Worth excavation: what you actually deserve",
      "7-day guided confidence + wealth building plan",
      "Income expansion mindset shifts",
      "First wealth action step with built-in accountability",
    ],
    transformation:
      "You stop leaving money — and opportunity — on the table because you finally believe you belong at the table.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["confidence", "wealth", "money-mindset", "worth", "abundance"],
    audience: ["general", "reentry", "youth"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 44,
  },

  {
    id: "say-do-identity-sprint",
    title: "2-Day SAY–DO Identity Sprint",
    slug: "say-do-identity-sprint",
    pillar: "C",
    pillarFull: "Create",
    type: "sprint",
    category: "Transformation & Identity",
    duration: "2day",
    durationLabel: "2 days",
    tagline: "Close the gap between what you say and what you actually do.",
    description:
      "The SAY–DO gap is the space between the person you claim to be and the person your actions reveal. In 2 days, you'll close it. Day 1 is radical honesty — mapping every gap. Day 2 is identity recalibration — installing the beliefs, decisions, and daily actions that make your SAY and your DO the same thing. Guided coaching runs both days.",
    coachNote:
      "This is one of the most powerful 2-day experiences in the entire platform. The SAY–DO gap is costing people their credibility — with themselves first, everyone else second.",
    whatYouGet: [
      "Day 1: SAY-DO gap audit with guided coaching",
      "Day 2: Identity recalibration session",
      "Commitment vs. preference distinction tool",
      "New identity declaration",
      "3 immediate integration actions",
    ],
    transformation:
      "You become someone who follows through — and the self-trust that builds from that changes everything downstream.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["identity", "follow-through", "accountability", "say-do", "integrity"],
    audience: ["general", "corporate", "reentry"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 45,
  },

  // ─────────────────────────────────────────────
  // U — UPLIFT (Habits, Routines & Lifestyle)
  // ─────────────────────────────────────────────

  {
    id: "productive-habits-5-days",
    title: "Build Productive Habits in 5 Days",
    slug: "build-productive-habits-5-days",
    pillar: "U",
    pillarFull: "Uplift",
    type: "challenge",
    category: "Habits & Lifestyle",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Stop relying on motivation. Build systems that run without it.",
    description:
      "Motivation is unreliable. Habits are not. This 5-day challenge is the fastest on-ramp to sustainable productivity in the platform — designed for people who want quick wins that actually compound. Each day introduces one high-leverage habit with an guided installation protocol that makes it stick.",
    coachNote:
      "This is my favorite entry point for new clients. Five days. Five habits. Each one small enough to actually do, powerful enough to actually matter.",
    whatYouGet: [
      "5 high-leverage habit installations with guided coaching",
      "Habit stacking framework for your specific life",
      "Friction audit: what's making your habits hard",
      "Environment design guide",
      "30-day habit momentum plan",
    ],
    transformation:
      "You install 5 habits that work with your life — and prove to yourself that sustainable change is actually possible.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["habits", "productivity", "quick-win", "systems", "daily-practice"],
    audience: ["general", "youth", "corporate"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 50,
  },

  {
    id: "radiant-morning-rituals",
    title: "Radiant Morning Rituals",
    slug: "radiant-morning-rituals",
    pillar: "U",
    pillarFull: "Uplift",
    type: "challenge",
    category: "Habits & Lifestyle",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Design the morning that sets the tone for everything else.",
    description:
      "How you start your morning is how you start your day — and how you start your day is how you start your life. This 7-day program helps you design a personalized morning ritual that energizes, grounds, and activates you — without requiring an alarm at 4am or a 90-minute protocol. Coaching customizes every element to your actual life.",
    coachNote:
      "The best morning routine is the one you'll actually do. This helps you find yours — not copy someone else's.",
    whatYouGet: [
      "Morning ritual design session with personalized coaching",
      "7-day morning ritual test and refine protocol",
      "Energy, mindset, and focus activation sequence",
      "Your personalized 20-minute morning blueprint",
      "Morning ritual anchor card (printable + digital)",
    ],
    transformation:
      "You own your mornings — and the confidence, clarity, and energy that follow you through the rest of your day.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["morning-ritual", "routine", "energy", "lifestyle-design", "daily-practice"],
    audience: ["general", "reentry", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 51,
  },

  {
    id: "mindful-mornings",
    title: "Mindful Mornings",
    slug: "mindful-mornings",
    pillar: "U",
    pillarFull: "Uplift",
    type: "challenge",
    category: "Habits & Lifestyle",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Start with presence. End the day with purpose.",
    description:
      "Presence is a skill — and mornings are where you practice it. This 7-day mindfulness-forward morning program teaches you to begin each day intentionally rather than reactively. Coaching pairs with guided presence practices to create a morning container that protects your mental state before the world gets to it.",
    coachNote:
      "Mindfulness doesn't have to mean meditation for an hour. It means choosing how you meet your day. This program teaches you exactly how.",
    whatYouGet: [
      "7 guided mindful morning practices (10–20 min each)",
      "guided intention-setting each morning",
      "Presence check-in framework for throughout the day",
      "Mindful morning ritual blueprint",
      "Evening reflection close to complete the loop",
    ],
    transformation:
      "You stop starting your day in reaction mode and start meeting it with intention — and the quality of your entire day shifts.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["mindfulness", "morning", "presence", "intention", "peace"],
    audience: ["general", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 52,
  },

  {
    id: "mindful-tech-detox",
    title: "Mindful Tech Detox",
    slug: "mindful-tech-detox",
    pillar: "U",
    pillarFull: "Uplift",
    type: "challenge",
    category: "Habits & Lifestyle",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Disconnect to reconnect — with yourself.",
    description:
      "You're spending an average of 7 hours a day on screens — and most of it isn't serving you. This 7-day challenge is a structured, intentional reduction of tech consumption with coaching guiding you through each stage of the detox. You'll design a technology relationship that works for your life instead of consuming it.",
    coachNote:
      "I built this specifically because the people using FocusFlow most need to also know when to put the tech down. This challenge models that.",
    whatYouGet: [
      "Tech consumption audit: where your screen time actually goes",
      "7-day mindful tech reduction protocol",
      "guided relationship redesign with your devices",
      "Analog replacement activities for each detox stage",
      "Sustainable tech boundaries blueprint",
    ],
    transformation:
      "You take back your attention — and discover what you actually think, feel, and want when the noise stops.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["tech-detox", "digital-wellness", "attention", "boundaries", "presence"],
    audience: ["general", "youth", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 53,
  },

  {
    id: "habit-mastery-challenge",
    title: "Habit Mastery Challenge",
    slug: "habit-mastery-challenge",
    pillar: "U",
    pillarFull: "Uplift",
    type: "challenge",
    category: "Habits & Lifestyle",
    duration: "30day",
    durationLabel: "30 days",
    tagline: "The 30-day system for habits that outlast motivation.",
    description:
      "This is your complete habit mastery curriculum — everything Coach Kay knows about building lasting change compressed into 30 days of guided practice. Weeks 1–2 identify and install, Weeks 3–4 stress-test and compound. You'll walk out with a personalized habit architecture that works with your brain, your schedule, and your life.",
    coachNote:
      "I've watched people build incredible habits in this program that they're still running years later. It works because it's built for you, not for some idealized version of you.",
    whatYouGet: [
      "Full 30-day habit installation curriculum",
      "Weekly coaching sessions + daily check-ins",
      "Habit science applied to your specific patterns",
      "Habit stack design for your routine",
      "30-day tracker and accountability dashboard",
    ],
    transformation:
      "You become someone who builds and keeps habits — permanently — because you finally understand how your own brain works.",
    accessTier: "premium",
    price: 297,
    priceDisplay: "$297",
    paymentPlan: { installments: 2, amountPerInstallment: 167, label: "2 payments of $167" },
    cohortCode: false,
    tags: ["habits", "30-day", "systems", "consistency", "lifestyle"],
    audience: ["general", "corporate"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 54,
  },

  {
    id: "mastering-consistency",
    title: "Mastering the Art of Being Consistent",
    slug: "mastering-consistency",
    pillar: "U",
    pillarFull: "Uplift",
    type: "course",
    category: "Habits & Lifestyle",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Consistency is not a personality trait — it's a design problem.",
    description:
      "The #1 thing clients struggle with is consistency — and it's almost never a willpower problem. It's an environment, identity, and system problem. This 7-day program diagnoses exactly why you've been inconsistent and redesigns the conditions so consistency becomes your default. Coaching personalizes every intervention to your specific blocks.",
    coachNote:
      "When a client tells me they're not consistent, I always ask: consistent with what, under what conditions? That question changes everything. So does this course.",
    whatYouGet: [
      "Inconsistency root cause diagnosis",
      "Identity-based consistency protocol",
      "Environment and trigger redesign",
      "7 daily guided consistency practices",
      "The 1% improvement daily habit blueprint",
    ],
    transformation:
      "You stop starting over and start compounding — because consistency becomes who you are, not something you try to be.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["consistency", "habits", "identity", "systems", "daily-practice"],
    audience: ["general", "reentry", "corporate"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: true,
    order: 55,
  },

  {
    id: "body-mind-rejuvenation",
    title: "Body and Mind Rejuvenation",
    slug: "body-mind-rejuvenation",
    pillar: "U",
    pillarFull: "Uplift",
    type: "reset",
    category: "Habits & Lifestyle",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "You can't think your way out of a body that's depleted.",
    description:
      "Whole-person wellness is the foundation of sustainable performance. This 7-day rejuvenation program addresses sleep, movement, nutrition, rest, and mental recovery — not as separate topics but as one integrated system. Coaching personalizes every recommendation and holds you accountable to restoring yourself, not just pushing through.",
    coachNote:
      "I watch people try to grow while running on empty. This week is about refusing to do that anymore.",
    whatYouGet: [
      "Whole-person wellness audit",
      "7-day rejuvenation protocol (sleep + movement + nutrition + rest)",
      "Daily coaching on energy restoration",
      "Recovery ritual design",
      "Sustainable wellness maintenance plan",
    ],
    transformation:
      "You restore your body and mind to a baseline that makes everything else — the work, the growth, the transformation — actually possible.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["wellness", "body", "recovery", "sleep", "holistic"],
    audience: ["general", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 56,
  },

  {
    id: "30-day-hydration-reset",
    title: "30-Day Hydration & Health Reset",
    slug: "30-day-hydration-health-reset",
    pillar: "U",
    pillarFull: "Uplift",
    type: "reset",
    category: "Habits & Lifestyle",
    duration: "30day",
    durationLabel: "30 days",
    tagline: "The simplest physical upgrade with the biggest mental payoff.",
    description:
      "Dehydration affects focus, mood, energy, and decision-making — most people are chronically dehydrated and don't know it. This 30-day guided reset pairs hydration as the anchor habit with a broader health foundation reset. Simple, science-backed, and guided weekly to keep you on track and expanding the practice.",
    coachNote:
      "I always start here with clients who feel foggy or exhausted. It sounds too simple to matter. And then it massively matters.",
    whatYouGet: [
      "30-day hydration protocol with daily tracking",
      "Weekly coaching sessions + adjustments",
      "Health foundation expansion (sleep, movement, stress)",
      "Habit anchor design around hydration",
      "Day 30 health audit and next steps",
    ],
    transformation:
      "You build a physical foundation that supports the mental and emotional work — because your body and brain are the same system.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["hydration", "health", "30-day", "wellness", "foundation"],
    audience: ["general", "reentry", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 57,
  },

  {
    id: "mac-fitness-foundation",
    title: "The 7-Day MAC Fitness Foundation",
    slug: "7-day-mac-fitness-foundation",
    pillar: "U",
    pillarFull: "Uplift",
    type: "challenge",
    category: "Habits & Lifestyle",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "Use your MAC type to design movement that actually fits you.",
    description:
      "Your MAC type isn't just for mindset — it determines how you best approach physical movement too. This 7-day challenge uses your MAC type profile to design a personalized fitness foundation that works with how you're wired, not against it. Coaching adapts each day's protocol to your energy level, schedule, and progress.",
    coachNote:
      "Mind and body are not separate. When your movement practice aligns with your type, it stops feeling like punishment and starts feeling like power.",
    whatYouGet: [
      "MAC type fitness profile",
      "Personalized 7-day movement protocol",
      "Daily coaching and energy check-ins",
      "Mind-body connection practices",
      "Ongoing movement maintenance plan",
    ],
    transformation:
      "You build a relationship with movement that energizes instead of drains — and it becomes a cornerstone of your transformation.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["fitness", "movement", "mac-type", "body", "energy"],
    audience: ["general", "youth", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 58,
  },

  // ─────────────────────────────────────────────
  // S — SUPPORT (AI & Tech-Adjacent + Community)
  // ─────────────────────────────────────────────

  {
    id: "lead-the-room-ai",
    title: "Lead the Room: AI Technology to Build Community & Get Paid",
    slug: "lead-the-room-ai",
    pillar: "S",
    pillarFull: "Support",
    type: "course",
    category: "AI & Technology",
    duration: "8day",
    durationLabel: "8 days",
    tagline: "Use AI to build a community around your expertise — and monetize it.",
    description:
      "This is the flagship coaching program on the platform — Coach Kay's direct methodology for using AI tools to build, grow, and monetize a community around your knowledge. Over 8 days, you'll learn how to prompt AI for content, design community experiences, create income streams from your expertise, and position yourself as the go-to voice in your space.",
    coachNote:
      "This is literally what I do. I'm not teaching theory — I'm teaching you the exact system I used to build Coach K Elevates. Powered by AI. Delivered with heart.",
    whatYouGet: [
      "AI content creation system for your niche",
      "Community architecture design (structure, offers, culture)",
      "8-day guided implementation plan",
      "Monetization model selection and build-out",
      "Your first 90-day community growth roadmap",
    ],
    transformation:
      "You go from 'I have knowledge to share' to 'I have a community paying me for it' — with AI doing half the work.",
    accessTier: "premium",
    price: 497,
    priceDisplay: "$497",
    paymentPlan: { installments: 3, amountPerInstallment: 197, label: "3 payments of $197" },
    cohortCode: false,
    tags: ["ai", "community", "monetization", "content", "business-building"],
    audience: ["general", "corporate", "nonprofit"],
    isFeatured: true,
    isGated: true,
    isNew: true,
    wrdLink: false,
    order: 60,
  },

  {
    id: "think-smarter-challenge",
    title: "How to Think Smarter Challenge",
    slug: "think-smarter-challenge",
    pillar: "S",
    pillarFull: "Support",
    type: "challenge",
    category: "AI & Technology",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Upgrade your cognitive game — with and without AI.",
    description:
      "AI is only as smart as the person prompting it. This 5-day challenge builds the cognitive frameworks — systems thinking, first-principles reasoning, mental model expansion — that make you a more powerful thinker and a more effective AI collaborator. Daily challenges are delivered with coaching that models the thinking it's teaching.",
    coachNote:
      "The people winning with AI are the ones who think well. This challenge builds that foundation.",
    whatYouGet: [
      "Cognitive style assessment",
      "5 mental model installations with guided practice",
      "Systems thinking primer",
      "First-principles reasoning exercises",
      "AI collaboration protocol using your upgraded thinking",
    ],
    transformation:
      "You become a sharper thinker who uses AI as a force multiplier — not a crutch.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["thinking", "cognitive", "ai", "mental-models", "strategy"],
    audience: ["general", "corporate", "youth"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 61,
  },

  {
    id: "deep-work-mastery",
    title: "The Deep Work Mastery Challenge",
    slug: "deep-work-mastery",
    pillar: "S",
    pillarFull: "Support",
    type: "challenge",
    category: "AI & Technology",
    duration: "7day",
    durationLabel: "7 days",
    tagline: "The ability to focus deeply is the most valuable skill in an AI world.",
    description:
      "As AI handles shallow work, the humans who win will be the ones who can think deeply. This 7-day challenge — built on Cal Newport's research and layered with Coach Kay's coaching methodology — trains your deep work capacity through daily focused sessions, distraction elimination, and guided reflection on your practice.",
    coachNote:
      "Deep work is rare. That's why it's valuable. This challenge makes you someone who can do it — consistently.",
    whatYouGet: [
      "Deep work capacity assessment",
      "Distraction audit and elimination protocol",
      "7 progressive deep work sessions (30–90 min)",
      "Coaching debrief after each session",
      "Personal deep work schedule and environment design",
    ],
    transformation:
      "You develop the rare ability to focus without distraction — and the output quality that comes with it.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["deep-work", "focus", "productivity", "ai", "skill-building"],
    audience: ["general", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 62,
  },

  {
    id: "system-success-sprint",
    title: "System Success Sprint",
    slug: "system-success-sprint",
    pillar: "S",
    pillarFull: "Support",
    type: "sprint",
    category: "AI & Technology",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Build the personal operating system that runs your life — with AI doing the heavy lifting.",
    description:
      "High performers don't rely on willpower — they rely on systems. This 5-day sprint builds your personal operating system: task management, time structure, decision frameworks, and communication systems — all optimized with AI tools. You'll leave with systems that are running before the sprint ends.",
    coachNote:
      "A system that works while you sleep is better than hustle that burns you out. This builds the former.",
    whatYouGet: [
      "Personal operating system audit",
      "5-day system build sprint with daily coaching",
      "Task management and prioritization system",
      "Decision framework installation",
      "AI tool stack for your specific workflow",
    ],
    transformation:
      "You run your life from a system instead of scramble — and the mental bandwidth that frees up is extraordinary.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["systems", "productivity", "ai-tools", "operating-system", "efficiency"],
    audience: ["general", "corporate", "nonprofit"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 63,
  },

  {
    id: "faster-learning-skills",
    title: "Faster Learning Skills",
    slug: "faster-learning-skills",
    pillar: "S",
    pillarFull: "Support",
    type: "course",
    category: "AI & Technology",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "Learn how to learn — and let AI accelerate the whole thing.",
    description:
      "The biggest competitive advantage in an AI world is the ability to learn fast. This 5-day program teaches the science of accelerated learning — spaced repetition, active recall, interleaving, chunking — and then shows you exactly how to use AI as your personal learning accelerator. You'll apply it immediately to something you're trying to learn right now.",
    coachNote:
      "AI doesn't replace learning — it supercharges it. But only if you know how to learn in the first place. That's what this builds.",
    whatYouGet: [
      "Learning style and pattern assessment",
      "5 accelerated learning techniques with AI practice",
      "Personalized learning system design for your current goals",
      "Spaced repetition protocol setup",
      "30-day learning acceleration plan",
    ],
    transformation:
      "You compress years of learning into months — and the AI tools you're already using become 10x more powerful.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["learning", "ai", "skills", "accelerated", "education"],
    audience: ["general", "youth", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 64,
  },

  {
    id: "faster-execution-challenge",
    title: "Faster Execution Challenge",
    slug: "faster-execution-challenge",
    pillar: "S",
    pillarFull: "Support",
    type: "challenge",
    category: "AI & Technology",
    duration: "5day",
    durationLabel: "5 days",
    tagline: "From idea to action — in half the time, with AI on your team.",
    description:
      "The gap between idea and execution is where most potential dies. This 5-day challenge closes it systematically — using AI tools to eliminate decision friction, build action momentum, and move from concept to completion faster than you thought possible. Every day you'll execute something real, with coaching to keep you moving.",
    coachNote:
      "Speed of execution is a competitive advantage. This challenge builds it — with AI as your co-pilot.",
    whatYouGet: [
      "Execution block diagnosis: what's slowing you down",
      "Guided project launch protocol",
      "5-day execution sprint with daily coaching",
      "Decision speed framework",
      "Momentum maintenance system for after Day 5",
    ],
    transformation:
      "You become a fast executor — someone who ships, launches, and moves while others are still planning.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["execution", "action", "ai", "momentum", "speed"],
    audience: ["general", "corporate"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 65,
  },

  {
    id: "kpi-roi-tracker",
    title: "KPI Dashboard & ROI Tracker",
    slug: "kpi-roi-tracker",
    pillar: "S",
    pillarFull: "Support",
    type: "workshop",
    category: "AI & Technology",
    duration: "2day",
    durationLabel: "2-day workshop",
    tagline: "Track your transformation like a CEO tracks their business.",
    description:
      "What gets measured gets managed. This 2-day workshop builds your personal transformation KPI dashboard — tracking the metrics that actually matter for your growth: consistency score, energy levels, goal completion rate, income trajectory, habit streaks, and more. Smart analysis powers the data and coaching sessions deliver the interpretation.",
    coachNote:
      "I built this for the analytical thinkers who need to see the data to trust the process. It's also the most fundable asset in the platform — perfect for impact reporting with grants.",
    whatYouGet: [
      "Personal KPI identification workshop",
      "Personalized transformation dashboard setup",
      "ROI calculation for your coaching investment",
      "Weekly review protocol",
      "Grant-ready impact reporting template",
    ],
    transformation:
      "You lead your transformation with data — and you can prove the ROI of your growth to yourself, your funders, and your community.",
    accessTier: "premium",
    price: 197,
    priceDisplay: "$197",
    paymentPlan: null,
    cohortCode: false,
    tags: ["data", "kpi", "roi", "tracking", "ai", "impact"],
    audience: ["general", "corporate", "nonprofit"],
    isFeatured: false,
    isGated: true,
    isNew: true,
    wrdLink: false,
    order: 66,
  },

  // ─────────────────────────────────────────────
  // SIGNATURE PROGRAMS — Multi-week Flagship Offers
  // ─────────────────────────────────────────────

  {
    id: "8-week-ai-transformation",
    title: "8-Week Life Transformation Intensive",
    slug: "8-week-ai-life-transformation",
    pillar: "C",
    pillarFull: "Create",
    type: "course",
    category: "Signature Program",
    duration: "8week",
    durationLabel: "8 weeks",
    tagline: "The complete F.O.C.U.S. transformation — guided by Coach Kay.",
    description:
      "This is the flagship. Eight weeks. The full F.O.C.U.S. framework. Coaching every single day. Live group sessions weekly. This program takes you from wherever you are right now to a completely rebuilt foundation, a clear sense of opportunity, aligned action, elevated habits, and a support system that keeps you growing long after the 8 weeks end. This is the program that cohort participants access with their code — and what the general public pays full price for.",
    coachNote:
      "I designed this to be the most comprehensive life coaching experience available anywhere. Every module, every session, every prompt is built from 20 years of coaching experience and the best of what technology can do. This is what I wish existed when I started my journey.",
    whatYouGet: [
      "Full 8-week F.O.C.U.S. curriculum (40+ modules, challenges, sprints)",
      "Daily coaching sessions with Coach Kay's voice and framework",
      "Weekly live group coaching sessions (recorded)",
      "MAC Type Assessment + personalized path",
      "F.O.C.U.S. progress tracker and KPI dashboard",
      "Private community access (8 weeks)",
      "Cohort code for group participants",
      "Certificate of completion",
    ],
    transformation:
      "You walk out of 8 weeks as a completely different operator — with a rebuilt foundation, a clear path, and the habits and support system to sustain everything you've built.",
    accessTier: "cohort",
    price: 997,
    priceDisplay: "$997",
    paymentPlan: { installments: 3, amountPerInstallment: 367, label: "3 payments of $367" },
    cohortCode: true,
    tags: ["flagship", "8-week", "transformation", "ai", "coaching", "focus-framework"],
    audience: ["general", "corporate", "nonprofit", "reentry"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 100,
  },

  {
    id: "30-day-focus-intensive",
    title: "30-Day F.O.C.U.S. Intensive",
    slug: "30-day-focus-intensive",
    pillar: "C",
    pillarFull: "Create",
    type: "course",
    category: "Signature Program",
    duration: "30day",
    durationLabel: "30 days",
    tagline: "One month. One framework. One version of you that doesn't quit.",
    description:
      "The 30-Day F.O.C.U.S. Intensive is the higher-touch version of the self-paced 30-day reset. It includes weekly group coaching calls, daily coaching sessions, and the full F.O.C.U.S. curriculum compressed into one powerful month. Application required — not because it's exclusive, but because Coach Kay is invested in your results and needs to know you're ready.",
    coachNote:
      "30 days is enough time to completely shift a pattern if you show up fully. This is built for the person who's ready to show up fully.",
    whatYouGet: [
      "30-day F.O.C.U.S. curriculum (curated module sequence)",
      "Daily coaching sessions",
      "4 weekly live group coaching calls with Coach Kay",
      "MAC Type intake and personalized path",
      "Private community for 30-day cohort",
      "30-day transformation tracker",
      "Application required for enrollment",
    ],
    transformation:
      "In 30 days you build more momentum than most people build in a year — because you're doing the right work, in the right order, with the right support.",
    accessTier: "premium",
    price: 497,
    priceDisplay: "$497",
    paymentPlan: { installments: 3, amountPerInstallment: 197, label: "3 payments of $197" },
    cohortCode: false,
    tags: ["30-day", "intensive", "transformation", "coaching", "flagship"],
    audience: ["general", "reentry", "nonprofit"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 101,
  },

  {
    id: "12-week-mastery",
    title: "12-Week F.O.C.U.S. Mastery Program",
    slug: "12-week-mastery-program",
    pillar: "C",
    pillarFull: "Create",
    type: "course",
    category: "Signature Program",
    duration: "12week",
    durationLabel: "12 weeks",
    tagline: "The deepest transformation available in the FocusFlow ecosystem.",
    description:
      "Twelve weeks is where real transformation lives — not just the beginning of it. This is Coach Kay's premium program: the full F.O.C.U.S. framework at depth, with group coaching every week, two private 1:1 sessions with Coach Kay, the complete module library, and a transformation so thorough you won't recognize who you were when you started. Application required. Not everyone is accepted. That's intentional.",
    coachNote:
      "I only accept people I genuinely believe are ready for this level of work. If you're reading this, take the clarity check first. If you're ready — apply. I want to see what you build.",
    whatYouGet: [
      "12-week full F.O.C.U.S. mastery curriculum",
      "Daily coaching sessions",
      "12 weekly live group coaching sessions",
      "2 private 1:1 sessions with Coach Kay",
      "Full module library access (all 40+ programs)",
      "MAC Type deep-dive and custom path",
      "KPI dashboard + transformation ROI report",
      "Certificate of completion",
      "Ongoing community access (post-program)",
      "Application required — limited cohort size",
    ],
    transformation:
      "You don't just transform — you master your own transformation process so you can keep growing without needing a program to push you.",
    accessTier: "premium",
    price: 1997,
    priceDisplay: "$1,997",
    paymentPlan: { installments: 3, amountPerInstallment: 697, label: "3 payments of $697" },
    cohortCode: false,
    tags: ["12-week", "premium", "mastery", "1-on-1", "flagship", "transformation"],
    audience: ["general", "corporate"],
    isFeatured: true,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 102,
  },

  {
    id: "master-lead-achieve",
    title: "Master the Skill to Lead and Achieve",
    slug: "master-lead-achieve",
    pillar: "C",
    pillarFull: "Create",
    type: "course",
    category: "Signature Program",
    duration: "8day",
    durationLabel: "8 days",
    tagline: "Leadership and achievement aren't destinations — they're daily practices.",
    description:
      "This outcomes-oriented 8-day program is built for the person who is done with potential and ready for results. It combines the best of Coach Kay's leadership coaching with the F.O.C.U.S. Create pillar — taking you through a structured arc from intention to execution to evidence of achievement. Coaching drives every session.",
    coachNote:
      "This one is for the person who has tried everything else. They have the intelligence, the desire, and the work ethic. They just need the framework. This is it.",
    whatYouGet: [
      "Leadership + achievement readiness assessment",
      "8-day guided leadership and results program",
      "Goal architecture: from vision to daily action",
      "Evidence collection: tracking your wins in real time",
      "Personal achievement system that scales beyond Day 8",
    ],
    transformation:
      "You stop waiting to feel like a leader and start operating like one — with results that prove you've arrived.",
    accessTier: "subscriber",
    price: 47,
    priceDisplay: "$47/mo (included in subscription)",
    paymentPlan: null,
    cohortCode: true,
    tags: ["leadership", "achievement", "results", "outcomes", "performance"],
    audience: ["general", "corporate", "reentry"],
    isFeatured: false,
    isGated: true,
    isNew: false,
    wrdLink: false,
    order: 70,
  },
];

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

export function getProgramsByPillar(pillar: FocusPillar): Program[] {
  return programs.filter((p) => p.pillar === pillar).sort((a, b) => a.order - b.order);
}

export function getProgramsByTier(tier: AccessTier): Program[] {
  return programs.filter((p) => p.accessTier === tier).sort((a, b) => a.order - b.order);
}

export function getProgramsByAudience(audience: Audience): Program[] {
  return programs.filter((p) => p.audience.includes(audience)).sort((a, b) => a.order - b.order);
}

export function getFeaturedPrograms(): Program[] {
  return programs.filter((p) => p.isFeatured).sort((a, b) => a.order - b.order);
}

export function getWRDPrograms(): Program[] {
  return programs.filter((p) => p.wrdLink).sort((a, b) => a.order - b.order);
}

export function getFreePrograms(): Program[] {
  return programs.filter((p) => p.accessTier === "free").sort((a, b) => a.order - b.order);
}

export function getSignaturePrograms(): Program[] {
  return programs.filter((p) => p.category === "Signature Program").sort((a, b) => a.order - b.order);
}

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getRecommendedPrograms(currentId: string, limit = 3): Program[] {
  const current = getProgramById(currentId);
  if (!current) return [];
  return programs
    .filter((p) => p.id !== currentId && p.pillar === current.pillar)
    .slice(0, limit);
}

// Cohort code validation (wire to Supabase in production)
export function validateCohortCode(code: string): AccessTier | null {
  // Replace with Supabase lookup in production
  const validCodes: Record<string, AccessTier> = {
    COHORT2025: "cohort",
    COED2025: "cohort",
    ACCELERATE: "cohort",
    REENTRY: "cohort",
  };
  return validCodes[code.toUpperCase()] ?? null;
}

export default programs;
