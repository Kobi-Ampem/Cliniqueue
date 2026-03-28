/**
 * Khaya AI text translation (translation-api.ghananlp.org).
 * @see https://translation.ghananlp.org/
 */

const CACHE_STORAGE_KEY = 'cliniklan_i18n_cache_v1'
const DEFAULT_TRANSLATE_URL =
  'https://translation-api.ghananlp.org/v1/translate'

const KHAYA_LANG_PAIR = {
  tw: 'en-tw',
  ewe: 'en-ee',
  ga: 'en-gaa',
}

export const SUPPORTED_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'tw', label: 'Twi' },
  { code: 'ewe', label: 'Ewe' },
  { code: 'ga', label: 'Ga' },
]

function loadDiskCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveDiskCache(map) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* quota */
  }
}

function cacheKey(pair, text) {
  let h = 5381
  for (let i = 0; i < text.length; i++) {
    h = (h * 33) ^ text.charCodeAt(i)
  }
  return `${pair}:${(h >>> 0).toString(36)}`
}

function pickTranslated(payload) {
  if (typeof payload === 'string') return payload.trim() || null
  if (!payload || typeof payload !== 'object') return null

  const direct =
    payload.translatedText ??
    payload.translation ??
    payload.text ??
    payload.result ??
    payload.output ??
    payload.data

  if (typeof direct === 'string') return direct.trim() || null
  if (Array.isArray(direct) && typeof direct[0] === 'string')
    return direct[0].trim() || null
  if (direct && typeof direct === 'object') {
    const inner = direct.translatedText ?? direct.text ?? direct.translation
    if (typeof inner === 'string') return inner.trim() || null
  }

  const strings = Object.values(payload).filter(
    (v) => typeof v === 'string' && v.trim(),
  )
  if (strings.length === 1) return strings[0].trim()
  return null
}

function translateUrl() {
  const u = import.meta.env.VITE_KHAYA_TRANSLATE_URL
  return (u && String(u).trim()) || DEFAULT_TRANSLATE_URL
}

function needsSubscriptionKey(url) {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin !== window.location.origin
  } catch {
    return true
  }
}

export async function translateText(text, targetCode, opts = {}) {
  const trimmed = (text ?? '').trim()
  if (!trimmed || targetCode === 'en') {
    return { ok: true, text: trimmed || text, fromCache: true }
  }

  const pair = KHAYA_LANG_PAIR[targetCode]
  if (!pair) {
    return { ok: false, text: trimmed, reason: 'unsupported_lang' }
  }

  const mem = opts.memoryCache
  const key = cacheKey(pair, trimmed)
  if (mem?.has(key)) {
    return { ok: true, text: mem.get(key), fromCache: true }
  }

  const disk = loadDiskCache()
  if (disk[key]) {
    mem?.set(key, disk[key])
    return { ok: true, text: disk[key], fromCache: true }
  }

  const url = translateUrl()
  const apiKey = import.meta.env.VITE_KHAYA_API_KEY

  if (needsSubscriptionKey(url) && !apiKey?.trim()) {
    return { ok: false, text: trimmed, reason: 'no_key' }
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    }
    if (apiKey?.trim()) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey.trim()
    }

    const res = await fetch(url.replace(/\/$/, ''), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        in: trimmed,
        lang: pair,
      }),
      signal: opts.signal,
    })

    if (!res.ok) {
      return { ok: false, text: trimmed, reason: `http_${res.status}` }
    }

    const data = await res.json()
    const out = pickTranslated(data)
    if (typeof out !== 'string' || !out.trim()) {
      return { ok: false, text: trimmed, reason: 'bad_response' }
    }

    disk[key] = out
    saveDiskCache(disk)
    mem?.set(key, out)
    return { ok: true, text: out, fromCache: false }
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    return { ok: false, text: trimmed, reason: 'network' }
  }
}
