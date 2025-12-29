'use client'
import { UnifiedSignupForm } from "@/components/features/auth/signup/unified-signup-form"

export default function RegisterProviderPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-accent">
            <UnifiedSignupForm type="provider" />
        </div>
    )
}