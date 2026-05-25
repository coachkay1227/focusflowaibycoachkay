import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";

const AuditLanding = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !sessionId) return;
    (async () => {
      const { data } = await supabase
        .from("business_audits" as never)
        .select("id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (data && (data as { id?: string }).id) setAuditId((data as { id: string }).id);
    })();
  }, [user, sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <SEOHead title="AI Business Audit — Ready to Begin" description="Your AI Business Audit is ready. Check your email or sign in to continue." path="/audit/landing" noIndex />
      <span className="font-mono-label text-primary tracking-[0.2em] text-xs">PAYMENT CONFIRMED</span>
      <h1 className="font-heading text-3xl md:text-4xl text-primary mt-3 mb-4">Your AI Business Audit is ready to begin</h1>
      <p className="text-muted-foreground max-w-xl mb-8">
        Check your email for the magic link to start your 5–7 minute intake. Already signed in? Continue below.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        {auditId && (
          <Button onClick={() => navigate(`/audit/intake?audit_id=${auditId}`)} className="bg-primary text-primary-foreground">
            Continue to Intake
          </Button>
        )}
        {!user && (
          <Button variant="outline" onClick={() => navigate("/auth?next=/audit/intake")}>Sign in to your account</Button>
        )}
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">Your magic link is valid for 90 days.</p>
    </div>
  );
};

export default AuditLanding;