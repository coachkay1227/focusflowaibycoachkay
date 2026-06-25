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
  // -------------------------- AI Chat & Reasoning --------------------------
  {
    name: "Claude",
    blurb: "First brain in the room. Long-form thinking, nuance, tone: the one Coach Kay runs everything through.",
    category: "AI Chat & Reasoning",
    signup_url: "https://claude.ai",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "ChatGPT",
    blurb: "Daily workhorse. Fast drafts, code, voice mode, image generation in one place.",
    category: "AI Chat & Reasoning",
    signup_url: "https://chatgpt.com",
    pricing: "Freemium",
  },
  {
    name: "Gemini",
    blurb: "Google's model with native search + long context. Strong second opinion for research.",
    category: "AI Chat & Reasoning",
    signup_url: "https://gemini.google.com",
    pricing: "Freemium",
  },
  {
    name: "Perplexity",
    blurb: "Answers with sources cited. Use it before you trust any other model's facts.",
    category: "AI Chat & Reasoning",
    signup_url: "https://perplexity.ai",
    pricing: "Freemium",
    affiliate_pending: true,
  },

  // -------------------------- AI Build & No-Code --------------------------
  {
    name: "Lovable",
    blurb: "The AI build studio behind every page in this room. Ship full apps in plain English.",
    category: "AI Build & No-Code",
    signup_url: "https://lovable.dev",
    pricing: "Freemium",
    affiliate_url: "https://lovable.dev/invite/S14O1L0",
  },
  {
    name: "Bolt.new",
    blurb: "Prompt-to-app in your browser. Great for quick prototypes and one-shot tools.",
    category: "AI Build & No-Code",
    signup_url: "https://bolt.new",
    pricing: "Freemium",
  },
  {
    name: "Cursor",
    blurb: "AI-native code editor. For when you (or Coach Kay) need to be hands-on in the codebase.",
    category: "AI Build & No-Code",
    signup_url: "https://cursor.com",
    pricing: "Freemium",
  },
  {
    name: "Bubble",
    blurb: "Mature no-code platform for real SaaS. Steeper learning curve, deeper ceiling.",
    category: "AI Build & No-Code",
    signup_url: "https://bubble.io",
    pricing: "Freemium",
  },
  {
    name: "Gamma",
    blurb:
      "AI-powered presentation and document builder. Turn rough notes into polished decks in seconds, perfect for coaching offers and content.",
    category: "AI Build & No-Code",
    signup_url: "https://gamma.app",
    affiliate_url: "https://gamma.app?via=coachkay",
    pricing: "Freemium",
  },
  {
    name: "Leadpages",
    blurb:
      "High-converting landing page builder built for coaches and course creators. Drag-and-drop, no code, fast results.",
    category: "AI Build & No-Code",
    signup_url: "https://www.leadpages.com",
    affiliate_url: "https://try.leadpages.com/coachkay",
    pricing: "Paid",
  },

  // -------------------------- AI Agents & Research --------------------------
  {
    name: "NotebookLM",
    blurb: "Google's research notebook. Drop sources, get audio overviews and grounded answers.",
    category: "AI Agents & Research",
    signup_url: "https://notebooklm.google.com",
    pricing: "Free",
  },

  // -------------------------- AI Voice & Audio --------------------------
  {
    name: "ElevenLabs",
    blurb: "Voice work for guided rituals and audio coaching. The only AI voice Coach Kay trusts on tone.",
    category: "AI Voice & Audio",
    signup_url: "https://elevenlabs.io",
    affiliate_url: "https://try.elevenlabs.io/ss73od7oz8wm",
    pricing: "Freemium",
  },
  {
    name: "Descript",
    blurb: "Edit video and audio like a doc. How Coach Kay batches content without burning a week.",
    category: "AI Voice & Audio",
    signup_url: "https://descript.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Suno",
    blurb: "Generate full songs from a prompt. Good for intros, hooks, and brand audio stings.",
    category: "AI Voice & Audio",
    signup_url: "https://suno.com",
    pricing: "Freemium",
  },
  {
    name: "Krisp",
    blurb: "Background noise + echo removal on every call. The single best $0 add-on for coaches.",
    category: "AI Voice & Audio",
    signup_url: "https://krisp.ai",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Otter.ai",
    blurb: "Real-time meeting transcription and summaries. Strong free tier.",
    category: "AI Voice & Audio",
    signup_url: "https://otter.ai",
    affiliate_url: "https://otter.ai/referrals/LLFONTHH",
    pricing: "Freemium",
  },

  // -------------------------- AI Video & Image --------------------------
  {
    name: "HeyGen",
    blurb: "AI avatars, voice clones, and translated video. Scale your face without losing it.",
    category: "AI Video & Image",
    signup_url: "https://heygen.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Synthesia",
    blurb: "Enterprise-grade AI video avatars. Best for training and explainer content.",
    category: "AI Video & Image",
    signup_url: "https://synthesia.io",
    pricing: "Paid",
    affiliate_pending: true,
  },
  {
    name: "Runway",
    blurb: "AI video editing + Gen-3 model. Useful for B-roll, restyles, and motion graphics.",
    category: "AI Video & Image",
    signup_url: "https://runwayml.com",
    pricing: "Freemium",
  },
  {
    name: "Midjourney",
    blurb: "Cinematic still imagery. The gold standard when the look has to land.",
    category: "AI Video & Image",
    signup_url: "https://midjourney.com",
    pricing: "Paid",
  },
  {
    name: "Ideogram",
    blurb: "Image generation that actually nails text inside the image. Posters and ads, sorted.",
    category: "AI Video & Image",
    signup_url: "https://ideogram.ai",
    pricing: "Freemium",
  },
  {
    name: "HitPaw FotorPea / VikPea",
    blurb: "AI upscaling and video enhancement. Rescue grainy phone footage in one pass.",
    category: "AI Video & Image",
    signup_url: "https://www.hitpaw.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Topaz Labs",
    blurb: "Pro-grade upscalers for photo and video. What studios use when quality is non-negotiable.",
    category: "AI Video & Image",
    signup_url: "https://topazlabs.com",
    pricing: "Paid",
    affiliate_pending: true,
  },
  {
    name: "AdCreative.ai",
    blurb:
      "AI-generated ad creatives and social content, trained on high-performing ads. Saves hours designing content that actually converts.",
    category: "AI Video & Image",
    signup_url: "https://www.adcreative.ai",
    affiliate_url: "https://www.adcreative.ai/signup?fpr=coachkay",
    pricing: "Paid",
  },
  {
    name: "Canva",
    blurb: "Fast assets, social cards, and quick mockups with AI baked in. Not glamorous, deeply useful.",
    category: "AI Video & Image",
    signup_url: "https://canva.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },

  // -------------------------- Productivity & Notes --------------------------
  {
    name: "Notion",
    blurb: "Where every client roadmap, F.O.C.U.S. audit, and program outline lives.",
    category: "Productivity & Notes",
    signup_url: "https://notion.so",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Granola",
    blurb: "AI note-taker that doesn't bot into your calls. Catches what coaching sessions miss.",
    category: "Productivity & Notes",
    signup_url: "https://granola.ai",
    pricing: "Freemium",
  },
  {
    name: "Fathom",
    blurb: "Free Zoom/Meet recorder + AI summaries. Strong privacy posture for client calls.",
    category: "Productivity & Notes",
    signup_url: "https://fathom.video",
    pricing: "Freemium",
    affiliate_pending: true,
  },

  // -------------------------- Automation & Ops --------------------------
  {
    name: "GoHighLevel",
    blurb: "CRM, pipelines, SMS/email under one roof. What runs Coach Kay's client engine.",
    category: "Automation & Ops",
    signup_url: "https://gohighlevel.com",
    pricing: "Paid",
    affiliate_pending: true,
  },
  {
    name: "Make",
    blurb: "Visual automation for teams that don't want to touch code.",
    category: "Automation & Ops",
    signup_url: "https://make.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Zapier",
    blurb: "The most connectors of any automation platform. Now with AI actions built-in.",
    category: "Automation & Ops",
    signup_url: "https://zapier.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Airtable",
    blurb: "Spreadsheet that thinks like a database, now with AI fields. Backbone for tracking deliverables.",
    category: "Automation & Ops",
    signup_url: "https://airtable.com",
    pricing: "Freemium",
  },
  {
    name: "ActiveCampaign",
    blurb:
      "Email marketing + CRM automation powerhouse. Perfect for coaches who want to nurture leads and automate client journeys at scale.",
    category: "Automation & Ops",
    signup_url: "https://www.activecampaign.com",
    affiliate_url: "https://www.activecampaign.com/?ref=coachkay",
    pricing: "Paid",
  },
  {
    name: "Manychat",
    blurb:
      "Automate your DMs on Instagram and Facebook. The go-to tool for coaches running social media funnels and comment-triggered lead flows.",
    category: "Automation & Ops",
    signup_url: "https://manychat.com",
    affiliate_url: "https://manychat.com/PartnerRef=coachkay",
    pricing: "Freemium",
  },
  {
    name: "SocialBee",
    blurb:
      "Social media scheduling and content recycling built for busy coaches. Plan once, publish everywhere, track what works.",
    category: "Automation & Ops",
    signup_url: "https://socialbee.com",
    affiliate_url: "https://socialbee.com/partner/coachkay",
    pricing: "Paid",
  },

  // -------------------------- Payments & Delivery --------------------------
  {
    name: "Stripe",
    blurb: "Every payment in this room runs through Stripe. Honest pricing needs honest checkout.",
    category: "Payments & Delivery",
    signup_url: "https://stripe.com",
    pricing: "Freemium",
  },
  {
    name: "Beehiiv",
    blurb: "Newsletter platform that doesn't fight you on deliverability.",
    category: "Payments & Delivery",
    signup_url: "https://beehiiv.com",
    affiliate_url: "https://www.beehiiv.com/?via=coach-kay",
    pricing: "Freemium",
  },
  {
    name: "Kit (ConvertKit)",
    blurb: "Creator-focused email + automations. The other newsletter platform worth your time.",
    category: "Payments & Delivery",
    signup_url: "https://kit.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Whop",
    blurb: "Sell digital products, communities, and software. Built-in audience + payments.",
    category: "Payments & Delivery",
    signup_url: "https://whop.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Thinkific",
    blurb:
      "Top-tier platform for building and selling online courses and coaching programs. Built for creators who want full control of their brand.",
    category: "Payments & Delivery",
    signup_url: "https://www.thinkific.com",
    affiliate_url: "https://www.thinkific.com/?ref=coachkay",
    pricing: "Paid",
  },

  // -------------------------- Community & Booking --------------------------
  {
    name: "Skool",
    blurb: "Home of the FocusFlow Elevation Hub: where support happens between sessions.",
    category: "Community & Booking",
    signup_url: "https://www.skool.com/focusflow-elevation-hub",
    affiliate_url: "https://www.skool.com/signup?ref=e641155cc53a431c8387d590ba785dea",
    pricing: "Paid",
  },
  {
    name: "Calendly",
    blurb: "Booking without back-and-forth. Used for every clarity call Coach Kay runs.",
    category: "Community & Booking",
    signup_url: "https://calendly.com",
    pricing: "Freemium",
    affiliate_pending: true,
  },
  {
    name: "Stan Store",
    blurb:
      "Coach Kay's creator storefront: digital products, session bookings, and community access all in one place.",
    category: "Community & Booking",
    signup_url: "https://join.stan.store/coachkay_ai",
    affiliate_url: "https://join.stan.store/coachkay_ai",
    pricing: "Freemium",
  },
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

/** The URL the CTA opens – affiliate beats signup, falls back to signup. */
export function ctaUrl(tool: DirectoryTool): string {
  return tool.affiliate_url || tool.signup_url;
}
