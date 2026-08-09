import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Layers, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ENTRY_OFFERS, ADVISORY_LANES, ADVISORY_FORMATS } from "@/lib/offer-catalog";
import { webPage, breadcrumb, serviceSchema, SITE_URL, ORG_ID } from "@/lib/seo-schema";
import FAQSection from "@/components/FAQSection";
import { getFaqLane, faqPageSchema } from "@/data/faqs";

const Advisory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busyPriceId, setBusyPriceId] = useState<string | null>(null);

  // Single advisory inquiry form
  const [format, setFormat] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const startCheckout = async (priceId: string, name: string, successPath?: string) => {
    setBusyPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          successPath: successPath ?? `/order-success?tier=${encodeURIComponent(name)}`,
          cancelPath: "/advisory?checkout=cancelled",
        },
      });
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (e) {
      toast({
        title: "Checkout could not start",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyPriceId(null);
    }
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!format || !name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("apply-now", {
        body: {
          type: "inquiry",
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim() || undefined,
          programName: `Advisory. ${format}`,
          message: `Format requested: ${format}\n\n${message.trim()}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email hello@coachkayelevates.org directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const jsonLd = [
    webPage("/advisory", "Advisory, Events & Premium Education", "CollectionPage"),
    serviceSchema({
      name: "Fractional AI Advisory. Coach Kay",
      description:
        "Fractional AI advisory and strategic partnership with Coach Kay. For leaders, founders, and organizations ready to integrate AI into their business at scale.",
      url: `${SITE_URL}/advisory`,
      idSuffix: "fractional-ai-advisory",
    }),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Advisory & Events", path: "/advisory" },
      ],
      "/advisory",
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/advisory#itemlist`,
      name: "Advisory, Speaking & Cohort Offers",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Service",
            name: ENTRY_OFFERS.audit.name,
            description: ENTRY_OFFERS.audit.description,
            provider: { "@id": ORG_ID },
            offers: {
              "@type": "Offer",
              price: ENTRY_OFFERS.audit.price.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Service",
            name: ENTRY_OFFERS.intensive.name,
            description: ENTRY_OFFERS.intensive.description,
            provider: { "@id": ORG_ID },
            offers: {
              "@type": "Offer",
              price: ENTRY_OFFERS.intensive.price.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        },
        ...ADVISORY_LANES.map((l, i) => ({
          "@type": "ListItem",
          position: i + 3,
          item: {
            "@type": "Service",
            name: l.name,
            description: l.description,
            provider: { "@id": ORG_ID },
          },
        })),
      ],
    },
    faqPageSchema(getFaqLane("advisory")?.items ?? [], `${SITE_URL}/advisory#faq`),
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="Advisory, Speaking & Cohorts: Coach Kay"
        description="Fractional AI advisory and strategic partnership with Coach Kay. For leaders, founders, and organizations ready to integrate AI into their business at scale."
        path="/advisory"
        keywords={[
          "fractional AI advisory",
          "AI consultant for small business",
          "corporate AI training Columbus",
          "AI keynote speaker Ohio",
          "executive AI strategy coaching",
          "Coach Kay advisory",
        ]}
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="font-heading text-lg font-light" role="img" aria-label="Coach Kay Elevates">
          <span aria-hidden="true" className="text-primary font-medium">
            Coach Kay
          </span>
          <span aria-hidden="true" className="text-foreground font-light">
            Elevates
          </span>
        </div>
        <MobileNav />
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-10 max-w-5xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
          ADVISORY · TRAINING · COHORTS
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Bring Coach Kay <span className="text-primary italic">into the room.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          If you lead a team, a company, or an institution and you are trying to figure out where AI actually fits, this
          is the page. Start small with the audit, or map the whole thing with me in one session.
        </p>
      </section>

      {/* 2. ENTRY */}
      <section className="relative z-10 px-6 sm:px-10 pb-10 max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 sm:p-10">
            <span className="font-mono-label text-primary tracking-[0.28em] text-xs">START HERE</span>
            <h2 className="font-heading text-2xl sm:text-3xl mt-3">{ENTRY_OFFERS.audit.name}</h2>
            <div className="mt-2 text-primary text-xl font-bold">{ENTRY_OFFERS.audit.priceDisplay}</div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              The lowest-risk way to work with me. You answer a short set of questions and you get back a real read on
              where AI belongs in your business, plus the first moves to make. No call required.
            </p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2">
              {ENTRY_OFFERS.audit.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              variant="outline"
              className="mt-6 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => navigate("/audit/intake")}
            >
              Take the $47 audit <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* 3. THE OFFER */}
      <section className="relative z-10 px-6 sm:px-10 pb-14 max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-primary/40 bg-primary/5 backdrop-blur-sm p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
                  THE OFFER · DIRECT CHECKOUT
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl mt-3 text-foreground">
                  {ENTRY_OFFERS.intensive.name}
                </h2>
                <div className="mt-2 text-primary text-2xl font-bold">{ENTRY_OFFERS.intensive.priceDisplay}</div>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {ENTRY_OFFERS.intensive.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {ENTRY_OFFERS.intensive.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full sm:w-auto sm:min-w-[200px]">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => startCheckout(ENTRY_OFFERS.intensive.priceId, "AI Strategy Intensive")}
                  disabled={busyPriceId === ENTRY_OFFERS.intensive.priceId}
                >
                  {busyPriceId === ENTRY_OFFERS.intensive.priceId ? "Starting…" : "Book my Intensive"}
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* 4. WHAT SCOPES LOOK LIKE */}
      <section className="relative z-10 px-6 sm:px-10 pb-14 max-w-4xl mx-auto">
        <AnimatedSection>
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">BIGGER SCOPES</span>
          <h2 className="font-heading text-2xl sm:text-3xl mt-3">What larger engagements look like</h2>
          <ul className="mt-6 divide-y divide-border/50 rounded-xl border border-border/60 bg-card/30 backdrop-blur-sm">
            {ADVISORY_LANES.map((lane) => (
              <li key={lane.key} className="p-5 sm:p-6">
                <h3 className="font-heading text-lg text-foreground">
                  {"route" in lane && lane.route ? (
                    <Link to={lane.route} className="text-primary hover:text-primary/80 inline-flex items-center gap-2">
                      {lane.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    lane.name
                  )}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{lane.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Scoped engagements start at $500. Final scope and price are set on a call, after I understand what you are
            actually trying to move.
          </p>
        </AnimatedSection>
      </section>

      {/* 5. THE FORM */}
      <section id="inquire" className="relative z-10 px-6 sm:px-10 pb-20 max-w-3xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-7 sm:p-10">
            <span className="font-mono-label text-primary tracking-[0.28em] text-xs">ONE FORM</span>
            <h2 className="font-heading text-2xl sm:text-3xl mt-3">Tell me what you need</h2>

            {sent ? (
              <p className="mt-5 text-sm sm:text-base text-foreground/90 leading-relaxed">
                Got it. Your request is in. Coach Kay reviews every inquiry personally and will reply with next steps
                and a scope. I'm glad you're here.
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Pick the format closest to what you have in mind. If none of them fit, choose the last option and tell
                  me what you are working with.
                </p>
                <form onSubmit={submitInquiry} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="adv-format">What are you booking? *</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger id="adv-format" className="border-border">
                        <SelectValue placeholder="Choose a format" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADVISORY_FORMATS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adv-name">Name *</Label>
                      <Input
                        id="adv-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-border"
                        maxLength={100}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adv-email">Email *</Label>
                      <Input
                        id="adv-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-border"
                        maxLength={255}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="adv-org">Organization (optional)</Label>
                    <Input
                      id="adv-org"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="border-border"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adv-msg">Goals, team size, timeline *</Label>
                    <Textarea
                      id="adv-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-border min-h-[110px]"
                      maxLength={2000}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {submitting ? "Sending…" : "Send my request"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Coach Kay reviews every inquiry personally.
                  </p>
                </form>
              </>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* 6. WHO DELIVERS */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-7 md:p-9">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <span className="font-mono-label text-primary tracking-[0.22em] text-[10px]">WHO DELIVERS</span>
          </div>
          <h2 className="font-heading text-2xl text-foreground mb-3">
            Advisory is led by Coach Kay, with partner capacity when the scope calls for it.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            For larger training, cohort, and enterprise scopes, Coach Kay brings in partner capacity across engineering,
            AI research, design, and QA. That capacity comes through Collective AI, the separate enterprise founded by
            John Moyler, where Coach Kay serves as an AI partner.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            The Cbus AI Task Force is a different thing. It is Coach Kay's own Columbus program, not that company.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://collectiveai.info/consulting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
            >
              Collective AI, the partner company <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              to="/ai-task-force"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
            >
              Cbus AI Task Force, Coach Kay's Columbus program <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <FAQSection eyebrow="Advisory & Cohorts" items={getFaqLane("advisory")?.items ?? []} />
    </div>
  );
};

export default Advisory;
