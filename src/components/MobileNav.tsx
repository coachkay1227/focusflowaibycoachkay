import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import BrandLogo from "@/components/BrandLogo";
import {
  Menu, X, LayoutDashboard, User, LogOut, Sparkles, ChevronDown, Shield,
  Eye, MessageCircle, HelpCircle, BookOpen, BookMarked, Bot, Briefcase, Wrench, Users, Layers, ArrowRight,
  Rocket, ClipboardCheck, Flame, Library, ShieldAlert, FileSearch, Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { label: string; path: string; icon: LucideIcon };
type NavGroup = { key: string; label: string; items: NavItem[]; defaultOpen?: boolean };

const navGroups: NavGroup[] = [
  {
    key: "start",
    label: "Start Here",
    defaultOpen: true,
    items: [
      { label: "Clarity Session", path: "/clarity", icon: Sparkles },
      { label: "Starter Kit", path: "/starter-kit", icon: Rocket },
      { label: "Free Assessment", path: "/assessment", icon: ClipboardCheck },
      { label: "Mirror Challenge", path: "/mirror-challenge", icon: Eye },
      { label: "30-Day Challenges", path: "/challenges", icon: Flame },
    ],
  },
  {
    key: "work",
    label: "Work With Me",
    items: [
      { label: "Transformation Paths", path: "/modules", icon: BookOpen },
      { label: "Books & AI Kits", path: "/store", icon: BookMarked },
      { label: "Rent-an-Agent", path: "/rent-an-agent", icon: Bot },
      { label: "AI Build Studio", path: "/build-studio", icon: Wrench },
      { label: "Advisory & Partnership", path: "/advisory", icon: Briefcase },
      { label: "Collective AI", path: "/collective", icon: Layers },
      { label: "Business Audit", path: "/audit/landing", icon: FileSearch },
      { label: "Autism Social Stories", path: "/autism-social-stories", icon: Heart },
    ],
  },
  {
    key: "resources",
    label: "Tools & Resources",
    items: [
      { label: "AI Tools Directory", path: "/ai-tools", icon: Library },
      { label: "Pause Hub — Scam Watch", path: "/pause-hub", icon: ShieldAlert },
      { label: "Coach Chat (AI)", path: "/coach", icon: MessageCircle },
      { label: "Elevation Hub", path: "/community", icon: Users },
    ],
  },
  {
    key: "truth",
    label: "Truth & About",
    items: [
      { label: "The Truth About AI", path: "/truth", icon: Eye },
      { label: "Meet Coach Kay", path: "/coach-kay", icon: User },
      { label: "FAQ", path: "/faq", icon: HelpCircle },
    ],
  },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((g) => [g.key, !!g.defaultOpen])),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const toggle = (key: string) =>
    setOpenGroups((s) => ({ ...s, [key]: !s[key] }));

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
                {navGroups.map((group) => {
                  const isOpen = !!openGroups[group.key];
                  const groupActive = group.items.some((i) => location.pathname.startsWith(i.path));
                  return (
                    <div key={group.key}>
                      <button
                        onClick={() => toggle(group.key)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors ${
                          groupActive
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:bg-muted/30"
                        }`}
                      >
                        <span className="font-medium">{group.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="pl-2 pb-2 pt-1 space-y-0.5">
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
                      )}
                    </div>
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
