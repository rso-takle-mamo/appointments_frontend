import * as Flags from 'country-flag-icons/react/3x2'

type FlagComponent = typeof Flags.US

const flagComponents: Record<string, FlagComponent> = {
  AT: Flags.AT, // Austria
  BE: Flags.BE, // Belgium
  BG: Flags.BG, // Bulgaria
  HR: Flags.HR, // Croatia
  CY: Flags.CY, // Cyprus
  CZ: Flags.CZ, // Czech Republic
  DK: Flags.DK, // Denmark
  EE: Flags.EE, // Estonia
  FI: Flags.FI, // Finland
  FR: Flags.FR, // France
  DE: Flags.DE, // Germany
  GR: Flags.GR, // Greece
  HU: Flags.HU, // Hungary
  IE: Flags.IE, // Ireland
  IT: Flags.IT, // Italy
  LV: Flags.LV, // Latvia
  LT: Flags.LT, // Lithuania
  LU: Flags.LU, // Luxembourg
  MT: Flags.MT, // Malta
  NL: Flags.NL, // Netherlands
  PL: Flags.PL, // Poland
  PT: Flags.PT, // Portugal
  RO: Flags.RO, // Romania
  SK: Flags.SK, // Slovakia
  SI: Flags.SI, // Slovenia
  ES: Flags.ES, // Spain
  SE: Flags.SE, // Sweden
  GB: Flags.GB, // United Kingdom
}

interface CountryFlagProps {
  countryCode: string
  title?: string
  className?: string
}

export function CountryFlag({ countryCode, title, className }: CountryFlagProps) {
  const FlagComponent = flagComponents[countryCode]

  if (!FlagComponent) {
    return (
      <span className={className} title={title || countryCode}>
        🏳️
      </span>
    )
  }

  return <FlagComponent title={title} className={className} />
}
