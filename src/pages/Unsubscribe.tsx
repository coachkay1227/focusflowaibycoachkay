import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { MailX, CheckCircle, AlertCircle } from "lucide-react";

type Status = "loading" | "confirm" | "already" | "success" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;
    // Validate the token
    supabase.functions
      .invoke("handle-email-unsubscribe", { method: "GET", body: undefined, headers: { "x-unsubscribe-token": token } })
      .then(({ data, error }) => {
        if (error) { setStatus("error"); return; }
        if (data?.already_unsubscribed) { setStatus("already"); return; }
        setStatus("confirm");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
      <SEOHead title="Unsubscribe — FocusFlow AI" description="Manage your FocusFlow AI email preferences. Unsubscribe from coaching updates, weekly insights, or transactional notifications at any time." path="/unsubscribe" noIndex />
      <FloatingOrbs />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
          {status === "success" ? <CheckCircle className="h-6 w-6 text-primary" /> :
           status === "error" ? <AlertCircle className="h-6 w-6 text-destructive" /> :
           <MailX className="h-6 w-6 text-muted-foreground" />}
        </div>

        {status === "loading" && (
          <p className="text-muted-foreground">Processing…</p>
        )}

        {status === "confirm" && (
          <>
            <h1 className="font-heading text-2xl font-light mb-3">Unsubscribe</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to stop receiving emails from FocusFlow AI?
            </p>
            <Button onClick={handleConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Confirm Unsubscribe
            </Button>
          </>
        )}

        {status === "already" && (
          <>
            <h1 className="font-heading text-2xl font-light mb-3">Already Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">You've already been removed from our email list.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="font-heading text-2xl font-light mb-3">You're Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">You won't receive any more emails from FocusFlow AI. We're here if you ever want to come back.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-heading text-2xl font-light mb-3">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              This link may be invalid or expired. You can email{" "}
              <a href="mailto:Hello@coachkayelevates.org" className="text-primary hover:underline">Hello@coachkayelevates.org</a>{" "}
              to manage your preferences.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
