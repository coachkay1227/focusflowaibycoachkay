import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Community from "./pages/Community.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import EmailPreview from "./pages/EmailPreview.tsx";
import Sitemap from "./pages/Sitemap.tsx";
import NotFound from "./pages/NotFound.tsx";
import Kiosk from "./pages/Kiosk.tsx";
import ChatWidget from "./components/ChatWidget.tsx";

// Lazy-load heavy pages
const Modules = lazy(() => import("./pages/Modules.tsx"));
const ProgramDetail = lazy(() => import("./pages/ProgramDetail.tsx"));
const ClaritySession = lazy(() => import("./pages/ClaritySession.tsx"));
const ResultScreen = lazy(() => import("./pages/ResultScreen.tsx"));
const MirrorChallenge = lazy(() => import("./pages/MirrorChallenge.tsx"));
const Challenges = lazy(() => import("./pages/Challenges.tsx"));
const CoachChat = lazy(() => import("./pages/CoachChat.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.tsx"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><Dashboard /></Suspense>} />
            <Route path="/clarity" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><ClaritySession /></Suspense>} />
            <Route path="/clarity/:moduleId" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><ClaritySession /></Suspense>} />
            <Route path="/result" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><ResultScreen /></Suspense>} />
            <Route path="/mirror-challenge" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><MirrorChallenge /></Suspense>} />
            <Route path="/challenges" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><Challenges /></Suspense>} />
            <Route path="/challenges/:type" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><MirrorChallenge /></Suspense>} />
            <Route path="/modules" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><Modules /></Suspense>} />
            <Route path="/programs/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><ProgramDetail /></Suspense>} />
            <Route path="/coach" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><CoachChat /></Suspense>} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><Profile /></Suspense>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><AdminUsers /></Suspense></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><AdminAnalytics /></Suspense></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute requireAdmin><Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}><AdminContent /></Suspense></ProtectedRoute>} />
            <Route path="/kiosk" element={<Kiosk />} />
            <Route path="/email-preview" element={<ProtectedRoute requireAdmin><EmailPreview /></ProtectedRoute>} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
