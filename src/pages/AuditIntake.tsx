import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  full_name: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().email("Valid email required").max(255),
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
  full_name: "", email: "",
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
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<IntakeState>(defaultState);
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => (step === 1 ? 33 : step === 2 ? 66 : 100), [step]);

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
      toast.error(`Please check: ${first.path.join(".")}: ${first.message}`);
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
      // Stash intake locally so AuditLanding can attach it after Stripe redirect.
      const leadId = crypto.randomUUID();
      try {
        sessionStorage.setItem(
          `audit:lead:${leadId}`,
          JSON.stringify(payloadIntake),
        );
        sessionStorage.setItem("audit:lead:last", leadId);
      } catch { /* sessionStorage may be unavailable */ }

      const { data: res, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: "price_1Tb41PBReje0oFcLMlvzjQQa", // AI Business Audit $47
          customerEmail: parsed.data.email,
          fullName: parsed.data.full_name,
          leadId,
          successPath: `/audit/landing?lead_id=${encodeURIComponent(leadId)}`,
          cancelPath: "/audit/intake?cancelled=1",
        },
      });
      if (error) throw error;
      const url = (res as { url?: string } | null)?.url;
      if (!url) throw new Error("Checkout failed");
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed. Please retry.");
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
            Tell us about your business
          </h1>
          <p className="text-muted-foreground mt-2">Step {step} of 3 · ~5–7 minutes · Pay $47 after intake</p>
          <div className="mt-4 h-2 w-full rounded-full bg-card/40 overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading text-xl">Business Snapshot</h2>
            <div>
              <Label>Full name *</Label>
              <Input value={data.full_name} onChange={(e) => setData({ ...data, full_name: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="you@business.com" />
              <p className="text-xs text-muted-foreground mt-1">We'll send your audit + receipt here.</p>
            </div>
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
                <div className="font-heading text-xl text-primary mb-2">Redirecting to secure checkout…</div>
                <p className="text-muted-foreground text-sm">Saving your intake and opening Stripe…</p>
              </div>
            ) : (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">Continue to Payment · $47</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditIntake;