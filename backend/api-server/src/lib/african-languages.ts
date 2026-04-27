// African Language Support for SEODomination
// Comprehensive support for Afrikaans, Zulu/Xhosa, Nigerian Pidgin, and Swahili

export type AfricanLanguage = 
  | "af"      // Afrikaans
  | "zu"      // Zulu (isiZulu)
  | "xh"      // Xhosa (isiXhosa) 
  | "pcm"     // Nigerian Pidgin
  | "sw"      // Swahili (Kiswahili)
  | "en";     // English (default)

export interface AfricanLanguageConfig {
  code: AfricanLanguage;
  name: string;
  nativeName: string;
  region: string;
  speakers: string;
  searchBehavior: {
    queryPatterns: string[];
    voiceSearchPrevalence: "high" | "medium" | "low";
    mobileFirst: boolean;
    localIntent: "high" | "medium" | "low";
  };
  seoGuidance: {
    titleLength: { min: number; max: number; recommendation: string };
    descriptionLength: { min: number; max: number; recommendation: string };
    contentStructure: string[];
    schemaRecommendations: string[];
    keywordStrategy: string;
  };
  aeoGuidance: {
    questionPatterns: string[];
    answerFormat: string;
    voiceOptimization: string[];
  };
}

export const AFRICAN_LANGUAGES: Record<AfricanLanguage, AfricanLanguageConfig> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    region: "Global / Africa",
    speakers: "1.5B+ globally",
    searchBehavior: {
      queryPatterns: ["how to", "best", "near me", "vs", "price"],
      voiceSearchPrevalence: "medium",
      mobileFirst: true,
      localIntent: "medium",
    },
    seoGuidance: {
      titleLength: { min: 30, max: 60, recommendation: "50-60 characters optimal" },
      descriptionLength: { min: 120, max: 160, recommendation: "150-160 characters optimal" },
      contentStructure: ["H1 with primary keyword", "H2 for sections", "H3 for subsections", "Bullet points for scanability"],
      schemaRecommendations: ["Organization", "WebSite", "WebPage", "Article", "FAQPage"],
      keywordStrategy: "Primary keyword in first 100 words, semantic variations throughout",
    },
    aeoGuidance: {
      questionPatterns: ["What is", "How to", "Why does", "When should", "Where can"],
      answerFormat: "Direct answer in 40-60 words, followed by detailed explanation",
      voiceOptimization: ["Conversational tone", "Question-based headers", "Featured snippet targeting"],
    },
  },

  af: {
    code: "af",
    name: "Afrikaans",
    nativeName: "Afrikaans",
    region: "South Africa, Namibia",
    speakers: "7.2 million native",
    searchBehavior: {
      queryPatterns: ["hoe om", "beste", "naby my", "waar kan ek", "wat is die"],
      voiceSearchPrevalence: "high",
      mobileFirst: true,
      localIntent: "high",
    },
    seoGuidance: {
      titleLength: { min: 30, max: 60, recommendation: "Afrikaans titles: 50-55 characters (compound words are longer)" },
      descriptionLength: { min: 120, max: 160, recommendation: "140-155 characters (descriptive language needs space)" },
      contentStructure: [
        "H1 with primary keyword + location when applicable",
        "H2 with action-oriented language ('Hoe om...', 'Wat is...')",
        "H3 for detailed subsections",
        "Bullet points with clear Afrikaans terminology",
        "Address local South African context explicitly"
      ],
      schemaRecommendations: [
        "Organization with South African address",
        "LocalBusiness for SA-based services",
        "WebPage with Afrikaans language tag",
        "FAQPage (Afrikaans users rely heavily on FAQ)"
      ],
      keywordStrategy: "Afrikaans users often mix English/Afrikaans in search - optimize for both. Use compound words naturally. Target local SA terms.",
    },
    aeoGuidance: {
      questionPatterns: ["Wat is", "Hoe om", "Hoekom", "Wanneer moet", "Waar kan ek"],
      answerFormat: "Direct answer first (30-50 words), followed by SA-specific context and examples",
      voiceOptimization: [
        "Conversational Afrikaans tone - formal but accessible",
        "Question headers in natural speech patterns",
        "Target 'Hoe om...' queries (very common in Afrikaans voice search)",
        "Include local place names and SA terminology"
      ],
    },
  },

  zu: {
    code: "zu",
    name: "Zulu",
    nativeName: "isiZulu",
    region: "South Africa (KwaZulu-Natal dominant)",
    speakers: "12 million native",
    searchBehavior: {
      queryPatterns: ["kanjani", "okuhle kakhulu", "eduze kwami", "yini", "kuphi"],
      voiceSearchPrevalence: "high",
      mobileFirst: true,
      localIntent: "high",
    },
    seoGuidance: {
      titleLength: { min: 25, max: 55, recommendation: "Shorter titles: 40-50 characters (isiZulu phrases are descriptive)" },
      descriptionLength: { min: 100, max: 150, recommendation: "120-140 characters - focus on clear value proposition" },
      contentStructure: [
        "H1 with key concept + Zulu context",
        "H2 using participial constructions (verbs as descriptors)",
        "H3 for specific aspects",
        "Numbered lists for step-by-step (Zulu users prefer sequential info)",
        "Cultural context sections"
      ],
      schemaRecommendations: [
        "WebPage with isiZulu language tag",
        "Organization serving Zulu-speaking communities",
        "LocalBusiness for KZN region",
        "HowTo schema for instructional content"
      ],
      keywordStrategy: "isiZulu search mixes with English ('how to' + isiZulu term). Optimize for code-switching patterns. Include clan/region-specific terms for KZN.",
    },
    aeoGuidance: {
      questionPatterns: ["Yini", "Kanjani", "Kungani", "Nini", "Kuphi"],
      answerFormat: "Answer with context first (Zulu communication style), then specific details. 40-60 words.",
      voiceOptimization: [
        "Respectful, community-oriented tone",
        "Use inclusive language ('thina', 'sonke')",
        "Structure for 'kanjani' (how) questions - very common",
        "Include audio/video content markers (Zulu users prefer rich media)"
      ],
    },
  },

  xh: {
    code: "xh",
    name: "Xhosa",
    nativeName: "isiXhosa",
    region: "South Africa (Eastern Cape dominant)",
    speakers: "8.2 million native",
    searchBehavior: {
      queryPatterns: ["njani", "eyona intle", "kufuphi kwam", "yintoni", "phi na"],
      voiceSearchPrevalence: "high",
      mobileFirst: true,
      localIntent: "high",
    },
    seoGuidance: {
      titleLength: { min: 25, max: 55, recommendation: "40-50 characters (click sounds in URLs need encoding consideration)" },
      descriptionLength: { min: 100, max: 150, recommendation: "120-140 characters with clear Eastern Cape context when relevant" },
      contentStructure: [
        "H1 with key noun class prefix (i-, ama-, etc.)",
        "H2 using concordial agreements",
        "H3 for detailed breakdowns",
        "Visual content heavily emphasized",
        "Community and Ubuntu references"
      ],
      schemaRecommendations: [
        "WebPage with isiXhosa language tag",
        "LocalBusiness for Eastern Cape",
        "Organization with Xhosa community focus",
        "VideoObject schema (Xhosa users engage heavily with video)"
      ],
      keywordStrategy: "isiXhosa search often code-switches with English. Target Eastern Cape specific terms. Noun class agreement is critical for relevance.",
    },
    aeoGuidance: {
      questionPatterns: ["Yintoni", "Njani", "Kutheni", "Nini na", "Phi na"],
      answerFormat: "Community-contextual answer first, then specifics. Honor Ubuntu (community) values in responses.",
      voiceOptimization: [
        "Community-centered language",
        "Click sound considerations for voice search (natural speech patterns)",
        "Target 'njani' questions",
        "Reference Eastern Cape locations and cultural touchpoints"
      ],
    },
  },

  pcm: {
    code: "pcm",
    name: "Nigerian Pidgin",
    nativeName: "Naija Pidgin",
    region: "Nigeria, Cameroon, Ghana",
    speakers: "75 million+",
    searchBehavior: {
      queryPatterns: ["how e dey work", "best one", "near me", "wetin be", "where i fit"],
      voiceSearchPrevalence: "high",
      mobileFirst: true,
      localIntent: "high",
    },
    seoGuidance: {
      titleLength: { min: 30, max: 60, recommendation: "50-60 characters - conversational, slang-aware" },
      descriptionLength: { min: 120, max: 160, recommendation: "140-160 characters with Naija flavor" },
      contentStructure: [
        "H1 with direct, simple language",
        "H2 with 'How' and 'Wetin' questions",
        "H3 for details",
        "Bullet points (Pidgin readers scan heavily)",
        "Nigerian context throughout"
      ],
      schemaRecommendations: [
        "WebPage with Pidgin indication (use 'pcm' or note in description)",
        "Organization with Nigerian operations",
        "LocalBusiness for Nigeria-specific",
        "FAQPage (Pidgin users rely on community Q&A patterns)"
      ],
      keywordStrategy: "Mix standard English with Pidgin terms. Target 'how e dey work', 'wetin be', 'where i fit' patterns. Slang and contemporary Naija terms critical.",
    },
    aeoGuidance: {
      questionPatterns: ["Wetin be", "How e dey work", "Why e be say", "When person fit", "Where i fit find"],
      answerFormat: "Direct street-smart answer, 30-50 words, then detailed breakdown with Nigerian context",
      voiceOptimization: [
        "Conversational, street-level tone",
        "Use Naija expressions naturally",
        "Target voice search patterns - Pidgin is HEAVILY voice-searched",
        "Include Nigerian Pidgin audio markers"
      ],
    },
  },

  sw: {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    region: "East Africa (Kenya, Tanzania, Uganda, Rwanda, Burundi, DRC)",
    speakers: "200 million+",
    searchBehavior: {
      queryPatterns: ["jinsi ya", "bora zaidi", "karibu nami", "nini", "wapi", "vipi"],
      voiceSearchPrevalence: "high",
      mobileFirst: true,
      localIntent: "high",
    },
    seoGuidance: {
      titleLength: { min: 30, max: 60, recommendation: "50-60 characters - Swahili compounds are efficient" },
      descriptionLength: { min: 120, max: 160, recommendation: "145-160 characters - Swahili descriptions are highly actionable" },
      contentStructure: [
        "H1 with m-/wa- or ki-/vi- noun class when applicable",
        "H2 with 'Jinsi ya' (how to) patterns",
        "H3 for specific steps",
        "Numbered steps (Swahili learners prefer structure)",
        "East African context markers"
      ],
      schemaRecommendations: [
        "WebPage with Kiswahili language tag",
        "Organization with East African presence",
        "LocalBusiness for Kenya/Tanzania/Uganda",
        "HowTo schema (very effective for Swahili content)"
      ],
      keywordStrategy: "Target 'jinsi ya' queries (dominant pattern). Optimize for both native speakers and learners. Include Arabic loanwords where appropriate. Pan-African East African terms.",
    },
    aeoGuidance: {
      questionPatterns: ["Nini", "Jinsi ya", "Kwa nini", "Lini", "Wapi", "Vipi"],
      answerFormat: "Polite, inclusive answer with East African context. 40-60 words. Use 'tafadhali' and 'karibu' hospitality markers where appropriate.",
      voiceOptimization: [
        "Warm, hospitable tone (Swahili culture values hospitality)",
        "Target 'jinsi ya' (how to) - massive search volume",
        "Structure for Arabic-influenced speech patterns",
        "East African location references"
      ],
    },
  },
};

// Get language configuration
export function getAfricanLanguageConfig(lang: AfricanLanguage): AfricanLanguageConfig {
  return AFRICAN_LANGUAGES[lang] ?? AFRICAN_LANGUAGES.en;
}

// Detect if content might be in an African language
export function detectAfricanLanguageContent(html: string): AfricanLanguage {
  const text = html.toLowerCase();
  
  // Afrikaans markers
  if (/\b(die|het|van|vir|wat|hoe|waar|hoekom)\b/.test(text) && 
      /\b(die|en|van|te|wat)\b/.test(text)) {
    return "af";
  }
  
  // Zulu markers
  if (/\b(ukuthi|kanjani|yini|kuphi|ukuba|ngoba)\b/.test(text) ||
      /\b(yebo|cha|sawubona|unjani)\b/.test(text)) {
    return "zu";
  }
  
  // Xhosa markers  
  if (/\b(yintoni|njani|kutheni|phi|apha|khona)\b/.test(text) ||
      /\b(molo|unjani|enkosi|tata|mama)\b/.test(text)) {
    return "xh";
  }
  
  // Nigerian Pidgin markers
  if (/\b(wetin|how e dey|i dey|you dey|where i fit|wan go)\b/.test(text) ||
      /\b(sabi|pikin|tok|dey work|nyam)\b/.test(text)) {
    return "pcm";
  }
  
  // Swahili markers
  if (/\b(jinsi ya|nini|wapi|lini|vipi|karibu|tafadhali)\b/.test(text) ||
      /\b(habari|asante|sawa|hakuna|matata)\b/.test(text)) {
    return "sw";
  }
  
  return "en";
}

// Generate hreflang tags for African markets
export function generateAfricanHreflang(
  baseUrl: string, 
  supportedLanguages: AfricanLanguage[]
): string {
  const tags: string[] = [];
  
  for (const lang of supportedLanguages) {
    if (lang === "en") {
      tags.push(`<link rel="alternate" hreflang="en" href="${baseUrl}" />`);
      tags.push(`<link rel="alternate" hreflang="x-default" href="${baseUrl}" />`);
    } else {
      tags.push(`<link rel="alternate" hreflang="${lang}" href="${baseUrl}?lang=${lang}" />`);
    }
  }
  
  return tags.join("\n");
}

// Generate language-specific schema guidance
export function generateLanguageSpecificSchemaGuidance(lang: AfricanLanguage): string {
  const config = getAfricanLanguageConfig(lang);
  
  return `
Language: ${config.name} (${config.nativeName})
Region: ${config.region}
Search Behavior: Mobile-first, ${config.searchBehavior.voiceSearchPrevalence} voice search usage, ${config.searchBehavior.localIntent} local intent

SEO Structure Requirements:
${config.seoGuidance.contentStructure.map(s => `- ${s}`).join("\n")}

Schema Recommendations:
${config.seoGuidance.schemaRecommendations.map(s => `- ${s}`).join("\n")}

AEO Optimization:
- Target question patterns: ${config.aeoGuidance.questionPatterns.join(", ")}
- Answer format: ${config.aeoGuidance.answerFormat}
- Voice optimization: ${config.aeoGuidance.voiceOptimization.join("; ")}
`;
}

// Generate optimization prompt enhancement for African languages
export function generateAfricanLanguagePrompt(
  detectedLang: AfricanLanguage,
  targetLang?: AfricanLanguage
): string {
  const lang = targetLang ?? detectedLang;
  const config = getAfricanLanguageConfig(lang);
  
  if (lang === "en") {
    return "";
  }
  
  return `

=== AFRICAN LANGUAGE OPTIMIZATION: ${config.name.toUpperCase()} ===

This content is being optimized for ${config.name} (${config.nativeName}) speakers in ${config.region}.

CRITICAL REQUIREMENTS:
1. Language Code: Use "${lang}" in all language attributes and hreflang tags
2. Title Length: ${config.seoGuidance.titleLength.recommendation}
3. Description: ${config.seoGuidance.descriptionLength.recommendation}

CONTENT STRUCTURE:
${config.seoGuidance.contentStructure.join("\n")}

REQUIRED SCHEMA:
${config.seoGuidance.schemaRecommendations.join("\n")}

AEO OPTIMIZATION FOR ${config.name.toUpperCase()}:
- Voice search is ${config.searchBehavior.voiceSearchPrevalence} in this market
- Target questions: ${config.aeoGuidance.questionPatterns.slice(0, 3).join(", ")}
- Answer format: ${config.aeoGuidance.answerFormat}
- ${config.aeoGuidance.voiceOptimization[0]}

KEYWORD STRATEGY:
${config.seoGuidance.keywordStrategy}

LOCAL CONTEXT:
Region: ${config.region}
Primary search device: Mobile
Local intent: ${config.searchBehavior.localIntent}
`;
}
