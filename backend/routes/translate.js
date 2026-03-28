import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import supabase from '../db/database.js'

dotenv.config()

const router = express.Router()

const KHAYA_API_URL = process.env.GHANANLP_API_URL || 'https://translation-api.ghananlp.org/v1/translate'
const API_KEY = process.env.GHANANLP_API_KEY

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'tw', label: 'Twi', nativeName: 'Twi' },
  { code: 'ee', label: 'Ewe', nativeName: 'Eʋegbe' },
  { code: 'gaa', label: 'Ga', nativeName: 'Gã' },
  { code: 'dag', label: 'Dagbani', nativeName: 'Dagbanli' },
  { code: 'dga', label: 'Dagaare', nativeName: 'Dagaare' },
  { code: 'fat', label: 'Fante', nativeName: 'Fante' },
  { code: 'gur', label: 'Gurene', nativeName: 'Gurene' },
  { code: 'nzi', label: 'Nzema', nativeName: 'Nzema' },
  { code: 'kpo', label: 'Ghanaian Pidgin', nativeName: 'Pidgin' },
  { code: 'yo', label: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ki', label: 'Kikuyu', nativeName: 'Gĩkũyũ' },
]

const VALID_LANG_CODES = new Set(SUPPORTED_LANGUAGES.map(l => l.code))

// Fast in-memory cache (first tier)
const memCache = new Map()
const MAX_MEM_CACHE = 2000

function getCacheKey(sourceLang, targetLang, text) {
  return `${sourceLang}-${targetLang}:${text}`
}

async function getFromCache(sourceLang, targetLang, text) {
  const memKey = getCacheKey(sourceLang, targetLang, text)
  if (memCache.has(memKey)) return memCache.get(memKey)

  try {
    const { data } = await supabase
      .from('translation_cache')
      .select('translated_text')
      .eq('source_lang', sourceLang)
      .eq('target_lang', targetLang)
      .eq('source_text', text)
      .single()

    if (data) {
      if (memCache.size >= MAX_MEM_CACHE) {
        const firstKey = memCache.keys().next().value
        memCache.delete(firstKey)
      }
      memCache.set(memKey, data.translated_text)
      return data.translated_text
    }
  } catch {
    // cache miss
  }
  return null
}

async function saveToCache(sourceLang, targetLang, text, translatedText) {
  const memKey = getCacheKey(sourceLang, targetLang, text)
  if (memCache.size >= MAX_MEM_CACHE) {
    const firstKey = memCache.keys().next().value
    memCache.delete(firstKey)
  }
  memCache.set(memKey, translatedText)

  try {
    await supabase.from('translation_cache').upsert({
      source_lang: sourceLang,
      target_lang: targetLang,
      source_text: text,
      translated_text: translatedText,
    }, { onConflict: 'source_lang,target_lang,source_text' })
  } catch (err) {
    console.error('Cache write error:', err.message)
  }
}

function mockTranslate(text, targetLang) {
  return `[${targetLang.toUpperCase()}] ${text}`
}

async function translateText(text, sourceLang = 'en', targetLang) {
  if (!text || sourceLang === targetLang) return text

  const cached = await getFromCache(sourceLang, targetLang, text)
  if (cached) return cached

  if (!API_KEY) {
    const mocked = mockTranslate(text, targetLang)
    await saveToCache(sourceLang, targetLang, text, mocked)
    return mocked
  }

  try {
    const response = await axios.post(
      KHAYA_API_URL,
      { in: text, lang: `${sourceLang}-${targetLang}` },
      {
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
          'Cache-Control': 'no-cache'
        },
        timeout: 8000
      }
    )

    let translated
    if (typeof response.data === 'string') {
      translated = response.data
    } else if (response.data?.translation) {
      translated = response.data.translation
    } else if (response.data?.out) {
      translated = response.data.out
    } else {
      translated = JSON.stringify(response.data)
    }

    await saveToCache(sourceLang, targetLang, text, translated)
    return translated
  } catch (error) {
    const status = error.response?.status
    const msg = error.response?.data || error.message

    if (status === 401 || status === 403) {
      console.error('Khaya API auth error — check your GHANANLP_API_KEY')
    } else if (status === 429) {
      console.error('Khaya API rate limit exceeded — slow down requests')
    } else {
      console.error(`Khaya API error (${status || 'network'}):`, msg)
    }

    return mockTranslate(text, targetLang)
  }
}

router.get('/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    apiConfigured: !!API_KEY,
  })
})

router.get('/cache-stats', async (req, res) => {
  try {
    const { count } = await supabase
      .from('translation_cache')
      .select('*', { count: 'exact', head: true })

    res.json({
      memoryCache: memCache.size,
      persistentCache: count || 0,
    })
  } catch {
    res.json({ memoryCache: memCache.size, persistentCache: 'error' })
  }
})

router.post('/', async (req, res) => {
  const { text, targetLang, sourceLang = 'en' } = req.body

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' })
  }

  if (!VALID_LANG_CODES.has(targetLang)) {
    return res.status(400).json({
      error: `Unsupported language: ${targetLang}`,
      supported: [...VALID_LANG_CODES],
    })
  }

  try {
    const translatedText = await translateText(text, sourceLang, targetLang)
    res.json({ translatedText, sourceLang, targetLang, apiConfigured: !!API_KEY })
  } catch (err) {
    console.error('Translate error:', err)
    res.json({ translatedText: mockTranslate(text, targetLang), error: 'Translation failed' })
  }
})

router.post('/batch', async (req, res) => {
  const { texts, targetLang, sourceLang = 'en' } = req.body

  if (!Array.isArray(texts) || texts.length === 0 || !targetLang) {
    return res.status(400).json({ error: 'Missing texts array or targetLang' })
  }

  if (texts.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 texts per batch' })
  }

  if (!VALID_LANG_CODES.has(targetLang)) {
    return res.status(400).json({
      error: `Unsupported language: ${targetLang}`,
      supported: [...VALID_LANG_CODES],
    })
  }

  if (sourceLang === targetLang) {
    return res.json({ translations: texts })
  }

  try {
    const translations = await Promise.all(
      texts.map(text => translateText(text, sourceLang, targetLang))
    )
    res.json({
      translations,
      sourceLang,
      targetLang,
      count: translations.length,
      apiConfigured: !!API_KEY,
    })
  } catch (err) {
    console.error('Batch translate error:', err)
    res.json({ translations: texts.map(t => mockTranslate(t, targetLang)), error: 'Batch translation failed' })
  }
})

export default router
