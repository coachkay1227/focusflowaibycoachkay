import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import BrandLogo from "@/components/BrandLogo";
import {
  LayoutDashboard, User, Shield, LogOut, ChevronDown, ArrowRight,
  BookOpen, BookMarked, Bot, Briefcase, Wrench, Users, Layers,
  Sparkles, Rocket, ClipboardCheck, Flame,
  Library, ShieldAlert, MessageCircle, Eye, HelpCircle,
  FileSearch, Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { label: string; path: string; icon: LucideIcon; desc: string };
type NavGroup = { key: string; label: string; items: NavItem[] };

const startHereGroup: NavGroup = {
  key: "start",
  label: "Start Here",
  items: [
    { label: "Clarity Session", path: "/clarity", icon: Sparkles, desc: "One question. AI insight in 30 seconds." },
    { label: "Starter Kit", path: "/starter-kit", icon: Rocket, desc: "Your free first step into AI" },
    { label: "Free Assessment", path: "/assessment", icon: ClipboardCheck, desc: "Find your AI readiness score" },
    { label: "Mirror Challenge", path: "/mirror-challenge", icon: Eye, desc: "See yourself through AI's lens" },
    { label: "30-Day Challenges", path: "/challenges", icon: Flame, desc: "Daily prompts to build the habit" },
  ],
};

const workGroup: NavGroup = {
  key: "work",
  label: "Work With Me",
  items: [
    { label: "Transformation Paths", path: "/modules", icon: BookOpen, desc: "Personal · Business · Full AI programs" },
    { label: "Books & AI Kits", path: "/store", icon: BookMarked, desc: "Self-paced tools, templates & guides" },
    { label: "Rent-an-Agent", path: "/rent-an-agent", icon: Bot, desc: "Done-with-you AI agents on your stack" },
    { label: "AI Build Studio", path: "/build-studio", icon: Wrench, desc: "Custom AI built end-to-end" },
    { label: "Advisory & Partnership", path: "/advisory", icon: Briefcase, desc: "Fractional AI strategy for leaders" },
    { label: "Collective AI", path: "/collective", icon: Layers, desc: "The delivery team behind every build" },
    { label: "Business Audit", path: "/advisory", icon: FileSearch, desc: "Where AI fits in your business, in 24 hours" },
    { label: "Autism Social Stories", path: "/autism-social-stories", icon: Heart, desc: "AI-personalized stories for families" },
  ],
};

const resourcesGroup: NavGroup = {
  key: "resources",
  label: "Tools & Resources",
  items: [
    { label: "AI Tools Directory", path: "/ai-tools", icon: Library, desc: "63 vetted tools, scored & reviewed" },
    { label: "Pause Hub: Scam Watch", path: "/pause-hub", icon: ShieldAlert, desc: "Live AI scam & threat alerts" },
    { label: "Coach Chat (AI)", path: "/coach", icon: MessageCircle, desc: "Talk to Coach Kay's AI anytime" },
    { label: "FocusFlow Elevation Hub", path: "/community", icon: Users, desc: "Free Skool community with Coach Kay" },
  ],
};

const truthGroup: NavGroup = {
  key: "truth",
  label: "Truth & About",
  items: [
    { label: "The Truth About AI", path: "/truth", icon: Eye, desc: "What AI really is: no hype, no fear" },
    { label: "Meet Coach Kay", path: "/coach-kay", icon: User, desc: "The human behind the mission" },
    { label: "FAQ", path: "/faq", icon: HelpCircle, desc: "Answers to the questions you're about to ask" },
  ],
};

const navGroups: NavGroup[] = [startHereGroup, workGroup, resourcesGroup, truthGroup];

const NAV_HIDDEN_ROUTES = ["/kiosk", "/auth", "/reset-password", "/onboarding"];

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const groupsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenKey(null);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (groupsRef.current && !groupsRef.current.contains(e.target as Node)) setOpenKey(null);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isHiddenRoute = NAV_HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r));
  if (isHiddenRoute) return null;

  const isGroupActive = (group: NavGroup) =>
    group.items.some((i) => location.pathname.startsWith(i.path));

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-6 lg:px-10 bg-navy-deep/80 backdrop-blur-xl border-b border-border/30">
      <BrandLogo size="md" />

      <div ref={groupsRef} className="flex items-center gap-1">
        {navGroups.map((group) => {
          const active = isGroupActive(group);
          const open = openKey === group.key;
          // 2-column for groups >4 items, single column otherwise
          const wide = group.items.length > 4;
          return (
            <div key={group.key} className="relative">
              <button
                onClick={() => setOpenKey(open ? null : group.key)}
                aria-expanded={open}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm transition-colors ${
                  active || open
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {group.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div
                  className={`absolute top-full ${
                    group.key === "truth" ? "right-0" : "left-1/2 -translate-x-1/2"
                  } mt-2 ${
                    wide ? "w-[640px] grid grid-cols-2 gap-x-4 gap-y-1" : "w-[360px]"
                  } rounded-2xl border border-border/50 bg-navy-deep/95 backdrop-blur-xl shadow-2xl shadow-navy-deep/50 p-4`}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const itemActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => { if (item.path.startsWith("http")) { window.open(item.path, "_blank", "noopener,noreferrer"); } else { navigate(item.path); } setOpenKey(null); }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors group ${
                          itemActive ? "bg-primary/10" : "hover:bg-primary/5"
                        }`}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/40 bg-primary/5 group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-4 w-4 text-primary" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-foreground">{item.label}</span>
                          <span className="block text-xs text-muted-foreground/70 truncate">{item.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/clarity")}
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          Start Clarity
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {user ? (
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Account menu"
            >
              <User className="h-4 w-4" />
            </button>
            {accountOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/50 bg-navy-deep/95 backdrop-blur-xl shadow-2xl shadow-navy-deep/50 p-1.5">
                <button
                  onClick={() => { navigate("/dashboard"); setAccountOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </button>
                <button
                  onClick={() => { navigate("/profile"); setAccountOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { navigate("/admin"); setAccountOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <Shield className="h-4 w-4" /> Admin
                  </button>
                )}
                <div className="my-1 border-t border-border/30" />
                <button
                  onClick={() => { signOut(); setAccountOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default DesktopNav;
