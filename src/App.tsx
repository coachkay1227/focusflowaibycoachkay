import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminViewProvider } from "@/contexts/AdminViewContext";
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
import Unsubscribe from "./pages/Unsubscribe.tsx";
import Kiosk from "./pages/Kiosk.tsx";
import ChatWidget from "./components/ChatWidget.tsx";
import { AdminViewToggle } from "./components/AccessGate.tsx";
import PageSkeleton from "./components/PageSkeleton.tsx";
import DesktopNav from "./components/DesktopNav.tsx";

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
      <AdminViewProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
          <main id="main-content">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense></ProtectedRoute>} />
            <Route path="/clarity" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ClaritySession /></Suspense></ProtectedRoute>} />
            <Route path="/clarity/:moduleId" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ClaritySession /></Suspense></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ResultScreen /></Suspense></ProtectedRoute>} />
            <Route path="/mirror-challenge" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><MirrorChallenge /></Suspense></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><Challenges /></Suspense></ProtectedRoute>} />
            <Route path="/challenges/:type" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><MirrorChallenge /></Suspense></ProtectedRoute>} />
            <Route path="/modules" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><Modules /></Suspense></ProtectedRoute>} />
            <Route path="/programs/:slug" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ProgramDetail /></Suspense></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><CoachChat /></Suspense></ProtectedRoute>} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><Profile /></Suspense></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminUsers /></Suspense></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminAnalytics /></Suspense></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminContent /></Suspense></ProtectedRoute>} />
            <Route path="/kiosk" element={<Kiosk />} />
            <Route path="/email-preview" element={<ProtectedRoute requireAdmin><EmailPreview /></ProtectedRoute>} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </main>
          <DesktopNav />
          <ChatWidget />
          <AdminViewToggle />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
      </AdminViewProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
