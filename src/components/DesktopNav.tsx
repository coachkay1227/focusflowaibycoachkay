import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";
import BrandLogo from "@/components/BrandLogo";
import {
  LayoutDashboard, User, Shield, LogOut, ChevronDown, ArrowRight,
  BookOpen, BookMarked, Bot, Briefcase, Wrench, Users, Layers,
} from "lucide-react";

const workWithMeGroups = [
  {
    label: "For Individuals",
    items: [
      { label: "Paths", path: "/modules", icon: BookOpen, desc: "F.O.C.U.S. modules" },
      { label: "Studio", path: "/store", icon: BookMarked, desc: "Books, kits & add-ons" },
      { label: "Rent-an-Agent", path: "/rent-an-agent", icon: Bot, desc: "Done-with-you AI" },
    ],
  },
  {
    label: "For Organizations",
    items: [
      { label: "Advisory", path: "/advisory", icon: Briefcase, desc: "Strategy & partnership" },
      { label: "Build Studio", path: "/build-studio", icon: Wrench, desc: "Custom AI delivery" },
      { label: "Collective AI", path: "/collective", icon: Layers, desc: "Delivery team" },
    ],
  },
  {
    label: "Connect",
    items: [
      { label: "Community", path: "/community", icon: Users, desc: "Skool hub" },
    ],
  },
];

const topLinks = [
  { label: "Truth", path: "/truth" },
  { label: "Coach Kay", path: "/coach-kay" },
  { label: "FAQ", path: "/faq" },
];

const NAV_HIDDEN_ROUTES = ["/kiosk", "/auth", "/reset-password", "/onboarding"];

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();
  const [workOpen, setWorkOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click / route change — hooks MUST run unconditionally
  useEffect(() => {
    setWorkOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (workRef.current && !workRef.current.contains(e.target as Node)) setWorkOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isHiddenRoute = NAV_HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r));
  const isHome = location.pathname === "/";

  if (isHiddenRoute || isHome) return null;

  const isWorkActive = workWithMeGroups.some((g) =>
    g.items.some((i) => location.pathname.startsWith(i.path)),
  );

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-8 lg:px-12 bg-navy-deep/80 backdrop-blur-xl border-b border-border/30">
      <BrandLogo size="md" />

      <div className="flex items-center gap-1">
        {/* Work With Me dropdown */}
        <div ref={workRef} className="relative">
          <button
            onClick={() => setWorkOpen((v) => !v)}
            aria-expanded={workOpen}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-colors ${
              isWorkActive || workOpen
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            Work With Me
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${workOpen ? "rotate-180" : ""}`} />
          </button>
          {workOpen && (
            <div className="absolute top-full right-0 mt-2 w-[640px] rounded-2xl border border-border/50 bg-navy-deep/95 backdrop-blur-xl shadow-2xl shadow-navy-deep/50 p-6 grid grid-cols-2 gap-x-6 gap-y-5">
              {workWithMeGroups.map((group) => (
                <div key={group.label} className={group.label === "Connect" ? "col-span-2 pt-4 border-t border-border/30" : ""}>
                  <h4 className="font-mono text-[10px] tracking-[0.18em] text-primary/70 uppercase mb-3">
                    {group.label}
                  </h4>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.path}>
                          <button
                            onClick={() => { navigate(item.path); setWorkOpen(false); }}
                            className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-primary/5 transition-colors group"
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/40 bg-primary/5 group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                              <Icon className="h-4 w-4 text-primary" />
                            </span>
                            <span className="flex-1">
                              <span className="block text-sm text-foreground">{item.label}</span>
                              <span className="block text-xs text-muted-foreground/70">{item.desc}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {topLinks.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {item.label}
            </button>
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
