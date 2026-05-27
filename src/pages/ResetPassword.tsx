import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Check URL hash for recovery token
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValid(true);
      setChecking(false);
      return;
    }

    // 2. Check if there's already an active session (token was exchanged during redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValid(true);
        setChecking(false);
      }
    });

    // 3. Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValid(true);
        setChecking(false);
      }
    });

    // Give it a moment then stop checking
    const timeout = setTimeout(() => setChecking(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/");
    }
  };

  if (checking) {
    return (
      <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
        <FloatingOrbs />
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
        <FloatingOrbs />
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button onClick={() => navigate("/auth")} variant="outline" className="mt-4 border-border hover:border-primary/40">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
      <SEOHead title="Reset Password — FocusFlow AI" description="Set a new password for your FocusFlow AI account. Secure password recovery for returning members of FocusFlow AI by Coach Kay." path="/reset-password" noIndex />
      <FloatingOrbs />
      <div className="mouse-glow" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-light" style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}>
            Set New Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pl-10 bg-card/30 border-border text-foreground placeholder:text-muted-foreground/70 py-6"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="pl-10 bg-card/30 border-border text-foreground placeholder:text-muted-foreground/70 py-6"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
