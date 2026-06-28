import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'



// Pages
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import RegisterPage from '@/pages/Register'
import { OtpVerificationPage } from '@/pages/OtpVerificationPage'


// Admin Pages
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminMonitoring } from '@/pages/admin/Monitoring'
import { AdminAlerts } from '@/pages/admin/Alerts'
import { AdminLogs } from '@/pages/admin/Logs'
import { AdminUsers } from '@/pages/admin/Users'
import { AdminSystem } from '@/pages/admin/System'
import { AdminSettings } from '@/pages/admin/Settings'

// User Pages
import { UserDashboard } from '@/pages/user/Dashboard'
import { UserMonitoring } from '@/pages/user/Monitoring'
import { UserLogs } from '@/pages/user/Logs'
import { UserAccount } from '@/pages/user/Account'
import { UserAlerts } from '@/pages/user/Alerts'


// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'user' }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading, token } = useAuth()

  const location = useLocation()

  console.log('PROTECTED ROUTE', {
    isAuthenticated,
    token,
    user,
    pathname: location.pathname,
  })



  if (isLoading) {

    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}


function AppRoutes() {
  const { isAuthenticated, user } = useAuth()
  const defaultPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to={defaultPath} /> : <HomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultPath} /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={defaultPath} /> : <RegisterPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />


      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monitoring"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/alerts"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/system"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSystem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/monitoring"
        element={
          <ProtectedRoute requiredRole="user">
            <UserMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/alerts"
        element={
          <ProtectedRoute requiredRole="user">
            <UserAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/logs"
        element={
          <ProtectedRoute requiredRole="user">
            <UserLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/account"
        element={
          <ProtectedRoute requiredRole="user">
            <UserAccount />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
