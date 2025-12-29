export interface Country {
  code: string
  name: string
  dialCode: string
}

export function getVatNumberLength(countryCode: string): number {
  const format = vatFormats[countryCode]
  if (!format) return 0

  const remaining = format.format.substring(countryCode.length)

  const cleaned = remaining
  return cleaned.length
}

export const europeanCountries: Country[] = [
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { code: 'HR', name: 'Croatia', dialCode: '+385' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'EE', name: 'Estonia', dialCode: '+372' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'HU', name: 'Hungary', dialCode: '+36' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'LV', name: 'Latvia', dialCode: '+371' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { code: 'MT', name: 'Malta', dialCode: '+356' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'RO', name: 'Romania', dialCode: '+40' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
]

// VAT format patterns for different countries
export const vatFormats: Record<string, { pattern: RegExp; format: string }> = {
  AT: { pattern: /^ATU\d{8}$/, format: 'ATU12345678' }, // Austria
  BE: { pattern: /^BE0\d{9}$/, format: 'BE0123456789' }, // Belgium
  BG: { pattern: /^BG\d{9,10}$/, format: 'BG123456789' }, // Bulgaria
  HR: { pattern: /^HR\d{11}$/, format: 'HR12345678901' }, // Croatia
  CY: { pattern: /^CY\d{8}[A-Z]$/, format: 'CY12345678L' }, // Cyprus
  CZ: { pattern: /^CZ\d{8,10}$/, format: 'CZ123456789' }, // Czech Republic
  DK: { pattern: /^DK\d{8}$/, format: 'DK12345678' }, // Denmark
  EE: { pattern: /^EE\d{9}$/, format: 'EE123456789' }, // Estonia
  FI: { pattern: /^FI\d{8}$/, format: 'FI12345678' }, // Finland
  FR: { pattern: /^FR[A-Z0-9]{2}\d{9}$/, format: 'FRAB123456789' }, // France
  DE: { pattern: /^DE\d{9}$/, format: 'DE123456789' }, // Germany
  GR: { pattern: /^EL\d{9}$/, format: 'EL123456789' }, // Greece (uses EL instead of GR)
  HU: { pattern: /^HU\d{8}$/, format: 'HU12345678' }, // Hungary
  IE: { pattern: /^IE(\d{7}[A-Z]{1,2}|\d[A-Z]\d{5}[A-Z])$/, format: 'IE1234567AB' }, // Ireland
  IT: { pattern: /^IT\d{11}$/, format: 'IT12345678901' }, // Italy
  LV: { pattern: /^LV\d{11}$/, format: 'LV12345678901' }, // Latvia
  LT: { pattern: /^LT\d{9,12}$/, format: 'LT123456789' }, // Lithuania
  LU: { pattern: /^LU\d{8}$/, format: 'LU12345678' }, // Luxembourg
  MT: { pattern: /^MT\d{8}$/, format: 'MT12345678' }, // Malta
  NL: { pattern: /^NL\d{9}B\d{2}$/, format: 'NL123456789B01' }, // Netherlands
  PL: { pattern: /^PL\d{10}$/, format: 'PL1234567890' }, // Poland
  PT: { pattern: /^PT\d{9}$/, format: 'PT123456789' }, // Portugal
  RO: { pattern: /^RO\d{2,10}$/, format: 'RO1234567890' }, // Romania
  SK: { pattern: /^SK\d{10}$/, format: 'SK1234567890' }, // Slovakia
  SI: { pattern: /^SI\d{8}$/, format: 'SI12345678' }, // Slovenia
  ES: { pattern: /^ES([A-Z]\d{7}[A-Z0-9]|\d{8}[A-Z])$/, format: 'ESX12345678Z' }, // Spain
  SE: { pattern: /^SE\d{10}01$/, format: 'SE123456789001' }, // Sweden
  GB: { pattern: /^GB(\d{9}|\d{12})$/, format: 'GB123456789' }, // United Kingdom
}

export function validateVATFormat(countryCode: string, vatNumber: string): boolean {
  const format = vatFormats[countryCode]
  if (!format) return false

  const cleanVat = vatNumber.toUpperCase()
  if (!cleanVat.startsWith(countryCode)) return false

  return format.pattern.test(cleanVat)
}

export function getVATFormatExample(countryCode: string): string {
  const format = vatFormats[countryCode]
  return format ? format.format : 'Invalid country code'
}