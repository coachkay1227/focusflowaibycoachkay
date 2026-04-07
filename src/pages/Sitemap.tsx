import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowLeft } from "lucide-react";

const links = [
  { path: "/", label: "Home" },
  { path: "/modules", label: "Modules" },
  { path: "/challenges", label: "Challenges" },
  { path: "/coach", label: "Coach Kay" },
  { path: "/clarity", label: "Clarity Session" },
  { path: "/community", label: "Community" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/auth", label: "Sign In" },
];

const Sitemap = () => (
  <div className="relative min-h-screen overflow-hidden grain-overlay">
    <FloatingOrbs />
    <SEOHead
      title="Sitemap — FocusFlow AI"
      description="Browse all pages on FocusFlow AI, your clarity coaching platform by Coach Kay."
      path="/sitemap"
    />
    <div className="relative z-10 px-6 md:px-12 py-6">
      <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
    </div>
    <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-light mb-8">Sitemap</h1>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.path}>
            <Link to={l.path} className="text-primary hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Sitemap;
