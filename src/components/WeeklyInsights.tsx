import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Sparkles, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const CACHE_KEY = "focusflow_weekly_insights";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedInsights {
  recap: string;
  meta: { sessionsCount: number; challengesActive: number; generatedAt: string };
  cachedAt: number;
}

function getCachedInsights(): CachedInsights | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedInsights = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function setCachedInsights(recap: string, meta: CachedInsights["meta"]) {
  const entry: CachedInsights = { recap, meta, cachedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

const WeeklyInsights = () => {
  const cached = getCachedInsights();
  const [recap, setRecap] = useState<string | null>(cached?.recap ?? null);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ sessionsCount: number; challengesActive: number; generatedAt: string } | null>(cached?.meta ?? null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("weekly-insights");

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const newMeta = {
        sessionsCount: data.sessionsCount,
        challengesActive: data.challengesActive,
        generatedAt: data.generatedAt,
      };

      setRecap(data.recap);
      setMeta(newMeta);
      setCachedInsights(data.recap, newMeta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-light">Weekly Clarity Recap</h3>
            <p className="text-muted-foreground text-sm">AI-generated insights from your week</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateInsights}
          disabled={loading}
          className="text-primary hover:text-primary/80"
          aria-label={recap ? "Regenerate weekly insights" : "Generate weekly insights"}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : recap ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-1" /> Generate
            </>
          )}
        </Button>
      </div>

      {!recap && !loading && !error && (
        <div className="text-center py-8">
          <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm mb-4">
            Get a personalized recap of your clarity journey this week.
          </p>
          <Button
            onClick={generateInsights}
            className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Generate My Recap
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Coach Kay is reviewing your week...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive text-sm mb-3">{error}</p>
          <Button variant="ghost" size="sm" onClick={generateInsights} className="text-primary">
            Try Again
          </Button>
        </div>
      )}

      {recap && !loading && (
        <div className="space-y-4">
          {meta && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground/60 font-mono-label mb-4">
              <span>{meta.sessionsCount} sessions</span>
              <span>•</span>
              <span>{meta.challengesActive} challenges</span>
              <span>•</span>
              <span>{new Date(meta.generatedAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:font-heading prose-headings:font-light prose-headings:text-foreground
            prose-strong:text-primary prose-strong:font-semibold
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-li:text-muted-foreground
            prose-ul:text-muted-foreground">
            <ReactMarkdown>{recap}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyInsights;
