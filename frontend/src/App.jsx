import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./index.css";
import { authAPI } from "./utils/api";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loading from "./components/Loading";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DataSourceSetup from "./pages/DataSourceSetup";
import QueryPage from "./pages/QueryPage";
import NotFound from "./pages/NotFound";

// Redirects to /login unless the user is signed in (defined outside AppContent so it is not re-created on every render)
function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) {
    return <Loading fullScreen />;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent({ isAuthenticated, handleLogin, handleLogout, loading }) {
  const location = useLocation();
  const hideFooter =
    location.pathname.includes("/datasource/") &&
    location.pathname.includes("/query");
  const hideNavbar =
    location.pathname.includes("/datasource/") &&
    location.pathname.includes("/query");

  return (
    <div className="flex flex-col min-h-screen bg-app">
      {!hideNavbar && (
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      )}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datasource/:type/setup"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <DataSourceSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datasource/:type/query"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <QueryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify authentication with backend
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.status === 200 && response.data) {
          setIsAuthenticated(true);
          // Update localStorage with current user data
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch {
        // Not authenticated or cookie expired
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore errors during logout
    } finally {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return (
      <Loading fullScreen />
    );
  }

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        loading={loading}
      />
    </Router>
  );
}

export default App;
