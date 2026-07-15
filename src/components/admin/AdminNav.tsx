import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BarChart3, BookOpen, ArrowLeft, ShoppingBag, Sparkles, Wrench, Mail, ShieldAlert, FileText, GraduationCap, Package, MessageCircle, Calendar, ScrollText, CreditCard } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/content", label: "Content", icon: BookOpen },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/autism-orders", label: "Autism", icon: Sparkles },
  { to: "/admin/build-orders", label: "Build Orders", icon: Package },
  { to: "/admin/build-inquiries", label: "Build Leads", icon: Wrench },
  { to: "/admin/audits", label: "Audits", icon: FileText },
  { to: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/scam-alerts", label: "Scam Alerts", icon: ShieldAlert },
  { to: "/admin/voice-bible", label: "Voice", icon: MessageCircle },
  { to: "/admin/booking-links", label: "Booking Links", icon: Calendar },
  { to: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { to: "/admin/payment-links", label: "Payment Links", icon: CreditCard },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="mb-8 p-1 bg-card/30 backdrop-blur-sm rounded-lg border border-border overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
        <Link
          to="/dashboard"
          aria-label="Back to App"
          className="shrink-0 flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Back to App</span>
        </Link>
        <div className="w-px h-6 bg-border mx-1 shrink-0" />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
