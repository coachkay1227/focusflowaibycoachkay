export interface ReportSection {
  heading: string;
  body: string;
  icon?: string;
}

/**
 * Convert a structured report into a clean plaintext block suitable
 * for clipboard/email. Stable ordering, ASCII-safe, no markdown.
 */
export function reportToPlaintext(params: {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  generatedAt?: Date | string;
  footerUrl?: string;
}): string {
  const { title, subtitle, sections, generatedAt, footerUrl } = params;
  const lines: string[] = [];
  lines.push(title.toUpperCase());
  if (subtitle) lines.push(subtitle);
  lines.push("");
  lines.push("=".repeat(Math.min(60, Math.max(title.length, 20))));
  lines.push("");

  for (const section of sections) {
    lines.push(section.heading.toUpperCase());
    lines.push("-".repeat(Math.min(60, Math.max(section.heading.length, 8))));
    lines.push(section.body.trim());
    lines.push("");
  }

  if (generatedAt) {
    const d = typeof generatedAt === "string" ? new Date(generatedAt) : generatedAt;
    if (!Number.isNaN(d.getTime())) {
      lines.push(`Generated: ${d.toLocaleString()}`);
    }
  }
  if (footerUrl) lines.push(footerUrl);
  lines.push("Where Focus Goes, Energy Flows.");
  return lines.join("\n");
}