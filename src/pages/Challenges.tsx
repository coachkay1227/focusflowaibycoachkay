import { useState, useEffect, useRef } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getChallengeEnrollments, enrollInChallenge, type ChallengeEnrollment } from "@/lib/enrollment-store";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Trophy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";

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

  useEffect(() => {
    if (user) {
      getChallengeEnrollments().then(setEnrollments);
    }
  }, [user]);

  useMouseGlow(containerRef);

  const getEnrollment = (type: string) => enrollments.find((e) => e.challengeType === type);

  const handleEnroll = async (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    setEnrolling(type);
    await enrollInChallenge(type);
    const updated = await getChallengeEnrollments();
    setEnrollments(updated);
    setEnrolling(null);
    toast({ title: "Enrolled!", description: "Challenge added to your dashboard." });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <SEOHead title="Challenges — FocusFlow AI" description="Take on transformative clarity challenges — 3-day, 4-day, or 7-day deep dives into honest self-reflection and growth." path="/challenges" jsonLd={{ "@context": "https://schema.org", "@type": "ItemList", name: "FocusFlow AI Challenges", itemListElement: challengeTypes.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Event", name: c.title, description: c.description } })) }} />
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <MobileNav />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="font-mono-label text-primary tracking-[0.2em]">Challenge Programs</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Commit to the work
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Guided daily prompts with adaptive coaching. Pick a duration that matches your readiness.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challengeTypes.map((challenge, i) => {
            const enrollment = getEnrollment(challenge.type);
            return (
              <AnimatedSection key={challenge.type} delay={i * 100}>
                <div className="clarity-card w-full text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8 h-full group">
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

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/challenges/${challenge.type}`)}
                      className="flex items-center gap-2 text-sm text-primary/60 hover:text-primary transition-colors"
                    >
                      {enrollment ? "Continue" : "Begin challenge"} <ArrowRight className="h-3 w-3" />
                    </button>
                    {user && !enrollment && (
                      <button
                        onClick={(e) => handleEnroll(challenge.type, e)}
                        disabled={enrolling === challenge.type}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
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
                        onClick={() => navigate("/auth")}
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
