import { createContext, useContext, useState, type ReactNode } from "react";

interface AdminViewContextType {
  /** When true, admin sees content as a regular user would */
  userView: boolean;
  toggleView: () => void;
}

const AdminViewContext = createContext<AdminViewContextType>({
  userView: false,
  toggleView: () => {},
});

export function AdminViewProvider({ children }: { children: ReactNode }) {
  // sessionStorage so the toggle resets on tab/browser close
  const [userView, setUserView] = useState(() => {
    try { return sessionStorage.getItem("admin-user-view") === "true"; } catch { return false; }
    try {
      return localStorage.getItem("admin-user-view") === "true";
    } catch (_err) {
      return false;
    }
  });

  const toggleView = () => {
    setUserView((prev) => {
      const next = !prev;
      try { sessionStorage.setItem("admin-user-view", String(next)); } catch {}
      try {
        localStorage.setItem("admin-user-view", String(next));
      } catch (_err) {
        // Ignore storage write failures (private mode / blocked storage).
      }
      return next;
    });
  };

  return (
    <AdminViewContext.Provider value={{ userView, toggleView }}>
      {userView && (
        <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between gap-4 bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-medium">
          <span>USER VIEW ACTIVE — access gates are visible as a regular user would see them</span>
          <button
            onClick={toggleView}
            className="underline underline-offset-2 hover:no-underline shrink-0"
          >
            Exit User View
          </button>
        </div>
      )}
      {children}
    </AdminViewContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminView() {
  return useContext(AdminViewContext);
}
