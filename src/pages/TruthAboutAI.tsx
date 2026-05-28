import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Eye,
  Compass,
  AlertTriangle,
  ArrowRight,
  Unlock,
  Tag,
  HeartHandshake,
  Clock,
  ShieldOff,
  Wrench,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import OfferCard from "@/components/offers/OfferCard";
import MirrorReveal from "@/components/truth/MirrorReveal";
import ToolPickCard from "@/components/truth/ToolPickCard";
import { TOOL_PICKS } from "@/data/tool-picks";
import { FOCUS_PILLARS } from "@/data/programs";
import { SITE_URL, ORG_ID } from "@/lib/seo-schema";

const TAGS = ["AI literacy", "No hype", "No fear", "Human-first", "Coach Kay"];

const MYTHS: { kind: "false" | "nuanced" | "true"; claim: string; truth: string }[] = [
  { kind: "false", claim: "AI is conscious and has its own agenda", truth: "It's a pattern-matching system trained on data. It doesn't think, feel, or want anything." },
  { kind: "false", claim: "AI will replace all human jobs", truth: "It changes how work gets done. People who learn to work with it outpace those who don't." },
  { kind: "false", claim: "AI knows what's true", truth: "AI generates plausible text. It will confidently hallucinate. Verify anything that matters." },
  { kind: "false", claim: "Learning to prompt makes you an AI expert", truth: "Prompting is one skill. Systems thinking, ethics, and implementation are the actual work." },
  { kind: "nuanced", claim: "AI businesses are passive income", truth: "AI reduces friction. It doesn't eliminate strategy, relationships, or judgment." },
  { kind: "nuanced", claim: "You need to learn every tool", truth: "Master the categories and 2–3 tools deeply. Depth beats breadth here." },
];

const STRENGTHS = [
  "Drafts, summaries, first passes",
  "Research starting points",
  "Repetitive task automation",
  "Brainstorming at speed",
  "Systems and workflow building",
  "Personalized learning tools",
  "Coding assistance",
];

const WEAKNESSES = [
  "Truth and fact verification",
  "Real emotional intelligence",
  "Long-term strategic judgment",
  "Genuine originality",
  "Context without being told",
  "Accountability and ethics",
  "Replacing real relationships",
];

const FEARS = [
  { fear: "I'll lose my job to AI", truth: "You're more likely to lose it to someone who uses AI well. That's a learnable skill, not a death sentence." },
  { fear: "I'm already too far behind", truth: "Tools change every few months. Being behind six months ago means nothing today. Start now." },
  { fear: "I can't trust AI content", truth: "You're right to be skeptical. AI is a tool, not a source. Critical thinking is the skill that matters." },
  { fear: "AI will destroy creativity", truth: "AI can generate. It cannot create from lived experience, values, or perspective. That's yours." },
  { fear: "I'll get scammed", truth: "Fake gurus, wrapper products, passive-income promises — all real. I teach you to spot them on sight." },
  { fear: "I don't know who to trust", truth: "Trust the people who tell you what AI can't do as clearly as what it can. That's the bar." },
];

const ENVIRONMENT: { kind: "false" | "nuanced" | "true"; claim: string; truth: string }[] = [
  {
    kind: "false",
    claim: "Every ChatGPT query uses a 500ml bottle of water",
    truth: "The viral figure aggregates training + on-site cooling + power-plant water per session, not per query. Real per-query on-site water is closer to ~5ml — a teaspoon. Less than a Google image search, a rounding error next to one almond (3L). [3]",
  },
  {
    kind: "true",
    claim: "Global data-centre electricity use is rising fast",
    truth: "The IEA puts data-centre demand at ~1.5% of global electricity today, projected to ~3% by 2030. Tracking firms count ~4,500 new data-centre projects in the pipeline before 2029. AI is the accelerant, but only ~10–20% of total data-centre load right now. [1][4]",
  },
  {
    kind: "nuanced",
    claim: "AI is destroying the climate",
    truth: "Individual chatbot use is climate-negligible — one beef burger, one short drive, or one transatlantic flight dwarfs a year of prompts. Training frontier models is genuinely energy-intensive (one GPT-class run ≈ thousands of homes-years). The honest concern is grid pressure and power-source mix, not your prompts. [2]",
  },
  {
    kind: "true",
    claim: "Some local communities are getting hit hard",
    truth: "Real and underreported. Data-centre clusters in Northern Virginia, Arizona, and parts of Ireland are straining local water tables and grid capacity. This is a siting and policy problem, not an 'AI is evil' problem. Pressure your utility commissioner, not your chatbot.",
  },
  {
    kind: "false",
    claim: "If I stop using AI, I'll save the planet",
    truth: "You won't. A year of moderate ChatGPT use is roughly the carbon footprint of a single 1-hour drive. Skipping AI to save the planet is like skipping toast to fund a mortgage. Direct your effort at flying, driving, heating, and meat — that's where the leverage is. [2]",
  },
  {
    kind: "nuanced",
    claim: "The tech companies are going green",
    truth: "Hyperscalers (Google, Microsoft, Amazon) are the largest corporate buyers of renewable energy on earth, and they're funding new nuclear (Three Mile Island restart, SMRs). Also true: their absolute emissions are rising because demand is outpacing renewable build-out. Both things at once.",
  },
];

const ENVIRONMENT_SOURCES = [
  { n: 1, label: "IEA — Energy and AI / 2025 data-centre update", url: "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary" },
  { n: 2, label: "Hannah Ritchie — How much electricity does AI consume? [2025]", url: "https://hannahritchie.substack.com/p/ai-electricity-2025" },
  { n: 3, label: "Sean Goedecke — Talking to ChatGPT costs 5ml of water, not 500ml", url: "https://www.seangoedecke.com/water-impact-of-ai/" },
  { n: 4, label: "Industrial Info Resources — 4,500 data-centre projects in pipeline (2026)", url: "https://www.industrialinfo.com/iirenergy/industry-news/article/iea-data-centers-pose-challenge-to-global-power-industry--356703" },
];

const RED_FLAGS = [
  { claim: "Fully automated income with AI", truth: "Automation reduces work. It doesn't eliminate strategy, offers, or customers." },
  { claim: "Overpriced prompt packs", truth: "Prompting is a skill, not a product. Most $97 packs are free elsewhere." },
  { claim: "Fake AI SaaS wrappers", truth: "Many 'AI tools' are ChatGPT with a custom UI and a 10x markup. Check what's under the hood." },
  { claim: "'I made $X in 30 days with AI'", truth: "The money came from selling the story. Watch the business model, not the screenshot." },
];

const SKILLS = [
  { name: "Discernment", why: "Knowing what's true in an ocean of AI-generated noise." },
  { name: "Clear communication", why: "AI amplifies direction. Vague in, vague out." },
  { name: "Emotional intelligence", why: "The one thing AI cannot replicate at scale." },
  { name: "Systems thinking", why: "Building workflows that compound over time." },
  { name: "Taste and judgment", why: "Knowing what good looks like — AI can't do this for you." },
  { name: "Trust and relationships", why: "The currency of the AI era. Harder to fake than ever." },
];

const TRUST_PILLARS = [
  {
    icon: Unlock,
    title: "No gatekeeping",
    body: "What I coach in a $5K container, I'll teach in a $0 module. The tier unlocks depth and access — never the truth itself.",
  },
  {
    icon: Tag,
    title: "Yes, affiliate links — flagged every time",
    body: "I use the tools I recommend. When a link pays me, you'll see a clear tag. The pick is the pick whether it pays or not.",
  },
  {
    icon: HeartHandshake,
    title: "Mindset + strategy, not motivation theater",
    body: "Life coaching belongs inside the system, not on a stage. Uplift and Support are pillars of F.O.C.U.S. — not upsells.",
  },
  {
    icon: Clock,
    title: "No fake scarcity",
    body: "No 'doors close at midnight,' no countdown timers, no fabricated cohorts. If a seat is limited, it's because the room is.",
  },
  {
    icon: Eye,
    title: "No discovery-call paywall",
    body: "Every price is on the page. You'll never have to book a call to find out what something costs.",
  },
  {
    icon: ShieldOff,
    title: "No screenshot flexing",
    body: "I won't show you my income, my followers, or my Stripe dashboard to sell you anything. Results speak in your life, not mine.",
  },
  {
    icon: Compass,
    title: "Plain language, always",
    body: "If I can't explain it to your grandma, I won't put it in front of you. AI is the tool — clarity is the product.",
  },
  {
    icon: AlertTriangle,
    title: "I'll tell you 'no'",
    body: "If you don't need what I sell, I'll send you somewhere that fits — even if that somewhere is rest. Trust over revenue, every time.",
  },
];

const PATHS = [
  {
    eyebrow: "Personal",
    title: "Reset your inner operating system",
    tagline: "For the human who feels stuck, scattered, or quietly afraid of the future.",
    features: [
      "Daily clarity ritual + AI thinking partner",
      "30 or 90-day structured reset",
      "Direct coaching from Kay inside the app",
      "Replaces journaling, therapy homework, and 5 productivity apps",
    ],
    price: "$97",
    priceSuffix: "/ from",
    primaryCta: { label: "Start the 30-day Personal Reset", to: "/programs/30-day-personal-reset" },
    secondaryCta: { label: "Talk to Kay first", to: "/coach-kay" },
  },
  {
    eyebrow: "Business",
    title: "Make your business AI-native",
    tagline: "For the founder or operator who's losing hours to manual work and time to faster competitors.",
    features: [
      "30-day business reset → systems audit + AI workflows",
      "90-day full business transformation",
      "Done-with-you OR done-for-you via the Build Studio",
      "Real ROI tracking, not vanity automation",
    ],
    price: "$497",
    priceSuffix: "/ from",
    primaryCta: { label: "Start the 30-day Business Reset", to: "/programs/30-day-business-reset" },
    secondaryCta: { label: "Have the Studio build it", to: "/build-studio" },
    variant: "featured" as const,
    badge: "Most chosen",
  },
  {
    eyebrow: "Full Transformation",
    title: "Rebuild your life AND business with AI",
    tagline: "For the rare person who's done playing small — ready to integrate the personal and the strategic.",
    features: [
      "90-day Full AI Transformation curriculum",
      "6-month Private Partnership with Kay",
      "Custom AI agents, dashboards, and decision systems",
      "Highest-touch — limited intake per quarter",
    ],
    price: "$2,997",
    priceSuffix: "/ from",
    primaryCta: { label: "Start 90-day Full Transformation", to: "/programs/90-day-full-ai-transformation" },
    secondaryCta: { label: "Apply for the Partnership", to: "/programs/6-month-private-partnership" },
    variant: "premium" as const,
  },
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    ...FEARS.map((f) => ({
      "@type": "Question",
      name: f.fear,
      acceptedAnswer: { "@type": "Answer", text: f.truth },
    })),
    ...ENVIRONMENT.map((e) => ({
      "@type": "Question",
      name: e.claim,
      acceptedAnswer: { "@type": "Answer", text: e.truth },
    })),
  ],
};

const ARTICLE_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Truth About AI — Personal, Business & Full Transformation",
  description:
    "No hype. No fear. A grounded breakdown of what AI is, what it isn't, the scams to avoid, and the exact next step for your life or business.",
  author: { "@id": `${SITE_URL}/#kay` },
  publisher: { "@id": ORG_ID },
  mainEntityOfPage: `${SITE_URL}/truth`,
  datePublished: "2026-05-27",
  dateModified: "2026-05-27",
};

export default function TruthAboutAI() {
  const pathsRef = useRef<HTMLDivElement>(null);

  const scrollToPaths = () =>
    pathsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <SEOHead
        title="The Truth About AI — Personal, Business & Full Transformation"
        description="The honest truth about AI in 2026 — no hype, no fear. Coach Kay breaks down what AI actually is, what it can do for you, and how to use it with clarity."
        path="/truth"
        jsonLd={[ARTICLE_LD, FAQ_LD]}
      />
      <div className="md:hidden fixed top-4 right-4 z-50">
        <MobileNav />
      </div>

      <main className="min-h-dvh bg-background text-foreground pt-24 md:pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          {/* HERO */}
          <AnimatedSection>
            <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-[hsl(210_40%_6%)] via-[hsl(210_40%_8%)] to-[hsl(210_40%_5%)] px-7 py-14 md:px-14 md:py-20 mb-10">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/[0.06] blur-2xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-primary mb-4">
                The AI Reality Guide — Coach Kay
              </p>
              <h1 className="font-heading font-light text-foreground text-[2.4rem] md:text-[3.6rem] leading-[1.05] mb-6 max-w-3xl">
                The truth about AI.
                <br />
                <em className="italic text-primary font-normal">No hype. No fear. Just clarity.</em>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8 font-light">
                Most AI content online is panic or propaganda. Neither serves you. This is the honest
                breakdown — for your life, your business, and what comes next.
              </p>
              <div className="flex flex-wrap gap-2 mb-9">
                {TAGS.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/[0.06]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={scrollToPaths}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors"
                >
                  Find your path <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/clarity"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 text-primary px-7 py-3 text-sm font-medium tracking-wide hover:bg-primary/10 transition-colors"
                >
                  Take the 60-sec Clarity Check
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* OPENER */}
          <AnimatedSection>
            <Section label="Let's start here" title="Yes, AI is changing everything. That's not a reason to panic.">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-4">
                I'll be honest the way I am with every client: AI is a significant shift. It's not
                going away. And most people are responding from one of two broken places — full
                fear, or delusional hype.
              </p>
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-4">
                Fear freezes you. Hype empties your wallet on things that don't work. Neither moves
                you forward.
              </p>
              <blockquote className="border-l-2 border-primary pl-5 py-3 my-6 bg-primary/[0.04] rounded-r-md">
                <p className="font-heading italic text-lg md:text-xl text-foreground/90 leading-relaxed">
                  "The people who thrive in the AI era aren't the loudest voices in the room.
                  They're the clearest thinkers."
                </p>
              </blockquote>
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-4">
                My job — whether I'm with a Fortune-500 board or a single mom rebuilding her life —
                is to give you the clarity to make smart decisions. That's what this page is.
              </p>
            </Section>
          </AnimatedSection>

          {/* MYTHS */}
          <MirrorReveal />
          <AnimatedSection>
            <Section label="Myth busting" title="What people are getting wrong about AI right now">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-5">
                These are the myths I hear most. Some are fear-based. Some are hype-based. All cost
                people time, money, or peace of mind.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MYTHS.map((m, i) => (
                  <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-5">
                    <MythBadge kind={m.kind} />
                    <p className="text-sm font-medium text-foreground mt-2 mb-1.5 leading-snug">
                      "{m.claim}"
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{m.truth}</p>
                  </div>
                ))}
              </div>
            </Section>
          </AnimatedSection>

          {/* ENVIRONMENT — fact-cited */}
          <AnimatedSection>
            <Section
              label="The environmental question"
              title="Yes, AI uses energy and water. Here's what's actually true — and what's not."
            >
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-5">
                You've seen the headlines. "Every ChatGPT query drinks a bottle of water." "AI is
                boiling the planet." Some of that is real. Most of it is wildly out of context.
                Here's the honest math — every number cited.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ENVIRONMENT.map((e, i) => (
                  <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-5">
                    <MythBadge kind={e.kind} />
                    <p className="text-sm font-medium text-foreground mt-2 mb-1.5 leading-snug">
                      "{e.claim}"
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{e.truth}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[14px] text-foreground/85 leading-relaxed font-light italic">
                Use AI when it helps you. Vote and pressure your utility on where the power comes
                from. Those are different problems — and pretending they're the same is its own kind
                of dishonesty.
              </p>
              <div className="mt-6 rounded-lg border border-border/30 bg-card/30 p-4">
                <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/80 mb-2 font-medium">
                  Sources
                </p>
                <ol className="space-y-1.5">
                  {ENVIRONMENT_SOURCES.map((s) => (
                    <li key={s.n} className="text-[12px] text-muted-foreground leading-relaxed">
                      <span className="text-primary/80 mr-1.5">[{s.n}]</span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline-offset-2 hover:underline"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </Section>
          </AnimatedSection>

          {/* STRENGTHS / WEAKNESSES */}
          <AnimatedSection>
            <Section label="The real picture" title="What AI is actually good at — and where it still fails">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-5">
                The balanced truth most AI content skips. Knowing both sides makes you dangerous in
                the best way.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/40 bg-card/40 p-6">
                  <p className="text-[11px] tracking-[0.12em] uppercase text-emerald-400/90 mb-4 font-medium">
                    Where AI genuinely helps
                  </p>
                  <ul className="space-y-2">
                    {STRENGTHS.map((s) => (
                      <li key={s} className="text-sm text-foreground/85 flex gap-2.5">
                        <span className="text-emerald-400/80 mt-0.5">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/40 bg-card/40 p-6">
                  <p className="text-[11px] tracking-[0.12em] uppercase text-rose-400/90 mb-4 font-medium">
                    Where AI consistently falls short
                  </p>
                  <ul className="space-y-2">
                    {WEAKNESSES.map((w) => (
                      <li key={w} className="text-sm text-foreground/85 flex gap-2.5">
                        <span className="text-rose-400/80 mt-0.5">▸</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          </AnimatedSection>

          {/* FEARS */}
          <AnimatedSection>
            <Section label="The fear conversation" title="Let's talk about what you're actually afraid of">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-5">
                The fear is real. Most of it is fed by incomplete information. Here's what I hear
                most — and the honest truth behind it.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FEARS.map((f, i) => (
                  <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-5">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-primary mb-2 font-medium">
                      Fear
                    </p>
                    <p className="text-sm font-medium text-foreground mb-1.5 leading-snug">
                      "{f.fear}"
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{f.truth}</p>
                  </div>
                ))}
              </div>
            </Section>
          </AnimatedSection>

          {/* RED FLAGS */}
          <AnimatedSection>
            <Section label="The AI scam economy" title="What to watch out for — nobody else says this clearly">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-5">
                This might be the most valuable thing on this page. The AI gold rush built a massive
                scam layer. Here's how to spot it.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RED_FLAGS.map((r, i) => (
                  <div key={i} className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-rose-400/90 font-medium">
                      Red flag
                    </span>
                    <p className="text-sm font-medium text-foreground mt-2 mb-1.5 leading-snug">
                      "{r.claim}"
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{r.truth}</p>
                  </div>
                ))}
              </div>
            </Section>
          </AnimatedSection>

          {/* SKILLS */}
          <AnimatedSection>
            <Section label="What actually matters now" title="The skills AI makes more valuable, not less">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-5">
                Certain human skills are becoming more valuable precisely because AI exists. Develop
                these on purpose.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SKILLS.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 text-center"
                  >
                    <p className="text-sm font-medium text-foreground mb-1.5">{s.name}</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{s.why}</p>
                  </div>
                ))}
              </div>
            </Section>
          </AnimatedSection>

          {/* TRUST */}
          <AnimatedSection>
            <Section
              label="Why people trust this room"
              title="What I'll never do — and what I promise instead"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TRUST_PILLARS.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-xl border border-border/40 bg-card/40 p-5 flex flex-col"
                  >
                    <p.icon className="h-5 w-5 text-primary mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-foreground mb-1.5 leading-snug">{p.title}</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                ))}
              </div>

              {/* F.O.C.U.S. bridge — mindset/life coaching tie-in */}
              <div className="mt-7 rounded-2xl border border-primary/25 bg-primary/[0.04] p-6 md:p-7">
                <p className="text-[13px] md:text-[14px] text-foreground/90 leading-relaxed font-light mb-5">
                  Mindset isn't a separate program. It lives inside{" "}
                  <span className="text-primary font-medium">Uplift</span> (rebuild your inner
                  operating system) and{" "}
                  <span className="text-primary font-medium">Support</span> (have a coach in your
                  corner when the work gets hard). Both are pillars of the F.O.C.U.S. framework —
                  not paywalled add-ons.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["U", "S"] as const).map((key) => (
                    <Link
                      key={key}
                      to={`/modules?pillar=${key}`}
                      className="group flex items-start gap-3 rounded-xl border border-border/40 bg-card/40 p-4 transition-all hover:border-primary/40 hover:bg-card/60"
                    >
                      <span
                        className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[12px] font-medium"
                        style={{
                          color: FOCUS_PILLARS[key].color,
                          background: `color-mix(in srgb, ${FOCUS_PILLARS[key].color} 18%, transparent)`,
                        }}
                      >
                        {key}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {FOCUS_PILLARS[key].full}
                          </p>
                          <ArrowRight
                            className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                            strokeWidth={1.5}
                          />
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          {FOCUS_PILLARS[key].description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Section>
          </AnimatedSection>

          {/* COACH KAY'S TOOL PICKS */}
          <AnimatedSection>
            <Section label="What I actually use" title="Coach Kay's tool picks">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-7 max-w-2xl">
                The stack behind every program. Affiliate links are tagged. No tool here gets a
                placement it didn't earn in my own workflow first.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                {TOOL_PICKS.map((tool) => (
                  <ToolPickCard key={tool.name} tool={tool} />
                ))}
              </div>
              <p className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                <Wrench className="h-3.5 w-3.5" strokeWidth={1.5} />
                Updated as my stack changes — not when a vendor pays
              </p>
            </Section>
          </AnimatedSection>

          {/* THE THREE PATHS — conversion engine */}
          <AnimatedSection>
            <div ref={pathsRef} className="scroll-mt-28">
              <Section
                label="Your next step"
                title="Three paths. Pick the one that matches where you actually are."
              >
                <p className="text-[15px] text-muted-foreground leading-[1.8] font-light mb-7">
                  Personal, business, or full transformation. Each path is a real product with a
                  real price. Start small or go deep — but start.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {PATHS.map((p) => (
                    <OfferCard key={p.title} {...p} />
                  ))}
                </div>
              </Section>
            </div>
          </AnimatedSection>

          {/* FINAL CTA */}
          <AnimatedSection>
            <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-[hsl(210_40%_6%)] to-[hsl(210_40%_8%)] px-7 py-12 md:px-14 md:py-16 text-center">
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-5" strokeWidth={1.5} />
              <p className="text-[11px] tracking-[0.2em] uppercase text-primary mb-3">
                You've done the reading
              </p>
              <h2 className="font-heading font-light text-foreground text-3xl md:text-[2.4rem] leading-tight mb-4 max-w-2xl mx-auto">
                Still unsure where you fit? <em className="italic text-primary">Take 60 seconds.</em>
              </h2>
              <p className="text-muted-foreground text-base mb-8 max-w-xl mx-auto font-light leading-relaxed">
                The Clarity Check asks one honest question, then tells you exactly which path is
                yours. No email gate. No upsell.
              </p>
              <Link
                to="/clarity"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors"
              >
                Start the Clarity Check <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-primary/60 tracking-wider mt-6 uppercase">
                Truth over hype. Always.
              </p>
            </section>
          </AnimatedSection>
        </div>
      </main>


    </>
  );
}

/* — Shared section shell ———————————————————————————————— */
function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm px-6 py-8 md:px-10 md:py-12 mb-8">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-primary mb-3">{label}</p>
      <h2 className="font-heading font-light text-foreground text-[1.7rem] md:text-[2.1rem] leading-[1.15] mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function MythBadge({ kind }: { kind: "false" | "nuanced" | "true" }) {
  const map = {
    false: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    nuanced: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    true: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  } as const;
  return (
    <span
      className={`inline-block text-[9px] font-medium tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border ${map[kind]}`}
    >
      {kind === "false" ? "False" : kind === "nuanced" ? "Nuanced" : "True"}
    </span>
  );
}
