import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupButton,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormValues } from './login.schema'
import { LoadingSpinner } from '@/components/ui/spinner'
import { UserAccountIcon, OfficeIcon, ViewIcon } from '@hugeicons/core-free-icons'
import Link from 'next/link'


export function LoginForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (values: LoginFormValues) => void
  isLoading?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  return (
    <Card className='shadow-md'>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='p-2'>
          <FieldGroup>
            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input {...form.register('username')} id="username" type="text" placeholder="Enter your username" />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
              </div>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label="Show password"
                    title="Show password"
                    size="icon-xs"
                    className={'cursor-pointer'}
                    onClick={() => {
                      setShowPassword(!showPassword)
                    }}
                    type="button"
                  >
                    <HugeiconsIcon icon={ViewIcon} />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </Field>
            <Field className="mt-4">
              <Button type="submit" disabled={isLoading} className="hover:cursor-pointer mb-6">
                {isLoading ? 'Loading' : 'Log in'}
                {isLoading ? <LoadingSpinner size={12} text="" /> : null}
              </Button>
              <FieldSeparator className='mt-0 mb-4'>Don't have an account? </FieldSeparator>

              <div className="flex flex-row justify-between gap-4">
                <Link
                  href="/register/customer"
                  className="w-full border rounded-md p-2 hover:bg-muted transition-colors"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <HugeiconsIcon icon={UserAccountIcon} color="blue" />
                    <span className='font-medium'>New Customer</span>
                  </div>
                </Link>

                <Link
                  href="/register/provider"
                  className="w-full border rounded-md p-2 hover:bg-muted transition-colors"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <HugeiconsIcon icon={OfficeIcon} color="purple" />
                    <span className='font-medium'>New Provider</span>
                  </div>
                </Link>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}