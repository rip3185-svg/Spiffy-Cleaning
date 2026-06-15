import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/utils/auth";
import { seedDemoData } from "@/data/demoWeek";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageProvider } from "@/i18n/LanguageContext";

// Pages
import LoginPage from "@/pages/LoginPage";
import EmployeeWeekPage from "@/pages/EmployeeWeekPage";
import EmployeeHistoryPage from "@/pages/EmployeeHistoryPage";
import ManagerOverviewPage from "@/pages/ManagerOverviewPage";
import ManagerEmployeeDetailPage from "@/pages/ManagerEmployeeDetailPage";
import CollectionsPage from "@/pages/CollectionsPage";
import ManagerDashboardPage from "@/pages/ManagerDashboardPage";
import FranchiseDashboardPage from "@/pages/FranchiseDashboardPage";
import PayRatesPage from "@/pages/PayRatesPage";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Auth Guard — stable deps so no infinite-loop risk
const ProtectedRoute = ({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType<any>;
  allowedRoles?: string[];
}) => {
  const [, setLocation] = useLocation();
  const user = getSession();
  const isLoggedIn = !!user;
  const role = user?.role ?? null;

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/login");
    } else if (allowedRoles && role && !allowedRoles.includes(role)) {
      setLocation(role === "employee" ? "/employee/week" : "/manager/overview");
    }
    // allowedRoles is intentionally omitted — it's a static inline array that
    // never changes at runtime, so including it would re-fire the effect on
    // every Router re-render and cause an update loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, role, setLocation]);

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Component />
      </motion.div>
    </AppLayout>
  );
};

function Router() {
  const [location, setLocation] = useLocation();
  // Use stable primitive (id string) instead of the full parsed object so the
  // effect doesn't re-fire on every render due to JSON.parse returning a new
  // object reference each time.
  const userId = getSession()?.id ?? null;
  const userRole = getSession()?.role ?? null;

  useEffect(() => {
    if (location === "/" || location === "") {
      if (userId) {
        setLocation(userRole === "employee" ? "/employee/week" : "/manager/overview");
      } else {
        setLocation("/login");
      }
    }
  }, [location, userId, userRole, setLocation]);

  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/login">
          {() => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginPage />
            </motion.div>
          )}
        </Route>

        {/* Employee Routes */}
        <Route path="/employee/week">
          {() => <ProtectedRoute component={EmployeeWeekPage} allowedRoles={["employee", "manager", "admin"]} />}
        </Route>
        <Route path="/employee/history">
          {() => <ProtectedRoute component={EmployeeHistoryPage} allowedRoles={["employee", "manager", "admin"]} />}
        </Route>

        {/* Manager Routes */}
        <Route path="/manager/overview">
          {() => <ProtectedRoute component={ManagerOverviewPage} allowedRoles={["manager", "admin"]} />}
        </Route>
        <Route path="/manager/franchises">
          {() => <ProtectedRoute component={FranchiseDashboardPage} allowedRoles={["manager", "admin"]} />}
        </Route>
        <Route path="/manager/employee/:id">
          {() => <ProtectedRoute component={ManagerEmployeeDetailPage} allowedRoles={["manager", "admin"]} />}
        </Route>
        <Route path="/manager/collections">
          {() => <ProtectedRoute component={CollectionsPage} allowedRoles={["manager", "admin"]} />}
        </Route>
        <Route path="/manager/dashboard">
          {() => <ProtectedRoute component={ManagerDashboardPage} allowedRoles={["manager", "admin"]} />}
        </Route>

        {/* Shared/Admin Routes */}
        <Route path="/admin/pay-rates">
          {() => <ProtectedRoute component={PayRatesPage} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="top-center" richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
