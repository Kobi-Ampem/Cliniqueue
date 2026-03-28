import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.js'
import { NAV_ICONS } from '../components/navIcons.js'

const SOURCE = {
  kicker: 'cliniKLAN',
  headline: 'Your hospital visit, simplified — in any language.',
  sub:
    'First aid, visit prep, wait times, and your health notes — built for Ghana.',
  cards: [
    {
      to: '/first-aid',
      icon: 'firstAid',
      title: 'First Aid',
      body: 'Step-by-step help for burns, choking, bites, and more — no jargon.',
    },
    {
      to: '/prepare',
      icon: 'prepare',
      title: 'Prepare for Visit',
      body: 'Documents, NHIS tips, and what to expect before you leave home.',
    },
    {
      to: '/wait-times',
      icon: 'wait',
      title: 'Wait Times',
      body: 'Crowdsourced averages for major Kumasi facilities — plan your day.',
    },
    {
      to: '/visits',
      icon: 'visits',
      title: 'My Visits',
      body: 'A private notebook for what the doctor said — saved on this device.',
    },
  ],
}

export default function Home() {
  const { lang, translateAll } = useLanguage()
  const [intlCopy, setIntlCopy] = useState(null)

  useEffect(() => {
    if (lang === 'en') return
    const ac = new AbortController()
    ;(async () => {
      try {
        const flat = [
          SOURCE.kicker,
          SOURCE.headline,
          SOURCE.sub,
          ...SOURCE.cards.flatMap((c) => [c.title, c.body]),
        ]
        const t = await translateAll(flat, ac.signal)
        if (ac.signal.aborted) return
        let i = 0
        const kicker = t[i++]
        const headline = t[i++]
        const sub = t[i++]
        const cards = SOURCE.cards.map((c) => ({
          ...c,
          title: t[i++],
          body: t[i++],
        }))
        setIntlCopy({ kicker, headline, sub, cards })
      } catch (e) {
        if (e.name !== 'AbortError') setIntlCopy(null)
      }
    })()
    return () => ac.abort()
  }, [lang, translateAll])

  const copy = lang === 'en' ? SOURCE : intlCopy ?? SOURCE

  return (
    <div className="space-y-6 text-left">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          {copy.kicker}
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
          {copy.headline}
        </h1>
        <p className="mt-3 text-stone-600">{copy.sub}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {copy.cards.map((c) => {
          const Icon = NAV_ICONS[c.icon]
          return (
            <li key={c.to}>
              <Link
                to={c.to}
                className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <Icon className="h-8 w-8 text-brand-600" />
                <span className="mt-2 font-semibold text-stone-900">{c.title}</span>
                <span className="mt-1 text-sm text-stone-600">{c.body}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>Note:</strong> First aid tips are not a diagnosis. In emergencies,
        call for help and get to a facility as soon as you can.
      </p>
    </div>
  )
}
