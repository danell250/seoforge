export type SupportedCurrency =
  | "AED"
  | "AUD"
  | "BRL"
  | "CAD"
  | "CHF"
  | "CNY"
  | "DKK"
  | "EGP"
  | "EUR"
  | "GBP"
  | "HKD"
  | "INR"
  | "JPY"
  | "KES"
  | "MXN"
  | "NGN"
  | "NOK"
  | "NZD"
  | "PLN"
  | "SAR"
  | "SEK"
  | "SGD"
  | "USD"
  | "ZAR";

export interface PricingLocale {
  currency: SupportedCurrency;
  locale: string;
  region: string | null;
}

const DEFAULT_PRICING_LOCALE: PricingLocale = {
  currency: "USD",
  locale: "en-US",
  region: "US",
};

const REGION_TO_CURRENCY: Record<string, SupportedCurrency> = {
  AE: "AED",
  AU: "AUD",
  AT: "EUR",
  BE: "EUR",
  BR: "BRL",
  CA: "CAD",
  CH: "CHF",
  CN: "CNY",
  DE: "EUR",
  DK: "DKK",
  EG: "EGP",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GB: "GBP",
  GR: "EUR",
  HK: "HKD",
  IE: "EUR",
  IN: "INR",
  IT: "EUR",
  JP: "JPY",
  KE: "KES",
  MX: "MXN",
  NG: "NGN",
  NL: "EUR",
  NO: "NOK",
  NZ: "NZD",
  PL: "PLN",
  PT: "EUR",
  SA: "SAR",
  SE: "SEK",
  SG: "SGD",
  US: "USD",
  ZA: "ZAR",
};

function detectRegionFromLocale(locale: string): string | null {
  try {
    const IntlLocale = Intl.Locale;
    if (IntlLocale) {
      return new IntlLocale(locale).maximize().region ?? null;
    }
  } catch {
    // Fall through to regex parsing.
  }

  const match = locale.match(/-([a-z]{2})$/i);
  return match ? match[1].toUpperCase() : null;
}

export function detectPricingLocale(): PricingLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_PRICING_LOCALE;
  }

  const locale = navigator.languages?.[0] || navigator.language || DEFAULT_PRICING_LOCALE.locale;
  const region = detectRegionFromLocale(locale);
  const currency = (region && REGION_TO_CURRENCY[region]) || DEFAULT_PRICING_LOCALE.currency;

  return { currency, locale, region };
}

export function formatLocalPrice(amount: number, pricingLocale: PricingLocale): string {
  return new Intl.NumberFormat(pricingLocale.locale, {
    style: "currency",
    currency: pricingLocale.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
