// ============================================================
// FocusFlow — Lane FAQ Catalog
// Single source of truth for FAQs across lane pages and /faq.
// Each lane's items power both on-page FAQ sections and JSON-LD
// FAQPage schema for SEO/AI search.
// ============================================================

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQLane {
  key: string;
  /** Display label for the lane on the master /faq page. */
  label: string;
  /** Short lane subtitle / context line. */
  blurb: string;
  /** Canonical lane page (anchor target on /faq + cross-link). */
  path: string;
  items: FAQItem[];
}

export const FAQ_LANES: FAQLane[] = [
  {
    key: "clarity",
    label: "Clarity Coaching & Programs",
    blurb: "The free Clarity Check, Mirror Challenge, and Coach Kay's transformation programs.",
    path: "/",
    items: [
      {
        q: "What is a Clarity Check?",
        a: "A free 5-minute guided self-reflection session that identifies your patterns and delivers a personalized clarity report with actionable next steps. No sign-up required to try it.",
      },
      {
        q: "Do I need to sign up to try it?",
        a: "No. The Clarity Check is completely free with no sign-up required. You can save your results and track your Clarity Score over time by creating a free account afterward.",
      },
      {
        q: "What is the Mirror Challenge?",
        a: "A daily guided reflection challenge available in 3, 7, 14, or 30-day formats. Each day delivers a focused prompt designed to build self-awareness, surface patterns, and create lasting change.",
      },
      {
        q: "Who is Coach Kay?",
        a: "Kenza Alaoui Ismaili (Coach Kay) is a 5x certified Master Life Coach, AI strategist, and prompt engineer. She blends honest clarity coaching with real momentum for women, high-performers, and leaders navigating transformation.",
      },
      {
        q: "What's the difference between the free tools and a paid program?",
        a: "Free tools (Clarity Check, Mirror Challenge, Starter Kit) help you diagnose and start. Paid programs (30-Day Personal Reset, 90-Day Transformation, Full AI 90-Day) give you structured curriculum, coaching access, and AI-supported execution to finish what you start.",
      },
    ],
  },
  {
    key: "autism",
    label: "Autism & Social Stories",
    blurb: "AI-personalized, therapist-grade social stories with HSA/FSA reimbursement support.",
    path: "/autism-social-stories",
    items: [
      {
        q: "Are these social stories therapist-grade?",
        a: "Yes. Every story is structured to align with evidence-based social-story frameworks used by SLPs, OTs, and behavioral therapists. Each delivery includes provider-friendly documentation you can share with your child's team.",
      },
      {
        q: "Can I use HSA or FSA funds to pay for this?",
        a: "Most packages are HSA/FSA-eligible when prescribed or recommended by a qualifying provider. We include a Letter of Medical Necessity template you can share with your plan administrator. Final eligibility is determined by your specific plan.",
      },
      {
        q: "Will this work for an IEP or school setting?",
        a: "Yes. Our School & IEP package is built specifically for educators and clinicians: IEP-aligned language, classroom-ready visuals, and a usage license scoped for school teams.",
      },
      {
        q: "How fast do I receive my story?",
        a: "Single-story packages typically deliver within 3–5 business days after intake. Bundles, school packages, and custom licenses run on a scoped timeline confirmed during intake.",
      },
      {
        q: "Can I request edits after delivery?",
        a: "Yes. Every package includes a defined revision window so you can fine-tune voice, names, and specific scenarios to match your child or client.",
      },
    ],
  },
  {
    key: "rent-an-agent",
    label: "Rent-an-Agent",
    blurb: "Subscribe to dedicated AI agents for inbox, sales, content, and ops support.",
    path: "/rent-an-agent",
    items: [
      {
        q: "What exactly is a 'rented' AI agent?",
        a: "A dedicated AI workflow tuned to your business: inbox triage, lead follow-up, content drafting, scheduling, or ops, running on your behalf and reporting into your existing stack. You don't manage prompts or infrastructure; we build, tune, and maintain it.",
      },
      {
        q: "What's the difference between Founding and Standard pricing?",
        a: "Founding pricing locks in our lowest historical rate for as long as you stay subscribed. It's available only while we're onboarding our first cohort of clients. Standard pricing is the published rate going forward.",
      },
      {
        q: "Do I need my own AI tooling or API keys?",
        a: "No. Subscriptions include the AI compute, agent runtime, and tooling. You bring the business context; we bring the agent layer.",
      },
      {
        q: "Can I upgrade, downgrade, or cancel?",
        a: "Yes. Subscriptions are month-to-month. You can change tiers or cancel anytime from your billing portal. Founding pricing stays locked as long as the subscription is active.",
      },
      {
        q: "How is this different from hiring a VA or agency?",
        a: "Agents work 24/7, scale instantly, and don't churn. They're best paired with a human for judgment calls, which is why every tier includes some human-led strategy time from our side.",
      },
    ],
  },
  {
    key: "advisory",
    label: "Advisory, Speaking & Cohorts",
    blurb: "Executive advisory, keynotes & workshops, corporate learning, and transformation cohorts.",
    path: "/advisory",
    items: [
      {
        q: "Who is executive advisory for?",
        a: "Founders, executives, and decision-makers navigating consequential AI adoption, leadership transitions, or growth-stage strategy. Retainers and per-hour engagements available.",
      },
      {
        q: "Do you speak at conferences and corporate events?",
        a: "Yes. Coach Kay delivers keynotes (30/45/60 min), half-day and full-day workshops, and hands-on Claude / GPT labs on AI literacy, clarity, and workforce readiness. Speaking starts at $750.",
      },
      {
        q: "Can you build a custom corporate or EAP training?",
        a: "Yes. We design wellness-aligned AI learning experiences for cohorts of 20 to 500+ learners with executive sponsor reporting and EAP integration available.",
      },
      {
        q: "What is the Collective AI Summit?",
        a: "A quarterly flagship cohort experience for groups, organizations, and ecosystem partners. Promo, Standard, and VIP variations are released ahead of each cohort.",
      },
      {
        q: "How do I get pricing for a scoped engagement?",
        a: "Submit a scope request from the lane page. We'll respond within two business days with a proposal aligned to your timeline, audience, and outcome targets.",
      },
    ],
  },
  {
    key: "audit",
    label: "AI Business Audit",
    blurb: "$47 diagnostic with a personalized F.O.C.U.S. action plan, delivered in 5 minutes.",
    path: "/audit/landing",
    items: [
      {
        q: "What do I get for $47?",
        a: "A 5-minute diagnostic across 12 AI-readiness vectors, a personalized F.O.C.U.S. action plan, AI routing and tool recommendations, and a quick-win action list, delivered to your inbox within minutes.",
      },
      {
        q: "Is the $47 credited toward larger engagements?",
        a: "Yes. The audit fee is credited toward any Rent-an-Agent subscription or Advisory engagement when you upgrade within 30 days.",
      },
      {
        q: "How long does the audit take?",
        a: "About 5 minutes of guided questions. The report is generated and emailed within minutes of completion.",
      },
      {
        q: "Is the audit confidential?",
        a: "Yes. Your responses and report are private to your account. We never share or sell intake data.",
      },
    ],
  },
  {
    key: "studio",
    label: "Story, Legacy & Publishing Studio",
    blurb: "Storybooks, legacy memoirs, expert books, creator bundles: all done for you.",
    path: "/store",
    items: [
      {
        q: "What can the Studio produce?",
        a: "Children's storybooks, legacy memoirs, expert/authority books, creator bundles, and autism social stories, delivered in formats ready for Amazon KDP, Etsy, lead magnets, or private keepsakes.",
      },
      {
        q: "Do I retain the rights to my book?",
        a: "Yes. You own 100% of the finished work. We provide print-ready and platform-ready files; you publish under your name, brand, or pen name.",
      },
      {
        q: "How long does production take?",
        a: "Most single-book packages deliver within 2–4 weeks of intake. Bundles, legacy projects, and custom expert books run on scoped timelines confirmed at kickoff.",
      },
      {
        q: "Can you handle illustrations and cover design?",
        a: "Yes. Illustration, layout, and cover design are included in the relevant packages, and available as add-ons elsewhere.",
      },
      {
        q: "Can I see examples before I buy?",
        a: "Yes. Sample spreads, covers, and case studies are linked from each package. For custom or institutional work, request a scoped portfolio walk-through from the intake form.",
      },
    ],
  },
];

/** Lookup a single lane by key. */
export function getFaqLane(key: string): FAQLane | undefined {
  return FAQ_LANES.find((l) => l.key === key);
}

/** Build a schema.org FAQPage JSON-LD block from FAQ items. */
export function faqPageSchema(
  items: FAQItem[],
  id?: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(id ? { "@id": id } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}