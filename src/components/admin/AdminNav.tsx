import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BarChart3, BookOpen, ArrowLeft } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/content", label: "Content", icon: BookOpen },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1 mb-8 p-1 bg-card/30 backdrop-blur-sm rounded-lg border border-border">
      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to App
      </Link>
      <div className="w-px h-6 bg-border mx-1" />
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
