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
  const [userView, setUserView] = useState(() => {
    try { return localStorage.getItem("admin-user-view") === "true"; } catch { return false; }
  });

  const toggleView = () => {
    setUserView((prev) => {
      const next = !prev;
      try { localStorage.setItem("admin-user-view", String(next)); } catch {}
      return next;
    });
  };

  return (
    <AdminViewContext.Provider value={{ userView, toggleView }}>
      {children}
    </AdminViewContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminView() {
  return useContext(AdminViewContext);
}
