export type AfricanLanguage = 
  | "af"      // Afrikaans
  | "zu"      // Zulu (isiZulu)
  | "xh"      // Xhosa (isiXhosa) 
  | "pcm"     // Nigerian Pidgin
  | "sw"      // Swahili (Kiswahili)
  | "en";     // English (default)

// Generate hreflang tags for African markets
export function generateAfricanHreflang(
  baseUrl: string, 
  supportedLanguages: AfricanLanguage[]
): { hreflang: string; href: string }[] {
  const tags: { hreflang: string; href: string }[] = [];
  
  for (const lang of supportedLanguages) {
    if (lang === "en") {
      tags.push({ hreflang: "en", href: baseUrl });
      tags.push({ hreflang: "x-default", href: baseUrl });
    } else {
      tags.push({ hreflang: lang, href: `${baseUrl}?lang=${lang}` });
    }
  }
  
  return tags;
}

// Default supported languages for South African multilingual site
export const DEFAULT_SUPPORTED_LANGUAGES: AfricanLanguage[] = ["en", "af", "zu", "xh"];
