import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import AuditLanding from "./AuditLanding";

describe("AuditLanding payment truth", () => {
  it("redirects an unpaid direct visitor to intake without showing confirmation", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/audit/landing"]}>
          <Routes>
            <Route path="/audit/landing" element={<AuditLanding />} />
            <Route path="/audit/intake" element={<div>Audit intake destination</div>} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByText("Audit intake destination")).toBeInTheDocument();
    expect(screen.queryByText("PAYMENT CONFIRMED")).not.toBeInTheDocument();
  });
});
