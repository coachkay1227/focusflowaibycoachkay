import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEOHead from "@/components/SEOHead";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

const TIMELINE_OPTIONS = [
  { value: '3_days', label: '3 days' },
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
];

const AgentIntake = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [agentPurpose, setAgentPurpose] = useState('');
  const [agentList, setAgentList] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [documents, setDocuments] = useState('');
  const [timeline, setTimeline] = useState('1_week');
  const [guestEmail, setGuestEmail] = useState('');

  // We infer whether this is an agency build from agentList having content
  // (the field is shown if user types something — it's optional/conditional)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error('Please enter your business name.');
      return;
    }
    if (agentPurpose.trim().length < 100) {
      toast.error('Please describe what your agent should do (at least 100 characters).');
      return;
    }
    if (!user && !guestEmail.trim()) {
      toast.error('Please enter your email address so we can reach you.');
      return;
    }

    setSubmitting(true);
    try {
      const email = user?.email ?? guestEmail.trim().toLowerCase();

      const intakePayload = {
        business_name: businessName.trim(),
        website_url: websiteUrl.trim() || null,
        agent_purpose: agentPurpose.trim(),
        agent_list: agentList.trim() || null,
        brand_voice: brandVoice.trim() || null,
        documents: documents.trim() || null,
        timeline,
      };

      // Insert into agent_orders table (table not in generated types yet)
      const { data: orderData, error: orderError } = await (supabase as any)
        .from('agent_orders')
        .insert({
          user_id: user?.id ?? null,
          guest_email: user ? null : email,
          agent_type: 'gpt', // default; actual type would come from order context
          agent_tier: 'single',
          agent_count: 1,
          status: 'intake_submitted',
          intake: intakePayload,
        })
        .select('id')
        .single();

      if (orderError) {
        console.error('agent_orders insert error:', orderError);
        throw new Error('Failed to save your intake. Please try again.');
      }

      // Send confirmation email
      if (email) {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'agent-intake-received',
            recipientEmail: email,
            idempotencyKey: `agent-intake-${orderData?.id ?? Date.now()}`,
            templateData: {
              agentType: 'Custom AI Agent',
              agentCount: 1,
              timeline: TIMELINE_OPTIONS.find((t) => t.value === timeline)?.label ?? timeline,
            },
          },
        }).catch((err: unknown) => {
          console.warn('agent-intake-received email failed:', err);
        });
      }

      // Notify GHL that intake was submitted (requires auth JWT; guests are
      // already in CRM from the stripe-webhook purchase event).
      if (user) {
        supabase.functions.invoke('ghl-webhook', {
          body: {
            event: 'agent_intake_submitted',
            payload: {
              email,
              order_id: orderData?.id ?? null,
              business_name: businessName.trim(),
              timeline: TIMELINE_OPTIONS.find((t) => t.value === timeline)?.label ?? timeline,
            },
          },
        }).catch(() => {});
      }

      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-dvh overflow-hidden grain-overlay bg-background text-foreground flex items-center justify-center px-6">
        <FloatingOrbs />
        <div className="relative z-10 max-w-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <span className="font-mono-label text-primary tracking-[0.2em]">INTAKE RECEIVED</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light">
            Your intake is in.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Coach Kay will have your agent ready within your selected timeline. You'll receive an email with your files and setup instructions when it's done.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            Go to Dashboard
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden grain-overlay bg-background text-foreground">
      <SEOHead
        title="Agent Intake — FocusFlow AI"
        description="Submit your agent intake form so Coach Kay can build your custom AI agent."
        path="/agent-intake"
        noIndex
      />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">FocusFlow</span> AI
        </div>
        <div />
      </div>

      <div className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.2em]">AGENT INTAKE FORM</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light mt-4 leading-tight">
            Let's build your agent.
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            This takes about 5 minutes. The more detail you give, the better your agent will sound like you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business name */}
          <div>
            <Label htmlFor="business-name" className="text-foreground/90">
              Business name <span className="text-primary">*</span>
            </Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Coach Kay Elevates"
              className="mt-2 bg-card/30 border-border"
              maxLength={200}
              required
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website-url" className="text-foreground/90">
              Website URL <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Input
              id="website-url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yoursite.com"
              className="mt-2 bg-card/30 border-border"
              maxLength={500}
            />
          </div>

          {/* Agent purpose */}
          <div>
            <Label htmlFor="agent-purpose" className="text-foreground/90">
              What should the agent do, in detail? <span className="text-primary">*</span>
            </Label>
            <p className="text-muted-foreground text-xs mt-1 mb-2">
              Be specific: what triggers it, what it responds to, what tone it uses. Minimum 100 characters.
            </p>
            <Textarea
              id="agent-purpose"
              value={agentPurpose}
              onChange={(e) => setAgentPurpose(e.target.value)}
              placeholder="When a customer asks about pricing, the agent should... It should always respond in a warm but professional tone..."
              className="bg-card/30 border-border min-h-[140px] resize-none"
              maxLength={5000}
              required
            />
            <p className={`text-xs mt-1 ${agentPurpose.length >= 100 ? 'text-primary/70' : 'text-muted-foreground/60'}`}>
              {agentPurpose.length} / 100 minimum
            </p>
          </div>

          {/* Agency build — agent list */}
          <div>
            <Label htmlFor="agent-list" className="text-foreground/90">
              For multi-agent builds: list each agent and its purpose <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <p className="text-muted-foreground text-xs mt-1 mb-2">
              Example: "Agent 1: Customer FAQ bot for product questions. Agent 2: Content writer for Instagram captions."
            </p>
            <Textarea
              id="agent-list"
              value={agentList}
              onChange={(e) => setAgentList(e.target.value)}
              placeholder="Agent 1: ..."
              className="bg-card/30 border-border min-h-[100px] resize-none"
              maxLength={3000}
            />
          </div>

          {/* Brand voice */}
          <div>
            <Label htmlFor="brand-voice" className="text-foreground/90">
              Brand voice notes <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <p className="text-muted-foreground text-xs mt-1 mb-2">
              How should it sound? Formal/casual, keywords to use/avoid, examples of your writing style.
            </p>
            <Textarea
              id="brand-voice"
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="Warm, direct, confident. Never uses corporate jargon. Uses 'you' not 'one'. Avoids: synergy, leverage, utilize..."
              className="bg-card/30 border-border min-h-[100px] resize-none"
              maxLength={2000}
            />
          </div>

          {/* Documents */}
          <div>
            <Label htmlFor="documents" className="text-foreground/90">
              Document links <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <p className="text-muted-foreground text-xs mt-1 mb-2">
              Paste links to any Google Docs, Notion pages, PDFs, or Drive folders you want the agent trained on.
            </p>
            <Textarea
              id="documents"
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
              placeholder="https://docs.google.com/... (make sure sharing is enabled)"
              className="bg-card/30 border-border min-h-[80px] resize-none"
              maxLength={3000}
            />
          </div>

          {/* Timeline */}
          <div>
            <Label className="text-foreground/90">Preferred delivery timeline</Label>
            <div className="mt-3 flex flex-wrap gap-3">
              {TIMELINE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeline(opt.value)}
                  className={`rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
                    timeline === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card/30 text-foreground/80 hover:border-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guest email (if not authed) */}
          {!user && (
            <div>
              <Label htmlFor="guest-email" className="text-foreground/90">
                Your email <span className="text-primary">*</span>
              </Label>
              <p className="text-muted-foreground text-xs mt-1 mb-2">
                We'll send your completed agent files here.
              </p>
              <Input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@email.com"
                className="bg-card/30 border-border"
                maxLength={255}
                required={!user}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base mt-4"
          >
            {submitting ? 'Submitting…' : 'Submit My Agent Intake →'}
          </Button>

          <p className="text-center text-xs text-muted-foreground/50">
            Coach Kay reviews every intake personally. Expect delivery within your selected timeline.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AgentIntake;
