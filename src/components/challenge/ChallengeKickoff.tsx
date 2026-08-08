import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

export interface KickoffAnswers {
  why: string;
  cost: string;
  when: string;
}

export const emptyKickoff: KickoffAnswers = { why: "", cost: "", when: "" };

const steps: { key: keyof KickoffAnswers; label: string; question: string; helper: string; placeholder: string }[] = [
  {
    key: "why",
    label: "Step 1 of 3",
    question: "Why this challenge, and why now?",
    helper: "Say the real reason. Not the polished one.",
    placeholder: "I'm starting this because...",
  },
  {
    key: "cost",
    label: "Step 2 of 3",
    question: "What has staying stuck already cost you?",
    helper: "Time, energy, opportunities. Name it plainly.",
    placeholder: "What it has cost me so far...",
  },
  {
    key: "when",
    label: "Step 3 of 3",
    question: "When will you show up for this each day?",
    helper: "Pick a real window in your actual life. Ten minutes counts.",
    placeholder: "I'll write at...",
  },
];

interface Props {
  challengeTitle: string;
  totalDays: number;
  answers: KickoffAnswers;
  /** Called after each step so progress is saved as you go. */
  onSaveStep: (answers: KickoffAnswers) => void;
  onComplete: (answers: KickoffAnswers) => void;
  onSkip: () => void;
}

const ChallengeKickoff = ({ challengeTitle, totalDays, answers, onSaveStep, onComplete, onSkip }: Props) => {
  const firstUnanswered = steps.findIndex((s) => !answers[s.key]?.trim());
  const [step, setStep] = useState(firstUnanswered === -1 ? steps.length - 1 : firstUnanswered);
  const [draft, setDraft] = useState<KickoffAnswers>(answers);

  const current = steps[step];
  const value = draft[current.key];
  const isLast = step === steps.length - 1;

  const next = () => {
    if (!value.trim()) return;
    onSaveStep(draft);
    if (isLast) onComplete(draft);
    else setStep(step + 1);
  };

  return (
    <AnimatedSection>
      <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono-label text-primary">{current.label}</span>
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.key}
                aria-hidden="true"
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i < step ? "bg-primary/70" : i === step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-2">
          Before Day 1 of your {challengeTitle}, three quick questions. This sets the ground for the next {totalDays} days.
        </p>

        <h2
          className="font-heading text-xl md:text-2xl font-light mb-2 leading-relaxed"
          style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.08)" }}
        >
          {current.question}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">{current.helper}</p>

        <Textarea
          value={value}
          onChange={(e) => setDraft({ ...draft, [current.key]: e.target.value })}
          placeholder={current.placeholder}
          className="bg-card/30 border-border backdrop-blur-sm text-foreground placeholder:text-muted-foreground/70 min-h-[130px] text-base resize-none focus:border-primary/40"
        />

        <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-border hover:border-primary/40"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </Button>
            )}
            <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Skip to Day 1
            </button>
          </div>
          <Button
            onClick={next}
            disabled={!value.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
          >
            {isLast ? (
              <>
                Begin Day 1 <Check className="h-3 w-3" />
              </>
            ) : (
              <>
                Save and continue <ArrowRight className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>

        <p className="text-muted-foreground text-xs mt-4">Your answers save as you go. You can come back to this anytime.</p>
      </div>
    </AnimatedSection>
  );
};

export default ChallengeKickoff;