import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import {
  armAdminPreview,
  disarmAdminPreview,
  isAdminPreviewArmed,
} from "@/lib/admin-preview";

/**
 * Admin-only control that arms or disarms preview mode for the current tab.
 * When armed, an admin can append `?preview=1` to /clarity or /assessment to
 * skip directly to the result screen. Without arming, `?preview=1` is inert.
 */
export function AdminPreviewToggle() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    setArmed(isAdminPreviewArmed());
  }, []);

  const toggle = () => {
    if (armed) {
      disarmAdminPreview();
      setArmed(false);
    } else {
      armAdminPreview();
      setArmed(true);
    }
  };

  return (
    <div className="clarity-card rounded-lg border border-border bg-card/30 backdrop-blur-sm p-5 mt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span className="font-mono-label text-xs tracking-[0.15em] text-primary/80">
              ADMIN PREVIEW MODE
            </span>
          </div>
          <p className="text-sm text-foreground/80">
            {armed
              ? "Armed for this tab. ?preview=1 will skip assessments straight to the result screen."
              : "Disarmed. ?preview=1 has no effect until you arm it here."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-clears when you close this tab. Never shared in URLs.
          </p>
        </div>
        <Button
          variant={armed ? "destructive" : "outline"}
          size="sm"
          onClick={toggle}
          className="shrink-0 gap-2"
        >
          {armed ? (
            <>
              <EyeOff className="h-4 w-4" /> Disarm
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> Arm preview
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default AdminPreviewToggle;