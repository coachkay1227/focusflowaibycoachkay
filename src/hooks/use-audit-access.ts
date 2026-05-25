import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface AuditRow {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  stripe_session_id: string | null;
  intake: Record<string, unknown>;
  report: Record<string, unknown> | null;
  recommended_offer: string | null;
  generated_at: string | null;
  created_at: string;
}

/**
 * Hybrid access: authenticated owner OR valid magic-link token.
 * - If both auditId + user.id match → direct table select via RLS.
 * - Else if token present → `get_audit_by_token` RPC (SECURITY DEFINER).
 */
export function useAuditAccess(auditId?: string, token?: string) {
  const { user } = useAuth();
  const [audit, setAudit] = useState<AuditRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Path 1: authenticated owner / admin via RLS
      if (user && auditId) {
        const { data, error: e } = await supabase
          .from("business_audits" as never)
          .select("*")
          .eq("id", auditId)
          .maybeSingle();
        if (!e && data) {
          setAudit(data as unknown as AuditRow);
          setLoading(false);
          return;
        }
      }
      // Path 2: token-based access (works for guests)
      if (token) {
        const { data, error: e } = await supabase.rpc("get_audit_by_token" as never, {
          p_token: token,
        } as never);
        if (e) throw e;
        const row = Array.isArray(data) ? data[0] : (data ?? null);
        if (row) {
          setAudit(row as unknown as AuditRow);
          setLoading(false);
          return;
        }
      }
      setAudit(null);
      setError("No access");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setAudit(null);
    } finally {
      setLoading(false);
    }
  }, [auditId, token, user]);

  useEffect(() => {
    load();
  }, [load]);

  const claimToAccount = useCallback(async () => {
    if (!user || !token) return null;
    const { data, error: e } = await supabase.rpc("claim_audit_token" as never, {
      p_token: token,
      p_user_id: user.id,
    } as never);
    if (e) {
      setError(e.message);
      return null;
    }
    await load();
    return (data as string | null) ?? null;
  }, [load, token, user]);

  return {
    audit,
    loading,
    error,
    canAccess: !!audit,
    claimToAccount,
    refresh: load,
  };
}