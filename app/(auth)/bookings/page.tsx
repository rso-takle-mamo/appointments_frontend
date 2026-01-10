'use client'

import { useAuth } from '@/hooks/useAuth'
import { useBookings, type Booking } from '@/hooks/useBookings'
import { format, isPast, isToday, isTomorrow, parseISO, subYears, addYears } from 'date-fns'
import { useEffect, useRef, useMemo } from 'react'
import { Spinner } from '@/components/ui/spinner'

export default function BookingsPage() {
  const { user } = useAuth()

  const startDate = useMemo(() => format(subYears(new Date(), 5), 'yyyy-MM-dd') + 'Z', [])
  const endDate = useMemo(() => format(addYears(new Date(), 5), 'yyyy-MM-dd') + 'Z', [])

  const { data: bookings, isLoading } = useBookings(
    startDate,
    endDate,
    undefined,
    user?.role === 'Provider' || user?.role === 'Customer'
  )

  const upcomingRef = useRef<HTMLDivElement>(null)

  const { passed, upcoming } = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) {
      return { passed: [], upcoming: [] }
    }

    const sorted = [...bookings].sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    )

    const passed: typeof sorted = []
    const upcoming: typeof sorted = []

    sorted.forEach(booking => {
      const endDate = new Date(booking.endDateTime)
      if (isPast(endDate)) {
        passed.push(booking)
      } else {
        upcoming.push(booking)
      }
    })

    return { passed, upcoming }
  }, [bookings])

  useEffect(() => {
    if (upcomingRef.current && upcoming.length > 0) {
      upcomingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [upcoming.length])

  const formatBookingDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) {
      return 'Today'
    }
    if (isTomorrow(date)) {
      return 'Tomorrow'
    }
    return format(date, 'EEEE, MMM d, yyyy')
  }

  const formatBookingTime = (startStr: string, endStr: string) => {
    const start = parseISO(startStr)
    const end = parseISO(endStr)
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return 'Confirmed'
      case 1:
        return 'Pending'
      case 2:
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-teal-500'
      case 1:
        return 'bg-yellow-500'
      case 2:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        {formatBookingDate(booking.startDateTime)}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900 mb-1">
              {formatBookingTime(booking.startDateTime, booking.endDateTime)}
            </div>
            {booking.notes && <div className="text-sm text-gray-500">{booking.notes}</div>}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white shrink-0 ${getStatusColor(booking.status)}`}
          >
            {getStatusLabel(booking.status)}
          </span>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner size={32} className="text-gray-400" />
      </div>
    )
  }

  const hasBookings = passed.length > 0 || upcoming.length > 0

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!hasBookings ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {upcoming.length > 0 && (
              <div ref={upcomingRef}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {passed.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Passed ({passed.length})
                </h2>
                <div className="space-y-3">
                  {passed.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
