'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companyInfoSchema, type CompanyInfoFormData } from './validation/company-info.schema'
import { Field, FieldGroup, FieldLabel, Input } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { useCheckVatMutation } from '@/hooks/useAuthMutation'
import { VatInputGroup } from './vat-input-group'
import { PhoneInputGroup } from './phone-input-group'
import { validateVATFormat } from '@/lib/countries'
import { Textarea } from '@/components/ui/textarea'

interface CompanyInfoStepProps {
  initialData?: Partial<CompanyInfoFormData>
  onDataChange?: (data: Partial<CompanyInfoFormData>) => void
  onNext?: (data: CompanyInfoFormData) => void
  isLoading?: boolean
}

export function CompanyInfoStep({
  initialData,
  onDataChange,
  onNext,
  isLoading = false,
}: CompanyInfoStepProps) {
  const [vatValidated, setVatValidated] = useState(false)
  const [vatValidationError, setVatValidationError] = useState<string | null>(null)
  const [vatCountryCode, setVatCountryCode] = useState<string>('SI')

  useEffect(() => {
    const companyName = getValues('companyName')
    const companyAddress = getValues('companyAddress')
    const vatNumber = getValues('vatNumber')

    if (companyName && companyAddress && vatNumber) {
      setVatValidated(true)
      if (vatNumber.length >= 2) {
        const countryCode = vatNumber.substring(0, 2).toUpperCase()
        setVatCountryCode(countryCode)
      }
    }
  }, [])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    mode: 'onChange',
    defaultValues: {
      vatNumber: initialData?.vatNumber || '',
      companyName: initialData?.companyName || '',
      companyAddress: initialData?.companyAddress || '',
      businessPhone: initialData?.businessPhone || '',
      businessEmail: initialData?.businessEmail || '',
      description: initialData?.description || '',
    },
  })

  const validateVatMutation = useCheckVatMutation()

  const handleVatValidationSuccess = (data: any) => {
    console.log('VAT validation response:', data)
    setVatValidationError(null)
    if (data.isValid) {
      if (data.companyName) {
        setValue('companyName', data.companyName, { shouldValidate: true })
      }
      if (data.address) {
        setValue('companyAddress', data.address, { shouldValidate: true })
      }
      setVatValidated(true)
      trigger()
    } else {
      const errorMessage = data.error || 'Invalid VAT number'
      setError('vatNumber', { message: errorMessage })
      setVatValidationError(errorMessage)
      setVatValidated(false)
    }
  }

  const handleVatValidationError = (error: any) => {
    const errorMessage = error?.message || 'Failed to validate VAT number'
    setError('vatNumber', { message: errorMessage })
    setVatValidationError(errorMessage)
    setVatValidated(false)
  }

  const handleVatCountryChange = (countryCode: string) => {
    setVatCountryCode(countryCode)
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleVatNumberChange = (value: string) => {
    setValue('vatNumber', value, { shouldValidate: true })
    setVatValidated(false)
    setVatValidationError(null)
    clearErrors('vatNumber')

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (value.length >= 5) {
      const countryCode = value.substring(0, 2).toUpperCase()
      if (validateVATFormat(countryCode, value)) {
        debounceTimerRef.current = setTimeout(() => {
          validateVatMutation.mutate(
            { vatNumber: value },
            {
              onSuccess: handleVatValidationSuccess,
              onError: handleVatValidationError,
            }
          )
        }, 1000) as any
      }
    }
  }

  const handleManualVatValidation = () => {
    const vatNumber = getValues('vatNumber')
    if (vatNumber) {
      validateVatMutation.mutate(
        { vatNumber },
        {
          onSuccess: handleVatValidationSuccess,
          onError: handleVatValidationError,
        }
      )
    }
  }

  const onSubmit = (data: CompanyInfoFormData) => {
    trigger().then(isFormValid => {
      if (!isFormValid) {
        return
      }

      if (!vatValidated) {
        setError('vatNumber', { message: 'Please validate your VAT number' })
        return
      }

      if (onNext) {
        onNext(data)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="vatNumber">Company VAT Number *</FieldLabel>
          <VatInputGroup
            value={watch('vatNumber')}
            onChange={value => {
              setValue('vatNumber', value, { shouldValidate: true })
              handleVatNumberChange(value)
            }}
            onValidateVAT={handleManualVatValidation}
            isVatValidated={vatValidated}
            isValidatingVAT={validateVatMutation.isPending}
            error={errors.vatNumber?.message || vatValidationError}
            disabled={isLoading}
            onCountryChange={handleVatCountryChange}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
          <Input
            id="companyName"
            type="text"
            placeholder="Company name will be auto-filled"
            {...register('companyName')}
            disabled={true}
          />
          {errors.companyName && (
            <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="companyAddress">Company Address</FieldLabel>
          <Input
            id="companyAddress"
            type="text"
            placeholder="Company address will be auto-filled"
            {...register('companyAddress')}
            disabled={true}
          />
          {errors.companyAddress && (
            <p className="text-sm text-red-500 mt-1">{errors.companyAddress.message}</p>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4">
          <Field>
            <FieldLabel htmlFor="businessPhone">Business Phone (Optional)</FieldLabel>
            <PhoneInputGroup
              value={watch('businessPhone') || ''}
              onChange={value => setValue('businessPhone', value, { shouldValidate: true })}
              disabled={isLoading}
              vatCountryCode={vatCountryCode}
            />
            {errors.businessPhone && (
              <p className="text-sm text-red-500 mt-1">{errors.businessPhone.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="businessEmail">Business Email (Optional)</FieldLabel>
            <Input
              id="businessEmail"
              type="email"
              placeholder="business@company.com"
              {...register('businessEmail')}
              disabled={isLoading}
            />
            {errors.businessEmail && (
              <p className="text-sm text-red-500 mt-1">{errors.businessEmail.message}</p>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
          <Textarea
            id="description"
            placeholder="Brief description of your business..."
            className="max-h-40"
            {...register('description')}
            disabled={isLoading}
          />

          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        className="w-full hover:cursor-pointer"
        disabled={!isValid || !vatValidated || isLoading || validateVatMutation.isPending}
      >
        {isLoading || validateVatMutation.isPending ? 'Validating...' : 'Next Step'}
      </Button>
    </form>
  )
}
