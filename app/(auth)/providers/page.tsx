'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getRoutePermissions } from '@/constants/routes'
import { LoadingSpinner } from '@/components/ui/spinner'

export default function ProvidersPage() {
  const { user, tenant, manualLogout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const permissions = getRoutePermissions('/providers')
      if (!permissions.allowedRoles.includes(user.role)) {
        router.replace('/')
        return
      }
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    )
  }

  const permissions = getRoutePermissions('/providers')
  if (!permissions.allowedRoles.includes(user.role)) {
    return null
  }

  if (permissions.requireTenant && user.role === 'Provider' && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={40} text="Loading tenant information..." />
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mt-2 text-gray-600">
            Welcome back, {user.username}!
            {tenant && (
              <>
                {' '}
                - Managing: <span className="font-semibold">{tenant.businessName}</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={manualLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
