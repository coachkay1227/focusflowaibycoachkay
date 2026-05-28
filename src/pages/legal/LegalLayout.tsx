import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FloatingOrbs from "@/components/FloatingOrbs";

interface LegalLayoutProps {
  title: string;
  description: string;
  path: string;
  eyebrow: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, path, eyebrow, lastUpdated, children }: LegalLayoutProps) => (
  <div className="relative min-h-dvh overflow-hidden grain-overlay">
    <FloatingOrbs />

    <div className="relative z-10 px-6 md:px-12 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
    </div>

    <div className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
      <span className="font-mono-label text-primary/70 tracking-[0.2em] text-xs">{eyebrow}</span>
      <h1
        className="font-heading text-4xl md:text-5xl font-light mt-3 mb-3 leading-tight"
        style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
      >
        {title}
      </h1>
      <p className="text-muted-foreground/70 text-sm mb-12">Last updated: {lastUpdated}</p>

      <article className="legal-prose space-y-6 text-foreground/85 leading-relaxed">
        {children}
      </article>

      <p className="mt-16 text-xs text-muted-foreground/50 border-t border-border/30 pt-6">
        Questions about this document? Email{" "}
        <a href="mailto:hello@coachkayelevates.org" className="text-primary/70 hover:text-primary">
          hello@coachkayelevates.org
        </a>
        .
      </p>
    </div>


  </div>
);

export default LegalLayout;