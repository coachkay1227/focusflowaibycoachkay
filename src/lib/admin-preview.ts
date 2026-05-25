/**
 * Admin preview-mode toggle.
 *
 * The legacy behaviour relied solely on `?preview=1`. That meant a leaked URL
 * could trigger admin-only quiz prefill on any admin browser, even on a shared
 * device or a stale tab. We now require TWO things:
 *
 *   1. The visitor is an admin (server-validated via has_role / get_user_tier).
 *   2. Preview mode has been explicitly armed for this tab (sessionStorage).
 *
 * The arm flag lives in `sessionStorage` — it auto-clears when the tab closes,
 * is never sent in URLs, and is not shared across tabs. Admins arm it from
 * the Admin Dashboard before using `?preview=1` on a flow.
 */

const ARM_KEY = "ff_admin_preview_armed";

export function armAdminPreview(): void {
  try {
    window.sessionStorage.setItem(ARM_KEY, "1");
  } catch {
    /* sessionStorage unavailable — preview just stays disarmed */
  }
}

export function disarmAdminPreview(): void {
  try {
    window.sessionStorage.removeItem(ARM_KEY);
  } catch {
    /* ignore */
  }
}

export function isAdminPreviewArmed(): boolean {
  try {
    return window.sessionStorage.getItem(ARM_KEY) === "1";
  } catch {
    return false;
  }
}