import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ClaritySession from "./pages/ClaritySession.tsx";
import ResultScreen from "./pages/ResultScreen.tsx";
import MirrorChallenge from "./pages/MirrorChallenge.tsx";
import Community from "./pages/Community.tsx";
import Modules from "./pages/Modules.tsx";
import Challenges from "./pages/Challenges.tsx";
import CoachChat from "./pages/CoachChat.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clarity" element={<ClaritySession />} />
          <Route path="/clarity/:moduleId" element={<ClaritySession />} />
          <Route path="/result" element={<ResultScreen />} />
          <Route path="/mirror-challenge" element={<MirrorChallenge />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:type" element={<MirrorChallenge />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/coach" element={<CoachChat />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
