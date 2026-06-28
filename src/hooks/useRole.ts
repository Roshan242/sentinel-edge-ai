import { useAuth } from '@/context/AuthContext'

export const useIsAdmin = () => {
  const { user } = useAuth()
  return user?.role === 'admin'
}

export const useIsUser = () => {
  const { user } = useAuth()
  return user?.role === 'user'
}
