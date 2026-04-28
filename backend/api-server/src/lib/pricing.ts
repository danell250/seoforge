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

const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY: SupportedCurrency = "USD";

const REGION_TO_CURRENCY: Record<string, SupportedCurrency> = {
  AE: "AED",
  AT: "EUR",
  AU: "AUD",
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

const ZAR_PER_CURRENCY: Record<SupportedCurrency, number> = {
  AED: 5.04,
  AUD: 12.22,
  BRL: 3.39,
  CAD: 13.53,
  CHF: 20.5,
  CNY: 2.58,
  DKK: 2.72,
  EGP: 0.37,
  EUR: 20.3,
  GBP: 23.75,
  HKD: 2.36,
  INR: 0.22,
  JPY: 0.12,
  KES: 0.14,
  MXN: 1.09,
  NGN: 0.012,
  NOK: 1.72,
  NZD: 11.18,
  PLN: 4.76,
  SAR: 4.93,
  SEK: 1.75,
  SGD: 13.76,
  USD: 18.5,
  ZAR: 1,
};

function detectRegionFromLocale(locale: string): string | null {
  try {
    return new Intl.Locale(locale).maximize().region ?? null;
  } catch {
    const match = locale.match(/-([a-z]{2})$/i);
    return match ? match[1].toUpperCase() : null;
  }
}

export function resolvePricingLocale(inputLocale?: string) {
  const locale = inputLocale?.trim() || DEFAULT_LOCALE;
  const region = detectRegionFromLocale(locale);
  const currency = (region && REGION_TO_CURRENCY[region]) || DEFAULT_CURRENCY;
  return { currency, locale, region };
}

export function convertFromZar(amountZar: number, currency: SupportedCurrency): number {
  return amountZar / (ZAR_PER_CURRENCY[currency] ?? ZAR_PER_CURRENCY[DEFAULT_CURRENCY]);
}

export function buildPricingContext(inputLocale?: string) {
  const resolved = resolvePricingLocale(inputLocale);
  return {
    ...resolved,
    plans: {
      free: convertFromZar(0, resolved.currency),
      starter: convertFromZar(299, resolved.currency),
      agency: convertFromZar(999, resolved.currency),
    },
  };
}
