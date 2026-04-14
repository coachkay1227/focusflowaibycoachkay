import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowLeft } from "lucide-react";
import { programs, FOCUS_PILLARS, type FocusPillar } from "@/data/programs";

const coreLinks = [
  { path: "/", label: "Home" },
  { path: "/modules", label: "Programs & Modules" },
  { path: "/challenges", label: "Challenges" },
  { path: "/mirror-challenge", label: "Mirror Challenge" },
  { path: "/coach", label: "Coach Kay AI Chat" },
  { path: "/clarity", label: "Clarity Session" },
  { path: "/community", label: "Community" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/auth", label: "Sign In / Sign Up" },
];

const pillars: FocusPillar[] = ["F", "O", "C", "U", "S"];

const Sitemap = () => (
  <div className="relative min-h-screen overflow-hidden grain-overlay">
    <FloatingOrbs />
    <SEOHead
      title="Sitemap — FocusFlow AI"
      description="Browse all pages and programs on FocusFlow AI, your clarity coaching platform by Coach Kay."
      path="/sitemap"
    />
    <div className="relative z-10 px-6 md:px-12 py-6">
      <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
    </div>
    <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-light mb-8">Sitemap</h1>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-light mb-4 text-primary">Core Pages</h2>
        <ul className="space-y-2">
          {coreLinks.map((l) => (
            <li key={l.path}>
              <Link to={l.path} className="text-foreground/80 hover:text-primary hover:underline transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {pillars.map((p) => {
        const meta = FOCUS_PILLARS[p];
        const pillarPrograms = programs.filter((prog) => prog.pillar === p);
        return (
          <section key={p} className="mb-10">
            <h2 className="font-heading text-xl font-light mb-4" style={{ color: meta.color }}>
              {p} — {meta.full} ({pillarPrograms.length} programs)
            </h2>
            <ul className="space-y-2">
              {pillarPrograms.map((prog) => (
                <li key={prog.id}>
                  <Link
                    to={`/programs/${prog.slug}`}
                    className="text-foreground/80 hover:text-primary hover:underline transition-colors"
                  >
                    {prog.title}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2">
                    {prog.durationLabel} · {prog.type}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  </div>
);

export default Sitemap;
