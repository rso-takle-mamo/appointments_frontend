import { UserRole } from '@/contexts/auth-context'

export const PUBLIC_ROUTES = ['/login'] as const

export const ROUTE_PERMISSIONS = {
  '/customers': {
    allowedRoles: ['Customer'] as UserRole[],
    requireTenant: false,
  },

  '/providers': {
    allowedRoles: ['Provider'] as UserRole[],
    requireTenant: false,
  },

  '/': {
    allowedRoles: ['Customer', 'Provider'] as UserRole[],
    requireTenant: false,
  },
} as const

export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))
}

export const getRoutePermissions = (pathname: string) => {
  if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
    return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]
  }

  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route) && route !== '/') {
      return permissions
    }
  }

  return ROUTE_PERMISSIONS['/']
}

export const ROLE_BASED_REDIRECTS = {
  Customer: '/customers',
  Provider: '/providers',
} as const

export type PublicRoute = (typeof PUBLIC_ROUTES)[number]
export type RouteKey = keyof typeof ROUTE_PERMISSIONS
