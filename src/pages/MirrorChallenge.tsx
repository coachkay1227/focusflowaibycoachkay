import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChallengeDataCloud, saveChallengeDataCloud } from "@/lib/session-store";
import { updateChallengeStatus } from "@/lib/enrollment-store";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Lock, Trophy } from "lucide-react";
import MobileNav from "@/components/MobileNav";

// Challenge prompt configs
const challengePrompts: Record<string, { prompt: string }[]> = {
  "3-day": [
    { prompt: "What is one thing you've been avoiding that you already know the answer to?" },
    { prompt: "If you removed the fear, what would you do tomorrow?" },
    { prompt: "Write one sentence that describes who you're becoming." },
  ],
  "4-day": [
    { prompt: "What pattern keeps showing up in your life that you pretend not to see?" },
    { prompt: "What are you tolerating that your future self would never accept?" },
    { prompt: "Write about a time you surprised yourself with your own strength." },
    { prompt: "What's the one shift that would make everything else fall into place?" },
  ],
  "7-day": [
    { prompt: "What is one thing you've been avoiding that you already know the answer to?" },
    { prompt: "Write about a moment today when you felt most like yourself." },
    { prompt: "What would you do differently if no one was watching or judging?" },
    { prompt: "Name one belief about yourself that you're ready to let go of." },
    { prompt: "What is your body trying to tell you that your mind keeps overriding?" },
    { prompt: "If your future self could send you one message, what would it say?" },
    { prompt: "Read everything you've written this week. What pattern do you see? What truth emerges?" },
  ],
  "8-day": [
    { prompt: "What do you say matters most to you? Does your calendar reflect that?" },
    { prompt: "Where are your actions out of alignment with your stated values?" },
    { prompt: "What would you stop doing if you truly believed you were enough?" },
    { prompt: "Write about the gap between who you are and who you present to others." },
    { prompt: "What commitment have you been breaking to yourself over and over?" },
    { prompt: "If your life was a story, what chapter are you in? What needs to happen next?" },
    { prompt: "What would radical honesty look like in your most important relationship?" },
    { prompt: "Look at your week. What one action would bring your life closer to alignment?" },
  ],
  "14-day": Array.from({ length: 14 }, (_, i) => ({
    prompt: [
      "What story have you been telling yourself about why you can't change?",
      "What emotion do you avoid feeling the most? Why?",
      "Write about a decision you've been postponing. What are you afraid of?",
      "Who are you when no one needs anything from you?",
      "What did you learn about yourself this week that surprised you?",
      "What would your life look like if you stopped seeking approval?",
      "Write a letter of forgiveness — to yourself.",
      "What's the bravest thing you could do in the next 48 hours?",
      "What are you grateful for that you usually overlook?",
      "Where in your life are you settling? Be honest.",
      "What does freedom actually mean to you — not the idea, the feeling?",
      "If today was your last day, what would you regret not saying?",
      "What pattern have you noticed in yourself over these two weeks?",
      "Write your personal declaration. Who are you choosing to be from now on?",
    ][i],
  })),
  "30-day": Array.from({ length: 30 }, (_, i) => ({
    prompt: [
      "What brought you here today? What are you seeking?",
      "Describe your current emotional weather — are you stormy, clear, foggy?",
      "What's one thing you've outgrown but haven't let go of?",
      "Write about a moment when you felt truly powerful.",
      "What would your 80-year-old self tell you about how you're living?",
      "What are you pretending not to know?",
      "Where do you feel most free? Go there in your mind. Write from that place.",
      "What relationship needs the most honest conversation?",
      "What's the story you tell yourself when things go wrong?",
      "Write about someone who believed in you before you believed in yourself.",
      "What boundary would change your life if you actually held it?",
      "What does success look like when no one else defines it for you?",
      "Write about your relationship with rest. Is it earned or inherent?",
      "What are you building? Is it what you actually want?",
      "Halfway point. What's shifted in you since Day 1?",
      "What scares you about getting exactly what you want?",
      "Write about your relationship with control. Where can you loosen your grip?",
      "What would you do if you knew you couldn't fail — and wouldn't be judged?",
      "Who do you become when you're stressed? Is that who you want to be?",
      "What would radical self-trust look like for you today?",
      "Write about a loss that shaped who you are. What did it teach you?",
      "What's the kindest thing you could do for yourself this week?",
      "Where are you playing small? What would playing full out look like?",
      "What does your intuition keep whispering that your logic keeps ignoring?",
      "Write about a moment this month where you chose courage over comfort.",
      "What's the most important conversation you need to have with yourself?",
      "If you could design your ideal day, what would it look like?",
      "What will you carry forward from this journey? What will you leave behind?",
      "Write a letter to the person you were on Day 1. What do you want them to know?",
      "You showed up for 30 days. Read everything you've written. What is the one truth that emerges from all of it?",
    ][i],
  })),
};

interface ChallengeData {
  entries: Record<number, string>;
  currentDay: number;
  startedAt: number;
}

const MirrorChallenge = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const challengeType = type || "7-day";
  const prompts = challengePrompts[challengeType] || challengePrompts["7-day"];
  const totalDays = prompts.length;
  const challengeTitle = `${totalDays}-Day ${challengeType === "7-day" ? "Mirror Challenge" : challengeType === "3-day" ? "Spark" : challengeType === "4-day" ? "Shift" : challengeType === "8-day" ? "Alignment" : challengeType === "14-day" ? "Transformation" : "Evolution"}`;

  const [data, setData] = useState<ChallengeData>({ entries: {}, currentDay: 1, startedAt: Date.now() });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [journalText, setJournalText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data from cloud on mount
  useEffect(() => {
    getChallengeDataCloud(challengeType).then((loaded) => {
      if (loaded) {
        setData(loaded);
        const day = loaded.currentDay > totalDays ? totalDays : loaded.currentDay;
        setSelectedDay(day);
        setJournalText(loaded.entries[day] || "");
      }
      setDataLoaded(true);
    });
  }, [challengeType, totalDays]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    el.addEventListener("mousemove", handler, { passive: true });
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  const isCompleted = data.currentDay > totalDays;
  const prompt = prompts[selectedDay - 1];
  const isDayUnlocked = selectedDay <= data.currentDay;
  const isDayCompleted = !!data.entries[selectedDay];

  const handleSubmit = () => {
    if (!journalText.trim()) return;
    const newData = {
      ...data,
      entries: { ...data.entries, [selectedDay]: journalText },
      currentDay: selectedDay === data.currentDay ? data.currentDay + 1 : data.currentDay,
    };
    setData(newData);
    saveChallengeDataCloud(challengeType, newData);

    // Update enrollment status
    if (selectedDay === 1 && !data.entries[1]) {
      updateChallengeStatus(challengeType, "in_progress");
    }

    if (selectedDay === totalDays && !data.entries[totalDays]) {
      setShowCelebration(true);
      updateChallengeStatus(challengeType, "completed");
    }
  };

  const handleDaySelect = (day: number) => {
    if (day > data.currentDay) return;
    setSelectedDay(day);
    setJournalText(data.entries[day] || "");
  };

  // For large challenges, show paginated day tracker
  const renderDayTracker = () => {
    const maxVisible = 14;
    const start = Math.max(0, Math.min(selectedDay - 7, totalDays - maxVisible));
    const visible = prompts.slice(start, start + maxVisible);

    return (
      <div className="flex justify-center gap-1.5 md:gap-2 flex-wrap">
        {visible.map((_, idx) => {
          const day = start + idx + 1;
          const unlocked = day <= data.currentDay;
          const completed = !!data.entries[day];
          const active = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => handleDaySelect(day)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center text-xs transition-all ${
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : completed
                  ? "border-primary/40 bg-primary/5 text-primary/80"
                  : unlocked
                  ? "border-border text-muted-foreground hover:border-primary/30"
                  : "border-border/30 text-muted-foreground/30 cursor-not-allowed"
              }`}
              disabled={!unlocked}
            >
              {completed ? <Check className="h-3 w-3" /> : !unlocked ? <Lock className="h-2.5 w-2.5" /> : day}
            </button>
          );
        })}
        {totalDays > maxVisible && (
          <span className="text-muted-foreground/40 text-xs self-center ml-1">
            {start > 0 && "..."} Day {start + 1}–{Math.min(start + maxVisible, totalDays)} of {totalDays}
          </span>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <FloatingOrbs />

      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate(type ? "/challenges" : "/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {type ? "Challenges" : "Home"}
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span>Flow AI
        </div>
        <MobileNav />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <span className="font-mono-label text-primary tracking-[0.2em]">{challengeTitle}</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Look inward. Write honestly.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            One prompt per day. One honest answer. {totalDays} days that change how you see yourself.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200} className="mb-12">
          {renderDayTracker()}
        </AnimatedSection>

        {(showCelebration || isCompleted) && (
          <AnimatedSection className="text-center mb-12">
            <div className="animate-celebration">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-primary/40 flex items-center justify-center" style={{ boxShadow: "0 0 40px hsl(43 75% 52% / 0.2)" }}>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-light text-primary mb-4">Challenge Complete</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                You showed up for {totalDays} days. You looked honestly at yourself. That takes real courage. This is just the beginning.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => navigate("/clarity")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start a New Clarity Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/challenges")}
                  className="border-border hover:border-primary/40"
                >
                  Try Another Challenge
                </Button>
              </div>
            </div>
          </AnimatedSection>
        )}

        {!isCompleted && prompt && (
          <AnimatedSection delay={300}>
            <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono-label text-primary/60">Day {selectedDay}</span>
                {isDayCompleted && <span className="font-mono-label text-primary/40">· Completed</span>}
              </div>

              <h3
                className="font-heading text-xl md:text-2xl font-light mb-8 text-foreground leading-relaxed"
                style={{ textShadow: "0 0 20px hsl(43 75% 52% / 0.08)" }}
              >
                {prompt.prompt}
              </h3>

              {isDayUnlocked ? (
                <div className="space-y-4">
                  <Textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write honestly. No one else will see this."
                    className="bg-card/30 border-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground/40 min-h-[150px] text-base resize-none focus:border-primary/40"
                    disabled={isDayCompleted && selectedDay !== data.currentDay}
                  />
                  {!isDayCompleted && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        disabled={!journalText.trim()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                      >
                        Complete Day {selectedDay}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground/50">
                  <Lock className="h-8 w-8 mx-auto mb-4 opacity-30" />
                  <p>Complete the previous day to unlock this prompt.</p>
                </div>
              )}
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default MirrorChallenge;
