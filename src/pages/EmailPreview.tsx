import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TEMPLATE_PREVIEWS } from "@/lib/email-templates";
import { ArrowLeft } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const templates = [
  { id: "enrollmentConfirmation", label: "Enrollment Confirmation" },
  { id: "challengeReminder", label: "Challenge Reminder" },
  { id: "sessionSummary", label: "Session Summary" },
  { id: "weeklyDigest", label: "Weekly Digest" },
] as const;

type TemplateKey = (typeof templates)[number]["id"];

const EmailPreview = () => {
  const [active, setActive] = useState<TemplateKey>("enrollmentConfirmation");
  const navigate = useNavigate();

  const html = TEMPLATE_PREVIEWS[active]();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Email Templates Preview</h1>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="pt-20 pb-16 px-4 max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                active === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Preview iframe */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <iframe
            srcDoc={html}
            title="Email preview"
            className="w-full border-0"
            style={{ minHeight: "700px" }}
            sandbox=""
          />
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          These templates will be used once an email domain is configured in Cloud → Emails.
        </p>
      </main>
    </div>
  );
};

export default EmailPreview;
