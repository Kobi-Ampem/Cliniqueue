import { createContext, useContext, useState, useCallback } from 'react'
import api from '../lib/api'

const LanguageContext = createContext(null)

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇭' },
  { code: 'tw', label: 'Twi', flag: '🌍' },
  { code: 'ee', label: 'Ewe', flag: '🌍' },
  { code: 'gaa', label: 'Ga', flag: '🌍' },
]

// Cache for translated content to avoid repeated API calls
const translationCache = new Map()

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState('en')
  const [translating, setTranslating] = useState(false)

  const translate = useCallback(async (text, targetLang) => {
    if (!text || targetLang === 'en') return text

    const cacheKey = `${targetLang}:${text}`
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)
    }

    try {
      const response = await api.post('/api/translate', {
        text,
        targetLang,
      }, { timeout: 8000 })

      const translated = response.data.translatedText || text
      translationCache.set(cacheKey, translated)
      return translated
    } catch (err) {
      console.warn('Translation failed, using English:', err.message)
      return text
    }
  }, [])

  const translateBatch = useCallback(async (texts, targetLang) => {
    if (targetLang === 'en') return texts
    setTranslating(true)
    try {
      const results = await Promise.all(texts.map(t => translate(t, targetLang)))
      return results
    } finally {
      setTranslating(false)
    }
  }, [translate])

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang, translate, translateBatch, translating }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
