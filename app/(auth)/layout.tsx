'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/spinner'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated && user) {
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '/(auth)') {
        if (user.role === 'Customer') {
          router.push('/customers')
        } else if (user.role === 'Provider') {
          router.push('/providers')
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, isClient])

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Appointments System</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.username}
                  {user?.role === 'Provider' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Provider
                    </span>
                  )}
                  {user?.role === 'Customer' && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Customer
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </ErrorBoundary>
  )
}