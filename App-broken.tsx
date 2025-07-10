import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ErrorBoundary } from "./components/error-boundary";
import { useAuth } from "./hooks/useAuth";
import { lazy, Suspense } from "react";
import { Card, CardContent } from "./components/ui/card";
// Lazy load heavy components for better bundle splitting
const Landing = lazy(() => import("./pages/landing-enhanced"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Projects = lazy(() => import("./pages/projects"));
const ProjectDetails = lazy(() => import("./pages/project-details"));
const Maps = lazy(() => import("./pages/maps"));
const Camera = lazy(() => import("./pages/camera"));
const AudioRecorder = lazy(() => import("./pages/audio-recorder"));
const Documents = lazy(() => import("./pages/documents"));
const AIAssistantPage = lazy(() => import("./pages/ai-assistant"));
const Profile = lazy(() => import("./pages/profile"));
const Customers = lazy(() => import("./pages/customers"));
const FloodProtection = lazy(() => import("./pages/flood-protection"));
const HochwasserAnleitung = lazy(() => import("./pages/hochwasser-anleitung"));
const ChecklistDetail = lazy(() => import("./pages/checklist-detail"));
const Admin = lazy(() => import("./pages/admin"));
const SftpManager = lazy(() => import("./pages/sftp-manager"));
const Support = lazy(() => import("./pages/support"));

// Keep lightweight components as regular imports
import NotFound from "./pages/not-found";
import Auth from "./pages/auth";

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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/">
          {() => (
            <Suspense fallback={<PageLoader />}>
              <Landing />
            </Suspense>
          )}
        </Route>
        <Route path="/auth" component={Auth} />
        <Route>
          {() => (
            <Suspense fallback={<PageLoader />}>
              <Landing />
            </Suspense>
          )}
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        )}
      </Route>
      <Route path="/projects">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Projects />
          </Suspense>
        )}
      </Route>
      <Route path="/projects/:id">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <ProjectDetails />
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
      <Route path="/customers">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <Customers />
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
      <Route path="/hochwasser-anleitung">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <HochwasserAnleitung />
          </Suspense>
        )}
      </Route>
      <Route path="/flood-protection">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <FloodProtection />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
