import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import FloatingOrbs from "@/components/FloatingOrbs";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // 404 logged server-side via analytics
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
      <FloatingOrbs />
      <div className="relative z-10 text-center max-w-md">
        <div className="font-heading text-6xl font-light text-primary mb-4">404</div>
        <h1 className="font-heading text-2xl font-light text-foreground mb-3">
          This page doesn't exist
        </h1>
        <p className="text-muted-foreground mb-8">
          Let's get you somewhere that matters.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
      </div>
    </div>
  );
};

export default NotFound;
