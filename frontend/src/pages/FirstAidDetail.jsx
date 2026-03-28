import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.js'
import { IconFirstAid } from '../components/icons.jsx'
import items from '../data/firstAid.json'

export default function FirstAidDetail() {
  const { id } = useParams()
  const { lang, translateAll } = useLanguage()
  const item = useMemo(() => items.find((i) => i.id === id), [id])

  const [cached, setCached] = useState({
    itemId: null,
    title: '',
    steps: [],
  })

  useEffect(() => {
    if (!item || lang === 'en') return
    const ac = new AbortController()
    const itemId = item.id
    ;(async () => {
      try {
        const t = await translateAll([item.title, ...item.steps], ac.signal)
        if (ac.signal.aborted) return
        setCached({ itemId, title: t[0], steps: t.slice(1) })
      } catch (e) {
        if (e.name !== 'AbortError') {
          setCached({ itemId, title: item.title, steps: item.steps })
        }
      }
    })()
    return () => ac.abort()
  }, [item, lang, translateAll])

  const title =
    lang === 'en' || cached.itemId !== item?.id ? item?.title ?? '' : cached.title
  const steps =
    lang === 'en' || cached.itemId !== item?.id
      ? item?.steps ?? []
      : cached.steps

  if (!item) {
    return (
      <p className="text-stone-600">
        Topic not found.{' '}
        <Link to="/first-aid" className="text-brand-700 underline">
          Back to list
        </Link>
      </p>
    )
  }

  return (
    <div className="space-y-4 text-left">
      <Link
        to="/first-aid"
        className="inline-block text-sm font-medium text-brand-700"
      >
        ← All emergencies
      </Link>

      <div className="flex gap-3">
        <IconFirstAid className="h-10 w-10 shrink-0 text-brand-600" />
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
          {title}
        </h1>
      </div>

      <ol className="list-decimal space-y-3 rounded-2xl border border-stone-200 bg-white p-4 pl-8 shadow-sm">
        {steps.map((step, i) => (
          <li key={i} className="text-stone-700 marker:font-semibold">
            {step}
          </li>
        ))}
      </ol>

      <p className="text-sm text-stone-500">
        If someone is very unwell, not breathing normally, or getting worse, get
        emergency help immediately.
      </p>
    </div>
  )
}
