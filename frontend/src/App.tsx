import React from 'react'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  RouteObject,
  useLocation,
} from 'react-router-dom'
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
const ProtectedRoute: React.FC<{
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
}> = ({ children, requiredRole }) => {
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

  // Avoid redirect loops while localStorage token is present but user state is still syncing.
  // If token exists, allow route render and let ProtectedRoute role check handle mismatch.
  if (!isAuthenticated) {
    // If we still have a token in storage, do not bounce to /login.
    // Instead allow render; role mismatch will be handled after sync.
    if (token) {
      return <>{children}</>
    }
    return <Navigate to="/login" replace />
  }




  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutesRenderer() {
  const { isAuthenticated, user } = useAuth()
  const defaultPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'

  const routes: RouteObject[] = [
    {
      path: '/',
      element: isAuthenticated ? <Navigate to={defaultPath} replace /> : <HomePage />,
    },
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to={defaultPath} replace /> : <LoginPage />,
    },
    {
      path: '/register',
      element: isAuthenticated ? <Navigate to={defaultPath} replace /> : <RegisterPage />,
    },
    {
      path: '/verify-otp',
      element: <OtpVerificationPage />,
    },

    {
      path: '/admin/dashboard',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/monitoring',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminMonitoring />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/alerts',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminAlerts />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/logs',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminLogs />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/users',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminUsers />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/system',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminSystem />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/settings',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminSettings />
        </ProtectedRoute>
      ),
    },

    {
      path: '/user/dashboard',
      element: (
        <ProtectedRoute requiredRole="user">
          <UserDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/user/monitoring',
      element: (
        <ProtectedRoute requiredRole="user">
          <UserMonitoring />
        </ProtectedRoute>
      ),
    },
    {
      path: '/user/alerts',
      element: (
        <ProtectedRoute requiredRole="user">
          <UserAlerts />
        </ProtectedRoute>
      ),
    },
    {
      path: '/user/logs',
      element: (
        <ProtectedRoute requiredRole="user">
          <UserLogs />
        </ProtectedRoute>
      ),
    },
    {
      path: '/user/account',
      element: (
        <ProtectedRoute requiredRole="user">
          <UserAccount />
        </ProtectedRoute>
      ),
    },

    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]

  const router = React.useMemo(
    () =>
      createBrowserRouter(routes, {
        future: {
          v7_relativeSplatPath: true,
        },
      }),
    // Recreate when auth state changes so redirects render correctly
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, user?.role]
  )

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutesRenderer />
    </AuthProvider>
  )
}

