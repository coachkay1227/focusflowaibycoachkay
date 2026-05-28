import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, X, ArrowRight } from "lucide-react";

const PRIVATE_ROUTES = ["/dashboard", "/admin", "/profile", "/onboarding", "/result", "/kiosk", "/email-preview"];

interface Option {
  label: string;
  route: string | null;
  followUp: string;
}

interface PageContext {
  greeting: string;
  options: Option[];
}

const DEFAULT_OPTIONS: Option[] = [
  { label: "I need clarity on something", route: "/clarity", followUp: "Let's get you clarity. The Clarity Check takes just 5 minutes, no sign-up needed." },
  { label: "I want to try a challenge", route: "/challenges", followUp: "Bold move. Pick a challenge that matches your readiness: 3 days to 30 days." },
  { label: "Tell me about Coach Kay", route: "/community", followUp: "Coach Kay is a Master Certified Life Coach with 600+ hours of coaching. Meet the community." },
  { label: "I'm ready to go deeper", route: "/modules", followUp: "All in. Browse the full F.O.C.U.S. program catalog and find your starting point." },
];

const PAGE_CONTEXT_MAP: Record<string, PageContext> = {
  '/rent-an-agent': {
    greeting: "Thinking about letting AI handle the grind? Ask me anything about how agents actually work.",
    options: [
      { label: "What does an agent actually do all day?", followUp: "A Rent-an-Agent handles your inbox, filters your DMs, routes tasks, and sends you a daily digest, so you stop being your own assistant.", route: null },
      { label: "Is $297/mo worth it for my business?", followUp: "If you're spending 2+ hours a day on tasks that repeat. Yes. Most clients recoup the cost in their first week.", route: null },
      { label: "See the Founding pricing before it closes", followUp: "Founding tiers lock in up to 50% off the standard rate, permanently. Once the founding cohort fills, this pricing is gone.", route: '/rent-an-agent#founding' },
      { label: "Book a discovery call", followUp: "Let's figure out exactly which agent setup fits your stack.", route: '/advisory' }
    ]
  },
  '/build-studio': {
    greeting: "Got an idea for an AI tool or site? I can help you figure out what tier makes sense.",
    options: [
      { label: "I need a landing page fast (under $800)", followUp: "Tier 1 Quick Wins: 48 hours to live. From $297. I'll get you the intake form right now.", route: '/build-studio' },
      { label: "I need a full AI-powered web app", followUp: "That's a Tier 3 Custom AI Build: starts at $5,997 for custom workflows and agents. Let me connect you.", route: '/build-studio' },
      { label: "What has the Collective built before?", followUp: "Coach Kay's Collective has shipped landing pages, lead-gen systems, AI chatbots, course platforms, and this very site. Ask for a consult.", route: '/build-studio' },
      { label: "Talk to the team", followUp: "I'll get you in front of the right person.", route: '/build-studio' }
    ]
  },
  '/audit/landing': {
    greeting: "Your audit is on its way. Or you're about to unlock one. What questions do you have?",
    options: [
      { label: "How long until I get my audit?", followUp: "Your intake takes about 5 minutes. Once you submit it, the AI generates your report, most people see it within minutes.", route: '/audit/intake' },
      { label: "What's actually in the audit?", followUp: "17 questions mapped across 12 business vectors: tools, time, revenue, bottlenecks, AI readiness. You'll get a clear action list + where AI fits your stack.", route: null },
      { label: "Start my intake now", followUp: "Let's go. Your results are waiting.", route: '/audit/intake' },
      { label: "I haven't paid yet, how do I get one?", followUp: "It's $47 one-time. Includes your full AI business audit + a 90-day magic link to access your results anytime.", route: '/audit/landing' }
    ]
  },
  '/modules': {
    greeting: "Figuring out which path is yours? I can help you pick.",
    options: [
      { label: "What's the difference between the 3 paths?", followUp: "Personal Clarity is about you: mindset, focus, patterns. Business Transformation adds your systems and revenue. Full AI Integration is all of it, plus building AI into how you operate.", route: null },
      { label: "I'm not sure I'm ready to invest yet", followUp: "Start free. Take a Clarity Session (90 seconds), or do the full Assessment. No card, no commitment. See if Coach Kay's approach resonates first.", route: '/clarity' },
      { label: "Show me the $27/mo option", followUp: "The subscriber tier is the entry point: full access to the platform for $27/month. You can upgrade anytime.", route: '/modules' },
      { label: "I want the full 90-day transformation", followUp: "The 90-day path is the most comprehensive Coach Kay offers: personal + business + AI. Let me pull up the details.", route: '/modules' }
    ]
  },
  '/advisory': {
    greeting: "Looking at working with Coach Kay directly? Here's what that looks like.",
    options: [
      { label: "What's included in the $497 intensive?", followUp: "90 minutes 1:1 with Coach Kay. You walk out with an AI implementation plan, decision tree, and your 30-day roadmap. Recorded + summarized.", route: null },
      { label: "Is there a free intro call?", followUp: "Yes. Coach Kay offers a free 15-minute clarity call for qualified founders and leaders. It's a real conversation, not a sales pitch.", route: '/advisory' },
      { label: "We need AI training for our whole team", followUp: "Coach Kay does corporate AI literacy workshops, EAP programs, and leadership cohorts. Let me get you to the inquiry form.", route: '/advisory' },
      { label: "I want the strategy intensive now", followUp: "Book it directly. $497 one-time, fully recorded.", route: '/advisory' }
    ]
  },
  '/store': {
    greeting: "Looking for tools you can use today? Let me help you find the right one.",
    options: [
      { label: "What's the best book for beginners?", followUp: "Start with the AI Starter Kit, built for someone brand new to AI. Practical, no fluff, no jargon.", route: '/store' },
      { label: "I need something for my team", followUp: "The AI Team Templates bundle is built for scaling. 20+ plug-and-play systems.", route: '/store' },
      { label: "Do you have anything for autism families?", followUp: "Yes. AI-personalized social stories for children and teens. HSA/FSA reimbursement may apply.", route: '/autism-social-stories' },
      { label: "Browse everything", followUp: "All products are below. Take your time.", route: '/store' }
    ]
  },
  '/': {
    greeting: "Hey. I'm Coach Kay's AI. Where are you right now, honestly?",
    options: [
      { label: "I'm stuck and don't know why", followUp: "That's exactly what the Clarity Session is for. 90 seconds, one question, AI insight. No signup needed.", route: '/clarity' },
      { label: "I want to use AI but don't know how", followUp: "Start with the free AI Starter Kit, built for exactly that moment.", route: '/starter-kit' },
      { label: "I run a business and need real help", followUp: "Two options: Get the $47 AI Business Audit (know exactly where AI fits your stack), or book the $497 Strategy Intensive for 1:1 with Coach Kay.", route: '/audit/landing' },
      { label: "I want to see what Coach Kay does", followUp: "You're in the right place. The best way to get it? Try a free Clarity Session first, takes 90 seconds.", route: '/clarity' }
    ]
  }
};

const DEFAULT_CONTEXT: PageContext = {
  greeting: "I'm Coach Kay's AI. Here to help you find your next step.",
  options: DEFAULT_OPTIONS,
};

function getPageContext(pathname: string): PageContext {
  if (PAGE_CONTEXT_MAP[pathname]) {
    return PAGE_CONTEXT_MAP[pathname];
  }
  return DEFAULT_CONTEXT;
}

const ChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const isPrivateRoute = PRIVATE_ROUTES.some((r) => location.pathname.startsWith(r));
  const pageContext = getPageContext(location.pathname);

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

  // Reset animation state when widget opens or page changes
  useEffect(() => {
    if (open) {
      setGreetingVisible(false);
      setOptionsVisible(false);
      const greetingTimer = setTimeout(() => setGreetingVisible(true), 200);
      const optionsTimer = setTimeout(() => setOptionsVisible(true), 500);
      return () => {
        clearTimeout(greetingTimer);
        clearTimeout(optionsTimer);
      };
    } else {
      setGreetingVisible(false);
      setOptionsVisible(false);
    }
  }, [open]);

  // Reset selection when page changes
  useEffect(() => {
    setSelected(null);
  }, [location.pathname]);

  if (isPrivateRoute || !visible) return null;

  const handleSelect = (option: Option) => {
    setSelected(option);
  };

  const handleGo = () => {
    if (!selected || !selected.route) return;
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
              <span className="text-sm font-medium text-foreground">Coach Kay AI</span>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {/* Contextual Greeting */}
            <div
              className={`bg-muted/30 rounded-lg px-3 py-2 transition-all duration-300 ${
                greetingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              <p className="text-sm text-foreground/90">{pageContext.greeting}</p>
            </div>

            {!selected ? (
              /* Options */
              <div
                className={`space-y-2 transition-all duration-300 ${
                  optionsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                }`}
              >
                {pageContext.options.map((option) => (
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
                {selected.route ? (
                  <button
                    onClick={handleGo}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Let's go
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : null}
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
