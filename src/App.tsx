import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import ClaritySession from "./pages/ClaritySession.tsx";
import ResultScreen from "./pages/ResultScreen.tsx";
import MirrorChallenge from "./pages/MirrorChallenge.tsx";
import Community from "./pages/Community.tsx";
import Modules from "./pages/Modules.tsx";
import Challenges from "./pages/Challenges.tsx";
import CoachChat from "./pages/CoachChat.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Profile from "./pages/Profile.tsx";
import EmailPreview from "./pages/EmailPreview.tsx";
import ProgramDetail from "./pages/ProgramDetail.tsx";
import Sitemap from "./pages/Sitemap.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clarity" element={<ClaritySession />} />
            <Route path="/clarity/:moduleId" element={<ClaritySession />} />
            <Route path="/result" element={<ResultScreen />} />
            <Route path="/mirror-challenge" element={<MirrorChallenge />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:type" element={<MirrorChallenge />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/coach" element={<CoachChat />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/email-preview" element={<EmailPreview />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
