import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { coachingModules } from "@/lib/modules";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowLeft, ArrowRight, Eye, Heart, Target, Sun, Compass } from "lucide-react";

const iconMap: Record<string, typeof Eye> = {
  eye: Eye,
  heart: Heart,
  target: Target,
  sun: Sun,
  compass: Compass,
};

const Modules = () => {
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

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span> Flow
        </div>
        <div />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">Coaching Modules</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Choose your path
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Each module is designed for a different moment. Pick the one that matches where you are right now.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {coachingModules.map((mod, i) => {
            const Icon = iconMap[mod.icon] || Eye;
            return (
              <AnimatedSection key={mod.id} delay={i * 120}>
                <button
                  onClick={() => navigate(`/clarity/${mod.id}`)}
                  className="clarity-card w-full text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 h-full group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-mono-label text-muted-foreground/50">{mod.duration}</span>
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl font-light mb-1">{mod.title}</h3>
                  <p className="text-primary/80 text-sm mb-3">{mod.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{mod.description}</p>
                  <span className="flex items-center gap-2 text-sm text-primary/60 group-hover:text-primary transition-colors">
                    Start session <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Modules;
