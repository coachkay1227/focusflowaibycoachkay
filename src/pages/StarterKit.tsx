import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StarterKit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  useMouseGlow(containerRef);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await supabase.functions.invoke("apply-now", {
        body: {
          type: "inquiry",
          name: name.trim() || "Starter Kit Request",
          email: email.trim().toLowerCase(),
          programName: "AI Transformation Starter Kit",
          message:
            "Requesting the AI Transformation Starter Kit (KPI/ROI workshop, dashboard template, weekly review protocol, and grant-ready impact reporting).",
        },
      });
      // Best-effort lead capture
      try {
        await supabase.from("cohort_registrations").insert({
          email: email.trim().toLowerCase(),
          first_name: name.trim() || null,
          cohort_name: "AI Transformation Starter Kit",
          source: "starter-kit",
        });
      } catch {
        /* ignore */
      }
      setSent(true);
      toast({ title: "You're in.", description: "Check your inbox — the kit is on its way." });
    } catch (err) {
      toast({
        title: "Couldn't send right now",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead
        title="AI Transformation Starter Kit — FocusFlow AI"
        description="A free starter kit for leaders adopting AI: KPI dashboard template, ROI calculator, weekly review protocol, and grant-ready impact reporting."
        path="/starter-kit"
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">FocusFlow</span> AI
        </div>
        <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">FREE</span>
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
          AI TRANSFORMATION · STARTER KIT
        </span>
        <h1
          className="font-heading text-4xl md:text-5xl font-light mt-3 mb-4"
          style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
        >
          Your first move into AI — without the noise.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10">
          A free starter kit for leaders, operators, and community builders who want to use AI on
          purpose. No fluff, no hype — just the foundation Coach Kay uses with every cohort.
        </p>

        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 mb-8">
          <p className="font-mono-label text-primary/70 tracking-[0.15em] text-xs mb-4">
            WHAT'S INSIDE
          </p>
          <ul className="space-y-3">
            {[
              "Personal KPI identification worksheet",
              "Plug-and-play transformation dashboard template",
              "ROI calculator for your time, energy, and coaching investment",
              "Weekly review protocol (15 minutes, every Sunday)",
              "Grant-ready impact reporting template",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {!sent ? (
          <form
            onSubmit={submit}
            className="bg-card/50 backdrop-blur-sm border border-primary/25 rounded-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 font-mono-label text-primary tracking-[0.2em] text-xs mb-3">
              <Download className="h-4 w-4" /> SEND ME THE KIT
            </div>
            <p className="text-muted-foreground text-sm mb-5">
              Drop your email and I'll send the full kit straight to your inbox.
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="First name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-border"
              />
              <Input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !email.trim()}
              className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base"
            >
              {submitting ? "Sending…" : "Send Me the Starter Kit"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-center font-mono-label text-muted-foreground/60 text-[10px] tracking-[0.15em]">
              NO SPAM · UNSUBSCRIBE ANY TIME
            </p>
          </form>
        ) : (
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="font-heading text-2xl font-light mb-2">You're in.</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your AI Transformation Starter Kit is on its way to <span className="text-primary">{email}</span>.
              Check your inbox (and spam, just in case).
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/programs/30-day-ai-reset")} className="gap-2">
                <Sparkles className="h-4 w-4" /> See the 30-Day AI Reset
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to home
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StarterKit;