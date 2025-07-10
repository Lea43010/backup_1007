import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ErrorBoundary } from "./components/error-boundary";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { lazy, Suspense } from "react";
import * as React from "react";
import { Card, CardContent } from "./components/ui/card";
// Lazy load heavy components for better bundle splitting
const Landing = lazy(() => import("./pages/landing-enhanced"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Projects = lazy(() => import("./pages/projects"));
const ProjectDetails = lazy(() => import("./pages/project-details"));
const ProjectEdit = lazy(() => import("./pages/project-edit-contacts"));
const Maps = lazy(() => import("./pages/maps"));
const Camera = lazy(() => import("./pages/camera"));
const AudioRecorder = lazy(() => import("./pages/audio-recorder"));
const Documents = lazy(() => import("./pages/documents"));
const Help = lazy(() => import("./pages/help"));
const AIAssistantPage = lazy(() => import("./pages/ai-assistant"));
const Profile = lazy(() => import("./pages/profile"));
const Customers = lazy(() => import("./pages/customers"));
const Companies = lazy(() => import("./pages/companies"));
const FloodProtectionNew = lazy(() => import("./pages/flood-protection"));
const ChecklistDetail = lazy(() => import("./pages/checklist-detail"));
const HochwasserAnleitung = lazy(() => import("./pages/hochwasser-anleitung"));
const Admin = lazy(() => import("./pages/admin"));
const SftpManager = lazy(() => import("./pages/sftp-manager"));
const Support = lazy(() => import("./pages/support"));
const Checkout = lazy(() => import("./pages/checkout"));
const PaymentSuccess = lazy(() => import("./pages/payment-success"));
const EmailInbox = lazy(() => import("./pages/email-inbox"));
const Datenschutz = lazy(() => import("./pages/datenschutz"));

// Keep lightweight components as regular imports
import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <Card className="w-80">
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-6"></div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Lädt...</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Seite wird vorbereitet</p>
      </CardContent>
    </Card>
  </div>
);

function Router() {
  const { user, isLoading } = useAuth();

  // Skip loading screen - go directly to routes
  return (
    <Switch>
      {/* Auth routes - always accessible */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      
      {/* Public routes */}
      <Route path="/datenschutz">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Datenschutz />
          </Suspense>
        )}
      </Route>
      <Route path="/">
        {() => {
          if (!user) {
            return (
              <Suspense fallback={<PageLoader />}>
                <Landing />
              </Suspense>
            );
          } else {
            return (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            );
          }
        }}
      </Route>
      
      {/* Protected routes */}
      {user && (
        <>
          <Route path="/dashboard">
            {() => (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            )}
          </Route>

          <Route path="/projects">
            {() => (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Projects />
                </Suspense>
              </ProtectedRoute>
            )}
          </Route>
        </>
      )}
      <Route path="/projects/:id">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <ProjectDetails />
          </Suspense>
        )}
      </Route>
      <Route path="/projects/:id/edit">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <ProjectEdit />
          </Suspense>
        )}
      </Route>
      <Route path="/maps">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Maps />
          </Suspense>
        )}
      </Route>
      <Route path="/camera">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Camera />
          </Suspense>
        )}
      </Route>
      <Route path="/audio">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AudioRecorder />
          </Suspense>
        )}
      </Route>
      <Route path="/documents">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Documents />
          </Suspense>
        )}
      </Route>
      <Route path="/help">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Help />
          </Suspense>
        )}
      </Route>
      <Route path="/ai-assistant">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AIAssistantPage />
          </Suspense>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        )}
      </Route>
      <Route path="/profil">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        )}
      </Route>
      <Route path="/customers">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Customers />
          </Suspense>
        )}
      </Route>
      <Route path="/companies">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Companies />
          </Suspense>
        )}
      </Route>
      <Route path="/flood-protection/checklist/:id">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <ChecklistDetail />
          </Suspense>
        )}
      </Route>
      <Route path="/flood-protection">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <FloodProtectionNew />
          </Suspense>
        )}
      </Route>
      <Route path="/sftp">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <SftpManager />
          </Suspense>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Admin />
          </Suspense>
        )}
      </Route>
      <Route path="/support">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Support />
          </Suspense>
        )}
      </Route>
      <Route path="/checkout">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Checkout />
          </Suspense>
        )}
      </Route>
      <Route path="/payment-success">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <PaymentSuccess />
          </Suspense>
        )}
      </Route>
      <Route path="/email-inbox">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <EmailInbox />
          </Suspense>
        )}
      </Route>
      <Route path="/flood-protection/maintenance">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <HochwasserAnleitung />
          </Suspense>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}

export default App;
