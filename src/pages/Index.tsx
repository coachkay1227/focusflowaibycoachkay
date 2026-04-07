import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, ArrowRight, User, LogOut } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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

  useMouseGlow(containerRef);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay grid-overlay">
      <SEOHead
        title="FocusFlow AI — Clarity Coaching by Coach Kay"
        description="See clearly. Move with purpose. Master-certified clarity coaching that helps you cut through mental fog, identify patterns, and take meaningful action."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "FocusFlow AI by Coach Kay",
            url: "https://focusflowelevation-hub.com",
            description: "Master-certified clarity coaching powered by the F.O.C.U.S. framework",
            serviceType: "Life Coaching",
            provider: {
              "@type": "Person",
              name: "Coach Kay",
              jobTitle: "Master Certified Life Coach",
              description: "Master Certified Life Coach with 600+ hours of client coaching. Creator of the Clarity Code framework and F.O.C.U.S. methodology.",
            },
            areaServed: "Worldwide",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "FocusFlow AI",
            url: "https://focusflowelevation-hub.com",
          },
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

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="font-heading text-xl md:text-2xl font-light tracking-wide text-foreground">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <div className="flex items-center gap-6">
          {user && (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-primary hover:text-primary/80 transition-colors hidden md:block font-medium"
            >
              Dashboard
            </button>
          )}
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden md:inline-flex"
          >
            Start Session
          </Button>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-primary/30 hidden md:flex">
                <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(user.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
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
          <MobileNav />
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
          A clarity experience that helps you cut through the noise, identify your patterns, and take your
          next bold step.
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
          5-minute guided session · No sign-up required · Personalized clarity report
        </div>
      </section>

      {/* Credentials Bar */}
      <section className="relative z-10 py-8 px-6">
        <AnimatedSection className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
            {[
              "Master Certified Life Coach",
              "600+ Coaching Hours",
              "Accredited Training",
              "Clarity Code Creator",
            ].map((cred, i) => (
              <div key={cred} className="flex items-center gap-4 md:gap-8">
                <span className="font-mono-label text-[11px] tracking-wider text-primary/70">{cred}</span>
                {i < 3 && <span className="hidden md:inline text-primary/20">|</span>}
              </div>
            ))}
          </div>
        </AnimatedSection>
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
                <span className="mt-4 inline-block font-mono-label text-[10px] tracking-wider text-primary/70 border border-primary/20 rounded-full px-3 py-1 self-start">
                  {item.tag}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Entry Points */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <span className="font-mono-label text-primary tracking-[0.2em]">YOUR ENTRY POINT</span>
          <h2
            className="font-heading text-3xl md:text-5xl font-light mt-4 mb-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
          >
            One app. Every path.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you're at an event, mid-cohort, or starting solo — FocusFlow AI meets you exactly where you are.
          </p>
          <div className="space-y-4 text-left">
            {[
              {
                step: "01",
                title: "Quick Clarity Check",
                duration: "5 Minutes",
                sub: "Event table · No sign-up required",
                badge: "FREE",
              },
              {
                step: "02",
                title: "Cohort Journey",
                duration: "3, 8, or 12 Weeks",
                sub: "Coach Kay–led · 1 module per session",
                badge: null,
              },
              {
                step: "03",
                title: "Full Access",
                duration: "All Modules & Challenges",
                sub: "Self-paced · Coach always on",
                badge: null,
              },
              {
                step: "04",
                title: "Reentry & Community Track",
                duration: "",
                sub: "Justice-impacted · Grant-funded access",
                badge: null,
              },
              {
                step: "05",
                title: "Corporate & Nonprofit Cohorts",
                duration: "",
                sub: "B2B · Shield Her Elevation LLC / Forward Focus Elevation",
                badge: null,
              },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 100}>
                <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 flex gap-6 items-start">
                  <span className="font-mono-label text-primary shrink-0 mt-1">{item.step}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-heading text-xl font-medium text-foreground">{item.title}</h3>
                      {item.duration && <span className="text-muted-foreground text-sm">· {item.duration}</span>}
                      {item.badge && (
                        <span className="font-mono-label text-[10px] tracking-wider text-primary border border-primary/30 rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-1">{item.sub}</p>
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
            Begin Your Clarity Check
          </Button>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="font-heading text-lg font-light">
              <span className="text-primary">Focus</span>Flow AI{" "}
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
                Coach Kay
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
