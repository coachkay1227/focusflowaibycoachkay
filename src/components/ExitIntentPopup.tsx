import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import NewsletterWaitlist from "@/components/NewsletterWaitlist";

const STORAGE_KEY = "ff_exit_intent_v1";
const SESSION_KEY = "ff_exit_intent_shown";
const NEWSLETTER_SESSION_KEY = "ff_newsletter_popup_shown";
const MIN_TIME_MS = 15_000;

const HIDDEN_EXACT = new Set([
  "/auth",
  "/reset-password",
  "/onboarding",
  "/dashboard",
  "/clarity",
  "/assessment",
  "/result",
  "/mirror-challenge",
  "/coach",
  "/profile",
  "/kiosk",
  "/order-success",
  "/email-preview",
  "/unsubscribe",
  "/email-unsubscribe",
]);
const HIDDEN_PREFIXES = [
  "/clarity/",
  "/challenges/",
  "/admin",
  "/audit/intake",
  "/audit/report",
];

const ExitIntentPopup = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);

  const allowed =
    !HIDDEN_EXACT.has(pathname) &&
    !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!allowed) return;

    // Already permanently suppressed
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    // Already shown this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    // Don't show if the newsletter popup already appeared this session
    try {
      if (sessionStorage.getItem(NEWSLETTER_SESSION_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    const arrivedAt = Date.now();
    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      if (Date.now() - arrivedAt < MIN_TIME_MS) return;
      triggered = true;
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      setOpen(true);
    };

    // Desktop: mouse moves toward browser bar (clientY < 10)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) trigger();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    // Mobile: page hidden (switching tabs / app backgrounded)
    const onVisibilityChange = () => {
      if (document.hidden) trigger();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [allowed, pathname]);

  const suppress = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  const close = () => {
    suppress();
    setOpen(false);
    setDismissed(true);
  };

  const handleCta = () => {
    suppress();
    setOpen(false);
    setDismissed(true);
    navigate("/clarity");
  };

  if (!allowed || dismissed || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Before you go — get your free AI readiness score"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: "#111827",
          border: "1.5px solid hsl(var(--primary) / 0.6)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mb-5">
          <BrandLogo size="md" withTagline />
        </div>

        {/* Copy */}
        <h2 className="font-heading text-2xl md:text-3xl font-light text-foreground mb-2">
          Wait. Before you go.
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Get your free AI readiness score. 90 seconds. No card.
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleCta}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mb-3"
        >
          Get My Free Clarity Code
        </button>

        {/* Secondary toggle */}
        <button
          type="button"
          onClick={() => setShowNewsletter((v) => !v)}
          className="w-full text-center text-xs text-primary/80 hover:text-primary transition-colors"
        >
          Or subscribe for weekly AI insights →
        </button>

        {/* Inline newsletter (toggled) */}
        {showNewsletter && (
          <div className="mt-4 border-t border-foreground/10 pt-4">
            <NewsletterWaitlist
              source="exit-intent"
              variant="inline"
              heading=""
              subheading=""
              className="border-0 bg-transparent p-0"
              onSuccess={() => window.setTimeout(close, 1200)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitIntentPopup;
