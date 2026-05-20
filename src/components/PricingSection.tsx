import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowRight } from "lucide-react";

const PATHS = [
  {
    title: "Personal Path",
    tagline: "Clarity for your life",
    entry: { label: "Free Clarity Check", to: "/clarity" },
    core: "30-Day Personal Reset",
    premium: "90-Day Private Transformation",
  },
  {
    title: "Business Path",
    tagline: "Clarity for your company",
    entry: { label: "Business Strategy Session", to: "/clarity" },
    core: "30-Day Business Reset",
    premium: "90-Day Business Transformation",
  },
  {
    title: "AI + Systems Path",
    tagline: "Clarity through automation",
    entry: { label: "AI Transformation Session", to: "/clarity" },
    core: "30-Day AI Reset",
    premium: "90-Day Full AI Transformation",
  },
];

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 py-24 md:py-32 px-6">
      <AnimatedSection className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">YOUR TRANSFORMATION PATH</span>
          <h2
            className="font-heading text-3xl md:text-5xl font-light mt-4 mb-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.1)" }}
          >
            Choose Your Path.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Three distinct journeys. One framework. Pick where you are — go where you want to be.
          </p>
        </div>
      </AnimatedSection>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PATHS.map((path, i) => (
          <AnimatedSection key={path.title} delay={i * 120}>
            <div className="clarity-card rounded-lg border border-border bg-card/40 backdrop-blur-sm p-6 h-full flex flex-col">
              <h3 className="font-heading text-2xl font-medium text-foreground">{path.title}</h3>
              <p className="font-mono-label text-[11px] tracking-wider text-muted-foreground mt-2">
                {path.tagline}
              </p>

              <div className="mt-6 space-y-3 flex-1">
                <button
                  type="button"
                  onClick={() => navigate(path.entry.to)}
                  className="w-full text-left rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-colors p-4 flex items-center justify-between gap-3 group"
                >
                  <div className="flex flex-col">
                    <span className="font-mono-label text-[10px] tracking-wider text-primary/70">ENTRY</span>
                    <span className="text-sm text-foreground mt-1">{path.entry.label}</span>
                  </div>
                  <span className="font-mono-label text-[10px] tracking-wider text-primary border border-primary/40 rounded-full px-2 py-0.5 shrink-0">
                    FREE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/programs")}
                  className="w-full text-left rounded-md border border-border bg-card/30 hover:border-primary/50 hover:bg-card/50 transition-colors p-4 flex items-center justify-between gap-3 group"
                >
                  <div className="flex flex-col">
                    <span className="font-mono-label text-[10px] tracking-wider text-muted-foreground">CORE</span>
                    <span className="text-sm text-foreground mt-1">{path.core}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/programs")}
                  className="w-full text-left rounded-md border border-border bg-card/30 hover:border-primary/50 hover:bg-card/50 transition-colors p-4 flex items-center justify-between gap-3 group"
                >
                  <div className="flex flex-col">
                    <span className="font-mono-label text-[10px] tracking-wider text-muted-foreground">PREMIUM</span>
                    <span className="text-sm text-foreground mt-1">{path.premium}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={400} className="max-w-6xl mx-auto mt-10">
        <div className="clarity-card rounded-lg border border-border/50 bg-card/20 backdrop-blur-sm p-6 text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            We also support community organizations and nonprofits through{" "}
            <a
              href="https://forward-focus-elevation.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              Forward Focus Elevation
            </a>
            {" "}— bringing clarity coaching to communities that need it most.
          </p>
          <p className="text-muted-foreground/50 text-xs mt-2">
            Corporate & organizational cohorts available · Contact us for details
          </p>
        </div>
      </AnimatedSection>
    </section>
  );
}