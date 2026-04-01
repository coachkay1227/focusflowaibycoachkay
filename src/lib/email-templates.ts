/**
 * FocusFlow AI — Transactional Email Templates
 *
 * These templates produce self-contained HTML emails styled with inline CSS.
 * Email body backgrounds are white (#ffffff) per best-practice; brand accent
 * colors from the app's design system are used for headers/CTAs.
 *
 * Ready to be used with Lovable's transactional email system once an email
 * domain is configured.
 */

// Brand palette (derived from app design tokens)
const BRAND = {
  gold: "#c9a227",
  darkBg: "#111827",
  cardBg: "#1a2332",
  textLight: "#e8d5a3",
  textMuted: "#8a7a5a",
  white: "#ffffff",
  bodyBg: "#ffffff",
  footerText: "#6b7280",
};

const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FocusFlow AI</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bodyBg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bodyBg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.darkBg};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                <span style="color:${BRAND.gold};">Focus</span><span style="color:${BRAND.textLight};">Flow AI</span>
              </h1>
              <p style="margin:4px 0 0;font-size:12px;color:${BRAND.textMuted};letter-spacing:2px;text-transform:uppercase;">by Coach Kay</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.footerText};line-height:1.6;">
                FocusFlow AI by Coach Kay<br/>
                Clarity → Pattern → Decision → Action
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${BRAND.footerText};">
                You're receiving this because you have an account with FocusFlow AI.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const ctaButton = (text: string, url: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
  <tr>
    <td style="background-color:${BRAND.gold};border-radius:8px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${BRAND.darkBg};text-decoration:none;letter-spacing:0.3px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;

// ---------------------------------------------------------------------------
// 1. Enrollment Confirmation
// ---------------------------------------------------------------------------

interface EnrollmentConfirmationData {
  userName: string;
  itemType: "module" | "challenge";
  itemName: string;
  itemDescription?: string;
  dashboardUrl: string;
}

export function enrollmentConfirmationEmail(data: EnrollmentConfirmationData): string {
  const emoji = data.itemType === "module" ? "📘" : "🏆";
  const typeLabel = data.itemType === "module" ? "Module" : "Challenge";

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">
      You're enrolled! ${emoji}
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${data.userName || "there"}, you've just enrolled in a new ${typeLabel.toLowerCase()}. Here's what's ahead:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.footerText};text-transform:uppercase;letter-spacing:1.5px;">${typeLabel}</p>
          <h3 style="margin:0 0 8px;font-size:18px;color:${BRAND.darkBg};font-weight:600;">${data.itemName}</h3>
          ${data.itemDescription ? `<p style="margin:0;font-size:14px;color:#4b5563;line-height:1.5;">${data.itemDescription}</p>` : ""}
        </td>
      </tr>
    </table>

    ${ctaButton("Go to Dashboard", data.dashboardUrl)}

    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;line-height:1.5;">
      Your clarity journey continues. Show up, stay honest, and trust the process.
    </p>`;

  return baseWrapper(content);
}

// ---------------------------------------------------------------------------
// 2. Challenge Reminder
// ---------------------------------------------------------------------------

interface ChallengeReminderData {
  userName: string;
  challengeName: string;
  currentDay: number;
  totalDays: number;
  prompt: string;
  challengeUrl: string;
}

export function challengeReminderEmail(data: ChallengeReminderData): string {
  const progress = Math.round((data.currentDay / data.totalDays) * 100);

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">
      Day ${data.currentDay} of ${data.totalDays} 🔥
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${data.userName || "there"}, your <strong>${data.challengeName}</strong> challenge awaits. Don't break the streak.
    </p>

    <!-- Progress bar -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:12px;color:${BRAND.footerText};">Progress: ${progress}%</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e5e7eb;border-radius:4px;height:8px;">
            <tr>
              <td style="width:${progress}%;background-color:${BRAND.gold};border-radius:4px;height:8px;"></td>
              <td style="height:8px;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border-left:4px solid ${BRAND.gold};">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.footerText};text-transform:uppercase;letter-spacing:1.5px;">Today's Prompt</p>
          <p style="margin:0;font-size:15px;color:${BRAND.darkBg};font-style:italic;line-height:1.5;">"${data.prompt}"</p>
        </td>
      </tr>
    </table>

    ${ctaButton("Complete Today's Reflection", data.challengeUrl)}

    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;line-height:1.5;">
      "The mirror doesn't judge. It just shows you what's real." — Coach Kay
    </p>`;

  return baseWrapper(content);
}

// ---------------------------------------------------------------------------
// 3. Session Summary
// ---------------------------------------------------------------------------

interface SessionSummaryData {
  userName: string;
  moduleName: string;
  completedAt: string;
  insightPattern?: string;
  insightTruth?: string;
  insightAction?: string;
  clarityScore?: number;
  clarityLevel?: string;
  dashboardUrl: string;
}

export function sessionSummaryEmail(data: SessionSummaryData): string {
  const insightBlock = (label: string, text: string, icon: string) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0 0 4px;font-size:11px;color:${BRAND.footerText};text-transform:uppercase;letter-spacing:1.5px;">${icon} ${label}</p>
        <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.5;">${text}</p>
      </td>
    </tr>`;

  const insights = [
    data.insightPattern ? insightBlock("Pattern Detected", data.insightPattern, "🔍") : "",
    data.insightTruth ? insightBlock("Your Truth", data.insightTruth, "💡") : "",
    data.insightAction ? insightBlock("Next Step", data.insightAction, "🎯") : "",
  ].filter(Boolean).join("");

  const scoreSection = data.clarityScore != null ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${BRAND.darkBg};border-radius:8px;">
      <tr>
        <td style="padding:20px 24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Clarity Score</p>
          <p style="margin:0;font-size:36px;font-weight:700;color:${BRAND.gold};">${data.clarityScore}</p>
          ${data.clarityLevel ? `<p style="margin:4px 0 0;font-size:13px;color:${BRAND.textLight};">Level: ${data.clarityLevel}</p>` : ""}
        </td>
      </tr>
    </table>` : "";

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">
      Session Complete ✨
    </h2>
    <p style="margin:0 0 4px;font-size:15px;color:#374151;line-height:1.6;">
      Nice work, ${data.userName || "there"}. Here's your clarity snapshot from <strong>${data.moduleName}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.footerText};">
      Completed on ${data.completedAt}
    </p>

    ${insights ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${insights}
          </table>
        </td>
      </tr>
    </table>` : ""}

    ${scoreSection}

    ${ctaButton("View Full Results", data.dashboardUrl)}

    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;line-height:1.5;">
      Every session sharpens the lens. Keep going.
    </p>`;

  return baseWrapper(content);
}

// ---------------------------------------------------------------------------
// 4. Weekly Digest
// ---------------------------------------------------------------------------

interface WeeklyDigestData {
  userName: string;
  weekLabel: string;
  clarityScore: number;
  clarityLevel: string;
  previousScore: number;
  sessionsThisWeek: number;
  totalSessions: number;
  challengeDaysCompleted: number;
  streak: number;
  topInsight?: string;
  scoreHistory: { label: string; score: number }[];
  dashboardUrl: string;
}

export function weeklyDigestEmail(data: WeeklyDigestData): string {
  const scoreDelta = data.clarityScore - data.previousScore;
  const deltaSign = scoreDelta >= 0 ? "+" : "";
  const deltaColor = scoreDelta >= 0 ? "#16a34a" : "#dc2626";

  const barChart = data.scoreHistory
    .map((point) => {
      const barHeight = Math.max(4, Math.round((point.score / 100) * 80));
      return `
      <td style="vertical-align:bottom;text-align:center;padding:0 4px;">
        <div style="width:28px;height:${barHeight}px;background-color:${BRAND.gold};border-radius:4px 4px 0 0;margin:0 auto;"></div>
        <p style="margin:4px 0 0;font-size:10px;color:${BRAND.footerText};">${point.label}</p>
      </td>`;
    })
    .join("");

  const statCell = (label: string, value: string | number, icon: string) => `
    <td style="text-align:center;padding:12px 8px;">
      <p style="margin:0;font-size:20px;">${icon}</p>
      <p style="margin:4px 0 2px;font-size:22px;font-weight:700;color:${BRAND.darkBg};">${value}</p>
      <p style="margin:0;font-size:11px;color:${BRAND.footerText};text-transform:uppercase;letter-spacing:1px;">${label}</p>
    </td>`;

  const content = `
    <h2 style="margin:0 0 4px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">
      Your Weekly Clarity Digest 📊
    </h2>
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.footerText};">
      ${data.weekLabel}
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${data.userName || "there"}, here's how your clarity evolved this week.
    </p>

    <!-- Score highlight -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.darkBg};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Clarity Score</p>
          <p style="margin:0;font-size:42px;font-weight:700;color:${BRAND.gold};">${data.clarityScore}</p>
          <p style="margin:4px 0 0;font-size:14px;color:${BRAND.textLight};">
            Level: ${data.clarityLevel} &nbsp;
            <span style="color:${deltaColor};font-weight:600;">${deltaSign}${scoreDelta} this week</span>
          </p>
        </td>
      </tr>
    </table>

    <!-- Score evolution chart -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 16px 12px;">
          <p style="margin:0 0 12px;font-size:11px;color:${BRAND.footerText};text-transform:uppercase;letter-spacing:1.5px;">Score Evolution</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>${barChart}</tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Stats row -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:24px;">
      <tr>
        ${statCell("Sessions", data.sessionsThisWeek, "🧠")}
        ${statCell("Challenges", data.challengeDaysCompleted, "🏆")}
        ${statCell("Streak", `${data.streak}d`, "🔥")}
      </tr>
    </table>

    ${data.topInsight ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border-left:4px solid ${BRAND.gold};margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.footerText};text-transform:uppercase;letter-spacing:1.5px;">💡 Top Insight This Week</p>
          <p style="margin:0;font-size:15px;color:${BRAND.darkBg};font-style:italic;line-height:1.5;">"${data.topInsight}"</p>
        </td>
      </tr>
    </table>` : ""}

    ${ctaButton("View Full Dashboard", data.dashboardUrl)}

    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;line-height:1.5;">
      Clarity compounds. Every session builds on the last.
    </p>`;

  return baseWrapper(content);
}

// ---------------------------------------------------------------------------
// Preview helpers (for testing in browser)
// ---------------------------------------------------------------------------

export const TEMPLATE_PREVIEWS = {
  enrollmentConfirmation: () =>
    enrollmentConfirmationEmail({
      userName: "Jordan",
      itemType: "module",
      itemName: "Emotional Reset",
      itemDescription: "Process what you're carrying and come back to center.",
      dashboardUrl: "https://app.focusflow.ai/dashboard",
    }),

  challengeReminder: () =>
    challengeReminderEmail({
      userName: "Jordan",
      challengeName: "7-Day Mirror Challenge",
      currentDay: 3,
      totalDays: 7,
      prompt: "What pattern keeps showing up that you keep ignoring?",
      challengeUrl: "https://app.focusflow.ai/challenges/mirror-7",
    }),

  sessionSummary: () =>
    sessionSummaryEmail({
      userName: "Jordan",
      moduleName: "Clarity Check",
      completedAt: "April 1, 2026",
      insightPattern: "You tend to overthink when you're avoiding a decision you've already made.",
      insightTruth: "You already know what you need to do — the hesitation is fear of commitment, not lack of clarity.",
      insightAction: "Write down the decision you've been avoiding. Set a 24-hour deadline to act on it.",
      clarityScore: 42,
      clarityLevel: "Reflecting",
      dashboardUrl: "https://app.focusflow.ai/dashboard",
    }),
};
