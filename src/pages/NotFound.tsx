import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import FloatingOrbs from "@/components/FloatingOrbs";
import { programs } from "@/data/programs";

const featured = programs.filter((p) => p.isFeatured).slice(0, 3);

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 for analytics
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
      <FloatingOrbs />
      <div className="relative z-10 text-center max-w-lg">
        <div className="font-heading text-6xl font-light text-primary mb-4">404</div>
        <h1 className="font-heading text-2xl font-light text-foreground mb-3">
          This page doesn't exist
        </h1>
        <p className="text-muted-foreground mb-8">
          Let's get you somewhere that matters.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Return Home
          </Link>
          <Link
            to="/clarity"
            className="inline-flex items-center justify-center rounded-md border border-border text-foreground px-6 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition-all"
          >
            Start a Clarity Check
          </Link>
        </div>

        {featured.length > 0 && (
          <div className="text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 text-center">Popular Programs</p>
            <div className="grid gap-2">
              {featured.map((prog) => (
                <Link
                  key={prog.id}
                  to={`/programs/${prog.slug}`}
                  className="flex items-center gap-3 bg-card/30 border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="text-xs text-muted-foreground">{prog.durationLabel}</div>
                  <div className="text-sm font-medium text-foreground flex-1">{prog.title}</div>
                  <div className="text-xs text-primary">View</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
