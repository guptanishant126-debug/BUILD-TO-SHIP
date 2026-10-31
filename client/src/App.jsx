import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CallSessionProvider } from './context/CallSessionContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CallMonitorPage from './pages/CallMonitorPage';
import ContactsEnclavePage from './pages/ContactsEnclavePage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import SettingsPage from './pages/SettingsPage';
import EnterprisePage from './pages/EnterprisePage';

// Protected Route wrapper that redirects to login if unauthenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing AegisVoice Zero-Trust Sentinel...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CallSessionProvider>
        <Router>
          <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Guardian Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guardian/call-monitor"
                  element={
                    <ProtectedRoute>
                      <CallMonitorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contacts/enclave"
                  element={
                    <ProtectedRoute>
                      <ContactsEnclavePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute>
                      <IncidentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents/:id"
                  element={
                    <ProtectedRoute>
                      <IncidentDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/enterprise/telemetry"
                  element={
                    <ProtectedRoute>
                      <EnterprisePage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CallSessionProvider>
    </AuthProvider>
  );
}

export default App;

