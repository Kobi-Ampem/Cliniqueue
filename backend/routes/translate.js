import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

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

// Server-side translation cache
const cache = new Map()
const MAX_CACHE_SIZE = 1000

function getCacheKey(text, sourceLang, targetLang) {
  return `${sourceLang}-${targetLang}:${text}`
}

function addToCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  cache.set(key, value)
}

function mockTranslate(text, targetLang) {
  return `[${targetLang.toUpperCase()}] ${text}`
}

async function translateText(text, sourceLang = 'en', targetLang) {
  if (!text || sourceLang === targetLang) return text

  const cacheKey = getCacheKey(text, sourceLang, targetLang)
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  if (!API_KEY) {
    const mocked = mockTranslate(text, targetLang)
    addToCache(cacheKey, mocked)
    return mocked
  }

  try {
    const langPair = `${sourceLang}-${targetLang}`

    const response = await axios.post(
      KHAYA_API_URL,
      { in: text, lang: langPair },
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

    addToCache(cacheKey, translated)
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

// GET /api/translate/languages — list supported languages
router.get('/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    apiConfigured: !!API_KEY,
  })
})

// POST /api/translate — single text translation
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
    res.json({
      translatedText,
      sourceLang,
      targetLang,
      cached: cache.has(getCacheKey(text, sourceLang, targetLang)),
      apiConfigured: !!API_KEY,
    })
  } catch (err) {
    console.error('Translate error:', err)
    res.json({ translatedText: mockTranslate(text, targetLang), error: 'Translation failed' })
  }
})

// POST /api/translate/batch — translate multiple texts at once
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
