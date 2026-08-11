/**
 * Public browser configuration for the FocusFlow AI Lovable Cloud project.
 *
 * The URL and publishable (anon) key are intentionally available to the
 * browser. Authorization remains enforced by Supabase RLS and edge functions.
 * Environment values can override these defaults for preview/test projects.
 */
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  "https://rarawrpajilqqlcxdzpj.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcmF3cnBhamlscXFsY3hkenBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMTQ3MzIsImV4cCI6MjA5MDU5MDczMn0.K2eAveo7DjCJscx_p38IAQO-38YUwfKmBNNqAyI1K8A";
