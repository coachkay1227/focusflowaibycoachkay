import { useEffect, useState, useRef } from "react";
import { computeClarityScore, getNextLevel, type ClarityScore } from "@/lib/clarity-score";
import { Flame, TrendingUp, Zap, Layers } from "lucide-react";

const ClarityScoreCard = () => {
  const [score, setScore] = useState<ClarityScore | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    computeClarityScore().then(setScore);
  }, []);

  // Animate the score number counting up
  useEffect(() => {
    if (!score) return;
    const target = score.total;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  if (!score) return null;

  const nextLevel = getNextLevel(score.levelIndex);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score.total / 100) * circumference;

  const breakdownItems = [
    { label: "Sessions", value: score.breakdown.sessions, max: 30, icon: Zap, color: "hsl(43 75% 52%)" },
    { label: "Challenges", value: score.breakdown.challenges, max: 25, icon: Flame, color: "hsl(43 60% 65%)" },
    { label: "Consistency", value: score.breakdown.consistency, max: 25, icon: TrendingUp, color: "hsl(210 40% 60%)" },
    { label: "Depth", value: score.breakdown.depth, max: 20, icon: Layers, color: "hsl(210 35% 50%)" },
  ];

  return (
    <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular score gauge */}
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(210 20% 20%)" strokeWidth="6" />
            <circle
              ref={circleRef}
              cx="60" cy="60" r="52"
              fill="none"
              stroke="hsl(43 75% 52%)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-3xl font-light text-foreground">{animatedScore}</span>
            <span className="font-mono-label text-primary/70 text-[0.55rem]">Clarity</span>
          </div>
        </div>

        {/* Level & stats */}
        <div className="flex-1 text-center md:text-left">
          <div className="font-mono-label text-primary tracking-[0.2em] mb-1">Level</div>
          <h3 className="font-heading text-2xl md:text-3xl font-light mb-2">{score.level}</h3>
          {nextLevel && (
            <p className="text-muted-foreground text-sm mb-4">
              {nextLevel.min - score.total} points to <span className="text-primary/80">{nextLevel.name}</span>
            </p>
          )}

          <div className="flex items-center gap-6 justify-center md:justify-start text-sm">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{score.streak}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{score.totalSessions}</span>
              <span className="text-muted-foreground">sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {breakdownItems.map(({ label, value, max, icon: Icon, color }) => (
          <div key={label}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="h-3.5 w-3.5" style={{ color }} />
              <span className="font-mono-label text-muted-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(value / max) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground/60 mt-1 block">{value}/{max}</span>
          </div>
        ))}
      </div>

      {/* Mini evolution spark line */}
      {score.evolution.length > 1 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="font-mono-label text-muted-foreground mb-3">Evolution</div>
          <div className="h-12 flex items-end gap-0.5">
            {score.evolution.slice(-20).map((point, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-primary/40 hover:bg-primary transition-colors"
                style={{
                  height: `${Math.max(8, point.score)}%`,
                }}
                title={`${point.date}: ${point.score}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClarityScoreCard;
