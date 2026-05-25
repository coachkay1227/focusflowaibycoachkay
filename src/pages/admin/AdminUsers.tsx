import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { Search, Loader2, AlertCircle } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AccessTier = Database["public"]["Enums"]["access_tier"];

interface AdminUser {
  id: string;
  display_name: string | null;
  email: string | null;
  tier: AccessTier;
  created_at: string | null;
}

const tierOptions: AccessTier[] = ["free", "subscriber", "cohort", "premium", "rent_agent", "corporate"];

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!rolesLoading && !isAdmin) {
      navigate("/dashboard");
      return;
    }
  }, [user, isAdmin, rolesLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("manage-users", {
          body: { action: "list_users" },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const mapped: AdminUser[] = (data?.users ?? []).map((u: { id: string; display_name: string | null; email?: string | null; tier: AccessTier; created_at: string | null }) => ({
          id: u.id,
          display_name: u.display_name,
          email: u.email ?? null,
          tier: u.tier,
          created_at: u.created_at,
        }));

        setUsers(mapped);
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleTierChange = async (userId: string, newTier: AccessTier) => {
    setUpdatingTier(userId);
    try {
      const { error } = await supabase.functions.invoke("manage-users", {
        body: { action: "update_tier", user_id: userId, tier: newTier },
      });

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tier: newTier } : u))
      );
      toast.success(`Tier updated to ${newTier}`);
    } catch (error) {
      toast.error("Failed to update tier. The manage-users edge function may not be deployed yet.");
    } finally {
      setUpdatingTier(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.display_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading users...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        <AnimatedSection>
          <span className="font-mono-label text-primary tracking-[0.2em]">Admin Panel</span>
          <h1 className="font-heading text-3xl md:text-4xl font-light mt-3">User Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage user accounts and access tiers.
          </p>
        </AnimatedSection>

        <div className="mt-8">
          <AdminNav />
        </div>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card/30 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm mt-6 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {users.length === 0 ? "No users found." : "No users match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="text-left px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">
                      Joined
                    </th>
                    <th className="text-right px-6 py-3 font-mono-label text-muted-foreground text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-card/20 transition-colors cursor-pointer" onClick={() => setSelectedUserId(u.id)}>
                      <td className="px-6 py-4">
                        <p className="font-medium truncate max-w-[200px]">
                          {u.display_name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {u.email || u.id.slice(0, 12) + "..."}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30 capitalize">
                          {u.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                        <span className="font-mono-label text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={u.tier}
                          onChange={(e) => handleTierChange(u.id, e.target.value as AccessTier)}
                          disabled={updatingTier === u.id}
                          className="text-xs rounded-md border border-border bg-card/50 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                        >
                          {tierOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        {updatingTier === u.id && (
                          <Loader2 className="inline h-3 w-3 ml-2 animate-spin text-primary" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Click any user row to view full details. Tier changes require the <code className="font-mono bg-card/50 px-1 rounded">manage-users</code> edge function to be deployed.
          </p>
        </div>
      </div>

      <UserDetailModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onTierChange={(userId, tier) => handleTierChange(userId, tier as AccessTier)}
      />
    </div>
  );
};

export default AdminUsers;
