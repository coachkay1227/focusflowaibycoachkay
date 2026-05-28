import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "ff_social_proof_count";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_TEXT = "Join hundreds who've found their clarity";

function roundDownToTen(n: number): number {
  return Math.floor(n / 10) * 10;
}

interface CachedResult {
  count: number;
  ts: number;
}

const SocialProofCounter = () => {
  const [text, setText] = useState<string | null>(null); // null = loading

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      // Check session-level cache first
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CachedResult = JSON.parse(raw);
          if (Date.now() - cached.ts < CACHE_TTL_MS) {
            if (!cancelled) setText(buildText(cached.count));
            return;
          }
        }
      } catch {
        /* ignore */
      }

      try {
        const { count, error } = await supabase
          .from("clarity_sessions")
          .select("*", { count: "exact", head: true });

        if (cancelled) return;

        if (error || count === null || count === 0) {
          setText(FALLBACK_TEXT);
          return;
        }

        const rounded = roundDownToTen(count);
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ count, ts: Date.now() } satisfies CachedResult)
          );
        } catch {
          /* ignore */
        }

        setText(buildText(rounded));
      } catch {
        if (!cancelled) setText(FALLBACK_TEXT);
      }
    };

    void fetchCount();
    return () => { cancelled = true; };
  }, []);

  // Loading skeleton
  if (text === null) {
    return (
      <p className="text-xs text-muted-foreground/60 mt-1 animate-pulse">
        ● Loading…
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground mt-1">
      <span className="text-primary mr-1" aria-hidden="true">●</span>
      {text}
    </p>
  );
};

function buildText(n: number): string {
  if (n <= 0) return FALLBACK_TEXT;
  return `Join ${n}+ people who've found their clarity this month`;
}

export default SocialProofCounter;
