import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.js'
import services from '../data/hospitalServices.json'
import { shareTextToWhatsApp } from '../lib/shareWhatsApp.js'

const SECTION_KEYS = [
  { key: 'documents', label: 'Documents needed' },
  { key: 'bring', label: 'What to wear / bring' },
  { key: 'nhis', label: 'NHIS coverage' },
  { key: 'time', label: 'Estimated time' },
  { key: 'tips', label: 'Tips' },
]

function buildEnglishDisplay(base) {
  return {
    name: base.name,
    documents: base.documents,
    bring: base.bring,
    nhis: base.nhis,
    time: base.time,
    tips: base.tips,
    process: [...base.process],
    labels: SECTION_KEYS.map((s) => s.label),
    processHeading: 'Step-by-step process',
  }
}

function buildShareText(svc) {
  const lines = [
    `cliniKLAN — ${svc.name}`,
    '',
    'Documents: ' + svc.documents,
    'Bring: ' + svc.bring,
    'NHIS: ' + svc.nhis,
    'Time: ' + svc.time,
    'Tips: ' + svc.tips,
    '',
    'Process:',
    ...svc.process.map((p, i) => `${i + 1}. ${p}`),
  ]
  return lines.join('\n')
}

export default function HospitalGuideDetail() {
  const { id } = useParams()
  const { lang, translateAll } = useLanguage()
  const base = useMemo(() => services.find((s) => s.id === id), [id])

  const enDisplay = useMemo(
    () => (base ? buildEnglishDisplay(base) : null),
    [base],
  )

  const [intl, setIntl] = useState({ serviceId: null, data: null })

  useEffect(() => {
    if (!base || lang === 'en') return
    const ac = new AbortController()
    const serviceId = base.id
    ;(async () => {
      try {
        const labelStrings = SECTION_KEYS.map((s) => s.label)
        const toTranslate = [
          base.name,
          ...labelStrings,
          'Step-by-step process',
          base.documents,
          base.bring,
          base.nhis,
          base.time,
          base.tips,
          ...base.process,
        ]
        const t = await translateAll(toTranslate, ac.signal)
        if (ac.signal.aborted) return
        let i = 0
        const name = t[i++]
        const labels = labelStrings.map(() => t[i++])
        const processHeading = t[i++]
        const documents = t[i++]
        const bring = t[i++]
        const nhis = t[i++]
        const time = t[i++]
        const tips = t[i++]
        const process = base.process.map(() => t[i++])
        setIntl({
          serviceId,
          data: {
            name,
            documents,
            bring,
            nhis,
            time,
            tips,
            process,
            labels,
            processHeading,
          },
        })
      } catch (e) {
        if (e.name !== 'AbortError') {
          setIntl({
            serviceId,
            data: buildEnglishDisplay(base),
          })
        }
      }
    })()
    return () => ac.abort()
  }, [base, lang, translateAll])

  const display =
    lang === 'en' || !intl.data || intl.serviceId !== base?.id
      ? enDisplay
      : intl.data

  if (!base || !display) {
    return (
      <p className="text-stone-600">
        Service not found.{' '}
        <Link to="/prepare" className="text-brand-700 underline">
          Back to list
        </Link>
      </p>
    )
  }

  const sharePayload = {
    name: base.name,
    documents: base.documents,
    bring: base.bring,
    nhis: base.nhis,
    time: base.time,
    tips: base.tips,
    process: base.process,
  }

  return (
    <div className="space-y-4 text-left">
      <Link
        to="/prepare"
        className="inline-block text-sm font-medium text-brand-700"
      >
        ← All services
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
          {display.name}
        </h1>
        <button
          type="button"
          onClick={() => shareTextToWhatsApp(buildShareText(sharePayload))}
          className="shrink-0 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-100"
        >
          Share via WhatsApp
        </button>
      </div>

      <div className="space-y-3">
        {SECTION_KEYS.map((section, idx) => (
          <section
            key={section.key}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-brand-700">
              {display.labels[idx]}
            </h2>
            <p className="mt-2 text-sm text-stone-700">
              {display[section.key]}
            </p>
          </section>
        ))}

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-700">
            {display.processHeading}
          </h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            {display.process.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
