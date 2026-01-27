import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login'; // Now Student Login Only
import { AdminLogin } from './pages/AdminLogin'; // New Hidden Route
import { CompanyRegistration } from './pages/CompanyRegistration';
import { StudentRegistration } from './pages/StudentRegistration';
import { RecruiterLogin } from './pages/RecruiterLogin';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDrives } from './pages/AdminDrives';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { MailBot } from './pages/MailBot';
import { StudentProfile } from './pages/StudentProfile';
import { StorageService } from './services/storageService';
import { Role } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: Role[] }) => {
  const user = StorageService.getCurrentUser();

  if (!user) {
    if (allowedRoles.includes(Role.ADMIN)) return <Navigate to="/admin-login" replace />;
    if (allowedRoles.includes(Role.RECRUITER)) return <Navigate to="/recruiter-login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/recruiter-login" element={<RecruiterLogin />} />
          <Route path="/register-company" element={<CompanyRegistration />} />
          <Route path="/signup" element={<StudentRegistration />} />

          {/* STUDENT ROUTES */}
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* RECRUITER ROUTES */}
          <Route path="/recruiter/drives" element={
            <ProtectedRoute allowedRoles={[Role.RECRUITER]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter" element={
            <ProtectedRoute allowedRoles={[Role.RECRUITER]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />

          {/* ADMIN ROUTES */}
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/drives" element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AdminDrives />
            </ProtectedRoute>
          } />
          <Route path="/admin/mail-bot" element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <MailBot />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;