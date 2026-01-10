'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CalendarIcon,
  CloudIcon,
  NewOfficeIcon,
  SearchAddIcon,
  TaskDaily02Icon,
  Calendar03Icon,
  Tag01Icon,
  MenuRestaurantIcon,
  TimeScheduleIcon,
} from '@hugeicons/core-free-icons'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '../ui/badge'
import { Button } from '@/components/ui/button'

type LinkItem = {
  href: string
  label: string
  icon: any
}

type LinkGroup = {
  name: string
  links: LinkItem[]
}

type LinksByRole = {
  Provider: LinkGroup[]
  Customer: LinkGroup[]
}

export function Sidebar() {
  const { user, tenant } = useAuth()
  const pathname = usePathname()
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const links: LinksByRole = {
    Provider: [
      {
        name: 'Company',
        links: [],
      },
      {
        name: 'Appointments',
        links: [
          { href: '/bookings', label: 'Bookings', icon: TaskDaily02Icon },
          { href: '/calendar', label: 'Calendar', icon: Calendar03Icon },
        ],
      },
      {
        name: 'Configuration',
        links: [
          { href: '/categories', label: 'Categories', icon: Tag01Icon },
          { href: '/services', label: 'Services', icon: MenuRestaurantIcon },
          { href: '/schedule', label: 'Schedule', icon: TimeScheduleIcon },
        ],
      },
    ],
    Customer: [
      {
        name: 'Bookings',
        links: [
          { href: '/tenants', label: 'Search Tenants', icon: NewOfficeIcon },
          { href: '/services', label: 'Find services', icon: CalendarIcon },
        ],
      },
      {
        name: 'Appointments',
        links: [
          { href: '/bookings', label: 'Bookings', icon: TaskDaily02Icon },
          { href: '/calendar', label: 'Calendar', icon: Calendar03Icon },
        ],
      },
    ],
  }

  const userLinkGroups = links[user?.role as keyof LinksByRole] || []

  return (
    <aside className="w-60 h-screen border-r border-gray-300 bg-white py-2 px-5 flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 h-12">
          <div className="p-0.75 rounded-lg shadow-sm border border-gray-800/10">
            <HugeiconsIcon icon={CloudIcon} className="w-6 text-primary fill-primary/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[16px]">Appointments</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">Account:</span>
          <Badge variant={'outline'} className="h-5">
            {user?.role}
          </Badge>
        </div>
      </div>

      <nav className="flex flex-col gap-6">
        {userLinkGroups.map(group => (
          <div key={group.name} className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {group.name}
            </span>
            {group.name == 'Company' && tenant && (
              <div className="flex flex-col items-start text-sm">
                <span className="font-semibold text-[14px] mb-1 text-gray-900">
                  {tenant.businessName}
                </span>
                <span className=" text-[12px] text-gray-500 ">VAT: {tenant.vatNumber}</span>
                <Button variant={'link'} className="hover:cursor-pointer px-0">
                  <span>View more info</span>
                  <HugeiconsIcon icon={SearchAddIcon} className="inline-block" />
                </Button>
              </div>
            )}
            {group.links.map(({ href, label, icon }: LinkItem) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 font-medium text-[15px] no-underline transition-colors
                  ${
                    pathname === href
                      ? 'text-primary font-semibold'
                      : 'text-gray-800 hover:text-primary'
                  }`}
              >
                <HugeiconsIcon icon={icon} className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto -mx-3 mb-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="border-0 rounded-none"
        />
      </div>
    </aside>
  )
}
