import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PricingSection from "@/components/PricingSection";
import { getPublicPrograms } from "@/data/programs";
import { webPage, breadcrumb, offerCatalog } from "@/lib/seo-schema";
import { getFaqLane, faqPageSchema } from "@/data/faqs";
import coachKayPortrait from "@/assets/coach-kay.jpeg";
import { trackEvent } from "@/lib/analytics";
import SocialProofCounter from "@/components/SocialProofCounter";

const Index = () => {
  const navigate = useNavigate();
  useAuth();
  // Start fully visible so hero content appears immediately above the fold
  // (no animation gating). Transitions still apply on subsequent re-renders.
  const [phase, setPhase] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhase(4);
  }, []);

  useMouseGlow(containerRef);

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay grid-overlay">
      <SEOHead
        title="FocusFlow AI — AI-Powered Clarity Coaching by Coach Kay"
        description="Master Certified Life Coach meets AI. Get clarity in 90 seconds, transform in 30 days. Free clarity session, AI business audit, and 1:1 coaching programs by Coach Kay."
        path="/"
        keywords={[
          "AI clarity coaching",
          "AI business coaching Columbus",
          "small business automation Ohio",
          "Coach Kay AI",
          "clarity coaching for entrepreneurs",
          "AI transformation starter kit",
          "Claude AI business training",
        ]}
        jsonLd={[
          webPage("/", "Home"),
          breadcrumb([{ name: "Home", path: "/" }], "/"),
          offerCatalog(getPublicPrograms()),
          faqPageSchema(getFaqLane("clarity")?.items ?? []),
        ]}
      />
      {/* Mouse glow */}
      <div className="mouse-glow" />

      {/* Floating orbs */}
      <FloatingOrbs />

      {/* Brand watermark */}
      <div
        className="animate-brand-pulse"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(3)",
          fontSize: "6rem",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          color: "hsl(var(--primary) / 0.04)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        FOCUSFLOW AI
      </div>

      {/* Global navigation — single source of truth across all pages */}
      <div className="md:hidden relative z-10 flex items-center justify-end px-6 py-4">
        <MobileNav />
      </div>

      {/* Hero — Editorial Asymmetry (60/40) */}
      <section className="relative z-10 px-4 md:px-8 pb-6 md:pt-20">
        <div className="w-full max-w-7xl mx-auto relative overflow-hidden border border-foreground/5 bg-background/40 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col md:flex-row min-h-[78vh]">
            {/* 60% — Content */}
            <div className="w-full md:w-[60%] p-8 md:p-14 lg:p-20 flex flex-col justify-center relative">
              {/* Vertical decorative line */}
              <div
                className="absolute left-4 md:left-8 top-12 bottom-12 w-px pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.3), transparent)",
                }}
                aria-hidden="true"
              />

              <div
                className="space-y-7 md:space-y-9"
                style={{
                  opacity: phase >= 2 ? 1 : 0,
                  transform: phase >= 2 ? "translateY(0)" : "translateY(30px)",
                  transition: "all 1.2s ease-out",
                  willChange: "transform, opacity",
                }}
              >
                <span className="block font-mono-label text-primary tracking-[0.4em] text-[10px] font-bold uppercase">
                  Clarity Code by Coach Kay
                </span>

                <h1
                  className="font-heading text-4xl md:text-6xl lg:text-7xl font-light leading-[1.05] text-foreground"
                  style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.12)" }}
                >
                  For high-achievers stuck in <span className="italic">decision loops</span>: get one clear next move in{" "}
                  <span className="text-primary">90 seconds.</span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                  No planner. No journal. No coaching call. Six honest questions and a personalized Clarity Code from
                  Master Certified Coach Kay.
                </p>

                <div className="pt-2 flex flex-col gap-10">
                  {/* CTA with gold halo */}
                  <button
                    type="button"
                    onClick={() => navigate("/clarity")}
                    className="group relative w-fit"
                    aria-label="Get My Clarity Code"
                  >
                    <span
                      className="absolute -inset-3 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "hsl(var(--primary) / 0.25)" }}
                      aria-hidden="true"
                    />
                    <span className="relative inline-flex items-center gap-2 bg-primary text-primary-foreground px-9 py-5 rounded-full font-bold text-sm tracking-[0.05em] uppercase transition-transform duration-300 group-hover:-translate-y-0.5">
                      <Sparkles className="h-4 w-4" />
                      Get My Clarity Code
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">Free to start · No credit card required</p>
                  <SocialProofCounter />

                  {/* Trust strip */}
                  <div className="flex flex-wrap items-center gap-6 md:gap-8 border-t border-foreground/10 pt-6 md:pt-8">
                    <div className="space-y-1">
                      <p className="font-mono-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                        Level
                      </p>
                      <p className="font-heading text-lg italic text-foreground">Master Certified</p>
                    </div>
                    <div className="w-px h-8 bg-foreground/10" aria-hidden="true" />
                    <div className="space-y-1">
                      <p className="font-mono-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                        Experience
                      </p>
                      <p className="text-sm font-medium text-foreground">600+ Hours</p>
                    </div>
                    <div className="w-px h-8 bg-foreground/10" aria-hidden="true" />
                    <div className="space-y-1">
                      <p className="font-mono-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                        Framework
                      </p>
                      <p className="text-sm font-medium text-foreground">3 Paths</p>
                    </div>
                  </div>

                  {/* Friction reversal */}
                  <div className="inline-flex items-center gap-2 font-mono-label text-primary/80 tracking-[0.15em] text-[11px]">
                    <Zap className="h-3.5 w-3.5" />
                    Takes 90 seconds · No signup · No card · Just clarity
                  </div>
                </div>
              </div>
            </div>

            {/* 40% — Portrait */}
            <div className="w-full md:w-[40%] relative bg-navy-deep overflow-hidden group min-h-[50vh] md:min-h-0">
              {/* Overlays */}
              {/* Top fade — masks any white edge in the source asset */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 14%)",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 55%)",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                style={{ background: "hsl(var(--primary) / 0.05)" }}
                aria-hidden="true"
              />

              {/* Portrait */}
              <img
                src={coachKayPortrait}
                alt="Coach Kay — Master Certified Life Coach"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={1200}
                height={1500}
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1200ms] ease-in-out"
                style={{
                  opacity: phase >= 2 ? 1 : 0,
                  objectPosition: "center 20%",
                  transition: "opacity 1.4s ease-out, filter 1.2s ease-in-out",
                }}
              />

              {/* Gold frame */}
              <div
                className="absolute inset-6 md:inset-8 border z-20 pointer-events-none transition-all duration-[1200ms] ease-in-out group-hover:inset-7 md:group-hover:inset-10"
                style={{ borderColor: "hsl(var(--primary) / 0.25)" }}
                aria-hidden="true"
              />

              {/* Soft glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none animate-brand-pulse"
                style={{ background: "hsl(var(--primary) / 0.12)" }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Next-act indicator */}
          <div className="h-16 md:h-20 border-t border-foreground/5 flex items-center justify-between px-6 md:px-12 bg-card/40">
            <div className="flex items-center gap-4 md:gap-6">
              <span className="font-heading text-2xl italic text-primary/80">01</span>
              <span className="font-mono-label text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 font-bold">
                The Core Methodology
              </span>
            </div>
            <a
              href="#how-it-works"
              className="group flex items-center gap-3 md:gap-4 text-muted-foreground/60 hover:text-primary transition-colors"
            >
              <span className="font-mono-label text-[9px] tracking-[0.2em] uppercase font-bold">Scroll to Begin</span>
              <span
                className="w-10 md:w-12 h-px bg-current transition-all duration-500 group-hover:w-16"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </section>

      {/* ── PATH FORK — Where are you stuck? ─────────────────────────────── */}
      <section className="relative z-10 px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono-label text-primary tracking-[0.2em] text-center mb-6 text-xs">
            WHERE DO YOU WANT TO START?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card A — Clarity / Thinking lane */}
            <button
              onClick={() => navigate("/modules")}
              className="group relative text-left p-8 border border-primary/20 bg-background/60 backdrop-blur-sm hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="font-mono-label text-primary text-xs tracking-[0.2em] mb-3 block">PATH A · CLARITY</span>
              <h3 className="font-heading text-xl md:text-2xl font-light text-foreground mb-3 leading-tight">
                My thinking is foggy —<br />I need clarity &amp; direction.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Decisions, focus, and mental clarity. Start with the F.O.C.U.S. framework and find your next move in 90
                seconds.
              </p>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                Start the Clarity Check
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </button>

            {/* Card B — AI Systems lane */}
            <button
              onClick={() => navigate("/rent-an-agent")}
              className="group relative text-left p-8 border border-foreground/10 bg-background/40 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="font-mono-label text-foreground/40 text-xs tracking-[0.2em] mb-3 block">
                PATH B · AI SYSTEMS
              </span>
              <h3 className="font-heading text-xl md:text-2xl font-light text-foreground mb-3 leading-tight">
                My business systems need AI —<br />I need to automate &amp; scale.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                AI-powered systems, workflows, and builds. Explore the tools and services that run Coach Kay's client
                engine.
              </p>
              <span className="inline-flex items-center gap-2 text-foreground/60 text-sm font-medium group-hover:text-primary group-hover:gap-3 transition-all">
                Explore AI Systems
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Start Here — Free */}
      <section className="relative z-10 py-16 md:py-20 px-6">
        <AnimatedSection className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-mono-label text-primary tracking-[0.2em]">START HERE · FREE</span>
            <h2
              className="font-heading text-3xl md:text-5xl font-light mt-4"
              style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
            >
              Find Your Path in 5 Minutes.
            </h2>
          </div>
        </AnimatedSection>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "01 · CLARITY",
              title: "F.O.C.U.S. Clarity Check",
              focus: "Best for mindset clarity and direction",
              desc: "6 questions · ~3 min. Personalized AI clarity report from Coach Kay.",
              cta: "Take the Check",
              to: "/clarity",
              primary: true,
            },
            {
              label: "02 · ASSESSMENT",
              title: "Business Clarity Assessment",
              focus: "Best for growth-stage owners",
              desc: "18 questions · ~5 min. Discover your Mind · Action · Character archetype.",
              cta: "Take the Assessment",
              to: "/assessment",
              primary: false,
            },
            {
              label: "03 · DOWNLOAD",
              title: "AI Transformation Starter Kit",
              focus: "Best for practical AI automation plans",
              desc: "4 questions · ~2 min. Instant AI Quick Start Report for your business.",
              cta: "Download Free",
              to: "/starter-kit",
              primary: false,
            },
          ].map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 100}>
              <div className="clarity-card h-full rounded-lg border border-border bg-card/40 backdrop-blur-sm p-5 flex flex-col">
                <h4 className="font-mono-label text-[10px] tracking-wider text-primary/70">{item.label}</h4>
                <h3 className="font-heading text-lg font-medium text-foreground mt-2">{item.title}</h3>
                <h5 className="text-[11px] uppercase tracking-[0.14em] text-primary/80 mt-2">{item.focus}</h5>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2 flex-1">{item.desc}</p>
                <Button
                  onClick={() => {
                    void trackEvent(
                      "path_card_clicked",
                      { card: item.label, title: item.title, to: item.to },
                      item.to === "/clarity" ? "personal" : item.to === "/assessment" ? "business" : "ai",
                    );
                    navigate(item.to);
                  }}
                  size="sm"
                  variant={item.primary ? "default" : "outline"}
                  className={
                    item.primary
                      ? "mt-4 bg-primary text-primary-foreground hover:bg-primary/90 self-start"
                      : "mt-4 border-border hover:border-primary/40 text-foreground hover:text-primary self-start"
                  }
                >
                  {item.cta}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* F.O.C.U.S. Framework */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono-label text-primary tracking-[0.2em]">THE FRAMEWORK</span>
            <h2
              className="font-heading text-3xl md:text-5xl font-light mt-4"
              style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
            >
              Your F.O.C.U.S. Journey
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every module, challenge, and coaching session maps to one of five transformational pillars. This is your
              roadmap, not a course, a life system.
            </p>
          </div>
        </AnimatedSection>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              step: "01",
              letter: "F",
              name: "Foundation",
              desc: "Identity, mindset, and inner work. Clearing what's holding you back so you can build on solid ground.",
              tag: "Core Inner Work",
              highlight: false,
            },
            {
              step: "02",
              letter: "O",
              name: "Opportunity",
              desc: "Recognizing open doors, aligning with purpose, and shifting from survival mode to strategic clarity.",
              tag: "Vision & Direction",
              highlight: false,
            },
            {
              step: "03",
              letter: "C",
              name: "Create",
              desc: "Taking aligned action, designing your life by intention, and building what you were made to build.",
              tag: "The Turning Point",
              highlight: true,
            },
            {
              step: "04",
              letter: "U",
              name: "Uplift",
              desc: "Elevating your standards, habits, and environment. Becoming the version of yourself that sustains success.",
              tag: "Habits & Growth",
              highlight: false,
            },
            {
              step: "05",
              letter: "S",
              name: "Support",
              desc: "Community, accountability, and ongoing coaching. You don't grow alone. This is where it compounds.",
              tag: "Community + Coaching",
              highlight: false,
            },
          ].map((item, i) => (
            <AnimatedSection key={item.letter} delay={i * 100}>
              <div
                className={`clarity-card rounded-lg backdrop-blur-sm p-6 h-full flex flex-col border ${
                  item.highlight ? "border-primary/60 bg-card/60" : "border-border bg-card/50"
                }`}
              >
                <span className="font-mono-label text-primary/60 text-xs">{item.step}</span>
                <div
                  className={`mt-3 font-heading text-4xl font-light ${item.highlight ? "text-primary" : "text-foreground"}`}
                >
                  {item.letter}
                </div>
                <h3
                  className={`font-heading text-lg font-medium mt-1 mb-3 ${item.highlight ? "text-primary" : "text-foreground"}`}
                >
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{item.desc}</p>
                <button
                  type="button"
                  tabIndex={-1}
                  className="mt-4 inline-block font-mono-label tracking-wider text-muted-foreground border border-border/60 rounded-full px-2.5 py-1 self-start uppercase whitespace-nowrap transition-colors duration-200 hover:text-primary hover:border-primary/60"
                  style={{ fontSize: "0.65rem" }}
                >
                  {item.tag}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 3 Paths to Transformation */}
      <PricingSection />

      {/* Social Proof */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono-label text-primary tracking-[0.2em]">Transformations</span>
            <h2
              className="font-heading text-3xl md:text-5xl font-light mt-4"
              style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
            >
              What they're saying
            </h2>
          </div>
        </AnimatedSection>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "I joined the cohort thinking I needed another productivity system. Coach Kay showed me I needed focus. By week two the noise was gone. I knew exactly which one thing to protect every morning.",
              name: "Sheila",
              role: "Cohort Member · Reset 30",
              pillar: "F · FOCUS",
            },
            {
              quote:
                "Coach Kay made AI feel like a journal that actually answers back. The Clarity Check named the pattern I'd been dancing around for years, in one paragraph. That's when I stopped second-guessing and started building.",
              name: "Starr",
              role: "Life Coaching Client · Transformation 90",
              pillar: "C · CLARITY  ·  U · UPLEVEL",
            },
            {
              quote:
                "I'm not techy. Coach Kay walked me through AI like a friend, not a manual. Three weeks in I had a workflow I actually own, not one I rented from a YouTube video.",
              name: "Buzz",
              role: "Founder · AI Simplified Track",
              pillar: "O · OWNERSHIP  ·  S · SUSTAIN",
            },
          ].map((item, i) => (
            <AnimatedSection key={item.name} delay={i * 120} className="h-full">
              <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 flex flex-col h-full">
                <p className="text-foreground/90 text-sm leading-relaxed italic flex-1">"{item.quote}"</p>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="font-medium text-sm text-foreground">{item.name}</p>
                  <p className="font-mono-label text-muted-foreground/60 mt-1">{item.role}</p>
                  <p className="font-mono-label text-primary/80 tracking-[0.2em] text-[10px] mt-2">{item.pillar}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2
            className="font-heading text-3xl md:text-5xl font-light mb-6"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
          >
            Ready to see clearly?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Your clarity session takes less than 5 minutes. No sign-up. No commitment. Just honest, personalized insight
            from Coach Kay's Clarity Code framework.
          </p>
          <Button
            onClick={() => navigate("/clarity")}
            size="lg"
            className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform text-base px-10 py-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Your Clarity Check
          </Button>
        </AnimatedSection>
      </section>

      {/* Footer */}
    </div>
  );
};

export default Index;
