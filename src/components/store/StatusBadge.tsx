import { STATUS_LABELS } from "@/lib/book-store";

const STYLES: Record<string, string> = {
  pending_payment: "bg-muted/40 text-muted-foreground border-border",
  paid: "bg-primary/15 text-primary border-primary/40",
  in_progress: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  cancelled: "bg-destructive/15 text-destructive border-destructive/40",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STYLES[status] ?? STYLES.pending_payment;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
