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

const USD_PER_CURRENCY: Record<SupportedCurrency, number> = {
  AED: 0.27,
  AUD: 0.66,
  BRL: 0.18,
  CAD: 0.73,
  CHF: 1.11,
  CNY: 0.14,
  DKK: 0.15,
  EGP: 0.02,
  EUR: 1.10,
  GBP: 1.28,
  HKD: 0.13,
  INR: 0.012,
  JPY: 0.0065,
  KES: 0.0076,
  MXN: 0.059,
  NGN: 0.00065,
  NOK: 0.093,
  NZD: 0.60,
  PLN: 0.26,
  SAR: 0.27,
  SEK: 0.095,
  SGD: 0.74,
  USD: 1,
  ZAR: 0.054,
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

export function convertFromUsd(amountUsd: number, currency: SupportedCurrency): number {
  return amountUsd * (USD_PER_CURRENCY[currency] ?? USD_PER_CURRENCY[DEFAULT_CURRENCY]);
}

export function buildPricingContext(inputLocale?: string) {
  const resolved = resolvePricingLocale(inputLocale);
  return {
    ...resolved,
    plans: {
      free: convertFromUsd(0, resolved.currency),
      starter: convertFromUsd(1, resolved.currency),
      professional: convertFromUsd(37, resolved.currency),
      agency: convertFromUsd(92, resolved.currency),
    },
  };
}
