import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImportQuestions from './pages/ImportQuestions';

// Authentication Guard – admin only
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const cached = localStorage.getItem('currentUser');
  if (!cached) return <Navigate to="/login" replace />;
  const user = JSON.parse(cached);
  if (user.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoginRedirect({ children }: { children: React.ReactNode }) {
  const cached = localStorage.getItem('currentUser');
  if (cached) {
    const user = JSON.parse(cached);
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Login */}
          <Route path="/" element={<LoginRedirect><Login role="admin" /></LoginRedirect>} />
          <Route path="/login" element={<LoginRedirect><Login role="admin" /></LoginRedirect>} />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Teacher / Test Manager Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Import Questions */}
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute>
                <ImportQuestions />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
