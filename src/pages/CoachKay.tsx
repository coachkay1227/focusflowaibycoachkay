import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Star, Award, Users, BookOpen, ExternalLink, Briefcase, Heart, Layers } from "lucide-react";
import coachKayImg from "@/assets/coach-kay.jpeg";
import { webPage, breadcrumb } from "@/lib/seo-schema";
import MobileNav from "@/components/MobileNav";
import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Sheila",
    text: "I joined the cohort thinking I needed another productivity system. Coach Kay showed me I needed focus. By week two the noise was gone — I knew exactly which one thing to protect every morning.",
    role: "Cohort Member · Reset 30",
    pillar: "F · FOCUS",
  },
  {
    name: "Starr",
    text: "Coach Kay made AI feel like a journal that actually answers back. The Clarity Check named the pattern I'd been dancing around for years in one paragraph. That's when I stopped second-guessing and started building.",
    role: "Life Coaching Client · Transformation 90",
    pillar: "C · CLARITY  ·  U · UPLEVEL",
  },
  {
    name: "Buzz",
    text: "I'm not techy. Coach Kay walked me through AI like a friend, not a manual. Three weeks in I had a workflow I actually own — not one I rented from a YouTube video.",
    role: "Founder · AI Simplified Track",
    pillar: "O · OWNERSHIP  ·  S · SUSTAIN",
  },
  {
    name: "Renee",
    text: "Forward Focus met my family where we were after my brother came home. No judgment, real tools, and a community that actually understood reentry. We finally felt seen.",
    role: "Community Member · Forward Focus Elevation",
    pillar: "S · SUSTAIN",
  },
];

const credentials = [
  { icon: Award, label: "5x Certified Life & Transformation Coach" },
  { icon: BookOpen, label: "Mindfulness & Goal-Setting Specialist" },
  { icon: Star, label: "Life Purpose Coaching Certification" },
  { icon: Users, label: "Accredited Consultant Strategist" },
];

const recognitions = [
  "Woman-Owned Business",
  "COED Workforce Partner",
  "Columbus Chamber Member",
  "WIOA-Aligned Programs",
];

const CoachKay = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead
        title="Meet Coach Kay — AI & Life Transformation Coach | FocusFlow AI"
        description="Kenza Alaoui (Coach Kay) — founder of Coach Kay Elevates (for-profit workforce & AI literacy) and Forward Focus Elevation (nonprofit support for justice-impacted families). Pattern-aware coaching that blends AI with human insight."
        path="/coach-kay"
        jsonLd={[
          webPage("/coach-kay", "Coach Kay", "AboutPage"),
          breadcrumb(
            [
              { name: "Home", path: "/" },
              { name: "Coach Kay", path: "/coach-kay" },
            ],
            "/coach-kay"
          ),
        ]}
      />

      {/* Header / Nav */}
      <div className="relative z-20 px-6 md:px-12 py-6 flex items-center justify-between border-b border-border/40">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span>
          <span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Photo */}
            <AnimatedSection>
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/20 blur-lg" />
                <img
                  src={coachKayImg}
                  alt="Coach Kay — Kenza Alaoui, AI & Life Transformation Coach"
                  className="relative rounded-2xl object-cover shadow-2xl w-full"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </AnimatedSection>

            {/* Intro */}
            <AnimatedSection>
              <p className="mb-2 font-sans text-sm uppercase tracking-widest text-primary">
                Meet Your Coach
              </p>
              <h1 className="mb-4 font-heading text-4xl font-bold leading-tight md:text-5xl">
                Coach Kay
              </h1>
              <p className="mb-2 text-lg text-muted-foreground">
                Kenza Alaoui — AI &amp; Life Transformation Coach
              </p>
              <p className="mb-6 text-foreground/80 leading-relaxed">
                Warm but direct. Emotionally intelligent. Pattern-aware. Coach Kay
                doesn't sugarcoat, but she never shames. She sees people deeply and
                speaks truth with care — blending cutting-edge AI technology with
                genuine human insight to help you find clarity, alignment, and
                intentional action.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.open("https://coachkayelevates.org/", "_blank", "noopener,noreferrer")}
                >
                  Book a session with Kay <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-foreground hover:bg-primary/10"
                  onClick={() => navigate("/clarity")}
                >
                  Free Clarity Check
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* TWO HATS — Collective AI positioning */}
      <section id="two-hats" className="py-12 md:py-16 bg-secondary/10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <AnimatedSection>
            <div className="rounded-2xl border border-primary/25 bg-card/40 backdrop-blur-sm p-7 md:p-9">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <span className="font-mono-label text-primary tracking-[0.22em] text-[10px]">
                  TWO HATS · ONE MISSION
                </span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-3">
                Coach Kay is both the coach and the builder.
              </h2>
              <p className="text-[15px] text-muted-foreground leading-[1.8]">
                As <strong className="text-foreground/85">Coach Kay</strong>, she leads 1:1 coaching and programs — solo and high-touch.
                As <strong className="text-foreground/85">Operations Architect &amp; Lead Developer at Collective AI</strong>, she leads
                the multidisciplinary team that ships enterprise builds, automations, and AI systems.
              </p>
              <Link
                to="/collective"
                className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
              >
                Meet the Collective <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Bio */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="mb-8 text-center font-heading text-3xl font-bold">
              The Story Behind the Mission
            </h2>
            <div className="space-y-5 text-foreground/80 leading-relaxed">
              <p>
                Coach Kay is a Columbus-based founder, 5x certified life coach,
                full-time banking professional, and single mom to a daughter with
                autism. Her frameworks weren't built in a classroom — they were
                built in the margins of a real life, for people doing the same.
              </p>
              <p>
                She leads two parallel missions. <strong>Coach Kay Elevates</strong>{" "}
                is her for-profit workforce-readiness and AI-literacy program — a
                COED partner serving working families across Central Ohio with
                cohort-based learning, live sessions, and pilot programs for
                organizations. <strong>Forward Focus Elevation</strong> is her
                separate nonprofit, providing trauma-informed, income-based
                support for justice-impacted families and crime victims and
                survivors.
              </p>
              <p>
                Her approach across both: balance empathy with accountability,
                connect emotions to patterns to actions, and make AI simple
                enough that anyone can use it to build momentum that sticks.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {recognitions.map((r) => (
                <span
                  key={r}
                  className="font-mono-label text-primary/80 tracking-[0.18em] text-[10px] px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5"
                >
                  {r}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="mb-12 text-center font-heading text-3xl font-bold">
              Credentials &amp; Expertise
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map(({ icon: Icon, label }, i) => (
              <AnimatedSection key={label} delay={i * 100}>
                <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimatedSection>
            <h2 className="mb-4 text-center font-heading text-3xl font-bold">
              What Clients Say
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
              Real stories from people who've worked with Coach Kay to find
              clarity and take action.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 100}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="mb-4 flex-1 text-foreground/80 italic leading-relaxed">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                    <p className="font-mono-label text-primary/80 tracking-[0.2em] text-[10px] mt-2">
                      {t.pillar}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Where this work lives — two brands */}
      <section className="bg-secondary/20 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AnimatedSection>
            <p className="text-center font-mono-label text-primary tracking-[0.2em] mb-3">
              TWO MISSIONS · ONE COACH
            </p>
            <h2 className="mb-4 text-center font-heading text-3xl font-bold">
              Where Coach Kay's Work Lives
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              Coach Kay leads two distinct organizations. Each operates
              independently with its own programs, terms, and privacy practices.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedSection>
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-mono-label text-primary tracking-[0.2em] text-[10px]">
                    FOR-PROFIT · COLUMBUS, OH
                  </span>
                </div>
                <h3 className="font-heading text-2xl mb-2">Coach Kay Elevates</h3>
                <p className="text-sm text-muted-foreground mb-2">Workforce Readiness &amp; AI Literacy</p>
                <p className="text-foreground/80 leading-relaxed flex-1 mb-6">
                  Structured cohort program helping working families build AI
                  literacy, career-ready skills, and sustainable momentum. COED
                  partner. WIOA-aligned. Pilot programs available for
                  organizations and public-sector partners.
                </p>
                <a
                  href="https://coachkayelevates.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit coachkayelevates.org (opens in a new tab)"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Visit coachkayelevates.org <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-mono-label text-primary tracking-[0.2em] text-[10px]">
                    NONPROFIT · JUSTICE-IMPACTED FAMILIES
                  </span>
                </div>
                <h3 className="font-heading text-2xl mb-2">Forward Focus Elevation</h3>
                <p className="text-sm text-muted-foreground mb-2">Trauma-Informed Family Support</p>
                <p className="text-foreground/80 leading-relaxed flex-1 mb-4">
                  AI-enhanced, trauma-informed, income-based support for
                  justice-impacted families and crime victims and survivors.
                  Free learning community, peer support, and crisis resources.
                </p>
                <p className="text-[11px] text-muted-foreground/70 mb-6 border-l-2 border-primary/30 pl-3">
                  In crisis? Call <a href="tel:911" className="underline">911</a> · Community help{" "}
                  <a href="tel:211" className="underline">211</a> · Mental health{" "}
                  <a href="tel:988" className="underline">988</a> · Text <strong>HOME</strong> to <strong>741741</strong>
                </p>
                <a
                  href="https://forward-focus-elevation.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit forward-focus-elevation.org (opens in a new tab)"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Visit forward-focus-elevation.org <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </AnimatedSection>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground/70 max-w-2xl mx-auto">
            Forward Focus Elevation is a separate nonprofit entity. Donations and
            program participation are governed by that organization's own terms
            and privacy policy. Coach Kay Elevates is a for-profit woman-owned
            business.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <AnimatedSection>
            <h2 className="mb-4 font-heading text-3xl font-bold">
              Ready to Get Unstuck?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Start with a free Clarity Check — no sign-up required — and see
              what Coach Kay's approach can reveal about where you are and where
              you're headed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/clarity")}
              >
                Free Clarity Check <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-foreground hover:bg-primary/10"
                onClick={() => navigate("/community")}
              >
                Join the Community
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default CoachKay;
