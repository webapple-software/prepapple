import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Student / Core Components
import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import TestAttempt from './pages/TestAttempt';
import ResultReview from './pages/ResultReview';

// Landing Page Components
import Home from './pages/landing/Home';
import Category from './pages/landing/Category';
import Instructions from './pages/landing/Instructions';
import LandingTestAttempt from './pages/landing/TestAttempt';
import About from './pages/landing/About';
import LandingMySubscription from './pages/landing/MySubscription';
import ContactUs from './pages/landing/ContactUs';
import FAQs from './pages/landing/FAQs';
import Terms from './pages/landing/Terms';
import Privacy from './pages/landing/Privacy';
import Pricing from './pages/landing/Pricing';
import MockTests from './pages/landing/MockTests';
import LandingNavbar from './components/landing/Navbar';
import LandingFooter from './components/landing/Footer';
import PageLoader from './components/PageLoader';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/admin/TeacherDashboard';
import ImportQuestions from './pages/admin/ImportQuestions';

// Authentication Guard – student role
function StudentProtectedRoute({ children }: { children: React.ReactNode }) {
  const cached = localStorage.getItem('currentUser');
  if (!cached) return <Navigate to="/login" replace />;
  const user = JSON.parse(cached);
  if (user.role !== 'student') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Authentication Guard – admin/teacher role
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const cached = localStorage.getItem('currentUser');
  if (!cached) return <Navigate to="/login/admin" replace />;
  const user = JSON.parse(cached);
  if (user.role !== 'admin' && user.role !== 'teacher') return <Navigate to="/login/admin" replace />;
  return <>{children}</>;
}

// Login redirect for student
function StudentLoginRedirect({ children }: { children: React.ReactNode }) {
  const cached = localStorage.getItem('currentUser');
  if (cached) {
    const user = JSON.parse(cached);
    if (user.role === 'student') return <Navigate to="/student" replace />;
  }
  return <>{children}</>;
}

// Login redirect for admin
function AdminLoginRedirect({ children }: { children: React.ReactNode }) {
  const cached = localStorage.getItem('currentUser');
  if (cached) {
    const user = JSON.parse(cached);
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLoader>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <main className="flex-grow flex flex-col">{children}</main>
      </div>
    </PageLoader>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Landing page routes (wrapped in LandingLayout) */}
          <Route path="/" element={<LandingLayout><Home /></LandingLayout>} />
          <Route path="/pricing" element={<LandingLayout><Pricing /></LandingLayout>} />
          <Route path="/mock-tests" element={<LandingLayout><MockTests /></LandingLayout>} />
          <Route path="/about" element={<LandingLayout><About /></LandingLayout>} />
          <Route path="/contact" element={<LandingLayout><ContactUs /></LandingLayout>} />
          <Route path="/faqs" element={<LandingLayout><FAQs /></LandingLayout>} />
          <Route path="/terms" element={<LandingLayout><Terms /></LandingLayout>} />
          <Route path="/privacy" element={<LandingLayout><Privacy /></LandingLayout>} />
          <Route path="/category/:categoryId" element={<LandingLayout><Category /></LandingLayout>} />
          <Route path="/category/:categoryId/:subcategoryId" element={<LandingLayout><Category /></LandingLayout>} />
          <Route path="/test/:id/instructions" element={<LandingLayout><Instructions /></LandingLayout>} />
          <Route path="/test/:id/attempt" element={<LandingLayout><LandingTestAttempt /></LandingLayout>} />
          <Route path="/my-subscription" element={<LandingLayout><LandingMySubscription /></LandingLayout>} />

          {/* Student Logins */}
          <Route path="/login" element={<StudentLoginRedirect><Login role="student" /></StudentLoginRedirect>} />
          <Route path="/login/student" element={<StudentLoginRedirect><Login role="student" /></StudentLoginRedirect>} />

          {/* Admin Logins */}
          <Route path="/login/admin" element={<AdminLoginRedirect><Login role="admin" /></AdminLoginRedirect>} />

          {/* Student Portal */}
          <Route
            path="/student"
            element={
              <StudentProtectedRoute>
                <StudentPortal />
              </StudentProtectedRoute>
            }
          />

          {/* Test Attempt */}
          <Route
            path="/attempt/:testId"
            element={
              <StudentProtectedRoute>
                <TestAttempt />
              </StudentProtectedRoute>
            }
          />

          {/* Results */}
          <Route
            path="/results/:attemptId"
            element={
              <StudentProtectedRoute>
                <ResultReview />
              </StudentProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          {/* Teacher / Test Manager Dashboard */}
          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <TeacherDashboard />
              </AdminProtectedRoute>
            }
          />

          {/* Import Questions */}
          <Route
            path="/admin/import"
            element={
              <AdminProtectedRoute>
                <ImportQuestions />
              </AdminProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
