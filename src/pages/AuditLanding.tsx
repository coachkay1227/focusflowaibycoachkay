import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import BrandLogo from "@/components/BrandLogo";

const AuditLanding = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const leadId = params.get("lead_id");
  const [status, setStatus] = useState<"working" | "ready" | "error">("working");
  const [next, setNext] = useState<{ auditId: string; token: string | null; email: string | null } | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    let attempts = 0;
    let intake: unknown = null;
    try {
      const stored = leadId ? sessionStorage.getItem(`audit:lead:${leadId}`) : null;
      if (stored) intake = JSON.parse(stored);
    } catch { /* ignore */ }

    const tick = async () => {
      attempts += 1;
      const { data, error } = await supabase.functions.invoke("complete-audit-intake", {
        body: { session_id: sessionId, intake },
      });
      if (cancelled) return;
      const payload = data as { ok?: boolean; audit_id?: string; token?: string | null; email?: string | null } | null;
      if (!error && payload?.ok && payload.audit_id) {
        setNext({ auditId: payload.audit_id, token: payload.token ?? null, email: payload.email ?? null });
        setStatus("ready");
        if (leadId) {
          try { sessionStorage.removeItem(`audit:lead:${leadId}`); } catch { /* noop */ }
        }
        return;
      }
      // Webhook may not have inserted the row yet — retry a few times.
      if (attempts < 6) {
        setTimeout(tick, 1500);
      } else {
        setStatus("error");
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [sessionId, leadId]);

  const continueToAuth = () => {
    if (!next) return;
    const reportPath = `/audit/report/${next.auditId}${next.token ? `?token=${encodeURIComponent(next.token)}` : ""}`;
    const qs = new URLSearchParams();
    qs.set("next", reportPath);
    if (next.email) qs.set("email", next.email);
    qs.set("message", "audit-ready");
    navigate(`/auth?${qs.toString()}`);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <SEOHead title="AI Business Audit — Ready to Begin" description="Your AI Business Audit is ready. Check your email or sign in to continue." path="/audit/landing" noIndex />
      <BrandLogo size="md" />
      <span className="font-mono-label text-primary tracking-[0.2em] text-xs mt-6">PAYMENT CONFIRMED</span>
      <h1 className="font-heading text-3xl md:text-4xl text-primary mt-3 mb-2">Your audit is being prepared</h1>
      <p className="text-base text-muted-foreground max-w-xl mb-6">
        Create your account to view your report. We've also emailed you a backup link.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button
          onClick={continueToAuth}
          disabled={status !== "ready"}
          className="bg-primary text-primary-foreground"
        >
          {status === "working" ? "Saving your intake…" : status === "error" ? "Continue anyway" : "Create your account to view your report"}
        </Button>
      </div>
      {status === "error" && (
        <p className="mt-4 text-xs text-destructive max-w-md">
          We couldn't auto-attach your intake. Check your email for the magic link, or{" "}
          <button onClick={() => navigate("/auth")} className="text-primary hover:underline">sign in</button> to continue.
        </p>
      )}
      <p className="mt-8 text-xs text-muted-foreground">Your magic link is valid for 30 days.</p>

      {/* Sample Audit Preview */}
      <div className="mt-12 max-w-xl mx-auto">
        <p className="text-xs text-muted-foreground text-center mb-4 tracking-widest uppercase">Sample Audit Preview</p>
        <div className="rounded-xl border border-primary/20 bg-card/40 p-6 space-y-4">
          <div>
            <p className="text-xs text-primary font-mono tracking-wider uppercase mb-1">AI Readiness Score</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-light text-foreground">72<span className="text-lg text-muted-foreground">/100</span></div>
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full">High Potential</span>
            </div>
          </div>
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs text-primary font-mono tracking-wider uppercase mb-2">Top 3 Quick Wins</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">→</span> Automate client onboarding emails (saves 4 hrs/week)</li>
              <li className="flex gap-2"><span className="text-primary">→</span> Replace 3 manual reporting tasks with a Zapier + ChatGPT flow</li>
              <li className="flex gap-2"><span className="text-primary">→</span> Add AI to your content pipeline (2× output, same effort)</li>
            </ul>
          </div>
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs text-primary font-mono tracking-wider uppercase mb-2">Recommended Path</p>
            <p className="text-sm text-muted-foreground">Based on your stage and stack, Rent-an-Agent Starter tier would recoup its cost within 2 weeks of implementation.</p>
          </div>
          <p className="text-xs text-muted-foreground/60 italic text-center pt-2">* Sample only. Your audit is personalized to your business.</p>
        </div>
      </div>
    </div>
  );
};

export default AuditLanding;