import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store";
import Layout from "@/components/Layout";
import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import QuranTracker from "@/pages/QuranTracker";
import QuranReaderPage from "@/pages/QuranReaderPage";
import DhikrPage from "@/pages/DhikrPage";
import SharePage from "@/pages/SharePage";
import RemindersPage from "@/pages/RemindersPage";
import AboutPage from "@/pages/AboutPage";
import PublicShareView from "@/pages/PublicShareView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public share route - always accessible
  return (
    <Routes>
      <Route path="/shared/:code" element={<PublicShareView />} />
      {!user && !isGuest ? (
        <Route path="*" element={<AuthPage />} />
      ) : (
        <Route path="*" element={
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        } />
      )}
    </Routes>
  );
}

function AppContent() {
  const { useStore } = require('@/lib/store');
  const { state } = useStore();

  if (!state.onboarded) {
    return <OnboardingPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/quran" element={<QuranTracker />} />
        <Route path="/quran/read" element={<QuranReaderPage />} />
        <Route path="/dhikr" element={<DhikrPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
