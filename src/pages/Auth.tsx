import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUserPreferences } from "@/lib/enrollment-store";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function getStoredReturnTo(): string | null {
  try {
    const v = sessionStorage.getItem("auth:returnTo");
    return v && v !== "/auth" ? v : null;
  } catch {
    return null;
  }
}

function clearStoredReturnTo() {
  try { sessionStorage.removeItem("auth:returnTo"); } catch { /* noop */ }
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intendedFrom =
    (location.state as { from?: string } | null)?.from || getStoredReturnTo();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "signup-success">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Persist any intent passed via router state so it survives reloads / email confirmation tab
  useEffect(() => {
    const fromState = (location.state as { from?: string } | null)?.from;
    if (fromState && fromState !== "/auth") {
      try { sessionStorage.setItem("auth:returnTo", fromState); } catch { /* noop */ }
    }
  }, [location.state]);

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      getUserPreferences().then((prefs) => {
        if (!prefs || !prefs.onboardingCompleted) {
          navigate("/onboarding");
        } else if (intendedFrom && intendedFrom !== "/auth") {
          clearStoredReturnTo();
          navigate(intendedFrom);
        } else {
          clearStoredReturnTo();
          navigate("/dashboard");
        }
      });
    }
  }, [user, navigate, intendedFrom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We've sent you a password reset link." });
        setMode("signin");
      }
      return;
    }

    if (mode === "signup" && password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (mode === "signup") {
      // Fire welcome email + GHL webhook (fire-and-forget, don't block UX)
      firePostSignupHooks(email);
      setMode("signup-success");
    } else {
      // useEffect will handle redirect based on onboarding status
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: "select_account",
      },
    });
    if (result.error) {
      toast({ title: "Error", description: String(result.error), variant: "destructive" });
      setLoading(false);
    }
  };

  const firePostSignupHooks = useCallback((_userEmail: string) => {
    // Welcome email + nurture webhook are dispatched server-side. The
    // authenticated client-notify wrapper resolves the recipient from the
    // verified user session so callers cannot target arbitrary addresses.
    supabase.functions
      .invoke("client-notify", { body: { action: "welcome" } })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay flex items-center justify-center px-6">
      <SEOHead title="Sign In — FocusFlow AI" description="Sign in or create your FocusFlow AI account to save your clarity sessions, track progress, and unlock personalized coaching." path="/auth" />
      <FloatingOrbs />
      <div className="mouse-glow" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {mode === "signup-success" ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1
              className="font-heading text-3xl md:text-4xl font-light"
              style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
            >
              Check your inbox
            </h1>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              We sent a confirmation link to <span className="text-foreground">{email}</span>.
              Click it to verify your account, then come back here to sign in.
            </p>
            {intendedFrom && intendedFrom !== "/auth" && (
              <p className="text-xs text-muted-foreground/70 mt-3">
                You'll be returned to <span className="text-primary/80">{intendedFrom}</span> after signing in.
              </p>
            )}
            <div className="mt-8 space-y-3">
              <Button
                onClick={() => setMode("signin")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6"
              >
                I confirmed — Sign me in
              </Button>
              <button
                onClick={() => { setMode("signup"); setEmail(""); setPassword(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </div>
          </div>
        ) : (
        <>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-light" style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}>
            {mode === "forgot" ? "Reset Password" : mode === "signin" ? "Welcome Back" : "Join FocusFlow AI"}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            {mode === "forgot"
              ? "Enter your email and we'll send a reset link."
              : "Save your clarity sessions and patterns across devices."}
          </p>
        </div>

        {/* Google Sign In */}
        {mode !== "forgot" && (
          <>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full border-border hover:border-primary/40 text-foreground hover:text-primary transition-all py-6 mb-4"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-4 text-muted-foreground font-mono-label">or</span>
              </div>
            </div>
          </>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="auth-email" className="sr-only">Email address</label>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="auth-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-card/30 border-border text-foreground placeholder:text-muted-foreground/40 py-6"
            />
          </div>

          {mode !== "forgot" && (
            <div className="relative">
              <label htmlFor="auth-password" className="sr-only">Password</label>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="auth-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10 bg-card/30 border-border text-foreground placeholder:text-muted-foreground/40 py-6"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6"
          >
            {loading
              ? "Please wait..."
              : mode === "forgot"
              ? "Send Reset Link"
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          {mode === "signin" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-sm text-muted-foreground hover:text-primary transition-colors block mx-auto">
                Forgot password?
              </button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("signin")} className="text-sm text-primary hover:underline">
              Back to sign in
            </button>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Auth;
