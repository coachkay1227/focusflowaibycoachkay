import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type Program, PILLAR_META } from "@/data/programs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Star, Clock } from "lucide-react";

interface ProgramCardProps {
  program: Program;
  enrollment?: { status: string } | null;
  onEnroll?: (programId: string) => void;
  enrolling?: boolean;
}

export default function ProgramCard({ program, enrollment, onEnroll, enrolling }: ProgramCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pillar = PILLAR_META[program.pillar];

  const statusLabels: Record<string, string> = {
    enrolled: "Enrolled",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const canStart = program.category === "module" || program.category === "assessment";

  return (
    <div className="clarity-card w-full text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8 h-full group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold"
          style={{ borderColor: pillar.color, color: pillar.color }}
        >
          {pillar.label}
        </div>
        <div className="flex items-center gap-2">
          {program.isFeatured && (
            <Star className="h-3.5 w-3.5 text-primary fill-primary" />
          )}
          {enrollment && (
            <Badge
              className={`text-xs ${
                enrollment.status === "completed"
                  ? "bg-accent/20 text-accent border-accent/30"
                  : enrollment.status === "in_progress"
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {statusLabels[enrollment.status] ?? enrollment.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Title & meta */}
      <h3
        className="font-heading text-lg md:text-xl font-light mb-1 cursor-pointer hover:text-primary transition-colors"
        onClick={() => navigate(`/programs/${program.slug}`)}
      >
        {program.title}
      </h3>
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {program.durationLabel}
        </span>
        {program.price > 0 && (
          <span className="text-xs text-primary font-medium">
            ${(program.price / 100).toLocaleString()}
            {program.category === "subscription" ? "/mo" : ""}
          </span>
        )}
        {program.price === 0 && program.accessTier === "free" && (
          <span className="text-xs text-accent font-medium">Free</span>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-3 flex-1">
        {program.description}
      </p>

      {/* Coach note */}
      <p className="text-xs text-primary/60 italic mb-4 border-l-2 border-primary/20 pl-3">
        "{program.coachNote}"
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {program.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/50">
        {canStart && (
          <button
            onClick={() => navigate(`/clarity/${program.id}`)}
            className="flex items-center gap-2 text-sm text-primary/60 hover:text-primary transition-colors"
          >
            {enrollment ? "Continue" : "Start"} <ArrowRight className="h-3 w-3" />
          </button>
        )}

        {program.isGated && !canStart && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Application required
          </span>
        )}

        {!canStart && !program.isGated && program.price > 0 && (
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 text-sm text-primary/60 hover:text-primary transition-colors"
          >
            Learn more <ArrowRight className="h-3 w-3" />
          </button>
        )}

        {user && canStart && !enrollment && onEnroll && (
          <button
            onClick={() => onEnroll(program.id)}
            disabled={enrolling}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
          >
            {enrolling ? "..." : "Enroll"}
          </button>
        )}

        {!user && canStart && (
          <button
            onClick={() => navigate("/auth")}
            className="text-xs text-muted-foreground/50 hover:text-primary transition-colors ml-auto"
          >
            Sign in to enroll
          </button>
        )}
      </div>
    </div>
  );
}
