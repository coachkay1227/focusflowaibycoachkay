import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminViewProvider } from "@/contexts/AdminViewContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import PageSkeleton from "./components/PageSkeleton.tsx";

// Lazy-load all pages except Index
const Community = lazy(() => import("./pages/Community.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const EmailPreview = lazy(() => import("./pages/EmailPreview.tsx"));
const Sitemap = lazy(() => import("./pages/Sitemap.tsx"));
const Faq = lazy(() => import("./pages/Faq.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const EmailUnsubscribe = lazy(() => import("./pages/EmailUnsubscribe.tsx"));
const Kiosk = lazy(() => import("./pages/Kiosk.tsx"));
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
const CoachKay = lazy(() => import("./pages/CoachKay.tsx"));
const Store = lazy(() => import("./pages/Store.tsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.tsx"));
const AutismSocialStories = lazy(() => import("./pages/AutismSocialStories.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.tsx"));
const AdminAutismOrders = lazy(() => import("./pages/admin/AdminAutismOrders.tsx"));
const Assessment = lazy(() => import("./pages/Assessment.tsx"));
const StarterKit = lazy(() => import("./pages/StarterKit.tsx"));
const RentAnAgent = lazy(() => import("./pages/RentAnAgent.tsx"));
const Advisory = lazy(() => import("./pages/Advisory.tsx"));
const CollectiveAIBuildStudio = lazy(() => import("./pages/CollectiveAIBuildStudio.tsx"));
const AdminBuildInquiries = lazy(() => import("./pages/admin/AdminBuildInquiries.tsx"));
const AuditIntake = lazy(() => import("./pages/AuditIntake.tsx"));
const AuditReport = lazy(() => import("./pages/AuditReport.tsx"));
const AuditLanding = lazy(() => import("./pages/AuditLanding.tsx"));
const Privacy = lazy(() => import("./pages/legal/Privacy.tsx"));
const Terms = lazy(() => import("./pages/legal/Terms.tsx"));
const Disclaimer = lazy(() => import("./pages/legal/Disclaimer.tsx"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy.tsx"));

// Lazy-load shell components
const ChatWidget = lazy(() => import("./components/ChatWidget.tsx"));
const DesktopNav = lazy(() => import("./components/DesktopNav.tsx"));
const AdminViewToggle = lazy(() =>
  import("./components/AccessGate.tsx").then((m) => ({ default: m.AdminViewToggle }))
);

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
            <Route path="/auth" element={<Suspense fallback={<PageSkeleton />}><Auth /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<PageSkeleton />}><ResetPassword /></Suspense>} />
            <Route path="/onboarding" element={<Suspense fallback={<PageSkeleton />}><Onboarding /></Suspense>} />
            <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense></ProtectedRoute>} />
            <Route path="/clarity" element={<Suspense fallback={<PageSkeleton />}><ClaritySession /></Suspense>} />
            <Route path="/clarity/:moduleId" element={<Suspense fallback={<PageSkeleton />}><ClaritySession /></Suspense>} />
            <Route path="/assessment" element={<Suspense fallback={<PageSkeleton />}><Assessment /></Suspense>} />
            <Route path="/result" element={<Suspense fallback={<PageSkeleton />}><ResultScreen /></Suspense>} />
            <Route path="/mirror-challenge" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><MirrorChallenge /></Suspense></ProtectedRoute>} />
            <Route path="/challenges" element={<Suspense fallback={<PageSkeleton />}><Challenges /></Suspense>} />
            <Route path="/challenges/:type" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><MirrorChallenge /></Suspense></ProtectedRoute>} />
            <Route path="/modules" element={<Suspense fallback={<PageSkeleton />}><Modules /></Suspense>} />
            <Route path="/programs/:slug" element={<Suspense fallback={<PageSkeleton />}><ProgramDetail /></Suspense>} />
            {/* Public-facing AI doorway — dedicated free starter-kit flow (NOT the clarity quiz) */}
            <Route path="/starter-kit" element={<Suspense fallback={<PageSkeleton />}><StarterKit /></Suspense>} />
            <Route path="/ai-starter-kit" element={<Navigate to="/starter-kit" replace />} />
            <Route path="/coach" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><CoachChat /></Suspense></ProtectedRoute>} />
            <Route path="/community" element={<Suspense fallback={<PageSkeleton />}><Community /></Suspense>} />
            <Route path="/about" element={<Navigate to="/coach-kay" replace />} />
            <Route path="/coach-kay" element={<Suspense fallback={<PageSkeleton />}><CoachKay /></Suspense>} />
            <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><Profile /></Suspense></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminUsers /></Suspense></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminAnalytics /></Suspense></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminContent /></Suspense></ProtectedRoute>} />
            <Route path="/kiosk" element={<Suspense fallback={<PageSkeleton />}><Kiosk /></Suspense>} />
            <Route path="/store" element={<ErrorBoundary><Suspense fallback={<PageSkeleton />}><Store /></Suspense></ErrorBoundary>} />
            <Route path="/autism-social-stories" element={<Suspense fallback={<PageSkeleton />}><AutismSocialStories /></Suspense>} />
            <Route path="/rent-an-agent" element={<Suspense fallback={<PageSkeleton />}><RentAnAgent /></Suspense>} />
            <Route path="/advisory" element={<Suspense fallback={<PageSkeleton />}><Advisory /></Suspense>} />
            <Route path="/build-studio" element={<Suspense fallback={<PageSkeleton />}><CollectiveAIBuildStudio /></Suspense>} />
            <Route path="/order-success" element={<Suspense fallback={<PageSkeleton />}><OrderSuccess /></Suspense>} />
            <Route path="/audit/landing" element={<Suspense fallback={<PageSkeleton />}><AuditLanding /></Suspense>} />
            <Route path="/audit/intake" element={<Suspense fallback={<PageSkeleton />}><AuditIntake /></Suspense>} />
            <Route path="/audit/intake/:id" element={<Suspense fallback={<PageSkeleton />}><AuditIntake /></Suspense>} />
            <Route path="/audit/report/:id" element={<Suspense fallback={<PageSkeleton />}><AuditReport /></Suspense>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminOrders /></Suspense></ProtectedRoute>} />
            <Route path="/admin/autism-orders" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminAutismOrders /></Suspense></ProtectedRoute>} />
            <Route path="/admin/build-inquiries" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><AdminBuildInquiries /></Suspense></ProtectedRoute>} />
            <Route path="/email-preview" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageSkeleton />}><EmailPreview /></Suspense></ProtectedRoute>} />
            <Route path="/sitemap" element={<Suspense fallback={<PageSkeleton />}><Sitemap /></Suspense>} />
            <Route path="/faq" element={<Suspense fallback={<PageSkeleton />}><Faq /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={<PageSkeleton />}><Privacy /></Suspense>} />
            <Route path="/terms" element={<Suspense fallback={<PageSkeleton />}><Terms /></Suspense>} />
            <Route path="/disclaimer" element={<Suspense fallback={<PageSkeleton />}><Disclaimer /></Suspense>} />
            <Route path="/refund-policy" element={<Suspense fallback={<PageSkeleton />}><RefundPolicy /></Suspense>} />
            <Route path="/unsubscribe" element={<Suspense fallback={<PageSkeleton />}><Unsubscribe /></Suspense>} />
            <Route path="/email-unsubscribe" element={<Navigate to="/unsubscribe" replace />} />
            <Route path="*" element={<Suspense fallback={<PageSkeleton />}><NotFound /></Suspense>} />
          </Routes>
          </main>
          <Suspense fallback={null}><DesktopNav /></Suspense>
          <Suspense fallback={null}><ChatWidget /></Suspense>
          <Suspense fallback={null}><AdminViewToggle /></Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
      </AdminViewProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
