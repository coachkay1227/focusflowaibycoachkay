import { useEffect, useState } from "react";
import SEOHead from "@/components/SEOHead";
import assessmentLogicMd from "../../docs/ASSESSMENT_LOGIC.md?raw";

/**
 * Public methodology page. Renders the canonical ASSESSMENT_LOGIC.md so users
 * who tap the "How this assessment is generated" link from any AIDisclaimer
 * land on a single shared explanation.
 */
const Methodology = () => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    // Lightweight markdown -> HTML (headings, paragraphs, lists, code).
    // Avoids pulling a full markdown lib for a single doc page.
    const md = assessmentLogicMd as string;
    const escaped = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const rendered = escaped
      .replace(/^### (.*)$/gm, '<h3 class="font-heading text-xl mt-6 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.*)$/gm, '<h2 class="font-heading text-2xl mt-8 mb-3 text-foreground">$1</h2>')
      .replace(/^# (.*)$/gm, '<h1 class="font-heading text-3xl mt-4 mb-4 text-foreground">$1</h1>')
      .replace(/^\- (.*)$/gm, '<li class="ml-5 list-disc text-muted-foreground">$1</li>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted/30 text-xs">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="my-3 text-muted-foreground leading-relaxed">');
    setHtml(`<p class="my-3 text-muted-foreground leading-relaxed">${rendered}</p>`);
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead
        title="Assessment Methodology — FocusFlow AI"
        description="How FocusFlow's Clarity, Business Audit, MAC, and Agent assessments generate results."
        path="/methodology"
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">METHODOLOGY</span>
        <article
          className="prose prose-invert max-w-none mt-3"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

export default Methodology;