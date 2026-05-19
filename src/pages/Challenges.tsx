import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getChallengeEnrollments, enrollInChallenge, type ChallengeEnrollment } from "@/lib/enrollment-store";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Trophy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";

const challengeDayPreviews: Record<string, string[]> = {
  "3-day": [
    "Day 1: What is one thing you've been avoiding that you already know the answer to?",
    "Day 2: If you removed the fear, what would you do tomorrow?",
    "Day 3: Write one sentence that describes who you're becoming.",
  ],
  "4-day": [
    "Day 1: What pattern keeps showing up in your life that you pretend not to see?",
    "Day 2: What are you tolerating that your future self would never accept?",
    "Day 3: Write about a time you surprised yourself with your own strength.",
    "Day 4: What's the one shift that would make everything else fall into place?",
  ],
  "7-day": [
    "Day 1: What is one thing you've been avoiding that you already know the answer to?",
    "Day 2: Write about a moment today when you felt most like yourself.",
    "Day 3: What would you do differently if no one was watching or judging?",
    "…4 more days of deepening reflection, ending with a full-week pattern review.",
  ],
  "8-day": [
    "Day 1: What do you say matters most to you? Does your calendar reflect that?",
    "Day 2: Where are your actions out of alignment with your stated values?",
    "Day 3: What would you stop doing if you truly believed you were enough?",
    "…5 more days bridging purpose and action, ending with a weekly alignment plan.",
  ],
  "14-day": [
    "Day 1: What story have you been telling yourself about why you can't change?",
    "Day 2: What emotion do you avoid feeling the most? Why?",
    "Day 3: Write about a decision you've been postponing.",
    "…11 more days of deep pattern work, ending with a personal declaration.",
  ],
  "30-day": [
    "Day 1: What brought you here today? What are you seeking?",
    "Day 2: Describe your current emotional weather — stormy, clear, foggy?",
    "Day 3: What's one thing you've outgrown but haven't let go of?",
    "…27 more days of daily coaching, reflection, and transformation.",
  ],
};

const challengeTypes = [
  { type: "3-day", title: "3-Day Spark", subtitle: "Quick clarity reset", description: "Three focused days to break through mental fog and reconnect with your truth.", days: 3 },
  { type: "4-day", title: "4-Day Shift", subtitle: "Identify and interrupt patterns", description: "Four days designed to surface your deepest patterns and begin the work of shifting them.", days: 4 },
  { type: "7-day", title: "7-Day Mirror Challenge", subtitle: "The original deep dive", description: "Seven days of honest reflection. The challenge that started it all. Look inward. Write honestly.", days: 7 },
  { type: "8-day", title: "8-Day Alignment", subtitle: "Reconnect purpose with action", description: "Eight days bridging the gap between what you say matters and what you actually do.", days: 8 },
  { type: "14-day", title: "14-Day Transformation", subtitle: "Build new patterns", description: "Two weeks of guided coaching to dismantle old patterns and build new ones that serve you.", days: 14 },
  { type: "30-day", title: "30-Day Evolution", subtitle: "The complete journey", description: "A full month of daily coaching, reflection, and growth. For those ready to truly transform.", days: 30 },
];

const statusLabels: Record<string, string> = {
  enrolled: "Enrolled",
  in_progress: "In Progress",
  completed: "Completed",
};

const Challenges = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [enrollments, setEnrollments] = useState<ChallengeEnrollment[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getChallengeEnrollments().then(async (current) => {
        setEnrollments(current);
        // Auto-enroll any pending challenge stored before sign-in
        let pending: string | null = null;
        try { pending = sessionStorage.getItem("pending:challenge"); } catch { /* noop */ }
        if (pending && !current.find((e) => e.challengeType === pending)) {
          try {
            await enrollInChallenge(pending);
            const refreshed = await getChallengeEnrollments();
            setEnrollments(refreshed);
            toast({ title: "Enrolled!", description: "Your challenge is now on your dashboard." });
          } catch { /* enrollInChallenge already surfaces error */ }
        }
        try { sessionStorage.removeItem("pending:challenge"); } catch { /* noop */ }
      });
    }
  }, [user, toast]);

  useMouseGlow(containerRef);

  const getEnrollment = (type: string) => enrollments.find((e) => e.challengeType === type);

  const handleEnroll = async (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      try {
        sessionStorage.setItem("auth:returnTo", "/challenges");
        sessionStorage.setItem("pending:challenge", type);
      } catch { /* noop */ }
      navigate("/auth", { state: { from: "/challenges" } });
      return;
    }
    setEnrolling(type);
    // Optimistic update so the badge appears immediately
    const optimistic: ChallengeEnrollment = {
      id: `optimistic-${type}`,
      challengeType: type,
      status: "enrolled",
      enrolledAt: new Date().toISOString(),
      completedAt: null,
    };
    setEnrollments((prev) => [optimistic, ...prev.filter((e) => e.challengeType !== type)]);
    try {
      await enrollInChallenge(type);
      const updated = await getChallengeEnrollments();
      setEnrollments(updated);
      toast({ title: "Enrolled!", description: "Challenge added to your dashboard." });
    } catch {
      // Roll back optimistic update; enrollInChallenge already showed a destructive toast
      setEnrollments((prev) => prev.filter((e) => e.id !== optimistic.id));
    } finally {
      setEnrolling(null);
    }
  };

  const togglePreview = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === type ? null : type);
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead title="Challenges — FocusFlow AI" description="Take on transformative clarity challenges — 3-day, 4-day, or 7-day deep dives into honest self-reflection and growth." path="/challenges" jsonLd={{ "@context": "https://schema.org", "@type": "ItemList", name: "FocusFlow AI Challenges", itemListElement: challengeTypes.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Event", name: c.title, description: c.description } })) }} />
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Go back home">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary font-medium">Focus</span><span className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">Guided Transformation Actions</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Commit to the work
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Each challenge is a structured daily coaching experience designed to create lasting change. Pick a duration that matches your readiness.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challengeTypes.map((challenge, i) => {
            const enrollment = getEnrollment(challenge.type);
            const isExpanded = expandedCard === challenge.type;
            const previews = challengeDayPreviews[challenge.type] || [];
            return (
              <AnimatedSection key={challenge.type} delay={i * 100}>
                <div className="clarity-card w-full text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 h-full group flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {enrollment && (
                        <Badge className={`text-xs ${
                          enrollment.status === "completed"
                            ? "bg-accent/20 text-accent border-accent/30"
                            : enrollment.status === "in_progress"
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-secondary text-secondary-foreground"
                        }`}>
                          {statusLabels[enrollment.status]}
                        </Badge>
                      )}
                      <span className="font-mono-label text-primary/60">{challenge.days} days</span>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg md:text-xl font-light mb-1">{challenge.title}</h3>
                  <p className="text-primary/80 text-sm mb-3">{challenge.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{challenge.description}</p>

                  {/* Day preview toggle */}
                  <button
                    onClick={(e) => togglePreview(challenge.type, e)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors mb-4"
                    aria-label={isExpanded ? "Hide daily prompts preview" : "Show daily prompts preview"}
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isExpanded ? "Hide" : "What to expect"}
                  </button>

                  {isExpanded && (
                    <div className="mb-4 space-y-2 border-l-2 border-primary/15 pl-3">
                      {previews.map((line, j) => (
                        <p key={j} className={`text-xs leading-relaxed ${line.startsWith("…") ? "text-muted-foreground/40 italic" : "text-muted-foreground/70"}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => navigate(`/challenges/${challenge.type}`)}
                      className="flex items-center gap-2 text-sm text-primary/60 hover:text-primary transition-colors"
                      aria-label={enrollment ? `Continue ${challenge.title}` : `Begin ${challenge.title}`}
                    >
                      {enrollment ? "Continue" : "Begin challenge"} <ArrowRight className="h-3 w-3" />
                    </button>
                    {user && !enrollment && (
                      <button
                        onClick={(e) => handleEnroll(challenge.type, e)}
                        disabled={enrolling === challenge.type}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
                        aria-label={`Enroll in ${challenge.title}`}
                      >
                        {enrolling === challenge.type ? "..." : (
                          <>
                            <Check className="h-3 w-3" /> Enroll
                          </>
                        )}
                      </button>
                    )}
                    {!user && (
                      <button
                        onClick={(e) => handleEnroll(challenge.type, e)}
                        className="text-xs text-muted-foreground/50 hover:text-primary transition-colors ml-auto"
                      >
                        Sign in to enroll
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
