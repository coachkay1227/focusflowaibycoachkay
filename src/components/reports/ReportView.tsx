import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { reportToPlaintext, type ReportSection } from "@/lib/report-to-plaintext";

export interface ReportViewProps {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  generatedAt: Date | string;
  userEmail?: string;
  footerCta?: { label: string; href: string };
  onEmail?: () => Promise<void>;
}

/**
 * Brand-consistent report renderer used across M.A.C. Assessment,
 * Starter Kit, and (future) AI Business Audit. Includes a sticky
 * action toolbar (Print/Copy/Email) and a dedicated @media print
 * stylesheet that strips the rest of the app for a clean printout.
 */
const ReportView = ({
  title,
  subtitle,
  sections,
  generatedAt,
  userEmail,
  footerCta,
  onEmail,
}: ReportViewProps) => {
  const [emailing, setEmailing] = useState(false);

  const generatedDate =
    typeof generatedAt === "string" ? new Date(generatedAt) : generatedAt;
  const generatedLabel = !Number.isNaN(generatedDate.getTime())
    ? generatedDate.toLocaleString()
    : "";

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleCopy = async () => {
    try {
      const text = reportToPlaintext({
        title,
        subtitle,
        sections,
        generatedAt: generatedDate,
        footerUrl: "coachkayai.life",
      });
      await navigator.clipboard.writeText(text);
      toast.success("Report copied to clipboard");
    } catch {
      toast.error("Couldn't copy — try Print instead");
    }
  };

  const handleEmail = async () => {
    if (!onEmail || emailing) return;
    setEmailing(true);
    try {
      await onEmail();
      toast.success(userEmail ? `Sent to ${userEmail}` : "Email sent");
    } catch {
      toast.error("Couldn't send email — please try again");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="report-view">
      {/* Print stylesheet — hides app chrome, styles the report. */}
      <style>{`
        @media print {
          /* Hide every app-chrome element by default */
          body * { visibility: hidden !important; }
          /* Then show only the report container and its contents */
          .report-view, .report-view * { visibility: visible !important; }
          .report-view { position: absolute; left: 0; top: 0; width: 100%; }
          /* Hide the interactive toolbar and any other no-print bits */
          .report-toolbar, .no-print { display: none !important; }
          /* Also force-hide common app shells that may render outside .report-view */
          nav, header, footer, aside, .floating-orbs, .mouse-glow,
          [data-app-chrome], .chat-widget { display: none !important; }
          .report-view {
            background: #ffffff !important;
            color: #0D1B2A !important;
            font-family: "DM Sans", sans-serif;
            padding: 32px 40px !important;
          }
          .report-view h1, .report-view h2, .report-view h3 {
            font-family: "Cormorant Garamond", serif !important;
            color: #0D1B2A !important;
          }
          .report-section {
            page-break-inside: avoid;
            border-color: #C9A84C !important;
            background: #ffffff !important;
          }
          .report-section-heading { color: #0D1B2A !important; }
          .report-section-body { color: #0D1B2A !important; }
          .report-print-footer { display: block !important; }
        }
        .report-print-footer { display: none; }
      `}</style>

      {/* Sticky action toolbar */}
      <div className="report-toolbar no-print sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-end gap-2 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-lg sm:border">
        <Button
          type="button"
          onClick={handlePrint}
          size="sm"
          variant="outline"
          className="border-border hover:border-primary/50"
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button
          type="button"
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className="border-border hover:border-primary/50"
        >
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
        {onEmail && (
          <Button
            type="button"
            onClick={handleEmail}
            size="sm"
            disabled={emailing}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Mail className="mr-2 h-4 w-4" />
            {emailing ? "Sending…" : "Email me"}
          </Button>
        )}
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1
          className="font-heading text-4xl md:text-5xl font-light text-primary"
          style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
        {generatedLabel && (
          <p className="mt-3 font-mono-label text-[10px] tracking-[0.2em] text-muted-foreground/70">
            GENERATED · {generatedLabel}
          </p>
        )}
      </header>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section, idx) => (
          <section
            key={`${section.heading}-${idx}`}
            className="report-section rounded-lg border border-border bg-card/40 backdrop-blur-sm p-5 md:p-6"
          >
            <h2 className="report-section-heading font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
              {section.heading.toUpperCase()}
            </h2>
            <p className="report-section-body mt-2 text-foreground/90 leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {/* Footer CTA — interactive, hidden on print */}
      {footerCta && (
        <div className="no-print mt-10 rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
          <a
            href={footerCta.href}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {footerCta.label}
          </a>
        </div>
      )}

      {/* Print-only footer */}
      <div className="report-print-footer mt-12 border-t border-[#C9A84C] pt-6 text-center">
        <p className="font-heading text-xl" style={{ color: "#0D1B2A" }}>
          Coach Kay Elevates
        </p>
        <p className="mt-1 text-sm" style={{ color: "#0D1B2A" }}>
          coachkayai.life
        </p>
        <p
          className="mt-3 font-mono text-[11px] tracking-[0.2em]"
          style={{ color: "#C9A84C" }}
        >
          WHERE FOCUS GOES, ENERGY FLOWS.
        </p>
      </div>
    </div>
  );
};

export default ReportView;