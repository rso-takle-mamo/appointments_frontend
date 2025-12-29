import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SignupProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabel: string
  className?: string
  leftAction?: ReactNode
}

export function SignupProgressIndicator({
  currentStep,
  totalSteps,
  stepLabel,
  className,
  leftAction,
}: SignupProgressIndicatorProps) {
  if (leftAction) {
    return (
      <div className={cn('flex items-center justify-between py-4', className)}>
        <div className="flex items-center">
          {leftAction}
        </div>
        <span className="text-sm text-muted-foreground">
          {currentStep}/{totalSteps} ({stepLabel})
        </span>
        <div className="w-32" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center py-4', className)}>
      <span className="text-sm text-muted-foreground">
        {currentStep}/{totalSteps} ({stepLabel})
      </span>
    </div>
  )
}