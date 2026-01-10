'use client'

import { useState, useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge02Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { europeanCountries } from '@/lib/countries'
import { CountryFlag } from './country-flag'
import { cn } from '@/lib/utils'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PhoneInputGroupProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  vatCountryCode?: string
}

export function PhoneInputGroup({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  vatCountryCode,
}: PhoneInputGroupProps) {
  const parsePhoneValue = (phoneValue: string | undefined) => {
    if (!phoneValue) {
      return {
        country: europeanCountries.find(c => c.code === 'SI') || europeanCountries[24],
        phoneNumber: '',
      }
    }

    for (const country of europeanCountries) {
      if (phoneValue.startsWith(country.dialCode)) {
        return {
          country,
          phoneNumber: phoneValue.substring(country.dialCode.length),
        }
      }
    }

    return {
      country: europeanCountries.find(c => c.code === 'SI') || europeanCountries[24],
      phoneNumber: phoneValue.replace(/^\+\d+/, '').replace(/\D/g, ''),
    }
  }

  const initial = parsePhoneValue(value)
  const [selectedCountry, setSelectedCountry] = useState(initial.country)
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber)
  const [userManuallyChangedCountry, setUserManuallyChangedCountry] = useState(false)

  useEffect(() => {
    const parsed = parsePhoneValue(value)
    if (value !== undefined && value !== selectedCountry.dialCode + phoneNumber) {
      setSelectedCountry(parsed.country)
      setPhoneNumber(parsed.phoneNumber)
    }
  }, [value])

  useEffect(() => {
    if (vatCountryCode && !phoneNumber && !userManuallyChangedCountry) {
      const matchingCountry = europeanCountries.find(c => c.code === vatCountryCode)
      if (matchingCountry && matchingCountry.code !== selectedCountry.code) {
        setSelectedCountry(matchingCountry)
      }
    }
  }, [vatCountryCode])

  const handlePhoneChange = (newPhoneNumber: string) => {
    const numbersOnly = newPhoneNumber.replace(/\D/g, '')
    setPhoneNumber(numbersOnly)

    if (!numbersOnly) {
      setUserManuallyChangedCountry(false)
    }

    if (numbersOnly) {
      onChange(selectedCountry.dialCode + numbersOnly)
    } else {
      onChange('')
    }
  }

  const handleCountryChange = (country: (typeof europeanCountries)[0]) => {
    setSelectedCountry(country)
    setUserManuallyChangedCountry(true)

    if (phoneNumber) {
      onChange(country.dialCode + phoneNumber)
    } else {
      onChange('')
    }
  }

  return (
    <div className={cn('relative', className)}>
      <InputGroup>
        <InputGroupAddon>
          <DropdownMenu>
            <DropdownMenuTrigger className={'flex'}>
              <div
                className={cn(
                  'h-full px-2 py-0.5 rounded-sm bg-muted hover:bg-muted/80 cursor-pointer inline-flex items-center',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                aria-disabled={disabled}
              >
                <CountryFlag
                  countryCode={selectedCountry.code}
                  title={selectedCountry.name}
                  className="h-3.5 mr-2"
                />
                <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-0" align="start">
              <ScrollArea className="max-h-60">
                <div className="p-1">
                  {europeanCountries.map(country => (
                    <DropdownMenuItem
                      key={country.code}
                      onClick={() => handleCountryChange(country)}
                      className="flex items-center gap-2 hover:bg-muted cursor-pointer"
                    >
                      <CountryFlag
                        countryCode={country.code}
                        title={country.name}
                        className="w-6 h-4 mx-1"
                      />
                      <div className="flex-col flex">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {country.code} - {country.dialCode}
                        </span>
                      </div>
                      {selectedCountry.code === country.code && (
                        <HugeiconsIcon
                          icon={CheckmarkBadge02Icon}
                          className="ml-auto h-4 w-4 text-green-600"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>

        <InputGroupInput
          value={phoneNumber}
          onChange={e => handlePhoneChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || 'Enter phone number...'}
          className={cn('rounded-l-none flex-1 ml-1')}
        />
      </InputGroup>
    </div>
  )
}
