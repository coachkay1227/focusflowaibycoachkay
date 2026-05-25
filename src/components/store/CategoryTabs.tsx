import { BookOpen, Scroll, Award, Palette, HeartHandshake, type LucideIcon } from "lucide-react";
import type { BookCategory } from "@/lib/book-store";
import { CATEGORY_LABELS } from "@/lib/book-store";

const ICONS: Record<BookCategory, LucideIcon> = {
  storybooks: BookOpen,
  legacy: Scroll,
  authority: Award,
  creator: Palette,
  autism: HeartHandshake,
};

interface Props {
  active: BookCategory;
  onChange: (c: BookCategory) => void;
}

export function CategoryTabs({ active, onChange }: Props) {
  const cats: BookCategory[] = ["storybooks", "legacy", "authority", "creator", "autism"];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-8 border-b border-border/40 mb-12">
      {cats.map((c) => {
        const Icon = ICONS[c];
        const isActive = c === active;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`group flex items-center gap-2 px-4 py-3 -mb-px border-b-2 transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wide">{CATEGORY_LABELS[c]}</span>
          </button>
        );
      })}
    </div>
  );
}
