import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GradeDataProvider } from "./context/GradeDataContext";
import CreateAcc from "./Pages/CreateAcc";
import Analytics from "./Pages/Analytics";
import Predictor from "./Pages/Predictor";
import Settings from "./Pages/Settings";
import { Card } from "./Components/ui/Card";

function ThemeBootstrap() {
  useEffect(() => {
    const t = localStorage.getItem("theme") === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  return null;
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="flex items-center gap-3 px-8 py-6">
        <span
          className="inline-block h-10 w-10 rounded-full border-2 border-border border-t-accent animate-spin"
          aria-hidden
        />
        <span className="text-sm text-muted">Loading session…</span>
      </Card>
    </div>
  );
}

function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function ProtectedGradeLayout() {
  return (
    <GradeDataProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Navbar />
        <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-auto">
          <Outlet />
        </div>
      </div>
    </GradeDataProvider>
  );
}

function App() {
  return (
    <Router>
      <ThemeBootstrap />
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<CreateAcc />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedGradeLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/predictor" element={<Predictor />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
