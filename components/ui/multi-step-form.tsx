'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface StepConfig {
  id: string
  title: string
  description?: string
  content: React.ReactNode | ((props: StepContentProps) => React.ReactNode)
  validate?: () => boolean | Promise<boolean>
}

interface MultiStepFormProps {
  steps: StepConfig[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  className?: string
  showStepNumbers?: boolean
  showStepDescriptions?: boolean
  nextButtonText?: string
  previousButtonText?: string
  submitButtonText?: string
  isLoading?: boolean
}

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  className,
  showStepNumbers = true,
  showStepDescriptions = false,
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  submitButtonText = 'Submit',
  isLoading = false,
  ...props
}: MultiStepFormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const currentStepConfig = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const updateFormData = React.useCallback((newData: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }, [])

  const handleNext = async () => {
    // Validate current step if validation function exists
    if (currentStepConfig.validate) {
      const isValid = await currentStepConfig.validate()
      if (!isValid) {
        return
      }
    }

    if (isLastStep && onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(formData)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      onStepChange(step)
    }
  }

  return (
    <div className={cn('w-full space-y-6', className)} {...props}>
      {/* Step Indicator */}
      <div className="space-y-4">
        {/* Progress Bar with Steps */}
        <div className="relative pl-2 pr-6">
          {/* Background line */}
          <div className="absolute top-5 left-16 right-16 h-0.5 bg-muted">
            {/*  <div className="absolute top-5 left- right-8 sm:right-16 lg:right-24 h-0.5 bg-muted"></div> */}
            {/* Progress line */}
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isActive = index === currentStep
              const isAccessible = index === 0 || index <= currentStep

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={!isAccessible}
                    className={cn(
                      'relative z-10 w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isActive &&
                        'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110',
                      !isCompleted &&
                        !isActive &&
                        'bg-background border-2 border-muted hover:border-primary/50',
                      isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {showStepNumbers ? (
                      <span>{index + 1}</span>
                    ) : (
                      isCompleted && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )
                    )}
                  </button>

                  {/* Step Title */}
                  <div className="mt-3 text-center max-w-[100px]">
                    <div
                      className={cn(
                        'text-xs font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </div>
                    {showStepDescriptions && step.description && (
                      <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div>
        {typeof currentStepConfig.content === 'function'
          ? (currentStepConfig.content as (props: StepContentProps) => React.ReactNode)({
              formData,
              updateFormData,
            })
          : currentStepConfig.content}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading || isSubmitting}
        >
          {previousButtonText}
        </Button>

        <Button type="button" onClick={handleNext} disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>{isLastStep ? 'Submitting...' : 'Loading...'}</span>
            </div>
          ) : isLastStep ? (
            submitButtonText
          ) : (
            nextButtonText
          )}
        </Button>
      </div>
    </div>
  )
}

// Helper component for step content that can access formData
export interface StepContentProps {
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void
}

export function StepContent({
  children,
  formData,
  updateFormData,
}: {
  children: (props: StepContentProps) => React.ReactNode
} & StepContentProps) {
  return <>{children({ formData, updateFormData })}</>
}
