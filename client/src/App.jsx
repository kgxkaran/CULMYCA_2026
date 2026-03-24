import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Pages import karenge — abhi banayenge
import LandingPage from './pages/LandingPage'
import EventsPage from './pages/events pages/EventsPage'
import EventDetailPage from './pages/events pages/EventDetailPage'
import LoginPage from './pages/auth pages/LoginPage'
import SignupPage from './pages/auth pages/SignupPage'
import StudentDashboard from './pages/student/StudentDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AuthCallback from './pages/auth pages/AuthCallback'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Admin route component
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user?.role === 'admin' ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* Admin only routes */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
    </Routes>
  )
}