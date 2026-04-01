import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type Program, FOCUS_PILLARS } from "@/data/programs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Star, Clock, Sparkles } from "lucide-react";

interface ProgramCardProps {
  program: Program;
  enrollment?: { status: string } | null;
  onEnroll?: (programId: string) => void;
  enrolling?: boolean;
}

const statusLabels: Record<string, string> = {
  enrolled: "Enrolled",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function ProgramCard({ program, enrollment, onEnroll, enrolling }: ProgramCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pillar = FOCUS_PILLARS[program.pillar];

  const canStart = program.type === "assessment";

  return (
    <div className="clarity-card w-full text-left rounded-lg border border-border bg-card/30 backdrop-blur-sm p-6 h-full group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
            style={{ borderColor: pillar.color, color: pillar.color }}
          >
            {program.pillar}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{program.category}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {program.isNew && <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">New</Badge>}
          {program.isFeatured && <Star className="h-3 w-3 text-primary fill-primary" />}
          {enrollment && (
            <Badge className={`text-[10px] ${
              enrollment.status === "completed"
                ? "bg-accent/20 text-accent border-accent/30"
                : enrollment.status === "in_progress"
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-secondary text-secondary-foreground"
            }`}>
              {statusLabels[enrollment.status] ?? enrollment.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-heading text-base md:text-lg font-light mb-1 cursor-pointer hover:text-primary transition-colors leading-tight"
        onClick={() => navigate(`/programs/${program.slug}`)}
      >
        {program.title}
      </h3>

      {/* Tagline */}
      <p className="text-xs text-primary/70 italic mb-2">{program.tagline}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {program.durationLabel}
        </span>
        <span className="text-[11px] font-medium" style={{ color: program.price > 0 ? pillar.color : undefined }}>
          {program.priceDisplay}
        </span>
      </div>

      {/* Description (truncated) */}
      <p className="text-muted-foreground text-xs leading-relaxed mb-3 flex-1 line-clamp-3">
        {program.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {program.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/50">
        <button
          onClick={() => navigate(`/programs/${program.slug}`)}
          className="flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary transition-colors"
        >
          View details <ArrowRight className="h-3 w-3" />
        </button>

        {canStart && (
          <button
            onClick={() => navigate(`/clarity/${program.id}`)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="h-3 w-3" /> Start
          </button>
        )}

        {user && !enrollment && onEnroll && !program.isGated && (
          <button
            onClick={() => onEnroll(program.id)}
            disabled={enrolling}
            className="text-xs text-muted-foreground hover:text-primary transition-colors ml-auto"
          >
            {enrolling ? "..." : "Enroll"}
          </button>
        )}

        {program.isGated && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
            <Lock className="h-3 w-3" /> {program.cohortCode ? "Code required" : "Application"}
          </span>
        )}

        {!user && !program.isGated && (
          <button
            onClick={() => navigate("/auth")}
            className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors ml-auto"
          >
            Sign in to enroll
          </button>
        )}
      </div>
    </div>
  );
}
