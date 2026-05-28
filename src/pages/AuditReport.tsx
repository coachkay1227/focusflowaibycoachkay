import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, Printer } from "lucide-react";
import { useAuditAccess } from "@/hooks/use-audit-access";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import { reportToPlaintext } from "@/lib/report-to-plaintext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const SKOOL_URL = "https://www.skool.com/focusflow-elevation-hub";

type Diagnostic = { score: number; note: string };
type AuditReport = {
  executive_snapshot: string;
  where_youre_leaking: string;
  focus_diagnostic: {
    foundation: Diagnostic; opportunity: Diagnostic; create: Diagnostic;
    uplift: Diagnostic; support: Diagnostic;
  };
  seven_day_plan: { day: number; focus_pillar: string; title: string; action: string; why: string }[];
  tool_stack_recommendations: { current_tool: string; recommendation: string; reasoning: string; type: string }[];
  custom_prompts: { use_case: string; prompt: string }[];
  next_best_move: { offer_slug: string; offer_name: string; why_this_one: string; what_youll_get: string; investment: string };
  all_pathways_note: string;
};

function ctaRoute(slug: string): { href: string; external?: boolean; opening_soon?: boolean; label?: string } {
  switch (slug) {
    // Door 1 — Transformation lane (no /transformations route yet → /store fallback; Phase 4B will add /transformations)
    case "transform_30_personal": return { href: "/store#30-personal" };
    case "transform_30_business": return { href: "/store#30-business" };
    case "transform_30_ai": return { href: "/store#30-ai" };
    case "transform_90_personal": return { href: "/store#90-personal" };
    case "transform_90_business": return { href: "/store#90-business" };
    case "transform_90_ai": return { href: "/store#90-ai" };
    case "transform_6mo_partnership": return { href: "/store#6-month" };
    // Door 2 — Rent-an-Agent
    case "rent_agent_starter": return { href: "/rent-an-agent#starter" };
    case "rent_agent_pro": return { href: "/rent-an-agent#pro" };
    case "rent_agent_dreamteam": return { href: "/rent-an-agent#dreamteam" };
    case "rent_agent_enterprise": return { href: "/rent-an-agent#enterprise" };
    // Door 2 — Lead Engine (lives inside /rent-an-agent)
    case "lead_engine_essentials": return { href: "/rent-an-agent#lead-engine-essentials" };
    case "lead_engine_pro": return { href: "/rent-an-agent#lead-engine-pro" };
    case "lead_engine_growth": return { href: "/rent-an-agent#lead-engine-growth" };
    case "lead_engine_scale": return { href: "/rent-an-agent#lead-engine-scale" };
    case "lead_engine_enterprise": return { href: "/rent-an-agent#lead-engine-enterprise" };
    // Door 3 — Advisory
    case "advisory_strategy_intensive": return { href: "/advisory#strategy-intensive" };
    case "advisory_executive": return { href: "/advisory#executive" };
    case "advisory_speaking": return { href: "/advisory#speaking" };
    case "advisory_corporate": return { href: "/advisory#corporate" };
    case "advisory_university": return { href: "/advisory#university" };
    case "group_programs": return { href: "/advisory#group-programs" };
    // Door 4 — Studio (books) lives in /store
    case "studio_mini_story": return { href: "/store#mini-story" };
    case "studio_storybook_pro": return { href: "/store#storybook-pro" };
    case "studio_other": return { href: "/store" };
    // Build Studio — Phase 3.5, opening soon (renders inline waitlist UI)
    case "build_studio_landing":
    case "build_studio_site":
    case "build_studio_dashboard":
      return { href: "#", opening_soon: true, label: "Opening soon — get notified" };
    // Community / free
    case "focus_flow_elevation_hub":
      return { href: SKOOL_URL, external: true, label: "Forward Focus Elevation Community · Free Access" };
    default:
      return { href: "/store" };
  }
}

const AuditReport = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = params.get("token") ?? undefined;

  const { audit, loading, canAccess, claimToAccount } = useAuditAccess(id, token);

  const report = audit?.report as AuditReport | null | undefined;

  const allSectionsForCopy = useMemo(() => {
    if (!report) return [];
    return [
      { heading: "Executive Snapshot", body: report.executive_snapshot },
      { heading: "Where You're Leaking", body: report.where_youre_leaking },
      {
        heading: "F.O.C.U.S. Diagnostic",
        body: ["foundation", "opportunity", "create", "uplift", "support"]
          .map((k) => {
            const d = (report.focus_diagnostic as unknown as Record<string, Diagnostic>)[k];
            return `${k.toUpperCase()} (${d.score}/10): ${d.note}`;
          }).join("\n"),
      },
      {
        heading: "7-Day Action Plan",
        body: report.seven_day_plan
          .map((d) => `Day ${d.day} — ${d.title} [${d.focus_pillar}]\n${d.action}\nWhy: ${d.why}`)
          .join("\n\n"),
      },
      {
        heading: "Tool Stack Recommendations",
        body: report.tool_stack_recommendations
          .map((t) => `${t.current_tool} → ${t.recommendation} (${t.type}): ${t.reasoning}`)
          .join("\n"),
      },
      {
        heading: "Custom Prompts",
        body: report.custom_prompts.map((p) => `[${p.use_case}]\n${p.prompt}`).join("\n\n"),
      },
      {
        heading: "Your Next Best Move",
        body: `${report.next_best_move.offer_name}\nWhy: ${report.next_best_move.why_this_one}\nWhat you'll get: ${report.next_best_move.what_youll_get}\nInvestment: ${report.next_best_move.investment}`,
      },
      { heading: "All Your Pathways", body: report.all_pathways_note },
    ];
  }, [report]);

  if (loading) return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">Loading audit…</div>;

  if (!canAccess || !audit) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <SEOHead title="Audit Access Required" description="Sign in or use your magic link to access this audit." path="/audit/report" noIndex />
        <h1 className="font-heading text-3xl text-primary mb-3">This audit requires access</h1>
        <p className="text-muted-foreground max-w-md mb-6">Sign in or check your magic link to view this report.</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <SEOHead title="Audit In Progress" description="Your audit is still generating." path="/audit/report" noIndex />
        <h1 className="font-heading text-3xl text-primary mb-3">Audit not yet generated</h1>
        <p className="text-muted-foreground mb-6">Your intake was saved. Return to the intake to finish.</p>
        <Button onClick={() => navigate(`/audit/intake${token ? `?token=${encodeURIComponent(token)}` : `?audit_id=${audit.id}`}`)}>
          Continue Intake
        </Button>
      </div>
    );
  }

  const nbm = report.next_best_move;
  const route = ctaRoute(nbm.offer_slug);
  const isFreeCommunity = nbm.offer_slug === "focus_flow_elevation_hub";

  const handlePrint = () => window.print();
  const handleCopy = async () => {
    try {
      const text = reportToPlaintext({
        title: `Your AI Business Audit`,
        subtitle: (audit.intake as { business_name?: string })?.business_name,
        sections: allSectionsForCopy,
        generatedAt: audit.generated_at ?? new Date(),
        footerUrl: "coachkayai.life",
      });
      await navigator.clipboard.writeText(text);
      toast.success("Report copied to clipboard");
    } catch { toast.error("Copy failed"); }
  };
  const copyPrompt = async (p: string) => {
    try { await navigator.clipboard.writeText(p); toast.success("Prompt copied"); }
    catch { toast.error("Copy failed"); }
  };

  const handleClaim = async () => {
    const claimed = await claimToAccount();
    if (claimed) toast.success("Audit linked to your account");
    else toast.error("Couldn't link audit — make sure you're signed in");
  };

  const pillars = ["foundation", "opportunity", "create", "uplift", "support"] as const;
  const pillarLabels = { foundation: "Foundation", opportunity: "Opportunity", create: "Create", uplift: "Uplift", support: "Support" };

  return (
    <div className="min-h-dvh bg-background text-foreground report-view">
      <SEOHead title="Your AI Business Audit — FocusFlow AI" description="Your custom AI Business Audit by Coach Kay." path="/audit/report" noIndex />
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .report-view, .report-view * { visibility: visible !important; }
          .report-view { position: absolute; left: 0; top: 0; width: 100%; background:#fff!important; color:#0D1B2A!important; padding:24px 32px!important; }
          .no-print { display: none !important; }
          nav, header, footer, aside, .chat-widget { display:none !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="no-print sticky top-0 z-20 -mx-6 mb-6 flex flex-wrap justify-end gap-2 border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md">
          <Button size="sm" variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" />Copy</Button>
          {!user && token && (
            <Button size="sm" disabled title="Sign in first to save">Save to my account</Button>
          )}
          {user && token && audit.user_id !== user.id && (
            <Button size="sm" onClick={handleClaim}>Save to my account</Button>
          )}
        </div>

        <header className="mb-10">
          <span className="font-mono-label text-primary tracking-[0.2em] text-xs">AI BUSINESS AUDIT</span>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-primary mt-2">Your Audit</h1>
          {audit.generated_at && (
            <p className="mt-3 font-mono-label text-[10px] tracking-[0.2em] text-muted-foreground/70">
              GENERATED · {new Date(audit.generated_at).toLocaleString()}
            </p>
          )}
        </header>

        {/* 1 — Executive Snapshot */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">YOUR EXECUTIVE SNAPSHOT</h2>
          <p className="mt-2 text-foreground/90 leading-relaxed whitespace-pre-line">{report.executive_snapshot}</p>
        </section>

        {/* 2 — Where You're Leaking */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">WHERE YOU'RE LEAKING</h2>
          <p className="mt-2 text-foreground/90 leading-relaxed whitespace-pre-line">{report.where_youre_leaking}</p>
        </section>

        {/* 3 — F.O.C.U.S. Diagnostic */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">YOUR F.O.C.U.S. DIAGNOSTIC</h2>
          <div className="mt-4 space-y-4">
            {pillars.map((k) => {
              const d = report.focus_diagnostic[k];
              const pct = Math.max(0, Math.min(100, (d.score / 10) * 100));
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-heading text-foreground">{pillarLabels[k]}</span>
                    <span className="text-primary">{d.score}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#0D1B2A] overflow-hidden">
                    <div className="h-full bg-[#C9A84C]" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{d.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4 — 7-Day Plan */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">YOUR 7-DAY ACTION PLAN</h2>
          <ol className="mt-4 space-y-4 border-l border-primary/30 pl-5">
            {report.seven_day_plan.map((d) => (
              <li key={d.day} className="relative">
                <span className="absolute -left-[26px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{d.day}</span>
                <div className="text-xs font-mono-label tracking-[0.2em] text-primary/70">{d.focus_pillar.toUpperCase()}</div>
                <div className="font-heading text-lg">{d.title}</div>
                <p className="text-sm text-foreground/90 mt-1">{d.action}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">Why: {d.why}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5 — Tool Stack */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">TOOL STACK RECOMMENDATIONS</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr><th className="py-2 pr-3">Current</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Recommendation</th><th className="py-2">Why</th></tr>
              </thead>
              <tbody>
                {report.tool_stack_recommendations.map((t, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="py-2 pr-3">{t.current_tool}</td>
                    <td className="py-2 pr-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t.type}</span></td>
                    <td className="py-2 pr-3">{t.recommendation}</td>
                    <td className="py-2 text-muted-foreground">{t.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6 — Custom Prompts */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">CUSTOM PROMPTS BUILT FOR YOU</h2>
          <div className="mt-4 grid gap-3">
            {report.custom_prompts.map((p, i) => (
              <div key={i} className="rounded-md border border-border bg-background/60 p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="font-heading">{p.use_case}</div>
                  <button onClick={() => copyPrompt(p.prompt)} className="text-xs text-primary hover:underline no-print">Copy</button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-foreground/90 font-mono bg-[#0D1B2A]/40 rounded p-3">{p.prompt}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* 7 — Next Best Move */}
        <section className="mb-8 rounded-xl border-2 border-primary bg-primary/10 p-7">
          <div className="text-xs font-mono-label tracking-[0.2em] text-primary mb-1">⭐ YOUR NEXT BEST MOVE</div>
          <h2 className="font-heading text-3xl text-primary">{nbm.offer_name}</h2>
          {isFreeCommunity && (
            <div className="mt-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
              Forward Focus Elevation Community · Free Access
            </div>
          )}
          <p className="mt-3 text-foreground/90 leading-relaxed">{nbm.why_this_one}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-mono-label tracking-[0.2em] text-muted-foreground">WHAT YOU'LL GET</div>
              <p className="mt-1">{nbm.what_youll_get}</p>
            </div>
            <div>
              <div className="text-xs font-mono-label tracking-[0.2em] text-muted-foreground">INVESTMENT</div>
              <p className="mt-1">{nbm.investment}</p>
            </div>
          </div>
          <div className="mt-6 no-print">
            {route.opening_soon ? (
              <BuildStudioWaitlist
                slug={nbm.offer_slug}
                defaultEmail={(audit.guest_email ?? "") as string}
              />
            ) : route.external ? (
              <a href={route.href} target="_blank" rel="noreferrer noopener"
                 className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {isFreeCommunity ? "Join the Free Community" : `Start with ${nbm.offer_name}`}
              </a>
            ) : (
              <Button onClick={() => navigate(route.href)} className="bg-primary text-primary-foreground">
                Start with {nbm.offer_name}
              </Button>
            )}
          </div>
        </section>

        {/* 8 — All Pathways */}
        <section className="mb-12 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">ALL YOUR PATHWAYS</h2>
          <p className="mt-2 text-foreground/90 whitespace-pre-line">{report.all_pathways_note}</p>
          <div className="mt-4 grid gap-2 text-sm no-print">
            <a className="text-primary hover:underline" href="/rent-an-agent">→ Rent-an-Agent / FocusFlow programs</a>
            <a className="text-primary hover:underline" href="/advisory">→ Advisory Consultation</a>
            <a className="text-primary hover:underline" href={SKOOL_URL} target="_blank" rel="noreferrer noopener">→ Focus Flow Elevation Hub (free community)</a>
            <a className="text-primary hover:underline" href="/store">→ Studio + Books</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuditReport;

// ---------- Build Studio waitlist (inline) ----------
function BuildStudioWaitlist({ slug, defaultEmail }: { slug: string; defaultEmail: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("cohort_registrations").insert({
        email: clean,
        first_name: name.trim() || null,
        cohort_name: `build_studio:${slug}`,
        source: "build_studio_waitlist",
      });
      if (error) throw error;
      setDone(true);
      toast.success("You're on the Build Studio waitlist");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't join waitlist");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-md border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
        ✓ You're on the list — we'll email you the moment F.O.C.U.S. Build Studio opens.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
      <div className="font-heading text-sm text-primary mb-2">
        Build Studio opens soon — be the first to know
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="First name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sm:max-w-[160px]"
        />
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={submit} disabled={submitting} className="bg-primary text-primary-foreground">
          {submitting ? "Joining…" : "Notify me"}
        </Button>
      </div>
    </div>
  );
}