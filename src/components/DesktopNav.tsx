import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import { LayoutDashboard, BookOpen, Trophy, MessageCircle, Users, User, Shield, LogOut, Info, BookMarked } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, authOnly: true },
  { label: "Pathways", path: "/modules", icon: BookOpen, authOnly: false },
  { label: "Work With Me", path: "/modules", icon: BookMarked, authOnly: false },
  { label: "Challenges", path: "/challenges", icon: Trophy, authOnly: false },
  { label: "Coach Kay", path: "/coach-kay", icon: MessageCircle, authOnly: false },
  { label: "Community", path: "/community", icon: Users, authOnly: false },
  { label: "Book Store", path: "/store", icon: BookMarked, authOnly: false },
  { label: "About", path: "/about", icon: Info, authOnly: false },
];

const PRIVATE_ROUTES = ["/admin", "/kiosk", "/email-preview", "/onboarding", "/auth", "/reset-password", "/dashboard", "/community", "/coach", "/challenges", "/modules", "/result", "/clarity", "/mirror-challenge", "/programs", "/profile", "/store", "/order-success"];

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();

  const isPrivateRoute = PRIVATE_ROUTES.some((r) => location.pathname.startsWith(r));
  const isHome = location.pathname === "/";

  if (isPrivateRoute || isHome) return null;

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border/40">
      <button
        onClick={() => navigate("/")} aria-label="FocusFlow AI — Home"
        className="font-heading text-lg font-light hover:opacity-80 transition-opacity"
      >
        <span aria-hidden="true" className="text-primary font-medium">Focus</span><span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
      </button>

      <div className="flex items-center gap-1">
        {navItems
          .filter((item) => !item.authOnly || user)
          .map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Admin panel"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </button>
        )}
        {user ? (
          <>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Profile"
            >
              <User className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default DesktopNav;
