'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ROLE_BASED_REDIRECTS } from '@/constants/routes'
import { LoadingSpinner } from '@/components/ui/spinner'

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      const redirectUrl = ROLE_BASED_REDIRECTS[user.role]
      router.push(redirectUrl)
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  return null
}
