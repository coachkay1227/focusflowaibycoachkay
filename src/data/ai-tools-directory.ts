export type DirCategory =
  | "AI Chat & Reasoning"
  | "AI Build & No-Code"
  | "AI Agents & Research"
  | "AI Voice & Audio"
  | "AI Video & Image"
  | "Productivity & Notes"
  | "Automation & Ops"
  | "Payments & Delivery"
  | "Community & Booking";

export interface DirectoryTool {
  name: string;
  blurb: string;
  category: DirCategory;
  /** Direct public signup / homepage URL — always set. */
  signup_url: string;
  /** Coach Kay's affiliate URL when available — overrides signup_url on the CTA. */
  affiliate_url?: string;
  /** True when Coach Kay plans to register an affiliate but hasn't dropped the link yet. */
  affiliate_pending?: boolean;
  pricing: "Free" | "Freemium" | "Paid";
}

/**
 * Coach Kay's working AI toolkit + recommended stack for the community.
 * Single source of truth: paste affiliate URLs into `affiliate_url` and the
 * card CTA switches automatically. Flip `affiliate_pending: true` for tools
 * where the affiliate link is on its way so visitors see the right note.
 */
export const DIRECTORY_TOOLS: DirectoryTool[] = [
  // ────────────────────────────── AI Chat & Reasoning ──────────────────────────────
  { name: "Claude", blurb: "First brain in the room. Long-form thinking, nuance, tone — the one Coach Kay runs everything through.", category: "AI Chat & Reasoning", signup_url: "https://claude.ai", pricing: "Freemium", affiliate_pending: true },
  { name: "ChatGPT", blurb: "Daily workhorse. Fast drafts, code, voice mode, image generation in one place.", category: "AI Chat & Reasoning", signup_url: "https://chatgpt.com", pricing: "Freemium" },
  { name: "Gemini", blurb: "Google's model with native search + long context. Strong second opinion for research.", category: "AI Chat & Reasoning", signup_url: "https://gemini.google.com", pricing: "Freemium" },
  { name: "Perplexity", blurb: "Answers with sources cited. Use it before you trust any other model's facts.", category: "AI Chat & Reasoning", signup_url: "https://perplexity.ai", pricing: "Freemium", affiliate_pending: true },
  { name: "Grok", blurb: "xAI's model with real-time X data. Useful for trend-checking, careful on bias.", category: "AI Chat & Reasoning", signup_url: "https://grok.com", pricing: "Freemium" },
  { name: "DeepSeek", blurb: "Open-weights reasoning model. Free tier punches well above its weight for math and code.", category: "AI Chat & Reasoning", signup_url: "https://chat.deepseek.com", pricing: "Free" },
  { name: "Mistral Le Chat", blurb: "European-hosted, fast, privacy-leaning chat model. Good when data residency matters.", category: "AI Chat & Reasoning", signup_url: "https://chat.mistral.ai", pricing: "Freemium" },
  { name: "Kimi", blurb: "Moonshot's long-context model. Drops 1M+ token docs without choking.", category: "AI Chat & Reasoning", signup_url: "https://kimi.com", pricing: "Free" },

  // ────────────────────────────── AI Build & No-Code ──────────────────────────────
  { name: "Lovable", blurb: "The AI build studio behind every page in this room. Ship full apps in plain English.", category: "AI Build & No-Code", signup_url: "https://lovable.dev", pricing: "Freemium", affiliate_pending: true },
  { name: "Bolt.new", blurb: "Prompt-to-app in your browser. Great for quick prototypes and one-shot tools.", category: "AI Build & No-Code", signup_url: "https://bolt.new", pricing: "Freemium" },
  { name: "Replit Agent", blurb: "Cloud IDE with an agent that scaffolds, deploys, and fixes bugs while you sleep.", category: "AI Build & No-Code", signup_url: "https://replit.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Cursor", blurb: "AI-native code editor. For when you (or Coach Kay) need to be hands-on in the codebase.", category: "AI Build & No-Code", signup_url: "https://cursor.com", pricing: "Freemium" },
  { name: "Windsurf", blurb: "Codeium's agentic IDE. Cursor's biggest rival — try both, pick what clicks.", category: "AI Build & No-Code", signup_url: "https://windsurf.com", pricing: "Freemium" },
  { name: "v0", blurb: "Vercel's UI generator. Prompt to React components with shadcn/ui out of the box.", category: "AI Build & No-Code", signup_url: "https://v0.app", pricing: "Freemium" },
  { name: "Base44", blurb: "Conversational app builder backed by Wix. Quietly powerful for internal tools.", category: "AI Build & No-Code", signup_url: "https://base44.com", pricing: "Freemium" },
  { name: "Softr", blurb: "Turn Airtable / Google Sheets into client portals and member sites without code.", category: "AI Build & No-Code", signup_url: "https://softr.io", pricing: "Freemium", affiliate_pending: true },
  { name: "Bubble", blurb: "Mature no-code platform for real SaaS. Steeper learning curve, deeper ceiling.", category: "AI Build & No-Code", signup_url: "https://bubble.io", pricing: "Freemium" },
  { name: "Supabase", blurb: "Open-source backend — auth, Postgres, edge functions. Powers the whole platform.", category: "AI Build & No-Code", signup_url: "https://supabase.com", pricing: "Freemium" },

  // ────────────────────────────── AI Agents & Research ──────────────────────────────
  { name: "Manus", blurb: "General-purpose agent that browses, writes, codes, and ships deliverables end-to-end.", category: "AI Agents & Research", signup_url: "https://manus.im", pricing: "Freemium", affiliate_pending: true },
  { name: "GenSpark", blurb: "Multi-agent search + automation. Spins up deep-research dossiers in minutes.", category: "AI Agents & Research", signup_url: "https://genspark.ai", pricing: "Freemium", affiliate_pending: true },
  { name: "OpenAI Operator", blurb: "ChatGPT agent that drives a real browser for you. Powerful — read the Pause Hub before you let it loose.", category: "AI Agents & Research", signup_url: "https://operator.chatgpt.com", pricing: "Paid" },
  { name: "Claude Computer Use", blurb: "Anthropic's agent that controls your screen via API. Best for power-users who can sandbox it.", category: "AI Agents & Research", signup_url: "https://docs.anthropic.com/en/docs/agents-and-tools/computer-use", pricing: "Paid" },
  { name: "NotebookLM", blurb: "Google's research notebook. Drop sources, get audio overviews and grounded answers.", category: "AI Agents & Research", signup_url: "https://notebooklm.google.com", pricing: "Free" },
  { name: "Elicit", blurb: "AI research assistant for academic and primary sources. Built for evidence, not vibes.", category: "AI Agents & Research", signup_url: "https://elicit.com", pricing: "Freemium" },

  // ────────────────────────────── AI Voice & Audio ──────────────────────────────
  { name: "ElevenLabs", blurb: "Voice work for guided rituals and audio coaching. The only AI voice Coach Kay trusts on tone.", category: "AI Voice & Audio", signup_url: "https://elevenlabs.io", pricing: "Freemium", affiliate_pending: true },
  { name: "Descript", blurb: "Edit video and audio like a doc. How Coach Kay batches content without burning a week.", category: "AI Voice & Audio", signup_url: "https://descript.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Suno", blurb: "Generate full songs from a prompt. Good for intros, hooks, and brand audio stings.", category: "AI Voice & Audio", signup_url: "https://suno.com", pricing: "Freemium" },
  { name: "Udio", blurb: "Suno's main rival for AI-generated music. Different vibe, often cleaner vocals.", category: "AI Voice & Audio", signup_url: "https://udio.com", pricing: "Freemium" },
  { name: "Krisp", blurb: "Background noise + echo removal on every call. The single best $0 add-on for coaches.", category: "AI Voice & Audio", signup_url: "https://krisp.ai", pricing: "Freemium", affiliate_pending: true },
  { name: "Otter.ai", blurb: "Real-time meeting transcription and summaries. Strong free tier.", category: "AI Voice & Audio", signup_url: "https://otter.ai", pricing: "Freemium", affiliate_pending: true },

  // ────────────────────────────── AI Video & Image ──────────────────────────────
  { name: "HeyGen", blurb: "AI avatars, voice clones, and translated video. Scale your face without losing it.", category: "AI Video & Image", signup_url: "https://heygen.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Synthesia", blurb: "Enterprise-grade AI video avatars. Best for training and explainer content.", category: "AI Video & Image", signup_url: "https://synthesia.io", pricing: "Paid", affiliate_pending: true },
  { name: "Runway", blurb: "AI video editing + Gen-3 model. Useful for B-roll, restyles, and motion graphics.", category: "AI Video & Image", signup_url: "https://runwayml.com", pricing: "Freemium" },
  { name: "Pika", blurb: "Short-form AI video with strong character consistency. Fun and fast.", category: "AI Video & Image", signup_url: "https://pika.art", pricing: "Freemium" },
  { name: "Kling", blurb: "Kuaishou's video model. Often the most cinematic free output available.", category: "AI Video & Image", signup_url: "https://klingai.com", pricing: "Freemium" },
  { name: "Luma Dream Machine", blurb: "Smooth camera motion and realistic physics. The one for product b-roll.", category: "AI Video & Image", signup_url: "https://lumalabs.ai/dream-machine", pricing: "Freemium" },
  { name: "Sora", blurb: "OpenAI's video model. Bundled with ChatGPT Plus / Pro.", category: "AI Video & Image", signup_url: "https://sora.com", pricing: "Paid" },
  { name: "Midjourney", blurb: "Cinematic still imagery. The gold standard when the look has to land.", category: "AI Video & Image", signup_url: "https://midjourney.com", pricing: "Paid" },
  { name: "Ideogram", blurb: "Image generation that actually nails text inside the image. Posters and ads, sorted.", category: "AI Video & Image", signup_url: "https://ideogram.ai", pricing: "Freemium" },
  { name: "Flux (Black Forest Labs)", blurb: "Open-weights image model with photographic fidelity. Run it anywhere.", category: "AI Video & Image", signup_url: "https://blackforestlabs.ai", pricing: "Freemium" },
  { name: "HitPaw FotorPea / VikPea", blurb: "AI upscaling and video enhancement. Rescue grainy phone footage in one pass.", category: "AI Video & Image", signup_url: "https://www.hitpaw.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Topaz Labs", blurb: "Pro-grade upscalers for photo and video. What studios use when quality is non-negotiable.", category: "AI Video & Image", signup_url: "https://topazlabs.com", pricing: "Paid", affiliate_pending: true },
  { name: "Canva", blurb: "Fast assets, social cards, and quick mockups with AI baked in. Not glamorous, deeply useful.", category: "AI Video & Image", signup_url: "https://canva.com", pricing: "Freemium", affiliate_pending: true },

  // ────────────────────────────── Productivity & Notes ──────────────────────────────
  { name: "Notion", blurb: "Where every client roadmap, F.O.C.U.S. audit, and program outline lives.", category: "Productivity & Notes", signup_url: "https://notion.so", pricing: "Freemium", affiliate_pending: true },
  { name: "Obsidian", blurb: "Local-first notes when ideas need to stay private and link together.", category: "Productivity & Notes", signup_url: "https://obsidian.md", pricing: "Free" },
  { name: "Granola", blurb: "AI note-taker that doesn't bot into your calls. Catches what coaching sessions miss.", category: "Productivity & Notes", signup_url: "https://granola.ai", pricing: "Freemium" },
  { name: "Fathom", blurb: "Free Zoom/Meet recorder + AI summaries. Strong privacy posture for client calls.", category: "Productivity & Notes", signup_url: "https://fathom.video", pricing: "Freemium", affiliate_pending: true },
  { name: "Mem", blurb: "AI-native notes that surface what you need without folders. For the chronically overstuffed brain.", category: "Productivity & Notes", signup_url: "https://mem.ai", pricing: "Freemium" },

  // ────────────────────────────── Automation & Ops ──────────────────────────────
  { name: "GoHighLevel", blurb: "CRM, pipelines, SMS/email under one roof. What runs Coach Kay's client engine.", category: "Automation & Ops", signup_url: "https://gohighlevel.com", pricing: "Paid", affiliate_pending: true },
  { name: "n8n", blurb: "Open-source workflow automation. The agent backbone for client builds.", category: "Automation & Ops", signup_url: "https://n8n.io", pricing: "Freemium" },
  { name: "Make", blurb: "Visual automation for teams that don't want to touch code.", category: "Automation & Ops", signup_url: "https://make.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Zapier", blurb: "The most connectors of any automation platform. Now with AI actions built-in.", category: "Automation & Ops", signup_url: "https://zapier.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Pipedream", blurb: "Code-first automation for devs. Free tier is generous.", category: "Automation & Ops", signup_url: "https://pipedream.com", pricing: "Freemium" },
  { name: "Airtable", blurb: "Spreadsheet that thinks like a database, now with AI fields. Backbone for tracking deliverables.", category: "Automation & Ops", signup_url: "https://airtable.com", pricing: "Freemium" },

  // ────────────────────────────── Payments & Delivery ──────────────────────────────
  { name: "Stripe", blurb: "Every payment in this room runs through Stripe. Honest pricing needs honest checkout.", category: "Payments & Delivery", signup_url: "https://stripe.com", pricing: "Freemium" },
  { name: "Beehiiv", blurb: "Newsletter platform that doesn't fight you on deliverability.", category: "Payments & Delivery", signup_url: "https://www.beehiiv.com/?via=coach-kay", pricing: "Freemium", affiliate_pending: false },
  { name: "Kit (ConvertKit)", blurb: "Creator-focused email + automations. The other newsletter platform worth your time.", category: "Payments & Delivery", signup_url: "https://kit.com", pricing: "Freemium", affiliate_pending: true },
  { name: "Resend", blurb: "Modern transactional email API. What sends every receipt and welcome in this app.", category: "Payments & Delivery", signup_url: "https://resend.com", pricing: "Freemium" },
  { name: "Whop", blurb: "Sell digital products, communities, and software. Built-in audience + payments.", category: "Payments & Delivery", signup_url: "https://whop.com", pricing: "Freemium", affiliate_pending: true },

  // ────────────────────────────── Community & Booking ──────────────────────────────
  { name: "Skool", blurb: "Home of the FocusFlow Elevation Hub — where support happens between sessions.", category: "Community & Booking", signup_url: "https://www.skool.com", pricing: "Paid", affiliate_pending: true },
  { name: "Circle", blurb: "Premium community platform when you outgrow free options.", category: "Community & Booking", signup_url: "https://circle.so", pricing: "Paid", affiliate_pending: true },
  { name: "Discord", blurb: "Free community spaces with voice, video, and bots. Where most AI-curious folks already live.", category: "Community & Booking", signup_url: "https://discord.com", pricing: "Freemium" },
  { name: "Calendly", blurb: "Booking without back-and-forth. Used for every clarity call Coach Kay runs.", category: "Community & Booking", signup_url: "https://calendly.com", pricing: "Freemium", affiliate_pending: true },
];

export const DIRECTORY_CATEGORIES: DirCategory[] = [
  "AI Chat & Reasoning",
  "AI Build & No-Code",
  "AI Agents & Research",
  "AI Voice & Audio",
  "AI Video & Image",
  "Productivity & Notes",
  "Automation & Ops",
  "Payments & Delivery",
  "Community & Booking",
];

/** The URL the CTA opens — affiliate beats signup, falls back to signup. */
export function ctaUrl(tool: DirectoryTool): string {
  return tool.affiliate_url || tool.signup_url;
}