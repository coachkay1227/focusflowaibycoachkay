import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import BrandLogo from "@/components/BrandLogo";
import {
  Menu, X, LayoutDashboard, User, LogOut, Sparkles, ChevronDown, Shield,
  Eye, MessageCircle, HelpCircle, BookOpen, BookMarked, Bot, Briefcase, Wrench, Users, Layers, ArrowRight,
} from "lucide-react";

const workGroups = [
  {
    label: "For Individuals",
    items: [
      { label: "Transformation Paths", path: "/modules", icon: BookOpen },
      { label: "Books & AI Kits", path: "/store", icon: BookMarked },
      { label: "Rent-an-Agent", path: "/rent-an-agent", icon: Bot },
    ],
  },
  {
    label: "For Organizations",
    items: [
      { label: "Advisory & Partnership", path: "/advisory", icon: Briefcase },
      { label: "AI Build Studio", path: "/build-studio", icon: Wrench },
      { label: "Collective AI", path: "/collective", icon: Layers },
    ],
  },
  {
    label: "Connect",
    items: [
      { label: "Elevation Hub", path: "/community", icon: Users },
    ],
  },
];

const topLinks = [
  { label: "The Truth About AI", path: "/truth", icon: Eye },
  { label: "Meet Coach Kay", path: "/coach-kay", icon: MessageCircle },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();

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

      {createPortal(
        <>
          {open && (
            <div
              className="fixed inset-0 z-[9998] bg-navy-deep/85 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
          )}

          <div
            className={`fixed top-0 right-0 z-[9999] h-full w-full transform transition-transform duration-300 ease-out ${
              open ? "translate-x-0" : "translate-x-full pointer-events-none"
            }`}
            style={{ backgroundColor: "hsl(var(--navy-deep))" }}
          >
            <div className="flex flex-col h-full pt-6 pb-8">
              <div className="flex items-center justify-between px-6 mb-6">
                <BrandLogo size="md" />
              </div>

              <div className="px-6 mb-6">
                <button
                  onClick={() => go("/clarity")}
                  className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Clarity Session
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                {/* Work With Me accordion */}
                <button
                  onClick={() => setWorkOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium">Work With Me</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${workOpen ? "rotate-180" : ""}`} />
                </button>
                {workOpen && (
                  <div className="pl-2 pb-2 space-y-4">
                    {workGroups.map((group) => (
                      <div key={group.label}>
                        <div className="font-mono text-[10px] tracking-[0.18em] text-primary/70 uppercase px-3 mb-1">
                          {group.label}
                        </div>
                        {group.items.map((item) => {
                          const active = location.pathname === item.path;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.path}
                              onClick={() => go(item.path)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div className="my-2 border-t border-border/30" />

                {topLinks.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => go(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-border/30 pt-4 mt-4 px-4 space-y-1">
                {user ? (
                  <>
                    <button
                      onClick={() => go("/dashboard")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </button>
                    <button
                      onClick={() => go("/profile")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <User className="h-4 w-4" /> Profile
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => go("/admin")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <Shield className="h-4 w-4" /> Admin
                      </button>
                    )}
                    <button
                      onClick={() => { signOut(); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => go("/auth")}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    <User className="h-4 w-4" /> Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default MobileNav;
