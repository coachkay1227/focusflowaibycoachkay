import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SHAREABLE_OFFERS } from "@/lib/shareable-offers";
import { BUILD_STUDIO_TIERS } from "@/lib/build-studio-catalog";
import { CheckCircle2 } from "lucide-react";

/** One inquiry for every offer that is not an instant purchase. Dropdowns do
 *  the guiding so nobody has to guess what to type, and the offer arrives
 *  prefilled from the link or QR code that brought them here. */

const WANTS = [
  "Not sure yet, help me scope it",
  ...BUILD_STUDIO_TIERS.flatMap((t) => t.offers.map((o) => `${t.label}: ${o.name}`)),
  "Rent-an-Agent (managed AI team)",
  "AI Lead Engine",
  "Corporate training or workshop",
  "Speaking engagement",
  "Book or publishing project",
  "Something else",
];

const AUDIENCES = [
  "My own business",
  "My clients or customers",
  "My team internally",
  "A school, agency, or nonprofit",
  "A corporate department",
];

const BUDGETS = [
  "Not sure yet, tell me what it takes",
  "Under $1K",
  "$1K – $5K",
  "$5K – $10K",
  "$10K – $15K",
  "$15K+",
];

const TIMELINES = ["As soon as possible", "Within a month", "1 to 3 months", "Just exploring"];

const StartABuild = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const prefill = useMemo(() => {
    const offerParam = params.get("offer") ?? params.get("interest");
    if (!offerParam) return "";
    const direct = WANTS.find((w) => w.toLowerCase().includes(offerParam.toLowerCase()));
    if (direct) return direct;
    const known = SHAREABLE_OFFERS.find((o) => o.slug === offerParam || o.slug === `build_${offerParam}`);
    if (!known) return "";
    return WANTS.find((w) => known.label.includes(w.split(": ").pop() ?? "")) ?? "";
  }, [params]);

  const [want, setWant] = useState(WANTS[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [problem, setProblem] = useState("");
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (prefill) setWant(prefill);
  }, [prefill]);

  const source = params.get("utm_source") ?? params.get("source") ?? "start-a-build";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !problem.trim()) {
      toast({ title: "Name, email, and what you're solving are needed", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error: dbErr } = await supabase.from("build_inquiries").insert({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || null,
        project_type: want,
        tier: audience,
        budget_range: budget,
        timeline,
        notes: problem.trim(),
        source,
      });
      if (dbErr) throw dbErr;

      const message = [
        `Interested in: ${want}`,
        `Building for: ${audience}`,
        `Budget: ${budget}`,
        `Timeline: ${timeline}`,
        `Source: ${source}`,
        "",
        problem.trim(),
      ].join("\n");

      const { error: emailErr } = await supabase.functions.invoke("apply-now", {
        body: {
          type: "inquiry",
          name: name.trim(),
          email: email.trim(),
          organization: company.trim() || undefined,
          programName: want,
          message,
        },
      });
      if (emailErr) console.warn("apply-now notification failed", emailErr);

      setSubmitted(true);
    } catch (err) {
      toast({
        title: "That did not go through",
        description:
          err instanceof Error
            ? err.message
            : "Please try again, or email hello@coachkayelevates.org directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const select =
    "w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Start a Build — Tell Coach Kay What You Need"
        description="One short form. Tell us what you want built, who it serves, and what it needs to solve. Coach Kay scopes it and replies within one business day."
      />
      <main className="mx-auto max-w-2xl px-4 py-16">
        {submitted ? (
          <section className="rounded-2xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h1 className="font-heading text-3xl text-foreground">Got it. I'm glad you're here.</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Your request is in. Coach Kay reads every one personally and replies within one
              business day with scope, timeline, and what the investment looks like for what you
              described.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Where Focus Goes, Energy Flows.
            </p>
          </section>
        ) : (
          <>
            <header className="mb-10">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
                Start a build
              </p>
              <h1 className="font-heading text-4xl leading-tight text-foreground">
                Tell me what you need. I'll tell you what it takes.
              </h1>
              <p className="mt-4 text-muted-foreground">
                If you're a founder, coach, or team who knows the outcome you want but not the build
                behind it, this is the form. Scope and investment come back from a real look at your
                project, not a price grid.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
              <div>
                <Label htmlFor="sab-want">What are you looking for?</Label>
                <select id="sab-want" value={want} onChange={(e) => setWant(e.target.value)} className={select}>
                  {WANTS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sab-audience">Who is it for?</Label>
                <select
                  id="sab-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className={select}
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sab-problem">What does it need to solve? *</Label>
                <Textarea
                  id="sab-problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="What is costing you time or leads right now? What should be true when this is done?"
                  className="min-h-[120px]"
                  maxLength={2000}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sab-budget">Budget range</Label>
                  <select
                    id="sab-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={select}
                  >
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="sab-timeline">Timeline</Label>
                  <select
                    id="sab-timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className={select}
                  >
                    {TIMELINES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sab-name">Name *</Label>
                  <Input id="sab-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
                </div>
                <div>
                  <Label htmlFor="sab-email">Email *</Label>
                  <Input
                    id="sab-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sab-company">Company or organization (optional)</Label>
                <Input id="sab-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={200} />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Sending…" : "→ Send My Request"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No payment here. You get scope and an estimate first.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default StartABuild;
