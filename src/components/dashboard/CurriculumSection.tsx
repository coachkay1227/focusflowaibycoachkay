import { useNavigate } from "react-router-dom";
import { getCurriculumModules, FOCUS_PILLARS } from "@/data/programs";
import type { FocusPillar } from "@/data/programs";
import { Clock, ArrowRight } from "lucide-react";

const PILLAR_ORDER: FocusPillar[] = ["F", "O", "C", "U", "S"];

const modules = getCurriculumModules();

export default function CurriculumSection() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6">
        <span className="font-mono text-[11px] text-primary/70 tracking-[0.18em] uppercase">F.O.C.U.S. Curriculum</span>
        <h2 className="font-heading text-2xl font-light mt-1 flex items-center gap-2">
          Your Program Modules
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {modules.length} modules across all five pillars — work through them at your pace.
        </p>
      </div>

      <div className="space-y-8">
        {PILLAR_ORDER.map((pillarKey) => {
          const pillar = FOCUS_PILLARS[pillarKey];
          const pillarModules = modules.filter((m) => m.pillar === pillarKey);
          if (pillarModules.length === 0) return null;

          return (
            <div key={pillarKey}>
              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: pillar.color }}
                >
                  {pillarKey}
                </span>
                <h3 className="font-heading text-lg font-light">{pillar.full}</h3>
                <span className="text-xs text-muted-foreground/60">{pillarModules.length} modules</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pillarModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => navigate(`/programs/${mod.slug}`)}
                    className="text-left rounded-lg border border-border/60 bg-card/30 backdrop-blur-sm p-4 group hover:border-primary/40 hover:bg-primary/[0.03] transition-all"
                  >
                    <h4 className="font-heading text-sm font-light leading-snug group-hover:text-primary transition-colors">
                      {mod.title}
                    </h4>
                    <p className="text-muted-foreground/70 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {mod.tagline}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
                        <Clock className="h-3 w-3" />
                        {mod.durationLabel}
                      </span>
                      <span className="text-[11px] text-primary/50 group-hover:text-primary transition-colors flex items-center gap-1">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
