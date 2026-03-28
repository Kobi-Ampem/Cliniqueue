import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import seed from '../data/waitTimesSeed.json'
import { saveWaitReport } from '../lib/waitReports.js'

const PERIODS = [
  { value: 'early', label: 'Before 8am' },
  { value: 'morning', label: '8am – 12pm' },
  { value: 'afternoon', label: '12pm – 4pm' },
  { value: 'evening', label: 'After 4pm' },
]

export default function ReportWait() {
  const navigate = useNavigate()
  const options = useMemo(() => {
    return seed.facilities.flatMap((f) =>
      f.services.map((s) => ({
        key: `${f.id}:${s.id}`,
        facilityId: f.id,
        serviceId: s.id,
        label: `${f.shortName} — ${s.label}`,
      })),
    )
  }, [])

  const [choice, setChoice] = useState(options[0]?.key ?? '')
  const [minutes, setMinutes] = useState(90)
  const [period, setPeriod] = useState('morning')

  function onSubmit(e) {
    e.preventDefault()
    const sel = options.find((o) => o.key === choice)
    if (!sel) return
    saveWaitReport({
      facilityId: sel.facilityId,
      serviceId: sel.serviceId,
      minutes: Number(minutes),
      period,
    })
    navigate('/wait-times')
  }

  return (
    <div className="space-y-4 text-left">
      <Link
        to="/wait-times"
        className="inline-block text-sm font-medium text-brand-700"
      >
        ← Wait times
      </Link>

      <h1 className="text-2xl font-bold text-stone-900">Report my wait</h1>
      <p className="text-sm text-stone-600">
        Help others plan: how long did you wait today? Data stays on this
        device until your team syncs it to a server.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Facility &amp; service
          </label>
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-stone-900"
            required
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            Total wait (minutes)
          </label>
          <input
            type="number"
            min={5}
            max={600}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-stone-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            When you arrived
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-stone-900"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Submit report
        </button>
      </form>
    </div>
  )
}
