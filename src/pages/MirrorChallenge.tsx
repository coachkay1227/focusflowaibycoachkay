import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mirrorPrompts } from "@/lib/clarity-engine";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingOrbs from "@/components/FloatingOrbs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Lock, Trophy } from "lucide-react";

interface ChallengeData {
  entries: Record<number, string>;
  currentDay: number;
}

const STORAGE_KEY = "focus-flow-mirror-challenge";

function loadData(): ChallengeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { entries: {}, currentDay: 1 };
}

function saveData(data: ChallengeData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const MirrorChallenge = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ChallengeData>(loadData);
  const [selectedDay, setSelectedDay] = useState(data.currentDay);
  const [journalText, setJournalText] = useState(data.entries[data.currentDay] || "");
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCompleted = data.currentDay > 7;
  const prompt = mirrorPrompts[selectedDay - 1];
  const isDayUnlocked = selectedDay <= data.currentDay;
  const isDayCompleted = !!data.entries[selectedDay];

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

  const handleSubmit = () => {
    if (!journalText.trim()) return;
    const newData = {
      entries: { ...data.entries, [selectedDay]: journalText },
      currentDay: selectedDay === data.currentDay ? data.currentDay + 1 : data.currentDay,
    };
    setData(newData);
    saveData(newData);

    if (selectedDay === 7 && !data.entries[7]) {
      setShowCelebration(true);
    }
  };

  const handleDaySelect = (day: number) => {
    if (day > data.currentDay) return;
    setSelectedDay(day);
    setJournalText(data.entries[day] || "");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden grain-overlay">
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Focus</span> Flow
        </div>
        <div />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <span className="font-mono-label text-primary tracking-[0.2em]">7-Day Mirror Challenge</span>
          <h1
            className="font-heading text-3xl md:text-5xl font-light mt-4"
            style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
          >
            Look inward. Write honestly.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            One prompt per day. One honest answer. Seven days that change how you see yourself.
          </p>
        </AnimatedSection>

        {/* Day Tracker */}
        <AnimatedSection delay={200} className="mb-12">
          <div className="flex justify-center gap-2 md:gap-3">
            {mirrorPrompts.map((_, i) => {
              const day = i + 1;
              const unlocked = day <= data.currentDay;
              const completed = !!data.entries[day];
              const active = day === selectedDay;
              return (
                <button
                  key={day}
                  onClick={() => handleDaySelect(day)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-sm transition-all ${
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
                  {completed ? <Check className="h-4 w-4" /> : !unlocked ? <Lock className="h-3 w-3" /> : day}
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Celebration */}
        {(showCelebration || isCompleted) && (
          <AnimatedSection className="text-center mb-12">
            <div className="animate-celebration">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-primary/40 flex items-center justify-center" style={{ boxShadow: "0 0 40px hsl(43 75% 52% / 0.2)" }}>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-light text-primary mb-4">Challenge Complete</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                You showed up for 7 days. You looked honestly at yourself. That takes real courage. This is just the beginning.
              </p>
              <Button
                onClick={() => navigate("/clarity")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start a New Clarity Session
              </Button>
            </div>
          </AnimatedSection>
        )}

        {/* Current Prompt */}
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
