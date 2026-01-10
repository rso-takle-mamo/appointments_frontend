import React, { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { getRoutePermissions, ROLE_BASED_REDIRECTS } from '../../constants/routes'
import { UserRole } from '../../contexts/auth-context'
import { LoadingSpinner } from '../ui/spinner'

interface RouteGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requireTenant?: boolean
  routePath?: string
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoles,
  requireTenant,
  routePath,
}) => {
  const { isAuthenticated, user, tenant, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const currentPath = routePath || window.location.pathname
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`)
        return
      }

      if (user) {
        if (routePath) {
          const permissions = getRoutePermissions(routePath)

          if (!permissions.allowedRoles.includes(user.role)) {
            router.replace(ROLE_BASED_REDIRECTS[user.role])
            return
          }
        } else {
          if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.replace(ROLE_BASED_REDIRECTS[user.role])
            return
          }
        }
      }
    }
  }, [isAuthenticated, user, tenant, isLoading, allowedRoles, requireTenant, routePath, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (routePath) {
    const permissions = getRoutePermissions(routePath)
    if (!permissions.allowedRoles.includes(user.role)) {
      return null
    }
    if (permissions.requireTenant && user.role === 'Provider' && !tenant) {
      return null
    }
  } else {
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return null
    }
    if (requireTenant && user.role === 'Provider' && !tenant) {
      return null
    }
  }

  return <>{children}</>
}
