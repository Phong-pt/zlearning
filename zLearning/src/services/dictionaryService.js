/**
 * Dictionary Service - Enhanced Version
 * 
 * Integrates with multiple dictionary APIs:
 * - Free Dictionary API (English): https://dictionaryapi.dev/
 * - Wiktionary API (Multi-language): for Russian, Chinese, etc.
 * - MyMemory Translation API (Multi-language): https://mymemory.translated.net/
 * 
 * Improvements:
 * - Better phonetic extraction for derived words
 * - Smart definition summarization
 * - Russian word type detection via Wiktionary
 * - AI summarization support (optional)
 */

// Word type colors mapping
export const WORD_TYPE_COLORS = {
  noun: { bg: '#1e40af', text: '#93c5fd', label: 'Noun' },
  verb: { bg: '#dc2626', text: '#fca5a5', label: 'Verb' },
  adjective: { bg: '#16a34a', text: '#86efac', label: 'Adj' },
  adverb: { bg: '#9333ea', text: '#c4b5fd', label: 'Adv' },
  preposition: { bg: '#ea580c', text: '#fdba74', label: 'Prep' },
  conjunction: { bg: '#0891b2', text: '#67e8f9', label: 'Conj' },
  pronoun: { bg: '#db2777', text: '#f9a8d4', label: 'Pron' },
  interjection: { bg: '#ca8a04', text: '#fde047', label: 'Interj' },
  exclamation: { bg: '#ca8a04', text: '#fde047', label: 'Interj' },
  determiner: { bg: '#6b7280', text: '#d1d5db', label: 'Det' },
  // Russian word types
  'существительное': { bg: '#1e40af', text: '#93c5fd', label: 'Сущ' },
  'глагол': { bg: '#dc2626', text: '#fca5a5', label: 'Гл' },
  'прилагательное': { bg: '#16a34a', text: '#86efac', label: 'Прил' },
  'наречие': { bg: '#9333ea', text: '#c4b5fd', label: 'Нар' },
  unknown: { bg: '#6b7280', text: '#d1d5db', label: '?' },
};

// Language configurations
export const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧', code: 'en', targetLang: 'vi' },
  zh: { name: '中文', flag: '🇨🇳', code: 'zh-CN', targetLang: 'vi' },
  ru: { name: 'Русский', flag: '🇷🇺', code: 'ru', targetLang: 'vi' },
  ja: { name: '日本語', flag: '🇯🇵', code: 'ja', targetLang: 'vi' },
  ko: { name: '한국어', flag: '🇰🇷', code: 'ko', targetLang: 'vi' },
  fr: { name: 'Français', flag: '🇫🇷', code: 'fr', targetLang: 'vi' },
  de: { name: 'Deutsch', flag: '🇩🇪', code: 'de', targetLang: 'vi' },
  es: { name: 'Español', flag: '🇪🇸', code: 'es', targetLang: 'vi' },
};

// AI API Settings (optional - user can configure)
let aiSettings = {
  enabled: false,
  provider: 'gemini', // 'gemini' or 'openai'
  apiKey: '',
};

export function setAISettings(settings) {
  aiSettings = { ...aiSettings, ...settings };
}

export function getAISettings() {
  return { ...aiSettings };
}

/**
 * Smart definition simplifier - makes definitions concise and clear
 * Uses rules-based approach (no AI required)
 */
function simplifyDefinition(definition, maxLength = 100) {
  if (!definition || definition.length <= maxLength) {
    return definition;
  }

  // Remove common filler phrases
  let simplified = definition
    .replace(/^(the act of|the state of|the quality of|the process of|a person who|something that|used to|relating to|pertaining to)\s+/gi, '')
    .replace(/\s+(in a particular way|in some way|to some degree|in general|especially|particularly|specifically)\s*/gi, ' ')
    .replace(/\s*,\s*(especially|particularly|specifically|often|usually|typically)[^,;.]*/gi, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove parenthetical content
    .replace(/\s+/g, ' ')
    .trim();

  // If still too long, take the first meaningful sentence
  if (simplified.length > maxLength) {
    const firstSentence = simplified.split(/[.;]/)[0];
    simplified = firstSentence.length > 10 ? firstSentence : simplified.substring(0, maxLength);
  }

  // Capitalize first letter
  simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);

  return simplified.trim();
}

/**
 * Extract Vietnamese meaning from translation, keeping it concise
 */
function extractVietnameseMeaning(translatedText, maxLength = 80) {
  if (!translatedText) return '';
  
  // Take only the first translation if multiple
  let meaning = translatedText.split(/[;,]/)[0].trim();
  
  // Remove articles and common words at the start
  meaning = meaning
    .replace(/^(cái|sự|việc|hành động|quá trình)\s+/gi, '')
    .trim();

  if (meaning.length > maxLength) {
    meaning = meaning.substring(0, maxLength) + '...';
  }

  return meaning;
}

/**
 * Get phonetic for derived words (like "attractiveness" from "attract")
 * Tries multiple strategies
 */
async function getPhoneticForDerivedWord(word) {
  // Common suffixes and their pronunciation hints
  const suffixPatterns = [
    { suffix: 'ness', ipa: 'nəs' },
    { suffix: 'ment', ipa: 'mənt' },
    { suffix: 'tion', ipa: 'ʃən' },
    { suffix: 'sion', ipa: 'ʒən' },
    { suffix: 'able', ipa: 'əbəl' },
    { suffix: 'ible', ipa: 'əbəl' },
    { suffix: 'ful', ipa: 'fəl' },
    { suffix: 'less', ipa: 'ləs' },
    { suffix: 'ive', ipa: 'ɪv' },
    { suffix: 'ous', ipa: 'əs' },
    { suffix: 'ly', ipa: 'li' },
    { suffix: 'er', ipa: 'ər' },
    { suffix: 'or', ipa: 'ər' },
    { suffix: 'ist', ipa: 'ɪst' },
    { suffix: 'ity', ipa: 'ɪti' },
  ];

  const lowerWord = word.toLowerCase();

  // Try to find base word and build phonetic
  for (const { suffix, ipa } of suffixPatterns) {
    if (lowerWord.endsWith(suffix)) {
      const baseWord = lowerWord.slice(0, -suffix.length);
      
      // Try common base word variations
      const variations = [
        baseWord,
        baseWord + 'e', // attractive -> attract + e
        baseWord.replace(/([^aeiou])$/, '$1$1'), // running -> run + n
      ];

      for (const variation of variations) {
        if (variation.length >= 3) {
          const baseResult = await fetchFromFreeDictionary(variation);
          if (baseResult && baseResult.ipa) {
            // Combine base phonetic with suffix
            const baseIpa = baseResult.ipa.replace(/^\/|\/$/g, '');
            return `/${baseIpa}${ipa}/`;
          }
        }
      }
    }
  }

  return '';
}

/**
 * Fetch word from Free Dictionary API (English only)
 * Enhanced with better phonetic extraction
 * https://dictionaryapi.dev/
 */
async function fetchFromFreeDictionary(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const entry = data[0];
    
    if (!entry) return null;

    // Enhanced phonetic extraction - try multiple sources
    let phonetic = '';
    if (entry.phonetic) {
      phonetic = entry.phonetic;
    } else if (entry.phonetics && entry.phonetics.length > 0) {
      // Prefer phonetics with audio (more reliable)
      const phoneticWithAudio = entry.phonetics.find(p => p.audio && p.text);
      const phoneticWithText = entry.phonetics.find(p => p.text);
      phonetic = phoneticWithAudio?.text || phoneticWithText?.text || '';
    }

    // Get ALL meanings grouped by part of speech
    const meanings = entry.meanings || [];
    const meaningsByType = meanings.map(meaning => {
      const partOfSpeech = meaning.partOfSpeech?.toLowerCase() || 'unknown';
      const definitions = meaning.definitions || [];
      
      // Get up to 2 definitions for this part of speech (reduced from 3)
      const definitionTexts = definitions
        .slice(0, 2)
        .map(d => simplifyDefinition(d.definition, 120));
      
      const example = definitions.find(d => d.example)?.example || '';
      
      return {
        type: partOfSpeech,
        definitions: definitionTexts,
        definitionText: definitionTexts.join('; '),
        example: example,
      };
    });

    return {
      word: entry.word,
      ipa: phonetic,
      meaningsByType: meaningsByType,
      language: 'en',
      raw: entry,
    };
  } catch (error) {
    console.error('Free Dictionary API error:', error);
    return null;
  }
}

/**
 * Fetch from Wiktionary API - better for Russian and other languages
 */
async function fetchFromWiktionary(word, langCode) {
  try {
    // Wiktionary language codes
    const wiktLangMap = {
      'ru': 'ru',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'de': 'de',
      'fr': 'fr',
      'es': 'es',
    };

    const wiktLang = wiktLangMap[langCode] || langCode;
    
    // Fetch from Wiktionary
    const response = await fetch(
      `https://${wiktLang}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Parse Wiktionary response
    let wordType = 'unknown';
    let definitions = [];
    let ipa = '';

    // Look for definitions in the target language
    const langData = data[wiktLang] || data[Object.keys(data)[0]];
    
    if (langData && Array.isArray(langData)) {
      for (const entry of langData) {
        // Get word type (partOfSpeech)
        if (entry.partOfSpeech) {
          wordType = normalizeWordType(entry.partOfSpeech, langCode);
        }

        // Get definitions
        if (entry.definitions) {
          definitions = entry.definitions
            .slice(0, 3)
            .map(d => {
              // Clean HTML from definition
              const cleanDef = d.definition
                ?.replace(/<[^>]*>/g, '')
                ?.replace(/\s+/g, ' ')
                ?.trim();
              return cleanDef;
            })
            .filter(d => d);
        }
      }
    }

    return {
      word: word,
      type: wordType,
      ipa: ipa,
      definitions: definitions,
      language: langCode,
    };
  } catch (error) {
    console.error('Wiktionary API error:', error);
    return null;
  }
}

/**
 * Normalize word type across different languages
 */
function normalizeWordType(rawType, langCode) {
  const typeLower = rawType.toLowerCase();
  
  // Russian word type mapping
  const ruMapping = {
    'имя существительное': 'noun',
    'существительное': 'noun',
    'глагол': 'verb',
    'имя прилагательное': 'adjective',
    'прилагательное': 'adjective',
    'наречие': 'adverb',
    'предлог': 'preposition',
    'союз': 'conjunction',
    'местоимение': 'pronoun',
    'междометие': 'interjection',
  };

  // English mappings
  const enMapping = {
    'noun': 'noun',
    'verb': 'verb',
    'adjective': 'adjective',
    'adverb': 'adverb',
    'preposition': 'preposition',
    'conjunction': 'conjunction',
    'pronoun': 'pronoun',
    'interjection': 'interjection',
    'exclamation': 'interjection',
  };

  if (langCode === 'ru') {
    return ruMapping[typeLower] || typeLower;
  }

  return enMapping[typeLower] || typeLower || 'unknown';
}

/**
 * Translate text using MyMemory API
 * https://mymemory.translated.net/doc/spec.php
 */
async function translateText(text, fromLang, toLang = 'vi') {
  try {
    const langPair = `${fromLang}|${toLang}`;
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }
    
    return null;
  } catch (error) {
    console.error('Translation API error:', error);
    return null;
  }
}

/**
 * AI-powered definition summarization (optional)
 * Uses Gemini or OpenAI to create concise Vietnamese meanings
 */
async function summarizeWithAI(word, englishDefinition, wordType) {
  if (!aiSettings.enabled || !aiSettings.apiKey) {
    return null;
  }

  const prompt = `Translate and summarize this English definition to Vietnamese in a very concise way (max 15 words). 
Word: "${word}" (${wordType})
English: "${englishDefinition}"
Reply with ONLY the Vietnamese translation, nothing else.`;

  try {
    if (aiSettings.provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${aiSettings.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 50,
            },
          }),
        }
      );

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } else if (aiSettings.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim();
    }
  } catch (error) {
    console.error('AI summarization error:', error);
  }

  return null;
}

/**
 * Lookup English word - uses Free Dictionary API + Translation
 * Returns all meanings by type for user to choose
 */
async function lookupEnglish(word) {
  // First, get word info from Free Dictionary API
  let dictResult = await fetchFromFreeDictionary(word);
  
  if (!dictResult || !dictResult.meaningsByType || dictResult.meaningsByType.length === 0) {
    return null;
  }

  // If no phonetic found, try to derive it from base word
  if (!dictResult.ipa) {
    dictResult.ipa = await getPhoneticForDerivedWord(word);
  }

  // Translate all meanings to Vietnamese
  const meaningsWithTranslation = await Promise.all(
    dictResult.meaningsByType.map(async (m) => {
      let meaningVi = '';
      
      // Try AI summarization first if enabled
      if (aiSettings.enabled && m.definitionText) {
        meaningVi = await summarizeWithAI(word, m.definitionText, m.type);
      }
      
      // Fallback to translation API
      if (!meaningVi && m.definitionText) {
        const translated = await translateText(m.definitionText, 'en', 'vi');
        meaningVi = extractVietnameseMeaning(translated);
      }
      
      return {
        type: m.type,
        meaningEn: m.definitionText,
        meaningVi: meaningVi || m.definitionText,
        example: m.example,
      };
    })
  );

  return {
    word: dictResult.word,
    ipa: dictResult.ipa,
    language: 'en',
    allMeanings: meaningsWithTranslation,
    type: meaningsWithTranslation[0]?.type || 'unknown',
    meaning: meaningsWithTranslation[0]?.meaningVi || '',
    meaningEn: meaningsWithTranslation[0]?.meaningEn || '',
    example: meaningsWithTranslation[0]?.example || '',
  };
}

/**
 * Lookup Russian word - uses Wiktionary + Translation
 * Enhanced with better grammar parsing
 */
async function lookupRussian(word) {
  // Try Wiktionary first for word type and grammar
  const wiktResult = await fetchFromWiktionary(word, 'ru');
  
  // Translate to Vietnamese
  const meaningVi = await translateText(word, 'ru', 'vi');
  
  if (!meaningVi || meaningVi.toLowerCase() === word.toLowerCase()) {
    return null;
  }

  // Build result with grammar info from Wiktionary
  const result = {
    word: word,
    type: wiktResult?.type || 'unknown',
    ipa: wiktResult?.ipa || '',
    meaning: extractVietnameseMeaning(meaningVi),
    meaningRu: wiktResult?.definitions?.[0] || '',
    example: '',
    language: 'ru',
  };

  // If Wiktionary gave us definitions, include them
  if (wiktResult?.definitions?.length > 0) {
    result.allMeanings = wiktResult.definitions.slice(0, 3).map((def, idx) => ({
      type: result.type,
      meaningVi: idx === 0 ? result.meaning : '',
      meaningRu: def,
      example: '',
    }));
  }

  return result;
}

/**
 * Lookup word in other languages - uses Translation API + Wiktionary
 */
async function lookupOtherLanguage(word, langCode) {
  const langConfig = LANGUAGES[langCode];
  if (!langConfig) {
    return null;
  }

  // Special handling for Russian
  if (langCode === 'ru') {
    return await lookupRussian(word);
  }

  try {
    // Try Wiktionary for grammar info
    const wiktResult = await fetchFromWiktionary(word, langCode);
    
    // Translate to Vietnamese
    const meaningVi = await translateText(word, langConfig.code, 'vi');
    
    if (!meaningVi || meaningVi.toLowerCase() === word.toLowerCase()) {
      return null;
    }

    return {
      word: word,
      type: wiktResult?.type || 'unknown',
      ipa: wiktResult?.ipa || '',
      meaning: extractVietnameseMeaning(meaningVi),
      example: '',
      language: langCode,
    };
  } catch (error) {
    console.error(`Lookup error for ${langCode}:`, error);
    return null;
  }
}

/**
 * Main lookup function - automatically chooses the right API based on language
 */
export async function lookupWord(word, language = 'en') {
  if (!word || !word.trim()) {
    return null;
  }

  const cleanWord = word.trim();

  try {
    if (language === 'en') {
      return await lookupEnglish(cleanWord);
    } else {
      return await lookupOtherLanguage(cleanWord, language);
    }
  } catch (error) {
    console.error('Lookup error:', error);
    return null;
  }
}

/**
 * Smart lookup with caching
 */
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function smartLookup(word, language = 'en') {
  const cacheKey = `${language}:${word.toLowerCase()}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch from API
  const result = await lookupWord(word, language);
  
  // Cache result
  if (result) {
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });
  }

  return result;
}

/**
 * Batch lookup multiple words (useful for importing)
 */
export async function batchLookup(words, language = 'en', onProgress) {
  const results = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const result = await smartLookup(word, language);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, words.length, word, result);
    }
    
    // Add small delay to avoid rate limiting
    if (i < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
}

export default {
  lookupWord,
  smartLookup,
  batchLookup,
  translateText,
  setAISettings,
  getAISettings,
  WORD_TYPE_COLORS,
  LANGUAGES,
};
