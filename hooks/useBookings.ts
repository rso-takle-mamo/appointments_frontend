import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiService'
import { getToken } from '@/utils/token'

export interface Booking {
  id: string
  tenantId: string
  ownerId: string
  serviceId: string
  startDateTime: string // ISO datetime
  endDateTime: string // ISO datetime
  status: number // 0 = confirmed, etc.
  notes?: string
  createdAt: string
  updatedAt: string
}

export const queryKeys = {
  allBookings: (status?: number) => ['allBookings', status] as const,
  bookings: (startDate: string, endDate: string, status?: number) => ['bookings', startDate, endDate, status] as const,
}

export const useAllBookings = (status?: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.allBookings(status),
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error('No token found')
      }

      const response = await api.bookings.getAll(status) as {
        data: Booking[]
      }
      return response.data
    },
    enabled: enabled && !!getToken(),
    retry: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useBookings = (startDate: string, endDate: string, status?: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.bookings(startDate, endDate, status),
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error('No token found')
      }

      const response = await api.bookings.get(startDate, endDate, status) as {
        data: Booking[]
      }
      return response.data
    },
    enabled: enabled && !!getToken() && !!startDate && !!endDate,
    retry: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
