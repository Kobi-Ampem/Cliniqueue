import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Server-side translation cache: "en-tw:hello" -> "translated text"
const cache = new Map()
const MAX_CACHE_SIZE = 500

function getCacheKey(text, targetLang) {
  return `${targetLang}:${text}`
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

const GHANA_NLP_API = process.env.GHANANLP_API_URL || 'https://translation-api.ghananlp.org/v1/translate'
const API_KEY = process.env.GHANANLP_API_KEY

async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text

  const cacheKey = getCacheKey(text, targetLang)
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  if (!API_KEY) {
    const mocked = mockTranslate(text, targetLang)
    addToCache(cacheKey, mocked)
    return mocked
  }

  try {
    const response = await axios.post(
      GHANA_NLP_API,
      { in: text, lang: `en-${targetLang}` },
      {
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
          'Cache-Control': 'no-cache'
        },
        timeout: 5000
      }
    )

    const translated = response.data?.translation || response.data || mockTranslate(text, targetLang)
    addToCache(cacheKey, translated)
    return translated
  } catch (error) {
    console.error('Translation API Error:', error.message)
    const fallback = mockTranslate(text, targetLang)
    addToCache(cacheKey, fallback)
    return fallback
  }
}

// POST /api/translate — single text translation
router.post('/', async (req, res) => {
  const { text, targetLang } = req.body

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' })
  }

  if (!API_KEY) {
    console.warn('No GHANANLP_API_KEY found — using mock translations')
  }

  try {
    const translatedText = await translateText(text, targetLang)
    res.json({ translatedText })
  } catch (err) {
    console.error('Translate error:', err)
    res.json({ translatedText: mockTranslate(text, targetLang), error: 'Translation failed' })
  }
})

// POST /api/translate/batch — translate multiple texts at once
router.post('/batch', async (req, res) => {
  const { texts, targetLang } = req.body

  if (!Array.isArray(texts) || texts.length === 0 || !targetLang) {
    return res.status(400).json({ error: 'Missing texts array or targetLang' })
  }

  if (texts.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 texts per batch' })
  }

  if (targetLang === 'en') {
    return res.json({ translations: texts })
  }

  try {
    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLang))
    )
    res.json({ translations })
  } catch (err) {
    console.error('Batch translate error:', err)
    res.json({ translations: texts.map(t => mockTranslate(t, targetLang)), error: 'Batch translation failed' })
  }
})

export default router
