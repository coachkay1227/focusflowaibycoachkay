import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, X, ArrowRight } from "lucide-react";

const PRIVATE_ROUTES = ["/dashboard", "/admin", "/profile", "/onboarding", "/result", "/kiosk", "/email-preview"];

interface Option {
  label: string;
  route: string;
  followUp: string;
}

const OPTIONS: Option[] = [
  { label: "I need clarity on something", route: "/clarity", followUp: "Let's get you clarity. The Clarity Check takes just 5 minutes — no sign-up needed." },
  { label: "I want to try a challenge", route: "/challenges", followUp: "Bold move. Pick a challenge that matches your readiness — 3 days to 30 days." },
  { label: "Tell me about Coach Kay", route: "/community", followUp: "Coach Kay is a Master Certified Life Coach with 600+ hours of coaching. Meet the community." },
  { label: "I'm ready to go deeper", route: "/modules", followUp: "All in. Browse the full F.O.C.U.S. program catalog and find your starting point." },
];

const ChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);

  const isPrivateRoute = PRIVATE_ROUTES.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    if (isPrivateRoute) return;
    const dismissed = localStorage.getItem("chatWidget_dismissed");
    if (dismissed === "true") {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [isPrivateRoute]);

  if (isPrivateRoute || !visible) return null;

  const handleSelect = (option: Option) => {
    setSelected(option);
  };

  const handleGo = () => {
    if (!selected) return;
    setOpen(false);
    navigate(selected.route);
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("chatWidget_dismissed", "true");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      {open && (
        <div className="mb-4 w-80 rounded-lg border border-primary/20 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                <span className="text-xs text-primary font-medium">K</span>
              </div>
              <span className="text-sm font-medium text-foreground">Coach Kay</span>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {/* Greeting */}
            <div className="bg-muted/30 rounded-lg px-3 py-2">
              <p className="text-sm text-foreground/90">Hey — I'm glad you're here. What brought you today?</p>
            </div>

            {!selected ? (
              /* Options */
              <div className="space-y-2">
                {OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 text-foreground/80 transition-all"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              /* Follow-up */
              <div className="space-y-3">
                <div className="bg-primary/10 rounded-lg px-3 py-2 text-right">
                  <p className="text-sm text-foreground/70">{selected.label}</p>
                </div>
                <div className="bg-muted/30 rounded-lg px-3 py-2">
                  <p className="text-sm text-foreground/90">{selected.followUp}</p>
                </div>
                <button
                  onClick={handleGo}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Let's go
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Show me other options
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => { setOpen(!open); setSelected(null); }}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Chat with Coach Kay"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
