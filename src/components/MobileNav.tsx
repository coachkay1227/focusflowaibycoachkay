import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LayoutDashboard, BookOpen, Trophy, MessageCircle, Users, LogOut, User } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, authOnly: true },
  { label: "Modules", path: "/modules", icon: BookOpen, authOnly: false },
  { label: "Challenges", path: "/challenges", icon: Trophy, authOnly: false },
  { label: "Coach Kay", path: "/coach", icon: MessageCircle, authOnly: false },
  { label: "Community", path: "/community", icon: Users, authOnly: false },
  { label: "Profile", path: "/profile", icon: User, authOnly: true },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="relative z-[60] p-2 text-foreground"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-[56] h-full w-72 bg-card border-l border-border transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8">
          <nav className="flex-1 space-y-1">
            {navItems
              .filter((item) => !item.authOnly || user)
              .map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
          </nav>

          <div className="border-t border-border pt-4 mt-4 space-y-2">
            {user ? (
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => go("/auth")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
