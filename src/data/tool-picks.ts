export type ToolCategory = "AI" | "Build" | "Productivity" | "Coaching" | "Payments" | "Community";

export interface ToolPick {
  name: string;
  why: string;
  category: ToolCategory;
  url: string;
  affiliate: boolean;
}

/**
 * Coach Kay's actual stack. Affiliate flags are honest — flip per tool.
 * Edit this file to add/remove tools; the Truth page renders them automatically.
 */
export const TOOL_PICKS: ToolPick[] = [
  {
    name: "Lovable",
    why: "The AI build studio I use to ship every product, page, and prototype in this room.",
    category: "Build",
    url: "https://lovable.dev",
    affiliate: true,
  },
  {
    name: "Claude",
    why: "My long-form writing and reasoning partner when nuance and tone matter more than speed.",
    category: "AI",
    url: "https://claude.ai",
    affiliate: false,
  },
  {
    name: "Manus",
    why: "General-purpose AI agent for deep research and multi-step browser work. When I need a task done, not just an answer, Manus is the one I trust.",
    category: "AI",
    url: "https://manus.im",
    affiliate: false,
  },
  {
    name: "Genspark",
    why: "Multi-agent search plus AI sheets and slides. Where I go when the question needs ten sources cross-checked before I answer a client.",
    category: "AI",
    url: "https://www.genspark.ai",
    affiliate: false,
  },
  {
    name: "Notion",
    why: "Where every client roadmap, F.O.C.U.S. audit, and program outline actually lives.",
    category: "Productivity",
    url: "https://notion.so",
    affiliate: true,
  },
  {
    name: "ChatGPT",
    why: "Daily thinking partner for drafts, structure, and pressure-testing ideas before they ship.",
    category: "AI",
    url: "https://chat.openai.com",
    affiliate: false,
  },
  {
    name: "Gemini",
    why: "Google's long-context model. Best when I'm feeding it an entire document, transcript, or codebase and asking it to reason across the whole thing.",
    category: "AI",
    url: "https://gemini.google.com",
    affiliate: false,
  },
  {
    name: "ElevenLabs",
    why: "Voice work for guided rituals and audio coaching: the only AI voice I trust on tone.",
    category: "AI",
    url: "https://elevenlabs.io",
    affiliate: true,
  },
  {
    name: "Skool",
    why: "Home of the FocusFlow Elevation Hub: where Support actually happens between sessions.",
    category: "Community",
    url: "https://www.skool.com",
    affiliate: true,
  },
];