import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import ReportView from "@/components/reports/ReportView";
import PillarBadge from "@/components/PillarBadge";
import PillarStrip from "@/components/PillarStrip";

const BUSINESS_TYPES = [
  "Coaching/Consulting",
  "Course/Info Product",
  "Service-Based",
  "Creator/Influencer",
  "E-commerce/Product",
  "Nonprofit/Mission-Driven",
  "Other",
] as const;

const StarterKit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  useMouseGlow(containerRef);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [bottleneck, setBottleneck] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<{
    where_you_are: string;
    what_to_focus_on: string;
    action_this_week: string;
  } | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !businessType || !bottleneck.trim()) return;
    setSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim() || null;
      const cleanBottleneck = bottleneck.trim();

      // Generate the AI Quick Start Report (also persists row + cohort_registration server-side)
      const { data, error } = await supabase.functions.invoke("generate-starter-report", {
        body: {
          name: cleanName ?? undefined,
          email: cleanEmail,
          business_type: businessType,
          bottleneck: cleanBottleneck,
        },
      });
      if (error) throw error;
      if (!data?.report) throw new Error("No report returned");

      // Preserve existing apply-now lead-capture parity (fire-and-forget)
      void supabase.functions.invoke("apply-now", {
        body: {
          type: "inquiry",
          name: cleanName ?? "Quick Start Report Request",
          email: cleanEmail,
          programName: "AI Quick Start Report",
          message: `Business type: ${businessType}\nBottleneck: ${cleanBottleneck}`,
        },
      });

      setReport(data.report);
      setGeneratedAt(new Date());
      void trackEvent("starter_kit_submitted", { email: cleanEmail, business_type: businessType }, "ai");
    } catch (err) {
      toast({
        title: "Couldn't generate your report",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay">
      <SEOHead
        title="Free AI-Powered Quick Start Report — FocusFlow AI"
        description="A personalized 3-section snapshot from Coach Kay: where you are, what to focus on first, and your one action this week."
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
        {!report && (
          <>
            <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
              FREE · AI-POWERED
            </span>
            <h1
              className="font-heading text-4xl md:text-5xl font-light mt-3 mb-4"
              style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
            >
              Get Your Free AI-Powered Quick Start Report
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10">
              A personalized 3-section snapshot of where you are, what to focus on first, and your one action this week.
            </p>
            <div className="mb-8"><PillarBadge pillar="O" /></div>
          </>
        )}

        {!report && !submitting && (
          <form
            onSubmit={submit}
            className="bg-card/50 backdrop-blur-sm border border-primary/25 rounded-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 font-mono-label text-primary tracking-[0.2em] text-xs mb-3">
              <Sparkles className="h-4 w-4" /> TELL COACH KAY ABOUT YOU
            </div>
            <p className="text-muted-foreground text-sm mb-5">
              Four quick fields. Coach Kay generates your report instantly, no waiting, no downloads.
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
              <select
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background/50 px-3 text-sm text-foreground"
              >
                <option value="" disabled>What kind of work do you do?</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Textarea
                required
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                placeholder="What's the one thing slowing you down right now? (time, leads, content, systems, clarity…)"
                className="bg-background/50 border-border min-h-[110px] resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !email.trim() || !businessType || !bottleneck.trim()}
              className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base"
            >
              Generate My Quick Start Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-center font-mono-label text-muted-foreground/60 text-[10px] tracking-[0.15em]">
              NO SPAM · UNSUBSCRIBE ANY TIME
            </p>
          </form>
        )}

        {submitting && !report && (
          <div className="space-y-4 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 rounded-lg border border-border bg-card/30 backdrop-blur-sm animate-pulse"
              />
            ))}
            <p className="text-center text-sm text-muted-foreground">
              Coach Kay is writing your Quick Start Report…
            </p>
          </div>
        )}

        {report && generatedAt && (
          <ReportView
            title="Your AI Quick Start Report"
            subtitle={`For ${name.trim() || email.trim().toLowerCase()} · ${businessType}`}
            generatedAt={generatedAt}
            userEmail={email.trim().toLowerCase()}
            footerCta={{
              label: "Want the full picture? Get your $47 AI Business Audit",
              href: "/rent-an-agent",
            }}
            sections={[
              { heading: "Where You Are", body: report.where_you_are },
              { heading: "What to Focus on First", body: report.what_to_focus_on },
              { heading: "Your Action This Week", body: report.action_this_week },
            ]}
          />
        )}

        <div className="mt-16">
          <PillarStrip />
        </div>
      </main>
    </div>
  );
};

export default StarterKit;