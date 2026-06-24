import { useMemo, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import SEOHead from "@/components/SEOHead";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  COACH_KAY_IDENTITY,
  COACH_KAY_VOICE,
  COACH_KAY_SIGNOFF,
  COACH_KAY_WARM_OPEN,
  lintVoice,
  scrubVoice,
} from "@/lib/coach-voice";

export default function AdminVoiceBible() {
  const [draft, setDraft] = useState("");
  const lint = useMemo(() => lintVoice(draft), [draft]);
  const cleaned = useMemo(() => scrubVoice(draft), [draft]);

  return (
    <div className="min-h-screen bg-background text-foreground">
        <SEOHead title="Voice Bible — Admin" description="CKE Voice Bible reference + lint." path="/admin/voice-bible" />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <AdminNav />
        <h1 className="font-serif text-3xl mb-2">Voice Bible</h1>
        <p className="text-muted-foreground mb-8">
          Single source of truth for every AI prompt and every email. Edit{" "}
          <code className="text-primary">src/lib/coach-voice.ts</code> to change the rules.
        </p>

        <section className="mb-10 p-6 rounded-lg border border-border bg-card/30">
          <h2 className="font-serif text-xl mb-3">Sign-off</h2>
          <p className="text-primary italic">{COACH_KAY_SIGNOFF}</p>
          <p className="mt-3 text-sm text-muted-foreground">Warm open: {COACH_KAY_WARM_OPEN}</p>
        </section>

        <section className="mb-10 p-6 rounded-lg border border-border bg-card/30">
          <h2 className="font-serif text-xl mb-3">Identity</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
            {COACH_KAY_IDENTITY}
          </pre>
        </section>

        <section className="mb-10 p-6 rounded-lg border border-border bg-card/30">
          <h2 className="font-serif text-xl mb-3">Voice & Rules</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
            {COACH_KAY_VOICE}
          </pre>
        </section>

        <section className="p-6 rounded-lg border border-border bg-card/30">
          <h2 className="font-serif text-xl mb-3">Voice Lint</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Paste any copy. Get back banned-word hits, em-dash count, missing sign-off.
          </p>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste copy here..."
            className="min-h-[160px] mb-4"
          />
          {draft && (
            <div className="space-y-3 text-sm">
              <Row label="Em-dashes" value={lint.emDashes} bad={lint.emDashes > 0} />
              <Row
                label="Banned openers"
                value={lint.bannedOpeners.join(", ") || "none"}
                bad={lint.bannedOpeners.length > 0}
              />
              <Row
                label="Banned words"
                value={lint.bannedWords.join(", ") || "none"}
                bad={lint.bannedWords.length > 0}
              />
              <Row
                label="Banned structures"
                value={lint.bannedStructures.join(", ") || "none"}
                bad={lint.bannedStructures.length > 0}
              />
              <Row
                label="Mantra sign-off present"
                value={lint.missingSignoff ? "missing" : "yes"}
                bad={lint.missingSignoff}
              />
              <div className="pt-3">
                <Button
                  variant="outline"
                  onClick={() => setDraft(cleaned)}
                  disabled={cleaned === draft}
                >
                  Auto-scrub em-dashes
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, bad }: { label: string; value: string | number; bad: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-44 text-muted-foreground">{label}:</span>
      <span className={bad ? "text-destructive font-medium" : "text-foreground"}>{value}</span>
    </div>
  );
}
