'use client'

import { LoginForm } from '@/components/features/auth/login/login-form'
import { LoginFormValues } from '@/components/features/auth/login/login.schema'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_BASED_REDIRECTS } from '@/constants/routes'
import { LoadingSpinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_BASED_REDIRECTS[user.role])
    }
  }, [isAuthenticated, user, router])

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsLoading(true)

      await login(values.username, values.password)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-accent">
        <LoadingSpinner size={40} text="Redirecting ..." />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-accent">
      <div className="w-full max-w-sm">
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  )
}
