import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import HomeEnhanced from "@/pages/HomeEnhanced";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProfileCompletion from "@/pages/ProfileCompletion";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect, useState } from "react";

function Router() {
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    // Check for unauthorized errors
    const checkUnauthorized = () => {
      const parkHub = (window as any).__parkHub;
      if (parkHub?.getUnauthorizedErrorState?.()) {
        setIsUnauthorized(true);
      }
    };

    checkUnauthorized();
    const interval = setInterval(checkUnauthorized, 100);
    return () => clearInterval(interval);
  }, []);

  if (isUnauthorized) {
    return <UnauthorizedPage />;
  }

  return (
    <Switch>
      <Route path={"/"} component={HomeEnhanced} />
      <Route path={"/profile/complete"} component={ProfileCompletion} />
      <Route path={"/user/dashboard"} component={UserDashboard} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
