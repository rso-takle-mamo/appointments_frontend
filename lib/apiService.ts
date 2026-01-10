import { getToken, removeToken } from '@/utils/token'
import { getApiBaseUrl } from '@/utils/apiUtils'
import { showToast, toastMessages } from '@/utils/toast'

// API functions for React Query
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${getApiBaseUrl()}${endpoint}`

  if (!url.startsWith('http')) {
    const error = 'Invalid API URL configuration'
    showToast.error(error)
    throw new Error(error)
  }

  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    const isLoginRequest = endpoint.includes('/api/auth/login')

    if (!isLoginRequest) {
      showToast.error(toastMessages.session.expired)
      removeToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error(toastMessages.session.expired)
    }
  }

  let responseData = await response.json()

  if (!response.ok) {
    let errorMessage: string

    switch (response.status) {
      case 401:
        errorMessage = toastMessages.login.error
        break
      case 403:
        errorMessage = toastMessages.api.forbidden
        break
      case 404:
        if (endpoint.includes('/api/auth/login')) {
          errorMessage =
            'User not yet registered. Please check your username or create a new account.'
        } else {
          errorMessage = toastMessages.api.notFound
        }
        break
      case 409:
        errorMessage =
          typeof responseData?.message === 'string'
            ? responseData.message
            : responseData?.message?.toString() || 'A user with this information already exists'
        break
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = toastMessages.api.serverError
        break
      default:
        if (typeof responseData?.message === 'string') {
          errorMessage = responseData.message
        } else if (typeof responseData?.error === 'string') {
          errorMessage = responseData.error
        } else if (responseData?.message && typeof responseData.message === 'object') {
          errorMessage =
            responseData.message.message ||
            responseData.message.description ||
            JSON.stringify(responseData.message)
        } else {
          errorMessage = response.statusText || toastMessages.api.error
        }
    }

    showToast.error(errorMessage)
    const error = new Error(errorMessage)
    ;(error as any).details = responseData
    throw error
  }

  return responseData
}

// API endpoint functions for use with React Query
export const api = {
  auth: {
    login: (username: string, password: string) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    checkVat: (vatNumber: string) =>
      apiRequest(`/api/auth/tenants/check-vat?vatNumber=${encodeURIComponent(vatNumber)}`, {
        method: 'GET',
      }),
    checkUsername: (username: string) =>
      apiRequest(`/api/auth/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET',
      }),
    checkEmail: (email: string) =>
      apiRequest(`/api/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      }),
    registerCustomer: (data: {
      firstName: string
      lastName: string
      email: string
      username: string
      password: string
    }) =>
      apiRequest('/api/auth/register/customer', {
        method: 'POST',
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      }),
    registerProvider: (data: {
      firstName: string
      lastName: string
      email: string
      username: string
      password: string
      vatNumber: string
      businessName: string
      address: string
      businessPhone?: string
      businessEmail?: string
      description?: string
    }) =>
      apiRequest('/api/auth/register/provider', {
        method: 'POST',
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          password: data.password,
          vatNumber: data.vatNumber,
          businessName: data.businessName,
          address: data.address,
          businessPhone: data.businessPhone,
          businessEmail: data.businessEmail,
          description: data.description,
        }),
      }),
    getCurrentUser: () => apiRequest('/api/users/me', { method: 'GET' }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  },

  // Tenant endpoints
  tenants: {
    get: (tenantId: string) => apiRequest(`/api/tenants/${tenantId}`, { method: 'GET' }),
    update: (tenantId: string, data: any) =>
      apiRequest(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    create: (data: any) =>
      apiRequest('/api/tenants', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Availability endpoints
  availability: {
    getWorkingHours: () => apiRequest('/api/availability/working-hours', { method: 'GET' }),
    getTimeBlocks: (startDate: string, endDate: string) =>
      apiRequest(
        `/api/availability/time-blocks?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        { method: 'GET' }
      ),
    getBufferTimes: () => apiRequest('/api/availability/tenant-settings/buffer', { method: 'GET' }),
  },

  // Bookings endpoints
  bookings: {
    getAll: (status?: number) => {
      const params = new URLSearchParams()
      if (status !== undefined) {
        params.append('status', status.toString())
      }
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return apiRequest(`/api/bookings/all${queryString}`, { method: 'GET' })
    },
    get: (startDate: string, endDate: string, status?: number) => {
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
      })
      if (status !== undefined) {
        params.append('status', status.toString())
      }
      return apiRequest(`/api/bookings?${params.toString()}`, { method: 'GET' })
    },
  },
}
