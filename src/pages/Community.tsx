import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

const posts = [
  {
    name: "Jordan K.",
    time: "2 days ago",
    content: "Day 6 of the Mirror Challenge. I realized I've been performing confidence instead of building it. The prompt about 'what would you do if no one was watching' wrecked me — in the best way. I'd quit my job. I'd paint. I'd sleep more. Why am I not doing those things?",
    tag: "Mirror Challenge",
  },
  {
    name: "Serena L.",
    time: "5 days ago",
    content: "Just finished my first Clarity Session. The pattern it identified — 'using variety as a distraction from depth' — hit different. I've started 12 projects this year. Finished zero. Not because I'm lazy, but because finishing means being judged. That's the real pattern.",
    tag: "Clarity Session",
  },
  {
    name: "Marcus W.",
    time: "1 week ago",
    content: "Coach Kay told me: 'Frustration is unprocessed ambition.' I've been sitting with that for three days. It changed how I talk to myself. I'm not angry at the world — I'm angry at myself for not acting on what I know. Time to stop rehearsing and start doing.",
    tag: "Insight",
  },
  {
    name: "Anya R.",
    time: "1 week ago",
    content: "The action step from my result was simple: 'Schedule 30 minutes that exist purely for you. No productivity, no output, no justification.' I did it yesterday. I sat in a park and did nothing. And I cried. Because I realized I haven't given myself that in years.",
    tag: "Breakthrough",
  },
  {
    name: "Dev P.",
    time: "2 weeks ago",
    content: "My Clarity Report said: 'You collect evidence of your inadequacy while dismissing proof of your competence.' Read that three times. Saved it to my phone. It's my new screensaver. Thank you, Coach Kay.",
    tag: "Clarity Session",
  },
];

const Community = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <div />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">The Clarity Circle</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            You're not alone in this.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Real stories from people doing the work. Honest reflections. Shared breakthroughs.
          </p>
        </AnimatedSection>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary font-medium">{post.name[0]}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{post.name}</span>
                    <span className="text-xs text-muted-foreground/50 ml-2">{post.time}</span>
                  </div>
                  <span className="ml-auto font-mono-label text-primary/40">{post.tag}</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-sm">{post.content}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={600} className="text-center mt-16">
          <div className="clarity-card rounded-lg border border-border bg-card/20 backdrop-blur-sm p-12">
            <h3 className="font-heading text-2xl font-light mb-4">Start your own story.</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Begin with a Clarity Session. See what emerges. Then share — or keep it for yourself. Either way, you'll know.
            </p>
            <Button
              onClick={() => navigate("/clarity")}
              className="animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform px-8 py-6"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Begin Your Clarity Check
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Community;
