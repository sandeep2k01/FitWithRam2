import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'

import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'

import Dashboard from './pages/dashboard/Dashboard'
import Workouts from './pages/dashboard/Workouts'
import WorkoutLog from './pages/dashboard/WorkoutLog'
import Exercises from './pages/dashboard/Exercises'
import Progress from './pages/dashboard/Progress'
import Diet from './pages/dashboard/Diet'
import Profile from './pages/dashboard/Profile'
import Payments from './pages/dashboard/Payments'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMembers from './pages/admin/AdminMembers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminDiet from './pages/admin/AdminDiet'
import AdminPayments from './pages/admin/AdminPayments'

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5', color: '#bbbbbb', fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
    Loading...
  </div>
)

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuthStore()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

const GuestRoute = ({ children, fallback = '/dashboard' }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <Spinner />
  return user ? <Navigate to={fallback} replace /> : children
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestRoute fallback="/dashboard"><Landing /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="workouts/log" element={<WorkoutLog />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="progress" element={<Progress />} />
          <Route path="diet" element={<Diet />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="members/:userId" element={<AdminUserDetail />} />
          <Route path="programs" element={<AdminPrograms />} />
          <Route path="diet" element={<AdminDiet />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
