export type DirCategory =
  | "AI Chat & Reasoning"
  | "AI Build & No-Code"
  | "AI Voice & Audio"
  | "AI Video & Image"
  | "Productivity & Notes"
  | "Automation & Agents"
  | "Payments & Ops"
  | "Community & Delivery";

export interface DirectoryTool {
  name: string;
  blurb: string;
  category: DirCategory;
  url: string;
  affiliate?: boolean;
  pricing: "Free" | "Freemium" | "Paid";
}

/**
 * Coach Kay's working AI toolkit. Curated, used in real client work.
 * Edit freely — the directory page renders categories and filters automatically.
 */
export const DIRECTORY_TOOLS: DirectoryTool[] = [
  // Chat & Reasoning
  { name: "ChatGPT", blurb: "Daily thinking partner. First drafts, structure, and pressure-testing ideas.", category: "AI Chat & Reasoning", url: "https://chat.openai.com", pricing: "Freemium" },
  { name: "Claude", blurb: "Long-form writing and nuanced reasoning. The one I trust for tone.", category: "AI Chat & Reasoning", url: "https://claude.ai", pricing: "Freemium" },
  { name: "Gemini", blurb: "Strong at research with live search. Useful as a third opinion.", category: "AI Chat & Reasoning", url: "https://gemini.google.com", pricing: "Freemium" },
  { name: "Perplexity", blurb: "Search engine answers with sources. My go-to for fact-checking.", category: "AI Chat & Reasoning", url: "https://perplexity.ai", pricing: "Freemium" },

  // Build & No-Code
  { name: "Lovable", blurb: "The AI build studio behind every page in this room. Ship full apps in plain English.", category: "AI Build & No-Code", url: "https://lovable.dev", affiliate: true, pricing: "Freemium" },
  { name: "Cursor", blurb: "AI-native code editor. For when I'm hands-on in a codebase.", category: "AI Build & No-Code", url: "https://cursor.sh", pricing: "Freemium" },
  { name: "v0", blurb: "Generate React components from a prompt. Great for quick UI exploration.", category: "AI Build & No-Code", url: "https://v0.dev", pricing: "Freemium" },
  { name: "Supabase", blurb: "Open-source backend — auth, database, edge functions. Powers the whole platform.", category: "AI Build & No-Code", url: "https://supabase.com", pricing: "Freemium" },

  // Voice & Audio
  { name: "ElevenLabs", blurb: "Voice work for guided rituals and audio coaching. The only AI voice I trust on tone.", category: "AI Voice & Audio", url: "https://elevenlabs.io", affiliate: true, pricing: "Freemium" },
  { name: "Descript", blurb: "Edit video and audio like a doc. How I batch coaching content without burning a week.", category: "AI Voice & Audio", url: "https://descript.com", affiliate: true, pricing: "Freemium" },

  // Video & Image
  { name: "Midjourney", blurb: "Hero imagery and brand visuals when the look has to land cinematic.", category: "AI Video & Image", url: "https://midjourney.com", pricing: "Paid" },
  { name: "Runway", blurb: "AI video — short clips, B-roll, motion. Useful for launches.", category: "AI Video & Image", url: "https://runwayml.com", pricing: "Freemium" },
  { name: "Canva", blurb: "Fast assets, social cards, and quick mockups. Not glamorous, deeply useful.", category: "AI Video & Image", url: "https://canva.com", pricing: "Freemium" },

  // Productivity
  { name: "Notion", blurb: "Where every client roadmap, F.O.C.U.S. audit, and program outline actually lives.", category: "Productivity & Notes", url: "https://notion.so", affiliate: true, pricing: "Freemium" },
  { name: "Obsidian", blurb: "Local-first notes when ideas need to stay private and link together.", category: "Productivity & Notes", url: "https://obsidian.md", pricing: "Free" },
  { name: "Granola", blurb: "AI note-taker for calls. Catches what I miss in coaching sessions.", category: "Productivity & Notes", url: "https://granola.ai", pricing: "Freemium" },

  // Automation & Agents
  { name: "n8n", blurb: "Open-source workflow automation. The agent backbone for client builds.", category: "Automation & Agents", url: "https://n8n.io", pricing: "Freemium" },
  { name: "Make", blurb: "Visual automation for the team that doesn't want to touch code.", category: "Automation & Agents", url: "https://make.com", pricing: "Freemium" },
  { name: "GoHighLevel", blurb: "CRM, pipelines, and SMS/email under one roof. What runs my client engine.", category: "Automation & Agents", url: "https://gohighlevel.com", affiliate: true, pricing: "Paid" },

  // Payments
  { name: "Stripe", blurb: "Every payment in this room runs through Stripe. Honest pricing needs honest checkout.", category: "Payments & Ops", url: "https://stripe.com", pricing: "Freemium" },
  { name: "Beehiiv", blurb: "Newsletter platform that doesn't fight you on deliverability.", category: "Payments & Ops", url: "https://beehiiv.com", affiliate: true, pricing: "Freemium" },

  // Community
  { name: "Skool", blurb: "Home of the FocusFlow Elevation Hub — where support happens between sessions.", category: "Community & Delivery", url: "https://www.skool.com", affiliate: true, pricing: "Paid" },
  { name: "Calendly", blurb: "Booking without back-and-forth. Used for every clarity call I run.", category: "Community & Delivery", url: "https://calendly.com", pricing: "Freemium" },
];

export const DIRECTORY_CATEGORIES: DirCategory[] = [
  "AI Chat & Reasoning",
  "AI Build & No-Code",
  "AI Voice & Audio",
  "AI Video & Image",
  "Productivity & Notes",
  "Automation & Agents",
  "Payments & Ops",
  "Community & Delivery",
];