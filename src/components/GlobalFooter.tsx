import { useLocation } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";

/**
 * Renders the SiteFooter on every public/marketing route.
 * Hidden on app-shell routes (auth, dashboard, clarity session, admin, etc.)
 * where a marketing footer would be out of place.
 */
const FOOTER_HIDDEN_EXACT = new Set([
  "/auth",
  "/reset-password",
  "/onboarding",
  "/dashboard",
  "/clarity",
  "/assessment",
  "/result",
  "/mirror-challenge",
  "/challenges",
  "/coach",
  "/profile",
  "/kiosk",
  "/order-success",
  "/email-preview",
  "/unsubscribe",
  "/email-unsubscribe",
]);

const FOOTER_HIDDEN_PREFIXES = [
  "/clarity/",
  "/challenges/",
  "/admin",
  "/audit/intake",
  "/audit/report",
];

const GlobalFooter = () => {
  const { pathname } = useLocation();
  if (FOOTER_HIDDEN_EXACT.has(pathname)) return null;
  if (FOOTER_HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <SiteFooter />;
};

export default GlobalFooter;