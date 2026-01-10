'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWorkingHours, useTimeBlocks, useBufferTimes } from '@/hooks/useAvailability'
import { useBookings } from '@/hooks/useBookings'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
  startOfWeek as startOfWeekFn,
  endOfWeek as endOfWeekFn,
} from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const calendarStyles = `
  .rbc-event,
  .rbc-event *,
  .rbc-event-content {
    pointer-events: auto !important;
  }
  .rbc-event[title]:hover::after,
  .rbc-event[title]::after {
    content: none !important;
    display: none !important;
  }

  .rbc-event {
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .rbc-event-label {
    padding: 0 !important;
    margin: 0 !important;
    display: none !important;
  }

  .rbc-event-content {
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
  }

  .rbc-day-column + .rbc-day-column {
    border-left: 1px solid #ddd;
  }

  .rbc-day-slot .rbc-events-container {
    margin-right: 0 !important;
  }

  .rbc-day-slot .rbc-event {
    width: 100% !important;
    margin: 0 !important;
  }

  .rbc-calendar,
  .rbc-month-view,
  .rbc-time-view,
  .rbc-agenda-view,
  .rbc-day-view,
  .rbc-week-view {
    overflow: hidden !important;
  }

  .rbc-month-row,
  .rbc-month-row-content,
  .rbc-day-bg,
  .rbc-events-container,
  .rbc-day-column {
    overflow: hidden !important;
  }

  .rbc-calendar::-webkit-scrollbar,
  .rbc-month-view::-webkit-scrollbar,
  .rbc-time-view::-webkit-scrollbar,
  .rbc-agenda-view::-webkit-scrollbar {
    display: none !important;
  }

  .rbc-calendar,
  .rbc-month-view,
  .rbc-time-view,
  .rbc-agenda-view {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
`

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: any) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

const formats = {
  timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
  agendaTimeFormat: (date: Date) => format(date, 'HH:mm'),
}

export default function CalendarPage() {
  const { user } = useAuth()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = calendarStyles
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const [calendarDate, setCalendarDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week')

  const { startDate, endDate } = useMemo(() => {
    let start: Date
    let end: Date

    if (calendarView === 'week') {
      start = startOfWeekFn(calendarDate, { weekStartsOn: 1 })
      end = endOfWeekFn(calendarDate, { weekStartsOn: 1 })
    } else {
      start = startOfMonth(calendarDate)
      end = endOfMonth(calendarDate)
    }

    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd') + 'Z'

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    }
  }, [calendarDate, calendarView])

  const { data: workingHours } = useWorkingHours(user?.role === 'Provider')

  const { data: timeBlocks } = useTimeBlocks(startDate, endDate, user?.role === 'Provider')

  const { data: bookings } = useBookings(
    startDate,
    endDate,
    undefined,
    user?.role === 'Provider' || user?.role === 'Customer'
  )

  const { data: bufferTimes } = useBufferTimes(user?.role === 'Provider')

  const EventComponent = useCallback(({ event }: { event: any }) => {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div className="w-full h-full cursor-pointer flex items-center justify-center" title="">
            {event.title}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" sideOffset={20} className="max-w-xs">
          <div className="space-y-1">
            {event.notes && <p className="font-medium">{event.notes}</p>}
            {!event.notes && <p className="font-medium">{event.title}</p>}
            <p className="text-xs opacity-60">{format(new Date(event.start), 'MMM d, yyyy')}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }, [])

  const handleNavigate = useCallback((newDate: Date) => {
    setCalendarDate(newDate)
  }, [])

  const handleView = useCallback((newView: string) => {
    setCalendarView(newView as 'week' | 'month')
  }, [])

  const { min, max } = useMemo(() => {
    if (!workingHours || user?.role !== 'Provider') {
      return { min: new Date(0, 0, 0, 0, 0, 0), max: new Date(0, 0, 0, 23, 59, 59) }
    }

    let earliestStart = 24 * 60
    let latestEnd = 0

    workingHours.forEach(wh => {
      const [startHour, startMin] = wh.startTime.split(':').map(Number)
      const [endHour, endMin] = wh.endTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      if (startMinutes < earliestStart) earliestStart = startMinutes
      if (endMinutes > latestEnd) latestEnd = endMinutes
    })

    const startHour = Math.floor((earliestStart - 60) / 60)
    const startMin = (earliestStart - 60) % 60
    const endHour = Math.ceil((latestEnd + 60) / 60)
    const endMin = (latestEnd + 60) % 60

    return {
      min: new Date(0, 0, 0, Math.max(0, startHour), Math.max(0, startMin), 0),
      max: new Date(0, 0, 0, Math.min(23, endHour), endMin, 0),
    }
  }, [workingHours, user?.role])

  const isWorkableDay = useCallback(
    (date: Date): boolean => {
      if (!workingHours || user?.role !== 'Provider') return true
      const dayOfWeek = date.getDay()
      return workingHours.some(wh => wh.day === dayOfWeek)
    },
    [workingHours, user?.role]
  )

  const isWithinWorkingHours = useCallback(
    (date: Date): boolean => {
      if (!workingHours || user?.role !== 'Provider') return true
      const dayOfWeek = date.getDay()
      const dayConfig = workingHours.find(wh => wh.day === dayOfWeek)

      if (!dayConfig) return false

      const hour = date.getHours()
      const minute = date.getMinutes()
      const currentTime = hour * 60 + minute

      const [startHour, startMin] = dayConfig.startTime.split(':').map(Number)
      const [endHour, endMin] = dayConfig.endTime.split(':').map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      return currentTime >= startTime && currentTime < endTime
    },
    [workingHours, user?.role]
  )

  const isWithinTimeBlock = useCallback(
    (date: Date): boolean => {
      if (!timeBlocks || !Array.isArray(timeBlocks) || timeBlocks.length === 0) return false

      return timeBlocks.some(block => {
        const blockStart = new Date(block.startDateTime)
        const blockEnd = new Date(block.endDateTime)
        return date >= blockStart && date < blockEnd
      })
    },
    [timeBlocks]
  )

  const isWithinBuffer = useCallback(
    (date: Date): boolean => {
      if (!bookings || !Array.isArray(bookings) || bookings.length === 0) return false

      const bufferBeforeMinutes = bufferTimes?.bufferBeforeMinutes || 0
      const bufferAfterMinutes = bufferTimes?.bufferAfterMinutes || 0

      if (bufferBeforeMinutes === 0 && bufferAfterMinutes === 0) return false

      return bookings.some(booking => {
        const bookingStart = new Date(booking.startDateTime)
        const bookingEnd = new Date(booking.endDateTime)

        const bufferBeforeStart = new Date(bookingStart.getTime() - bufferBeforeMinutes * 60 * 1000)
        if (date >= bufferBeforeStart && date < bookingStart) return true

        const bufferAfterEnd = new Date(bookingEnd.getTime() + bufferAfterMinutes * 60 * 1000)
        if (date >= bookingEnd && date < bufferAfterEnd) return true

        return false
      })
    },
    [bookings, bufferTimes]
  )

  const slotPropGetter = useMemo(() => {
    return (date: Date) => {
      const isBuffered = isWithinBuffer(date)

      if (isBuffered) {
        return {
          className: 'rbc-slot-buffer',
          style: {
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)',
          },
        }
      }

      const isBlocked = isWithinTimeBlock(date)

      if (isBlocked) {
        return {
          className: 'rbc-slot-blocked',
          style: {
            backgroundColor: 'rgba(249, 115, 22, 0.2)',
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(249, 115, 22, 0.1) 5px, rgba(249, 115, 22, 0.1) 10px)',
          },
        }
      }

      if (user?.role === 'Provider') {
        const isWorkable = isWorkableDay(date) && isWithinWorkingHours(date)

        if (!isWorkable) {
          return {
            className: 'rbc-slot-free',
            style: {
              backgroundColor: 'rgba(255, 243, 200, 1)',
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0, 0, 0, 0.05) 5px, rgba(0, 0, 0, 0.05) 10px)',
            },
          }
        }

        return {
          className: 'rbc-slot-workable',
        }
      }

      return {}
    }
  }, [user?.role, isWorkableDay, isWithinWorkingHours, isWithinTimeBlock, isWithinBuffer])

  const dayPropGetter = useMemo(() => {
    return (date: Date) => {
      if (user?.role !== 'Provider') return {}

      const isWorkable = isWorkableDay(date)

      return {
        className: isWorkable ? 'rbc-day-workable' : 'rbc-day-free',
        style: {
          backgroundColor: isWorkable ? undefined : 'rgba(255, 243, 200, 1)',
        },
      }
    }
  }, [user?.role, isWorkableDay])

  const bookingEvents = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return []

    return bookings.map(booking => {
      const start = new Date(booking.startDateTime)
      const end = new Date(booking.endDateTime)
      return {
        id: booking.id,
        title: `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
        notes: booking.notes,
        start,
        end,
        backgroundColor: '#0d9488',
        borderColor: '#0f766e',
      }
    })
  }, [bookings])

  const eventPropGetter = useMemo(() => {
    return (event: any) => ({
      style: {
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
      },
    })
  }, [])

  return (
    <div className="h-full p-6 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={bookingEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['week', 'month']}
          view={calendarView}
          date={calendarDate}
          onNavigate={handleNavigate}
          onView={handleView}
          formats={formats}
          slotPropGetter={slotPropGetter}
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventPropGetter}
          components={{
            event: EventComponent,
          }}
          min={min}
          max={max}
          step={15}
          timeslots={2}
        />
      </div>
    </div>
  )
}
