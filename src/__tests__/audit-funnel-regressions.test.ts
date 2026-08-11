import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("AI Business Audit funnel regressions", () => {
  it("has one public /audit doorway and keeps /audit/landing post-payment only", () => {
    expect(source("src/App.tsx")).toMatch(/path=["']\/audit["']/);
    expect(source("src/pages/AuditLanding.tsx")).toContain(
      'if (!sessionId) return <Navigate to="/audit/intake" replace />;',
    );

    for (const path of [
      "src/components/DesktopNav.tsx",
      "src/components/MobileNav.tsx",
      "src/components/ChatWidget.tsx",
      "src/pages/AiToolsDirectory.tsx",
      "src/data/faqs.ts",
      "src/pages/Sitemap.tsx",
    ]) {
      expect(source(path), path).not.toMatch(
        /(?:route|path|to|href)\s*(?:=|:)\s*["']\/audit\/landing["']/,
      );
    }
  });

  it("never sends an existing audit id through checkout", () => {
    expect(source("src/pages/AuditIntake.tsx")).toContain("const attachMode = !!targetAuditId;");
    const recovery = source("supabase/functions/complete-audit-intake/index.ts");
    expect(recovery).toContain('.eq("user_id", ownerId)');
    expect(recovery).toContain('.neq("status", "pending_payment")');
  });

  it("binds repeat audit checkout requests to one Stripe session", () => {
    const checkout = source("supabase/functions/create-checkout/index.ts");
    expect(checkout).toContain('pendingAudit.status !== "pending_payment"');
    expect(checkout).toContain("idempotencyKey: `audit-checkout-${safeAuditId}`");
  });
});
