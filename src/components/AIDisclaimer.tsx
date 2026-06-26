import { cn } from "@/lib/utils";

/**
 * Reusable AI / informational disclaimer for assessment & result pages.
 * Required on Clarity, Audit, MAC, and Agent recommendation outputs so the
 * user understands that AI-assisted output is reflective, not clinical or
 * financial advice. See docs/ASSESSMENT_LOGIC.md.
 */
export function AIDisclaimer({
  variant = "default",
  className,
}: {
  variant?: "default" | "clinical";
  className?: string;
}) {
  const clinical = variant === "clinical";
  return (
    <div
      className={cn(
        "mt-12 rounded-lg border border-border/60 bg-card/40 p-4 text-xs leading-relaxed text-foreground/70",
        className,
      )}
      role="note"
    >
      <p className="font-mono-label text-[10px] tracking-[0.2em] text-primary/80">
        ABOUT THIS RESULT
      </p>
      <p className="mt-2">
        This output is generated with AI assistance using the answers you provided.
        It is intended for reflection and decision support — not a diagnosis,
        clinical evaluation, legal opinion, or financial guarantee.
        {clinical
          ? " If you are in crisis or considering harm to yourself or others, contact a licensed professional or call your local emergency line immediately."
          : " Results may vary if you re-take the assessment with different answers."}
      </p>
    </div>
  );
}

export default AIDisclaimer;