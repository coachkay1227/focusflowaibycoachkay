import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { webPage, breadcrumb } from "@/lib/seo-schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, ExternalLink, BookOpen, Calendar } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const SKOOL_URL = "https://www.skool.com/focusflow-elevation-hub";

const highlights = [
  { icon: BookOpen, text: "12+ coaching modules" },
  { icon: Calendar, text: "Specialty prompts & tools" },
];

const testimonials = [
  {
    name: "Jordan K.",
    tag: "Mirror Challenge",
    content: "Day 6 of the Mirror Challenge. I realized I've been performing confidence instead of building it. The prompt about 'what would you do if no one was watching' wrecked me, in the best way.",
  },
  {
    name: "Serena L.",
    tag: "Clarity Session",
    content: "Just finished my first Clarity Session. The pattern it identified, 'using variety as a distraction from depth,' hit different. I've started 12 projects this year. Finished zero. That's the real pattern.",
  },
  {
    name: "Marcus W.",
    tag: "Insight",
    content: "Coach Kay told me: 'Frustration is unprocessed ambition.' I've been sitting with that for three days. It changed how I talk to myself.",
  },
];

const Community = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  useMouseGlow(containerRef);

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead
        title="FocusFlow Elevation Hub — Community"
        description="Join the FocusFlow Elevation Hub on Skool. Connect with 98+ elevation seekers, coaching modules, weekly group sessions, and 24/7 community support."
        path="/community"
        jsonLd={[
          webPage("/community", "Community"),
          breadcrumb(
            [
              { name: "Home", path: "/" },
              { name: "Community", path: "/community" },
            ],
            "/community"
          ),
        ]}
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        {/* Hero */}
        <AnimatedSection className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">FocusFlow Elevation Hub</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
          >
            You're not alone in this.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Join 98+ elevation seekers rebuilding their lives and businesses with intentional growth. Free to join.
          </p>
          <Button
            onClick={() => window.open(SKOOL_URL, "_blank")}
            className="mt-8 animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform px-8 py-6 text-base"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Join the Community on Skool
          </Button>
        </AnimatedSection>

        {/* About Coach Kay */}
        <AnimatedSection delay={100}>
          <div className="clarity-card rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                <span className="text-sm text-primary font-medium">K</span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-light">Coach Kay</h3>
                <p className="text-xs text-muted-foreground">Life Transformation Coach</p>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed text-sm mb-4">
              Master Certified Life Coach with 600+ hours of client coaching. Trained in transformation, mindfulness, purpose, and goal-setting. Creator of the Clarity Code framework and the F.O.C.U.S. methodology.
            </p>
            <p className="text-foreground/70 leading-relaxed text-sm">
              My tools are built on the latest technology, but my approach is rooted in real coaching science. I built FocusFlow so you can compress years of growth into months.
            </p>
          </div>
        </AnimatedSection>

        {/* What's inside */}
        <AnimatedSection delay={200}>
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-light text-center mb-8">
              FREE inside the community
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item, i) => (
                <div key={i} className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground/80 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Member stories */}
        <AnimatedSection delay={300}>
          <h2 className="font-heading text-2xl font-light text-center mb-8">
            What members are saying
          </h2>
          <div className="space-y-4 mb-12">
            {testimonials.map((post, i) => (
              <div key={i} className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary font-medium">{post.name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{post.name}</span>
                  <span className="ml-auto font-mono-label text-primary/40 text-xs">{post.tag}</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-sm">{post.content}</p>
              </div>
            ))}
            <p className="text-center text-xs text-muted-foreground/50 mt-2">
              Member testimonials from the FocusFlow Elevation Hub
            </p>
          </div>
        </AnimatedSection>

        {/* Bottom CTA */}
        <AnimatedSection delay={400} className="text-center">
          <div className="clarity-card rounded-lg border border-primary/15 bg-card/20 backdrop-blur-sm p-12">
            <h3 className="font-heading text-2xl font-light mb-4">Ready to elevate?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join the community. Access coaching modules, weekly group sessions, and a support system that moves with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.open(SKOOL_URL, "_blank")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform px-8 py-6"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Join Free on Skool
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/clarity")}
                className="border-border hover:border-primary/40 text-foreground hover:text-primary transition-all px-8 py-6"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try a Clarity Session First
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Community;
