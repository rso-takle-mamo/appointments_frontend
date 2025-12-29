import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge02Icon, ArrowDown01Icon, Refresh01Icon, CheckmarkCircle02Icon, Alert02Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { europeanCountries, validateVATFormat, getVATFormatExample, getVatNumberLength } from '@/lib/countries'
import { CountryFlag } from './country-flag'
import { cn } from '@/lib/utils'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ScrollArea } from '@/components/ui/scroll-area'

interface VatInputGroupProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  onValidateVAT?: () => void
  isVatValidated?: boolean
  isValidatingVAT?: boolean
  error?: string | null
  onCountryChange?: (countryCode: string) => void
}

export function VatInputGroup({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  onValidateVAT,
  isVatValidated,
  isValidatingVAT,
  error,
  onCountryChange,
}: VatInputGroupProps) {
  const [selectedCountry, setSelectedCountry] = useState(europeanCountries[24])
  const [showFormatError, setShowFormatError] = useState(false)


  const handleVatChange = (vatNumber: string) => {

    const fullVat = selectedCountry.code + vatNumber
    onChange(fullVat)

    if (fullVat.length >= 3) {
      const isValid = validateVATFormat(selectedCountry.code, fullVat)
      setShowFormatError(!isValid)
    } else {
      setShowFormatError(false)
    }
  }

  const handleCountryChange = (country: typeof europeanCountries[0]) => {
    setSelectedCountry(country)
    onCountryChange?.(country.code)

    if (value) {
      const currentVatNumbers = value.substring(2)
      const newVat = country.code + currentVatNumbers
      onChange(newVat)

      const isValid = validateVATFormat(country.code, newVat)
      setShowFormatError(!isValid)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex">
        <InputGroup>
          <InputGroupAddon>
            <DropdownMenu>
              <DropdownMenuTrigger className={"flex"}>
                <div
                  className={cn(
                    'h-full px-2 py-0.5 rounded-sm bg-muted hover:bg-muted/80 cursor-pointer inline-flex items-center',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-disabled={disabled}
                >
                  <CountryFlag countryCode={selectedCountry.code} title={selectedCountry.name} className="h-3.5 mr-2" />
                  <span className="text-sm font-medium">{selectedCountry.code}</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-0" align="start">
                <ScrollArea className="max-h-60">
                  <div className="p-1">
                    {europeanCountries.map((country) => (
                      <DropdownMenuItem
                        key={country.code}
                        onClick={() => handleCountryChange(country)}
                        className="flex items-center gap-2 hover:bg-muted cursor-pointer"
                      >
                        <CountryFlag countryCode={country.code} title={country.name} className="w-6 h-4 mx-1" />
                        <div className="flex-col flex">
                          <span className="font-medium">{country.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {country.code} - {getVATFormatExample(country.code)}
                          </span>
                        </div>
                        {selectedCountry.code === country.code && (
                          <HugeiconsIcon icon={CheckmarkBadge02Icon} className="ml-auto h-4 w-4 text-green-600" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        
        <InputGroupInput
          value={value.substring(2)}
          onChange={(e) => handleVatChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || `Enter VAT number (${getVatNumberLength(selectedCountry.code)} numbers)...`}
          className={cn(
            'rounded-l-none flex-1 ml-1',
            isVatValidated && 'border-green-500 focus-visible:ring-green-500',
            showFormatError && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        </InputGroup>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onValidateVAT}
          disabled={disabled || isValidatingVAT || showFormatError || !value}
          className="ml-2 hover:cursor-pointer"
          title={isVatValidated ? "Refresh company data" : "Validate VAT number"}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            className={cn(
              'h-4 w-4',
              isValidatingVAT && 'animate-spin',
              isVatValidated && 'text-green-600'
            )}
          />
        </Button>
      </div>

      <div className="mt-1">
        {showFormatError && (
          <p className="text-sm text-red-500">
            Invalid VAT format for {selectedCountry.name}, expecting {getVatNumberLength(selectedCountry.code)} numbers
          </p>
        )}
        {error && !showFormatError && (
          <div className='flex gap-1 items-center ml-1'>
            <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        {isVatValidated && !showFormatError && !error && (
          <div className='flex gap-1 items-center ml-1'>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-600">
            VAT number validated successfully
          </p>
          </div>
        )}
      </div>
    </div>
  )
}