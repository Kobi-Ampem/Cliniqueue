import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.js'
import services from '../data/hospitalServices.json'

export default function HospitalGuideList() {
  const { lang, translateAll } = useLanguage()
  const enNames = useMemo(() => services.map((s) => s.name), [])
  const [intlNames, setIntlNames] = useState(enNames)

  useEffect(() => {
    if (lang === 'en') return
    const ac = new AbortController()
    ;(async () => {
      try {
        const t = await translateAll(
          services.map((s) => s.name),
          ac.signal,
        )
        if (!ac.signal.aborted) setIntlNames(t)
      } catch (e) {
        if (e.name !== 'AbortError') setIntlNames(enNames)
      }
    })()
    return () => ac.abort()
  }, [lang, translateAll, enNames])

  const names = lang === 'en' ? enNames : intlNames

  return (
    <div className="space-y-4 text-left">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Prepare for Visit</h1>
        <p className="mt-1 text-sm text-stone-600">
          Pick a service to see documents, NHIS notes, timing, and practical
          tips — before you queue.
        </p>
      </div>

      <ul className="space-y-2">
        {services.map((svc, idx) => (
          <li key={svc.id}>
            <Link
              to={`/prepare/${svc.id}`}
              className="block rounded-xl border border-stone-200 bg-white px-4 py-3 font-medium text-stone-900 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              {names[idx]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
