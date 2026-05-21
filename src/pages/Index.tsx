import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, ArrowRight, User, LogOut, Zap } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PricingSection from "@/components/PricingSection";
import { getPublicPrograms } from "@/data/programs";
import { webPage, breadcrumb, offerCatalog } from "@/lib/seo-schema";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  // Start fully visible so hero content appears immediately above the fold
  // (no animation gating). Transitions still apply on subsequent re-renders.
  const [phase, setPhase] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhase(4);
  }, []);

  useMouseGlow(containerRef);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay grid-overlay">
      <SEOHead
        title="FocusFlow AI — Clarity Coaching by Coach Kay"
        description="See clearly. Move with purpose. Master-certified clarity coaching that helps you cut through mental fog, identify patterns, and take meaningful action."
        path="/"
        jsonLd={[
          webPage("/", "Home"),
          breadcrumb([{ name: "Home", path: "/" }], "/"),
          offerCatalog(getPublicPrograms()),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is a Clarity Check?",
                acceptedAnswer: { "@type": "Answer", text: "A free 5-minute guided self-reflection session that identifies your patterns and provides a personalized clarity report with actionable next steps." },
              },
              {
                "@type": "Question",
                name: "Do I need to sign up to try it?",
                acceptedAnswer: { "@type": "Answer", text: "No. The Clarity Check is completely free with no sign-up required. You can save your results by creating an account afterward." },
              },
              {
                "@type": "Question",
                name: "What is the Mirror Challenge?",
                acceptedAnswer: { "@type": "Answer", text: "A daily guided reflection challenge available in 3, 7, 14, or 30-day formats. Each day includes a specific prompt designed to build self-awareness and lasting change." },
              },
            ],
          },
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
          color: "hsl(43 75% 52% / 0.04)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        FOCUSFLOW AI
      </div>

      {/* Navigation — minimal hero bar: logo + Sign In + single CTA */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="font-heading text-xl md:text-2xl font-light tracking-wide text-foreground" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-primary hover:text-primary/80 transition-colors hidden md:block font-medium"
              >
                Dashboard
              </button>
              <Avatar className="h-8 w-8 border border-primary/30 hidden md:flex">
                <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(user.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hidden md:inline-flex"
            >
              <User className="h-4 w-4 mr-1" /> Sign In
            </Button>
          )}
          <Button
            onClick={() => navigate("/clarity")}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden md:inline-flex"
          >
            Get My Clarity Code
          </Button>
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 pt-4 md:pt-8 text-center">
        {/* Gold line */}
        <div
          className="mb-8"
          style={{
            width: "min(80vw, 400px)",
            height: 1,
            background: "linear-gradient(90deg, transparent, hsl(43 75% 52% / 0.6), transparent)",
            transform: phase >= 1 ? "scaleX(1)" : "scaleX(0)",
            transition: "transform 0.6s ease-out",
            willChange: "transform",
          }}
        />

        {/* Label */}
        <div
          className="font-mono-label text-primary mb-6 tracking-[0.2em]"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.1s",
          }}
        >
          Clarity Code by Coach Kay
        </div>

        {/* Headline — direct-response: audience + pain + outcome + timeframe */}
        <h1
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-light leading-tight max-w-4xl"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            filter: phase >= 2 ? "blur(0)" : "blur(12px)",
            transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease-out",
            willChange: "transform, opacity, filter",
            textShadow: "0 0 40px hsl(43 75% 52% / 0.15)",
          }}
        >
          For high-achievers stuck in decision loops:
          <br />
          <span className="text-primary">get one clear next move in 90 seconds.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0) scale(1)" : "translateY(15px) scale(0.95)",
            transition: "all 0.6s ease-out",
          }}
        >
          No planner. No journal. No coaching call. Six honest questions and a personalized Clarity Code from Master Certified Coach Kay.
        </p>

        {/* Single CTA */}
        <div
          className="mt-10 flex justify-center"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0) scale(1)" : "translateY(15px) scale(0.95)",
            transition: "all 0.6s ease-out 0.15s",
          }}
        >
          <Button
            onClick={() => navigate("/clarity")}
            size="lg"
            className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform text-base px-10 py-7"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Get My Clarity Code
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Proof line */}
        <p
          className="mt-6 text-sm text-foreground/70 max-w-md text-center"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transition: "opacity 0.8s ease-out",
          }}
        >
          Trusted by early-access founders and coaches rebuilding their focus.
        </p>

        {/* Friction reversal */}
        <div
          className="mt-4 inline-flex items-center gap-2 font-mono-label text-primary/80 tracking-[0.15em] text-xs"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transition: "opacity 1s ease-out",
          }}
        >
          <Zap className="h-3.5 w-3.5" />
          Takes 90 seconds · No signup · No card · Just clarity
        </div>
      </section>

      {/* Credentials Bar */}
      <section className="relative z-10 py-8 px-6">
        <AnimatedSection className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
            {[
              "Master Certified Life Coach",
              "600+ Coaching Hours",
              "3 Transformation Paths",
              "Founding Cohort Waitlist Open",
            ].map((cred, i) => (
              <div key={cred} className="flex items-center gap-4 md:gap-8">
                <span className="font-mono-label text-[11px] tracking-wider text-primary/90 opacity-70">{cred}</span>
                {i < 3 && <span className="hidden md:inline text-primary/20">|</span>}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Start Here — Free */}
      <section className="relative z-10 py-16 md:py-20 px-6">
        <AnimatedSection className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-mono-label text-primary tracking-[0.2em]">START HERE — FREE</span>
            <h2
              className="font-heading text-3xl md:text-5xl font-light mt-4"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
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
              desc: "Answer 6 questions. Get your personalized clarity report.",
              cta: "Take the Check",
              to: "/clarity",
              primary: true,
            },
            {
              label: "02 · ASSESSMENT",
              title: "Business Clarity Assessment",
              desc: "Discover how your mindset, action, and character drive your business.",
              cta: "Take the Assessment",
              to: "/assessment",
              primary: false,
            },
            {
              label: "03 · DOWNLOAD",
              title: "AI Transformation Starter Kit",
              desc: "A free download to kickstart your AI-powered business transformation.",
              cta: "Download Free",
              to: "/programs/kpi-roi-tracker",
              primary: false,
            },
          ].map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 100}>
              <div className="clarity-card h-full rounded-lg border border-border bg-card/40 backdrop-blur-sm p-5 flex flex-col">
                <span className="font-mono-label text-[10px] tracking-wider text-primary/70">
                  {item.label}
                </span>
                <h3 className="font-heading text-lg font-medium text-foreground mt-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2 flex-1">{item.desc}</p>
                <Button
                  onClick={() => navigate(item.to)}
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
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
            >
              Your F.O.C.U.S. Journey
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every module, challenge, and coaching session maps to one of five transformational pillars. This is your
              roadmap — not a course, a life system.
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
              desc: "Community, accountability, and ongoing coaching. You don't grow alone — this is where it compounds.",
              tag: "Community & Coaching",
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
                  className="mt-4 inline-block font-mono-label tracking-wider text-muted-foreground border border-border/60 rounded-full px-3 py-1 self-start uppercase transition-colors duration-200 hover:text-primary hover:border-primary/60"
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
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
            >
              What they're saying
            </h2>
          </div>
        </AnimatedSection>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "I've done therapy, journaling, meditation — but this 5-minute session showed me a pattern I'd been blind to for years.",
              name: "Aisha M.",
              role: "Creative Director",
            },
            {
              quote:
                "The Mirror Challenge rewired how I start my mornings. Day 4 broke something open in me. I'm not the same person I was a week ago.",
              name: "David R.",
              role: "Founder & CEO",
            },
            {
              quote:
                "Coach Kay's voice in the results felt like someone who actually sees me. Not generic advice — real, specific truth.",
              name: "Priya S.",
              role: "Product Designer",
            },
          ].map((item, i) => (
            <AnimatedSection key={item.name} delay={i * 120}>
              <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 flex flex-col h-full">
                <p className="text-foreground/90 text-sm leading-relaxed italic flex-1">"{item.quote}"</p>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="font-medium text-sm text-foreground">{item.name}</p>
                  <p className="font-mono-label text-muted-foreground/60 mt-1">{item.role}</p>
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
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
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
      <footer className="relative z-10 py-12 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
              <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>{" "}
              <span className="text-muted-foreground/40 text-sm">by Coach Kay</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground/60 flex-wrap justify-center">
              <button onClick={() => navigate("/clarity")} className="hover:text-foreground transition-colors">
                Clarity Session
              </button>
              <button onClick={() => navigate("/modules")} className="hover:text-foreground transition-colors">
                Modules
              </button>
              <button onClick={() => navigate("/challenges")} className="hover:text-foreground transition-colors">
                Challenges
              </button>
              <button onClick={() => navigate("/coach")} className="hover:text-foreground transition-colors">
                AI Coach
              </button>
              <button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">
                About
              </button>
              <button onClick={() => navigate("/community")} className="hover:text-foreground transition-colors">
                Community
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground/40 space-y-1">
            <p>Master Certified Life Coach · Coach Kay</p>
            <p>&copy; {new Date().getFullYear()} FocusFlow Elevation · Shield Her Elevation LLC</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
