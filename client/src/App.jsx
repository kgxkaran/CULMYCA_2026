import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Pages import karenge
import LandingPage from './pages/LandingPage'
import EventsPage from './pages/events pages/EventsPage'
import EventDetailPage from './pages/events pages/EventDetailPage'
import LoginPage from './pages/auth pages/LoginPage'
import SignupPage from './pages/auth pages/SignupPage'
import StudentDashboard from './pages/student/StudentDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AuthCallback from './pages/auth pages/AuthCallback'
import Layout from './Components/Layout/Layout.jsx'

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
      <Route path="/" element={
        <Layout><LandingPage /></Layout>} />
      <Route path="/events" element={
        <Layout><EventsPage /></Layout>} />
      <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
      <Route path="/auth/callback" element={<Layout><AuthCallback /></Layout>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <Layout>
        <ProtectedRoute>
          <StudentDashboard />
        </ProtectedRoute>
        </Layout>
      } />

      {/* Admin only routes */}
      <Route path="/admin/*" element={
        <Layout>
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
        </Layout>
      } />
    </Routes>
  )
}