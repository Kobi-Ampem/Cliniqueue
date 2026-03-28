import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.js'
import { IconFirstAid } from '../components/icons.jsx'
import items from '../data/firstAid.json'

export default function FirstAidList() {
  const { lang, translateAll } = useLanguage()
  const enTitles = useMemo(() => items.map((i) => i.title), [])
  const [intlTitles, setIntlTitles] = useState(enTitles)

  useEffect(() => {
    if (lang === 'en') return
    const ac = new AbortController()
    ;(async () => {
      try {
        const t = await translateAll(
          items.map((i) => i.title),
          ac.signal,
        )
        if (!ac.signal.aborted) setIntlTitles(t)
      } catch (e) {
        if (e.name !== 'AbortError') setIntlTitles(enTitles)
      }
    })()
    return () => ac.abort()
  }, [lang, translateAll, enTitles])

  const titles = lang === 'en' ? enTitles : intlTitles

  return (
    <div className="space-y-4 text-left">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">First Aid</h1>
        <p className="mt-1 text-sm text-stone-600">
          Choose a situation. Follow the steps calmly — then seek professional
          care when needed.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item, idx) => (
          <li key={item.id}>
            <Link
              to={`/first-aid/${item.id}`}
              className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <IconFirstAid className="h-8 w-8 shrink-0 text-brand-600" />
              <span className="font-medium text-stone-900">{titles[idx]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
