import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import NewsletterWaitlist from "@/components/NewsletterWaitlist";

const STORAGE_KEY = "ff_newsletter_popup_v1";
const DELAY_MS = 30_000;
const SCROLL_THRESHOLD = 0.5;

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

const NewsletterPopup = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const allowed =
    !HIDDEN_EXACT.has(pathname) &&
    !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!allowed) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    let opened = false;
    const trigger = () => {
      if (opened) return;
      opened = true;
      setOpen(true);
    };

    const timer = window.setTimeout(trigger, DELAY_MS);

    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (scrolled >= SCROLL_THRESHOLD) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [allowed, pathname]);

  const close = () => {
    setOpen(false);
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (!allowed || dismissed || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join the FocusFlow newsletter"
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 sm:bottom-6 sm:right-6 sm:left-auto sm:px-0 sm:pb-0 sm:justify-end animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-primary/30 bg-navy-deep/95 backdrop-blur-xl p-5 shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <NewsletterWaitlist
          source="popup"
          variant="inline"
          heading="FocusFlow Newsletter"
          subheading="Weekly clarity drops + AI plays. Join the waitlist before launch."
          className="border-0 bg-transparent p-0"
          onSuccess={() => window.setTimeout(close, 1200)}
        />
      </div>
    </div>
  );
};

export default NewsletterPopup;