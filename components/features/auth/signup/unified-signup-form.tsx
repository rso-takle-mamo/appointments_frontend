'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { SignupProgressIndicator } from './signup-progress-indicator'
import { AccountInfoStep } from './account-info-step'
import { CompanyInfoStep } from './company-info-step'
import { useRegisterCustomerMutation } from '@/hooks/useAuthMutation'
import { useRegisterProviderMutation } from '@/hooks/useAuthMutation'
import { useAuth } from '@/hooks/useAuth'
import type { CompanyInfoFormData } from './validation/company-info.schema'
import type { AccountInfoFullData } from './validation/account-info-full.schema'
import { UserAccountIcon, OfficeIcon, ArrowUpRight01Icon, ArrowLeft02Icon  } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ROLE_BASED_REDIRECTS } from '@/constants/routes'
import { LoadingSpinner } from '@/components/ui/spinner'


type UserRole = 'customer' | 'provider'

interface UnifiedSignupFormProps {
  type: UserRole
}

interface FormData {
  companyInfo?: CompanyInfoFormData
  accountInfo: AccountInfoFullData
}

export function UnifiedSignupForm({ type }: UnifiedSignupFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    accountInfo: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    } as AccountInfoFullData,
  })

  const registerCustomerMutation = useRegisterCustomerMutation()
  const registerProviderMutation = useRegisterProviderMutation()

  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_BASED_REDIRECTS[user.role])
    }
  }, [isAuthenticated, user, router])

  const totalSteps = type === 'provider' ? 2 : 1
  const isProvider = type === 'provider'

  const getStepLabel = () => {
    if (!isProvider) return 'Account Info'
    return currentStep === 0 ? 'Company Details' : 'Account Info'
  }

  const getTitle = () => {
    return isProvider ? 'Provider Account' : 'Customer Account'
  }

  const getIcon = () => {
    return isProvider ? OfficeIcon : UserAccountIcon
  }

  const getIconColor = () => {
    return isProvider ? 'purple' : 'blue'
  }

  const handleCompanyInfoDataChange = (data: Partial<CompanyInfoFormData>) => {
    setFormData(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, ...data } as CompanyInfoFormData,
    }))
  }

  const handleAccountInfoDataChange = (data: Partial<AccountInfoFullData>) => {
    setFormData(prev => ({
      ...prev,
      accountInfo: { ...prev.accountInfo, ...data },
    }))
  }

  const handleNextFromCompanyInfo = (data: CompanyInfoFormData) => {
    setFormData(prev => ({
      ...prev,
      companyInfo: data,
    }))
    setCurrentStep(1)
  }

  const handleSubmitAccountInfo = async (data: AccountInfoFullData) => {
      if (isProvider) {
        if (!formData.companyInfo) {
          throw new Error('Company information is required for provider registration')
        }

        const providerData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          password: data.password,
          vatNumber: formData.companyInfo.vatNumber,
          businessName: formData.companyInfo.companyName,
          address: formData.companyInfo.companyAddress,
          ...(formData.companyInfo.businessPhone?.trim() && { businessPhone: formData.companyInfo.businessPhone }),
          ...(formData.companyInfo.businessEmail?.trim() && { businessEmail: formData.companyInfo.businessEmail }),
          ...(formData.companyInfo.description?.trim() && { description: formData.companyInfo.description }),
        }

        await registerProviderMutation.mutateAsync(providerData)
      } else {
        const customerData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          password: data.password,
        }

        await registerCustomerMutation.mutateAsync(customerData)
      }
    
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const isLoading = registerCustomerMutation.isPending || registerProviderMutation.isPending

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-accent">
        <LoadingSpinner size={40} text="Redirecting..." />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-start font-bold">
            <HugeiconsIcon icon={getIcon()} color={getIconColor()} />
            {getTitle()}
          </CardTitle>
          <Link
            href={isProvider ? '/register/customer' : '/register/provider'}
            className="text-sm font-normal flex items-center gap-1 hover:underline hover:cursor-pointer hover:text-primary"
          >
            Switch to {isProvider ? 'Customer' : 'Provider'}
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SignupProgressIndicator
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          stepLabel={getStepLabel()}
          leftAction={isProvider && currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              className={"hover:cursor-pointer"}
              onClick={handlePrevious}
              disabled={isLoading}
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className=" h-4 w-4" />
              Previous step
            </Button>
          )}
        />

        {isProvider && currentStep === 0 && (
          <CompanyInfoStep
            initialData={formData.companyInfo}
            onDataChange={handleCompanyInfoDataChange}
            onNext={handleNextFromCompanyInfo}
            isLoading={isLoading}
          />
        )}

        {(!isProvider || currentStep === 1) && (
          <AccountInfoStep
            initialData={formData.accountInfo}
            onDataChange={handleAccountInfoDataChange}
            onSubmit={handleSubmitAccountInfo}
            isLastStep={true}
            isLoading={isLoading}
          />
        )}

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </div>
      </CardContent>
    </Card>
  )
}