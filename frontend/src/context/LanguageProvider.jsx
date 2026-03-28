import { useCallback, useMemo, useRef, useState } from 'react'
import { LanguageContext } from './languageContext.js'
import { SUPPORTED_LANGS, translateText } from '../services/translate.js'

const STORAGE_KEY = 'cliniklan_lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const s = sessionStorage.getItem(STORAGE_KEY)
      if (s && SUPPORTED_LANGS.some((l) => l.code === s)) return s
    } catch {
      /* ignore */
    }
    return 'en'
  })

  const memoryCache = useRef(new Map())
  const [translationWarning, setTranslationWarning] = useState(null)

  const setLang = useCallback((code) => {
    setLangState(code)
    try {
      sessionStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
    setTranslationWarning(null)
  }, [])

  const translate = useCallback(
    async (text, signal) => {
      const r = await translateText(text, lang, {
        signal,
        memoryCache: memoryCache.current,
      })
      if (lang !== 'en' && !r.ok) {
        setTranslationWarning('unavailable')
      }
      return r.text
    },
    [lang],
  )

  const translateAll = useCallback(
    async (strings, signal) => {
      if (lang === 'en') return strings.map((s) => s)
      const out = []
      for (const s of strings) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
        out.push(await translate(s, signal))
      }
      return out
    },
    [lang, translate],
  )

  const value = useMemo(
    () => ({
      lang,
      setLang,
      translate,
      translateAll,
      langs: SUPPORTED_LANGS,
      translationWarning,
      clearTranslationWarning: () => setTranslationWarning(null),
    }),
    [lang, setLang, translate, translateAll, translationWarning],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
