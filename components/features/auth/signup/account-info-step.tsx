'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  accountInfoFullSchema,
  type AccountInfoFullData,
} from './validation/account-info-full.schema'
import { Field, FieldGroup, FieldLabel, Input } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ViewIcon,
  Loading03Icon,
  Alert02Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'
import {
  InputGroup,
  InputGroupButton,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useCheckUsernameMutation, useCheckEmailMutation } from '@/hooks/useAuthMutation'

interface AccountInfoStepProps {
  initialData?: Partial<AccountInfoFullData>
  onDataChange?: (data: Partial<AccountInfoFullData>) => void
  onSubmit?: (data: AccountInfoFullData) => void
  isLastStep?: boolean
  isLoading?: boolean
}

export function AccountInfoStep({
  initialData,
  onDataChange,
  onSubmit,
  isLastStep = false,
  isLoading = false,
}: AccountInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    'idle'
  )
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    'idle'
  )

  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const emailDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const checkUsernameMutation = useCheckUsernameMutation()
  const checkEmailMutation = useCheckEmailMutation()

  const form = useForm<AccountInfoFullData>({
    resolver: zodResolver(accountInfoFullSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      username: initialData?.username || '',
      password: initialData?.password || '',
      confirmPassword: initialData?.confirmPassword || '',
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isValid },
  } = form

  const checkUsername = (username: string) => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current)
    }

    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameMutation.mutateAsync({ username })
        setUsernameStatus(result.exists ? 'taken' : 'available')
      } catch {
        setUsernameStatus('available')
      }
    }, 1000)
  }

  const checkEmail = (email: string) => {
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current)
    }

    if (!email || !email.includes('@')) {
      setEmailStatus('idle')
      return
    }

    setEmailStatus('checking')

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const result = await checkEmailMutation.mutateAsync({ email })
        setEmailStatus(result.exists ? 'taken' : 'available')
      } catch {
        setEmailStatus('available')
      }
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current)
      }
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (onDataChange) {
      const subscription = form.watch(value => {
        if (onDataChange) {
          onDataChange(value as Partial<AccountInfoFullData>)
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [onDataChange, form.watch])

  useEffect(() => {
    if (usernameStatus === 'taken') {
      setError('username', { type: 'manual', message: 'Username is already taken' })
    } else if (usernameStatus === 'available') {
      clearErrors('username')
      trigger('username')
    } else if (usernameStatus === 'idle') {
      clearErrors('username')
    }
  }, [usernameStatus, setError, clearErrors, trigger])

  useEffect(() => {
    if (emailStatus === 'taken') {
      setError('email', { type: 'manual', message: 'Email is already taken' })
    } else if (emailStatus === 'available') {
      clearErrors('email')
      trigger('email')
    } else if (emailStatus === 'idle') {
      clearErrors('email')
    }
  }, [emailStatus, setError, clearErrors, trigger])

  const onFormSubmit = (data: AccountInfoFullData) => {
    if (onSubmit) {
      onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              {...register('firstName')}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              {...register('lastName')}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                onChange: e => checkEmail(e.target.value),
              })}
              disabled={isLoading}
              className={
                emailStatus === 'available'
                  ? 'border-green-500'
                  : emailStatus === 'taken'
                    ? 'border-red-500'
                    : ''
              }
            />
            {(emailStatus === 'available' ||
              emailStatus === 'taken' ||
              emailStatus === 'checking') && (
              <InputGroupAddon align="inline-end">
                {emailStatus === 'checking' ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="h-4 w-4 text-muted-foreground animate-spin"
                  />
                ) : emailStatus === 'available' ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="h-4 w-4 text-green-600"
                  />
                ) : (
                  <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-red-500" />
                )}
              </InputGroupAddon>
            )}
          </InputGroup>
          {errors.email ? (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          ) : emailStatus === 'available' ? (
            <p className="text-sm text-green-600 mt-1">Email is available</p>
          ) : emailStatus === 'taken' ? (
            <p className="text-sm text-red-500 mt-1">Email is already taken</p>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="username"
              type="text"
              placeholder="Choose a username"
              {...register('username', {
                onChange: e => checkUsername(e.target.value),
              })}
              disabled={isLoading}
              className={
                usernameStatus === 'available'
                  ? 'border-green-500'
                  : usernameStatus === 'taken'
                    ? 'border-red-500'
                    : ''
              }
            />
            {(usernameStatus === 'available' ||
              usernameStatus === 'taken' ||
              usernameStatus === 'checking') && (
              <InputGroupAddon align="inline-end">
                {usernameStatus === 'checking' ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="h-4 w-4 text-muted-foreground animate-spin"
                  />
                ) : usernameStatus === 'available' ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className=" text-green-600"
                  />
                ) : (
                  <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-red-500" />
                )}
              </InputGroupAddon>
            )}
          </InputGroup>
          {errors.username ? (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          ) : usernameStatus === 'available' ? (
            <p className="text-sm text-green-600 mt-1">Username is available</p>
          ) : usernameStatus === 'taken' ? (
            <p className="text-sm text-red-500 mt-1">Username is already taken</p>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              {...register('password')}
              disabled={isLoading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Show password"
                title="Show password"
                size="icon-xs"
                className="cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <HugeiconsIcon icon={ViewIcon} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Show confirm password"
                title="Show confirm password"
                size="icon-xs"
                className="cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
              >
                <HugeiconsIcon icon={ViewIcon} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </Field>
      </FieldGroup>

      {isLastStep && (
        <Button
          type="submit"
          className="w-full hover:cursor-pointer"
          disabled={!isValid || isLoading || usernameStatus === 'taken' || emailStatus === 'taken'}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      )}
    </form>
  )
}
