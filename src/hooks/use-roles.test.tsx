import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock auth + supabase BEFORE importing the hook
const mockUser = { id: "user-123", email: "someone@example.com" };
let currentUser: typeof mockUser | null = mockUser;
let rpcImpl: (name: string, args: unknown) => Promise<{ data: unknown; error: unknown }> =
  async () => ({ data: false, error: null });

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: currentUser, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (name: string, args: unknown) => rpcImpl(name, args),
  },
}));

import { useRoles } from "./use-roles";

describe("useRoles", () => {
  beforeEach(() => {
    currentUser = mockUser;
    rpcImpl = async () => ({ data: false, error: null });
  });

  it("returns isAdmin=true ONLY when has_role RPC returns true", async () => {
    rpcImpl = async (name) => {
      expect(name).toBe("has_role");
      return { data: true, error: null };
    };
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns isAdmin=false when has_role returns false (no email fallback)", async () => {
    currentUser = { id: "u-1", email: "hello@coachkayelevates.org" };
    rpcImpl = async () => ({ data: false, error: null });
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("does NOT escalate corporate tier to admin", async () => {
    // The hook should ONLY call has_role — never get_user_tier.
    const calls: string[] = [];
    rpcImpl = async (name) => {
      calls.push(name);
      if (name === "has_role") return { data: false, error: null };
      // If anyone ever re-introduces a tier check, fail loudly.
      if (name === "get_user_tier") return { data: "corporate", error: null };
      return { data: null, error: null };
    };
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(calls).toEqual(["has_role"]);
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isAdmin=false when there is no user", async () => {
    currentUser = null;
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isAdmin=false on RPC error", async () => {
    rpcImpl = async () => ({ data: null, error: { message: "boom" } });
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
});
