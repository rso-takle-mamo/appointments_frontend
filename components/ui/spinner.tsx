import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

interface SpinnerProps {
  className?: string
  size?: number
}

function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  // Convert numeric size to Tailwind classes
  const sizeClasses = {
    16: 'w-4 h-4', // 16px = size-4
    20: 'w-5 h-5', // 20px
    24: 'w-6 h-6', // 24px = size-6
    32: 'w-8 h-8', // 32px = size-8
    48: 'w-12 h-12', // 48px = size-12
    64: 'w-16 h-16', // 64px
    80: 'w-20 h-20', // 80px
    96: 'w-24 h-24', // 96px
  }

  // Default to closest size class
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || `w-[${size}px] h-[${size}px]`

  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={2}
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', sizeClass, className)}
      {...props}
    />
  )
}

interface LoadingSpinnerProps {
  text?: string
  className?: string
  size?: number
}

function LoadingSpinner({ text = 'Loading...', className, size = 32 }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Spinner size={size} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export { Spinner, LoadingSpinner }
