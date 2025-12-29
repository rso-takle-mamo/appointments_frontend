import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiService'
import { getToken, removeToken, setToken } from '@/utils/token'
import { showToast, toastMessages } from '@/utils/toast'
import type { User, Tenant } from '@/contexts/auth-context'

export const queryKeys = {
  currentUser: ['currentUser'],
  tenant: (tenantId: string) => ['tenant', tenantId],
}

// Login mutation
export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const data = await api.auth.login(username, password) as { accessToken: string }
      setToken(data.accessToken)
      return data
    },
    onSuccess: async () => {
      showToast.success(toastMessages.login.success)
      await queryClient.fetchQuery({
        queryKey: queryKeys.currentUser,
        queryFn: async () => {
          const token = getToken()
          if (!token) {
            throw new Error('No token found')
          }
          const userData = await api.auth.getCurrentUser()
          return userData as User
        },
      })
    }
  })
}

// VAT validation mutation
export const useCheckVatMutation = () => {
  return useMutation({
    mutationFn: async ({ vatNumber }: { vatNumber: string }) => {
      const response = await api.auth.checkVat(vatNumber) as {
        isValid: boolean
        companyName?: string
        address?: string
        countryCode?: string
        vatNumber?: string
      }
      return response
    },
  })
}

// Username validation mutation
export const useCheckUsernameMutation = () => {
  return useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const response = await api.auth.checkUsername(username) as {
        exists: boolean
      }
      return response
    },
  })
}

// Email validation mutation
export const useCheckEmailMutation = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await api.auth.checkEmail(email) as {
        exists: boolean
      }
      return response
    },
  })
}

// Register customer mutation
export const useRegisterCustomerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      firstName: string
      lastName: string
      email: string
      username: string
      password: string
    }) => {
      const response = await api.auth.registerCustomer(data) as {
        accessToken: string
        user: User
      }
      setToken(response.accessToken)
      return response
    },
    onSuccess: async () => {
      showToast.success('Account created successfully!')
      await queryClient.fetchQuery({
        queryKey: queryKeys.currentUser,
        queryFn: async () => {
          const token = getToken()
          if (!token) {
            throw new Error('No token found')
          }
          const userData = await api.auth.getCurrentUser()
          return userData as User
        },
      })
    }
  })
}

// Register provider mutation
export const useRegisterProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
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
    }) => {
      const response = await api.auth.registerProvider(data) as {
        accessToken: string
      }
      setToken(response.accessToken)
      return response
    },
    onSuccess: async () => {
      showToast.success('Provider account created successfully!')
      await queryClient.fetchQuery({
        queryKey: queryKeys.currentUser,
        queryFn: async () => {
          const token = getToken()
          if (!token) {
            throw new Error('No token found')
          }
          const userData = await api.auth.getCurrentUser()
          return userData as User
        },
      })
    }
  })
}

// Get current user query
export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error('No token found')
      }

      const userData = await api.auth.getCurrentUser()
      return userData as User
    },
    enabled: enabled && !!getToken(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Get tenant query
export const useTenant = (tenantId: string | null, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.tenant(tenantId!),
    queryFn: async () => {
      if (!tenantId) return null
      const tenantData = await api.tenants.get(tenantId)
      return tenantData as Tenant
    },
    enabled: !!tenantId && enabled,
    retry: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Logout mutation
export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      removeToken()
      queryClient.clear()
    },
    onSuccess: () => {
      showToast.success(toastMessages.logout.success)
    },
  })
}