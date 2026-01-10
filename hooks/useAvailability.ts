import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiService'
import { getToken } from '@/utils/token'

export interface WorkingHour {
  id: string
  tenantId: string
  day: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // Format: "HH:mm:ss"
  endTime: string // Format: "HH:mm:ss"
  maxConcurrentBookings: number
  createdAt: string
  updatedAt: string
}

export interface TimeBlock {
  id: string
  tenantId: string
  startDateTime: string // ISO datetime
  endDateTime: string // ISO datetime
  reason?: string
  type?: number
  isRecurring?: boolean
  createdAt: string
  updatedAt: string
}

export interface BufferTimes {
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
}

export const queryKeys = {
  workingHours: ['workingHours'],
  timeBlocks: (startDate: string, endDate: string) => ['timeBlocks', startDate, endDate],
  bufferTimes: ['bufferTimes'],
}

export const useWorkingHours = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.workingHours,
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error('No token found')
      }

      const data = await api.availability.getWorkingHours()
      return data as WorkingHour[]
    },
    enabled: enabled && !!getToken(),
    retry: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useTimeBlocks = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.timeBlocks(startDate, endDate),
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error('No token found')
      }

      const response = (await api.availability.getTimeBlocks(startDate, endDate)) as {
        data: TimeBlock[]
      }
      return response.data
    },
    enabled: enabled && !!getToken() && !!startDate && !!endDate,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useBufferTimes = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.bufferTimes,
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error('No token found')
      }

      const data = await api.availability.getBufferTimes()
      console.log('Raw buffer times API response:', data)
      return data as BufferTimes
    },
    enabled: enabled && !!getToken(),
    retry: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
