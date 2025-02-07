import React from "react";
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
import CreateAcc from "./Pages/CreateAcc";
import Analytics from "./Pages/Analytics";
import Predictor from "./Pages/Predictor";
import Settings from "./Pages/Settings";

function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  // Add loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no current user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the child routes
  return <Outlet />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<CreateAcc />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/predictor" element={<Predictor />} />
            </Route>
          </Route>

          {/* Catch-all route to redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Create a Layout component
function Layout() {
  return (
    <div className="flex h-screen">
      <Navbar className="h-full" />
      <div className="flex flex-grow overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
