import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import db from '../db/database.js'

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

// --- Two-tier cache: fast in-memory Map + persistent SQLite ---

const memCache = new Map()
const MAX_MEM_CACHE = 2000

const dbGet = db.prepare(
  'SELECT translatedText FROM translation_cache WHERE sourceLang = ? AND targetLang = ? AND sourceText = ?'
)
const dbInsert = db.prepare(
  'INSERT OR REPLACE INTO translation_cache (sourceLang, targetLang, sourceText, translatedText) VALUES (?, ?, ?, ?)'
)

function getCacheKey(sourceLang, targetLang, text) {
  return `${sourceLang}-${targetLang}:${text}`
}

function getFromCache(sourceLang, targetLang, text) {
  const memKey = getCacheKey(sourceLang, targetLang, text)
  if (memCache.has(memKey)) return memCache.get(memKey)

  const row = dbGet.get(sourceLang, targetLang, text)
  if (row) {
    if (memCache.size >= MAX_MEM_CACHE) {
      const firstKey = memCache.keys().next().value
      memCache.delete(firstKey)
    }
    memCache.set(memKey, row.translatedText)
    return row.translatedText
  }
  return null
}

function saveToCache(sourceLang, targetLang, text, translatedText) {
  const memKey = getCacheKey(sourceLang, targetLang, text)
  if (memCache.size >= MAX_MEM_CACHE) {
    const firstKey = memCache.keys().next().value
    memCache.delete(firstKey)
  }
  memCache.set(memKey, translatedText)

  try {
    dbInsert.run(sourceLang, targetLang, text, translatedText)
  } catch (err) {
    console.error('Cache write error:', err.message)
  }
}

function mockTranslate(text, targetLang) {
  return `[${targetLang.toUpperCase()}] ${text}`
}

async function translateText(text, sourceLang = 'en', targetLang) {
  if (!text || sourceLang === targetLang) return text

  const cached = getFromCache(sourceLang, targetLang, text)
  if (cached) return cached

  if (!API_KEY) {
    const mocked = mockTranslate(text, targetLang)
    saveToCache(sourceLang, targetLang, text, mocked)
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

    saveToCache(sourceLang, targetLang, text, translated)
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

// GET /api/translate/languages
router.get('/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    apiConfigured: !!API_KEY,
  })
})

// GET /api/translate/cache-stats
router.get('/cache-stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM translation_cache').get()
  const byLang = db.prepare(
    'SELECT targetLang, COUNT(*) as count FROM translation_cache GROUP BY targetLang ORDER BY count DESC'
  ).all()
  res.json({
    memoryCache: memCache.size,
    persistentCache: total.count,
    byLanguage: byLang,
  })
})

// POST /api/translate
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

// POST /api/translate/batch
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
