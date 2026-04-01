import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Eye, Lightbulb, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 700),
      setTimeout(() => setPhase(4), 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    el.addEventListener("mousemove", handler, { passive: true });
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay grid-overlay">
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
        FOCUS FLOW
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="font-heading text-xl md:text-2xl font-light tracking-wide text-foreground">
          <span className="text-primary">Focus</span> Flow
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/modules")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            Modules
          </button>
          <button
            onClick={() => navigate("/challenges")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            Challenges
          </button>
          <button
            onClick={() => navigate("/coach")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            Coach Kay
          </button>
          <button
            onClick={() => navigate("/community")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            Community
          </button>
          <Button
            onClick={() => navigate("/clarity")}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Session
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Gold line */}
        <div
          className="mb-12"
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

        {/* Headline */}
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
          See clearly.
          <br />
          <span className="text-primary">Move with purpose.</span>
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
          An AI-powered clarity experience that helps you cut through the noise,
          identify your patterns, and take your next bold step.
        </p>

        {/* CTA */}
        <div
          className="mt-10 flex flex-col sm:flex-row gap-4"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0) scale(1)" : "translateY(15px) scale(0.95)",
            transition: "all 0.6s ease-out 0.15s",
          }}
        >
          <Button
            onClick={() => navigate("/clarity")}
            size="lg"
            className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform text-base px-8 py-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Begin Your Clarity Check
          </Button>
          <Button
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}
            variant="outline"
            size="lg"
            className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all text-base px-8 py-6"
          >
            How It Works
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Ambient badge */}
        <div
          className="mt-16 font-mono-label text-muted-foreground/50"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transition: "opacity 1s ease-out",
          }}
        >
          5-minute guided session · No sign-up required
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono-label text-primary tracking-[0.2em]">The Process</span>
            <h2 className="font-heading text-3xl md:text-5xl font-light mt-4" style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}>
              Three steps to clarity
            </h2>
          </div>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Eye,
              title: "Reflect",
              desc: "Answer six guided questions designed to cut through surface-level thinking and reach what's really going on.",
              step: "01",
            },
            {
              icon: Lightbulb,
              title: "Reveal",
              desc: "Receive a personalized insight — your truth, your pattern, and your next action — in Coach Kay's direct, warm voice.",
              step: "02",
            },
            {
              icon: Zap,
              title: "Act",
              desc: "Choose your path: continue with AI coaching, book a live session, or start the 7-Day Mirror Challenge.",
              step: "03",
            },
          ].map((item, i) => (
            <AnimatedSection key={item.step} delay={i * 150}>
              <div className="clarity-card rounded-lg border border-border bg-card/50 backdrop-blur-sm p-8 h-full">
                <span className="font-mono-label text-primary/60">{item.step}</span>
                <div className="mt-4 mb-4 w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-light mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <span className="font-mono-label text-primary tracking-[0.2em]">The Insight</span>
          <h2 className="font-heading text-3xl md:text-5xl font-light mt-4 mb-8" style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}>
            What you'll discover
          </h2>
          <div className="space-y-6 text-left">
            {[
              { label: "The Truth", text: "What's really going on beneath the noise — the honest insight you've been avoiding or couldn't see." },
              { label: "The Pattern", text: "The recurring behavior or belief that keeps showing up in your life, keeping you in the same loop." },
              { label: "The Action", text: "One clear, specific next step. Not a to-do list. Not a 90-day plan. Just the one move that changes everything." },
            ].map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 120}>
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 flex gap-6 items-start">
                  <span className="font-mono-label text-primary shrink-0 mt-1">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-heading text-xl font-medium text-primary mb-1">{item.label}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono-label text-primary tracking-[0.2em]">Transformations</span>
            <h2 className="font-heading text-3xl md:text-5xl font-light mt-4" style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}>
              What they're saying
            </h2>
          </div>
        </AnimatedSection>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "I've done therapy, journaling, meditation — but this 5-minute session showed me a pattern I'd been blind to for years.",
              name: "Aisha M.",
              role: "Creative Director",
            },
            {
              quote: "The Mirror Challenge rewired how I start my mornings. Day 4 broke something open in me. I'm not the same person I was a week ago.",
              name: "David R.",
              role: "Founder & CEO",
            },
            {
              quote: "Coach Kay's voice in the results felt like someone who actually sees me. Not generic advice — real, specific truth.",
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
          <h2 className="font-heading text-3xl md:text-5xl font-light mb-6" style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}>
            Ready to see clearly?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Your clarity session takes less than 5 minutes. No sign-up. No commitment. Just honest, AI-powered insight from Coach Kay's Clarity Code framework.
          </p>
          <Button
            onClick={() => navigate("/clarity")}
            size="lg"
            className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform text-base px-10 py-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Begin Your Clarity Check
          </Button>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-heading text-lg font-light">
            <span className="text-primary">Focus</span> Flow AI <span className="text-muted-foreground/40 text-sm">by Coach Kay</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground/60 flex-wrap justify-center">
            <button onClick={() => navigate("/clarity")} className="hover:text-foreground transition-colors">Clarity Session</button>
            <button onClick={() => navigate("/modules")} className="hover:text-foreground transition-colors">Modules</button>
            <button onClick={() => navigate("/challenges")} className="hover:text-foreground transition-colors">Challenges</button>
            <button onClick={() => navigate("/coach")} className="hover:text-foreground transition-colors">Coach Kay</button>
            <button onClick={() => navigate("/community")} className="hover:text-foreground transition-colors">Community</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
