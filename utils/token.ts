export const TOKEN_KEY = 'access_token'

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export interface TokenClaims {
  userId: string
  role: 'customer' | 'provider'
  tenantId: string | null
  exp: number
}

export function parseJwt(token: string): TokenClaims | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      userId: decoded.user_id,
      role: decoded.role,
      tenantId: decoded.tenantId ?? null,
      exp: decoded.exp,
    }
  } catch {
    return null
  }
}

export function isTokenExpired(exp: number): boolean {
  return Date.now() >= exp * 1000
}
