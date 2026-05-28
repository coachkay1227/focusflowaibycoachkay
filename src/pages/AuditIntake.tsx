import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditAccess } from "@/hooks/use-audit-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEOHead from "@/components/SEOHead";

const INDUSTRIES = [
  "Coaching/Consulting", "Course/Info Product", "Service-Based", "Creator/Influencer",
  "E-commerce/Product", "Nonprofit/Mission-Driven", "Agency", "SaaS",
  "Real Estate", "Health/Wellness", "Finance/Legal", "Other",
];
const STAGES = ["Idea", "Pre-launch", "Launched (under 1yr)", "Growing (1-3yr)", "Scaling (3yr+)", "Stuck/Stalled"];
const REVENUE = ["$0", "Under $1K", "$1K-$5K", "$5K-$10K", "$10K-$25K", "$25K-$50K", "$50K-$100K", "$100K+"];
const TEAM = ["Solo", "2-5", "6-20", "20+"];
const TOOLS = ["ChatGPT", "Claude", "Gemini", "Zapier", "Make/Integromat", "Notion", "Airtable", "HubSpot", "ConvertKit", "Stripe", "Calendly", "Slack", "Loom", "Canva"];
const SOFTWARE_SPEND = ["Under $100", "$100-$500", "$500-$1500", "$1500-$5000", "$5000+"];
const HOURS = ["Under 5", "5-10", "10-20", "20-40", "40+"];
const AI_USAGE = ["None", "Dabbling occasionally", "Using regularly", "Advanced/Building with it"];
const BOTTLENECK = ["Time", "Leads/Sales", "Content creation", "Operations/Systems", "Clarity/Direction", "Technology", "Team/Hiring", "Cash flow"];
const BUDGET = ["Under $500", "$500-$2K", "$2K-$5K", "$5K-$10K", "$10K+", "Not sure yet"];
const PATH = ["DIY with guidance", "Done-with-me coaching", "Done-for-me service", "Not sure yet"];

const intakeSchema = z.object({
  business_name: z.string().trim().min(1).max(200),
  website: z.string().trim().max(500).optional().or(z.literal("")),
  industry: z.enum(INDUSTRIES as [string, ...string[]]),
  stage: z.enum(STAGES as [string, ...string[]]),
  monthly_revenue: z.enum(REVENUE as [string, ...string[]]),
  team_size: z.enum(TEAM as [string, ...string[]]),
  current_tools: z.array(z.string()).default([]),
  current_tools_other: z.string().max(300).optional().or(z.literal("")),
  monthly_software_spend: z.enum(SOFTWARE_SPEND as [string, ...string[]]),
  hours_repetitive_tasks: z.enum(HOURS as [string, ...string[]]),
  ai_usage_today: z.enum(AI_USAGE as [string, ...string[]]),
  ai_tried_so_far: z.string().max(2000).optional().or(z.literal("")),
  primary_offer: z.string().trim().min(1).max(2000),
  biggest_bottleneck: z.enum(BOTTLENECK as [string, ...string[]]),
  whats_broken: z.string().trim().min(50).max(3000),
  outcome_30_days: z.string().trim().min(30).max(2000),
  what_2x_looks_like: z.string().max(2000).optional().or(z.literal("")),
  budget_appetite: z.enum(BUDGET as [string, ...string[]]),
  preferred_path: z.enum(PATH as [string, ...string[]]),
});

type IntakeState = z.input<typeof intakeSchema>;

const defaultState: IntakeState = {
  business_name: "", website: "", industry: "Coaching/Consulting",
  stage: "Idea", monthly_revenue: "$0", team_size: "Solo",
  current_tools: [], current_tools_other: "",
  monthly_software_spend: "Under $100", hours_repetitive_tasks: "Under 5",
  ai_usage_today: "None", ai_tried_so_far: "", primary_offer: "",
  biggest_bottleneck: "Time", whats_broken: "", outcome_30_days: "",
  what_2x_looks_like: "", budget_appetite: "Not sure yet", preferred_path: "Not sure yet",
};

const RadioRow = ({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) => (
  <div>
    <Label className="text-sm text-foreground/90">{label}</Label>
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-md border px-3 py-2 text-sm transition-colors ${
            value === opt
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card/30 text-foreground/80 hover:border-primary/50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const AuditIntake = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get("token") ?? undefined;
  const auditIdFromUrl = searchParams.get("audit_id") ?? undefined;

  const { audit, loading, canAccess } = useAuditAccess(auditIdFromUrl, token);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<IntakeState>(defaultState);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isRetry = searchParams.get("retry") === "1";

  // Resume support: when the audit row already has intake data
  // (Dashboard "Complete Intake" or "Retry" CTAs), pre-populate the form
  // so the user doesn't lose work and can regenerate without retyping.
  useEffect(() => {
    if (!audit || hydrated) return;
    const existing = (audit.intake ?? {}) as Partial<IntakeState> & {
      current_tools?: unknown;
    };
    const hasAny = Object.keys(existing).length > 0;
    if (hasAny) {
      setData((d) => ({
        ...d,
        ...existing,
        current_tools: Array.isArray(existing.current_tools)
          ? (existing.current_tools as string[])
          : d.current_tools,
      }));
    }
    setHydrated(true);
  }, [audit, hydrated]);

  const progress = useMemo(() => (step === 1 ? 33 : step === 2 ? 66 : 100), [step]);

  if (loading) {
    return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!canAccess || !audit) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <SEOHead title="AI Business Audit — Access Needed" description="Purchase or sign in to access your audit intake." path="/audit/intake" noIndex />
        <h1 className="font-heading text-3xl text-primary mb-3">Audit access required</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to purchase the $47 AI Business Audit or sign in with the account used at purchase.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/rent-an-agent")}>Purchase Audit</Button>
          <Button variant="outline" onClick={() => navigate("/auth?next=/audit/intake")}>Sign in</Button>
        </div>
      </div>
    );
  }

  const toggleTool = (t: string) => {
    setData((d) => ({
      ...d,
      current_tools: d.current_tools.includes(t)
        ? d.current_tools.filter((x) => x !== t)
        : [...d.current_tools, t],
    }));
  };

  const handleSubmit = async () => {
    const parsed = intakeSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast.error(`Please check: ${first.path.join(".")} — ${first.message}`);
      return;
    }
    setSubmitting(true);
    try {
      const payloadIntake = {
        ...parsed.data,
        current_tools: [
          ...parsed.data.current_tools,
          ...(parsed.data.current_tools_other ? [parsed.data.current_tools_other] : []),
        ],
      };
      const { data: res, error } = await supabase.functions.invoke("generate-business-audit", {
        body: { audit_id: audit.id, intake: payloadIntake, token },
      });
      if (error) throw error;
      if (!(res as { ok?: boolean })?.ok) throw new Error("Generation failed");
      const qs = token ? `?token=${encodeURIComponent(token)}` : "";
      navigate(`/audit/report/${audit.id}${qs}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed — please retry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead title="AI Business Audit Intake — FocusFlow AI" description="Complete your 17-field intake. Custom audit generates in under 2 minutes." path="/audit/intake" noIndex />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <span className="font-mono-label text-primary tracking-[0.2em] text-xs">$47 AI BUSINESS AUDIT</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light text-primary mt-2">
            {isRetry ? "Retry your audit" : audit.report ? "Update your audit" : audit.intake && Object.keys(audit.intake).length > 0 ? "Resume your intake" : "Tell us about your business"}
          </h1>
          <p className="text-muted-foreground mt-2">Step {step} of 3 · ~5–7 minutes</p>
          {(isRetry || (audit.intake && Object.keys(audit.intake).length > 0)) && (
            <p className="mt-2 text-xs text-primary/80">Your previous answers have been pre-filled — edit anything, then regenerate.</p>
          )}
          <div className="mt-4 h-2 w-full rounded-full bg-card/40 overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl">Business Snapshot</h2>
            <div>
              <Label>Business name *</Label>
              <Input value={data.business_name} onChange={(e) => setData({ ...data, business_name: e.target.value })} />
            </div>
            <div>
              <Label>Website (optional)</Label>
              <Input value={data.website ?? ""} onChange={(e) => setData({ ...data, website: e.target.value })} placeholder="https://" />
            </div>
            <div>
              <Label>Industry *</Label>
              <select className="mt-2 w-full rounded-md border border-border bg-card/30 px-3 py-2 text-sm"
                value={data.industry} onChange={(e) => setData({ ...data, industry: e.target.value })}>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <RadioRow label="Stage *" value={data.stage} options={STAGES} onChange={(v) => setData({ ...data, stage: v })} />
            <RadioRow label="Current monthly revenue *" value={data.monthly_revenue} options={REVENUE} onChange={(v) => setData({ ...data, monthly_revenue: v })} />
            <RadioRow label="Team size *" value={data.team_size} options={TEAM} onChange={(v) => setData({ ...data, team_size: v })} />
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Continue →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl">Current Reality</h2>
            <div>
              <Label>Current tools (multi-select)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <button type="button" key={t} onClick={() => toggleTool(t)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      data.current_tools.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/30 text-foreground/80"
                    }`}>{t}</button>
                ))}
              </div>
              <Input className="mt-2" placeholder="Other (comma-separated)"
                value={data.current_tools_other ?? ""} onChange={(e) => setData({ ...data, current_tools_other: e.target.value })} />
            </div>
            <RadioRow label="Monthly software spend" value={data.monthly_software_spend} options={SOFTWARE_SPEND} onChange={(v) => setData({ ...data, monthly_software_spend: v })} />
            <RadioRow label="Hours/week on repetitive tasks" value={data.hours_repetitive_tasks} options={HOURS} onChange={(v) => setData({ ...data, hours_repetitive_tasks: v })} />
            <RadioRow label="AI usage today" value={data.ai_usage_today} options={AI_USAGE} onChange={(v) => setData({ ...data, ai_usage_today: v })} />
            <div>
              <Label>What AI have you tried? (optional)</Label>
              <Textarea value={data.ai_tried_so_far ?? ""} onChange={(e) => setData({ ...data, ai_tried_so_far: e.target.value })} />
            </div>
            <div>
              <Label>Your primary offer *</Label>
              <Textarea value={data.primary_offer} onChange={(e) => setData({ ...data, primary_offer: e.target.value })} placeholder="What do you sell, to whom, for how much?" />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => setStep(3)}>Continue →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl">Pain + Goal + Routing</h2>
            <RadioRow label="Biggest bottleneck *" value={data.biggest_bottleneck} options={BOTTLENECK} onChange={(v) => setData({ ...data, biggest_bottleneck: v })} />
            <div>
              <Label>What's broken right now? * (min 50 chars)</Label>
              <Textarea rows={4} value={data.whats_broken} onChange={(e) => setData({ ...data, whats_broken: e.target.value })} />
            </div>
            <div>
              <Label>What does success in 30 days look like? * (min 30 chars)</Label>
              <Textarea rows={3} value={data.outcome_30_days} onChange={(e) => setData({ ...data, outcome_30_days: e.target.value })} />
            </div>
            <div>
              <Label>What would 2x look like? (optional)</Label>
              <Textarea rows={3} value={data.what_2x_looks_like ?? ""} onChange={(e) => setData({ ...data, what_2x_looks_like: e.target.value })} />
            </div>
            <RadioRow label="If outside help solved your bottleneck, what would feel doable to invest? *" value={data.budget_appetite} options={BUDGET} onChange={(v) => setData({ ...data, budget_appetite: v })} />
            <RadioRow label="What kind of support feels right? *" value={data.preferred_path} options={PATH} onChange={(v) => setData({ ...data, preferred_path: v })} />

            {submitting ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
                <div className="font-heading text-xl text-primary mb-2">Analyzing your business across 12 vectors…</div>
                <p className="text-muted-foreground text-sm">Generating your custom audit… Routing your best next move…</p>
              </div>
            ) : (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">Generate My Audit</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditIntake;