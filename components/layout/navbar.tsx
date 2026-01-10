"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Logout05Icon, Settings01Icon } from "@hugeicons/core-free-icons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const routeNames: Record<string, string> = {
  "/bookings": "Bookings",
  "/calendar": "Calendar",
  "/categories": "Categories",
  "/services": "Services",
  "/schedule": "Schedule",
  "/tenants": "Search Tenants",
  "/appointments": "My Appointments",
  "/": "Home",
}

function getInitials(firstName: string | undefined, lastName: string | undefined): string {
  const first = firstName?.charAt(0) || ""
  const last = lastName?.charAt(0) || ""
  return `${first}${last}`.toUpperCase()
}

function getConsistentColor(email: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ]
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getBreadcrumbFromPath(pathname: string): { href: string; label: string }[] {
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '')

  if (cleanPath === '' || cleanPath === '/') {
    return []
  }

  const parts = cleanPath.split('/').filter(Boolean)
  const breadcrumb: { href: string; label: string }[] = []

  let currentPath = ''
  for (let i = 0; i < parts.length; i++) {
    currentPath += '/' + parts[i]
    const label = routeNames[currentPath] || parts[i].charAt(0).toUpperCase() + parts[i].slice(1)

    breadcrumb.push({ href: currentPath, label })
  }

  return breadcrumb
}

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [breadcrumb, setBreadcrumb] = useState<{ href: string; label: string }[]>([])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    setBreadcrumb(getBreadcrumbFromPath(pathname))
  }, [pathname])

  return (
    <nav className="bg-white border-b border-gray-200 h-16 w-full flex items-center justify-between px-6">
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  {index === breadcrumb.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumb.length - 1 && (
                  <BreadcrumbSeparator />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName || ''} {user.lastName || ''}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getConsistentColor(user.email || "")}`}>
                  {getInitials(user.firstName, user.lastName) || user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <div className="px-2 py-1 text-sm font-semibold text-gray-500">
                  My Account
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={"hover:cursor-pointer hover:bg-gray-100"}>
                <HugeiconsIcon icon={UserIcon} className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className={"hover:cursor-pointer hover:bg-gray-100"}>
                <HugeiconsIcon icon={Settings01Icon} className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 hover:cursor-pointer hover:bg-red-50">
                <HugeiconsIcon icon={Logout05Icon} className="mr-2 h-4 w-4 hover:text-red-600" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
  )
}
