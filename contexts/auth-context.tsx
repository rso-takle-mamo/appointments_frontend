'use client'

import React, { createContext, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, parseJwt, isTokenExpired } from '../utils/token'
import { showToast } from '../utils/toast'
import { useLoginMutation, useCurrentUser, useTenant, useLogoutMutation } from '@/hooks/useAuthMutation'

export type UserRole = 'Customer' | 'Provider'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string | null
}

export interface Tenant {
  id: string
  ownerId: string
  businessName: string
  vatNumber: string
  bussinessAddress: string
  bussinessEmail: string | null
  bussinessPhone: string | null
  address: string
  description: string | null
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  manualLogout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter()

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const token = getToken()
  const hasToken = !!token

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  } = useCurrentUser(mounted)

  const {
    data: tenant,
    error: tenantError,
  } = useTenant(user?.tenantId ?? null, mounted)

  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()

  const isLoading = !mounted || (hasToken ? userLoading : false)

  React.useEffect(() => {
    if (token) {
      const claims = parseJwt(token)
      if (claims && isTokenExpired(claims.exp)) {
        logout()
      }
    }
  }, [])

  const handleAutoLogout = React.useCallback(() => {
    logoutMutation.mutate()
    setTimeout(() => {
      router.push('/login')
    }, 100)
  }, [logoutMutation, router])

  React.useEffect(() => {
    if (tenantError && user?.role === 'Provider') {
      showToast.error(
        'Failed to load business information. Some features may be unavailable.',
        tenantError
      )
    }
  }, [tenantError, user?.role])

  React.useEffect(() => {
    if (userError && hasToken) {
      handleAutoLogout()
    }
  }, [userError, hasToken, handleAutoLogout])

  async function login(username: string, password: string) {
    await loginMutation.mutateAsync({ username, password })
  }

  const logout = React.useCallback(() => {
    logoutMutation.mutate()
    setTimeout(() => {
      router.push('/login')
    }, 100)
  }, [logoutMutation, router])

  const manualLogout = React.useCallback(() => {
    logoutMutation.mutate()
    setTimeout(() => {
      router.push('/login')
    }, 100)
  }, [logoutMutation, router])

  const isAuthenticated = !!user

  const value = useMemo(() => ({
    user: user ?? null,
    tenant: tenant ?? null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    login,
    logout,
    manualLogout,
  }), [user, tenant, isAuthenticated, isLoading, loginMutation.isPending, login, logout, manualLogout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
