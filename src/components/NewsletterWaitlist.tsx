import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackNewsletterSignup } from "@/lib/gtag";

const EmailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

interface NewsletterWaitlistProps {
  source: string;
  variant?: "inline" | "compact" | "card";
  heading?: string;
  subheading?: string;
  className?: string;
  onSuccess?: () => void;
}

/**
 * Newsletter / waitlist email capture.
 * Posts to the `newsletter-subscribe` edge function which writes to
 * `newsletter_subscribers` and (when keys are configured) forwards to Beehiiv.
 */
const NewsletterWaitlist = ({
  source,
  variant = "inline",
  heading = "FocusFlow Newsletter — coming soon",
  subheading = "Weekly clarity drops, AI plays, and Coach Kay's no-fluff field notes.",
  className,
  onSuccess,
}: NewsletterWaitlistProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: parsed.data, source },
      });
      if (error) throw error;
      setDone(true);
      toast.success("You're on the list. Watch your inbox.");
      trackNewsletterSignup();
      onSuccess?.();
    } catch (err) {
      console.error("newsletter subscribe failed", err);
      toast.error("Couldn't add you right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const wrapper =
    variant === "card"
      ? "rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 md:p-8"
      : variant === "compact"
        ? ""
        : "rounded-xl border border-border/40 bg-background/30 p-5";

  return (
    <div className={cn(wrapper, className)}>
      {variant !== "compact" && (
        <div className="mb-4">
          <h3 className="font-serif text-lg md:text-xl text-foreground">{heading}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subheading}</p>
        </div>
      )}
      {done ? (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" /> You're on the list.
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              maxLength={320}
              aria-label="Email address"
              className="w-full rounded-full border border-border/60 bg-background/60 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join the list"}
          </button>
        </form>
      )}
      {variant !== "compact" && !done && (
        <p className="text-[11px] text-muted-foreground/60 mt-3">
          No spam. Unsubscribe anytime. We'll never share your email.
        </p>
      )}
    </div>
  );
};

export default NewsletterWaitlist;