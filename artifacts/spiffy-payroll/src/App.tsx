import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/utils/auth";
import { seedDemoData } from "@/data/demoWeek";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import LoginPage from "@/pages/LoginPage";
import EmployeeWeekPage from "@/pages/EmployeeWeekPage";
import EmployeeHistoryPage from "@/pages/EmployeeHistoryPage";
import ManagerOverviewPage from "@/pages/ManagerOverviewPage";
import ManagerEmployeeDetailPage from "@/pages/ManagerEmployeeDetailPage";
import CollectionsPage from "@/pages/CollectionsPage";
import ManagerDashboardPage from "@/pages/ManagerDashboardPage";
import PayRatesPage from "@/pages/PayRatesPage";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Auth Guard component
const ProtectedRoute = ({ component: Component, allowedRoles }: { component: React.ComponentType<any>, allowedRoles?: string[] }) => {
  const [location, setLocation] = useLocation();
  const user = getSession();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Basic redirect if not authorized for this view
      setLocation(user.role === 'employee' ? "/employee/week" : "/manager/overview");
    }
  }, [user, location, setLocation, allowedRoles]);

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
  const user = getSession();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/" || location === "") {
      if (user) {
        setLocation(user.role === 'employee' ? "/employee/week" : "/manager/overview");
      } else {
        setLocation("/login");
      }
    }
  }, [location, user, setLocation]);

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
          {() => <ProtectedRoute component={EmployeeWeekPage} allowedRoles={['employee', 'manager', 'admin']} />}
        </Route>
        <Route path="/employee/history">
          {() => <ProtectedRoute component={EmployeeHistoryPage} allowedRoles={['employee', 'manager', 'admin']} />}
        </Route>

        {/* Manager Routes */}
        <Route path="/manager/overview">
          {() => <ProtectedRoute component={ManagerOverviewPage} allowedRoles={['manager', 'admin']} />}
        </Route>
        <Route path="/manager/employee/:id">
          {() => <ProtectedRoute component={ManagerEmployeeDetailPage} allowedRoles={['manager', 'admin']} />}
        </Route>
        <Route path="/manager/collections">
          {() => <ProtectedRoute component={CollectionsPage} allowedRoles={['manager', 'admin']} />}
        </Route>
        <Route path="/manager/dashboard">
          {() => <ProtectedRoute component={ManagerDashboardPage} allowedRoles={['manager', 'admin']} />}
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
