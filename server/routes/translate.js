import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Fallback in case the API key isn't provided or the API is simply slow.
function mockTranslate(text, targetLang) {
  // Just a simple mock that prefixes the text to show it "worked" without breaking the demo
  return `[${targetLang.toUpperCase()}] ${text}`
}

router.post('/', async (req, res) => {
  const { text, targetLang } = req.body

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' })
  }

  // Base translation API setup for GhanaNLP
  const GHANA_NLP_API = process.env.GHANANLP_API_URL || 'https://translation-api.ghananlp.org/v1/translate'
  const API_KEY = process.env.GHANANLP_API_KEY

  if (!API_KEY) {
    console.warn('⚠️ No GHANANLP_API_KEY found. Falling back to mock translations for the demo.')
    return res.json({ translatedText: mockTranslate(text, targetLang) })
  }

  try {
    // Attempt actual request
    const response = await axios.post(
      GHANA_NLP_API,
      {
        in: text,
        lang: `en-${targetLang}`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY, // Standard header for Azure APIM where GhanaNLP is often hosted
          'Cache-Control': 'no-cache'
        },
        timeout: 5000 // Ensure we don't hang the UI if the API is slow
      }
    )

    if (response.data && response.data.translation) {
      return res.json({ translatedText: response.data.translation })
    }

    // Fallback if data format differs
    res.json({ translatedText: response.data || mockTranslate(text, targetLang) })

  } catch (error) {
    console.error('Translation API Error:', error.message)
    res.json({ translatedText: mockTranslate(text, targetLang), error: 'API Error' })
  }
})

export default router
