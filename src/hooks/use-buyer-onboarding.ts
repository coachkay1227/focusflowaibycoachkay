import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Data behind the `/start` buyer onboarding flow.
 *
 * Resolution order, first hit wins:
 *   1. An audit reachable by magic-link token (works for guests).
 *   2. The signed-in person's most recent audit.
 *   3. The signed-in person's most recent settled order, across every
 *      fulfillment table.
 *
 * Everything reads through existing RLS, so a person only ever sees their own
 * rows. When nothing is found the caller sends them to the dashboard rather
 * than rendering an empty flow.
 */

/** Rows that are on the table before money settles. Not a purchase yet. */
const UNSETTLED_STATUSES = ["pending", "draft", "created", "abandoned", "failed"];

export interface AuditResults {
  id: string;
  /** Null while the report is still generating. */
  report: AuditReportShape | null;
  recommendedOffer: string | null;
  hasIntake: boolean;
}

export interface AuditReportShape {
  executive_snapshot?: string;
  where_youre_leaking?: string;
  focus_diagnostic?: Record<string, { score: number; note: string }>;
  seven_day_plan?: { day: number; title: string; action: string; focus_pillar?: string }[];
  next_best_move?: {
    offer_slug?: string;
    offer_name?: string;
    why_this_one?: string;
    what_youll_get?: string;
    investment?: string;
  };
}

export interface PurchaseSummary {
  /** Which fulfillment table this came from. */
  source: "one_time_orders" | "agent_orders" | "book_orders" | "autism_orders";
  productName: string;
  /** Pre-discount amount in cents when the table recorded one. */
  amountCents: number | null;
  status: string;
  createdAt: string;
}

export interface BuyerOnboardingState {
  loading: boolean;
  audit: AuditResults | null;
  purchase: PurchaseSummary | null;
  /** True once we know there is nothing to onboard from. */
  empty: boolean;
  /** True when this person already finished or dismissed the flow. */
  completed: boolean;
  /** Marks the flow finished for this person. Never throws. */
  markCompleted: () => Promise<void>;
}

const LOCAL_DONE_KEY = "ffai_buyer_onboarding_done";

function readLocalDone(): boolean {
  try {
    return window.localStorage.getItem(LOCAL_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeLocalDone() {
  try {
    window.localStorage.setItem(LOCAL_DONE_KEY, "1");
  } catch {
    /* private browsing, nothing to do */
  }
}

function toAudit(row: Record<string, unknown>): AuditResults {
  const intake = (row.intake ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    report: (row.report ?? null) as AuditReportShape | null,
    recommendedOffer: (row.recommended_offer as string | null) ?? null,
    hasIntake: Object.keys(intake).length > 0,
  };
}

/** Latest settled order across the fulfillment tables, newest first. */
async function loadLatestPurchase(userId: string): Promise<PurchaseSummary | null> {
  const queries: {
    source: PurchaseSummary["source"];
    columns: string;
    name: (r: Record<string, unknown>) => string;
    amount: (r: Record<string, unknown>) => number | null;
  }[] = [
    {
      source: "one_time_orders",
      columns: "product_name,price_cents,status,created_at",
      name: (r) => (r.product_name as string) || "One-Time Purchase",
      amount: (r) => (r.price_cents as number | null) ?? null,
    },
    {
      source: "agent_orders",
      columns: "agent_type,agent_tier,quoted_price_cents,status,created_at",
      name: (r) =>
        [r.agent_type, r.agent_tier].filter(Boolean).join(" · ") || "Agent Build",
      amount: (r) => (r.quoted_price_cents as number | null) ?? null,
    },
    {
      source: "book_orders",
      columns: "package_name,order_total,status,created_at",
      name: (r) => (r.package_name as string) || "Book Package",
      amount: (r) => (r.order_total as number | null) ?? null,
    },
    {
      source: "autism_orders",
      columns: "package_name,order_total,status,created_at",
      name: (r) => (r.package_name as string) || "Social Story Package",
      amount: (r) => (r.order_total as number | null) ?? null,
    },
  ];

  const results = await Promise.all(
    queries.map(async (q) => {
      const { data, error } = await supabase
        .from(q.source as never)
        .select(q.columns)
        .eq("user_id", userId)
        .not("status", "in", `(${UNSETTLED_STATUSES.join(",")})`)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) return null;
      const row = data[0] as unknown as Record<string, unknown>;
      return {
        source: q.source,
        productName: q.name(row),
        amountCents: q.amount(row),
        status: String(row.status ?? ""),
        createdAt: String(row.created_at ?? ""),
      } satisfies PurchaseSummary;
    }),
  );

  return results
    .filter((r): r is PurchaseSummary => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function useBuyerOnboarding(token?: string | null): BuyerOnboardingState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditResults | null>(null);
  const [purchase, setPurchase] = useState<PurchaseSummary | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      let foundAudit: AuditResults | null = null;
      let foundPurchase: PurchaseSummary | null = null;
      let done = readLocalDone();

      try {
        if (token) {
          const { data } = await supabase.rpc("get_audit_by_token" as never, {
            p_token: token,
          } as never);
          const row = Array.isArray(data) ? data[0] : data;
          if (row) foundAudit = toAudit(row as Record<string, unknown>);
        }

        if (user) {
          if (!foundAudit) {
            const { data } = await supabase
              .from("business_audits" as never)
              .select("id,report,recommended_offer,intake,created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1);
            const row = (data as unknown as Record<string, unknown>[] | null)?.[0];
            if (row) foundAudit = toAudit(row);
          }

          if (!foundAudit) {
            foundPurchase = await loadLatestPurchase(user.id);
          }

          const { data: prefs } = await supabase
            .from("user_preferences")
            .select("buyer_onboarding_completed_at")
            .eq("id", user.id)
            .maybeSingle();
          const stamp = (prefs as { buyer_onboarding_completed_at?: string | null } | null)
            ?.buyer_onboarding_completed_at;
          if (stamp) done = true;
        }
      } catch {
        /* fall through: the page renders its own empty state */
      }

      if (cancelled) return;
      setAudit(foundAudit);
      setPurchase(foundPurchase);
      setCompleted(done);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  const markCompleted = useCallback(async () => {
    writeLocalDone();
    setCompleted(true);
    if (!user) return;
    try {
      await supabase.from("user_preferences").upsert(
        {
          id: user.id,
          buyer_onboarding_completed_at: new Date().toISOString(),
        } as never,
        { onConflict: "id" },
      );
    } catch {
      /* the local flag already stops the nudge for this browser */
    }
  }, [user]);

  return {
    loading,
    audit,
    purchase,
    empty: !loading && !audit && !purchase,
    completed,
    markCompleted,
  };
}