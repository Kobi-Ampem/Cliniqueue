import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import seed from '../data/waitTimesSeed.json'
import {
  loadWaitReports,
  mergedServiceAverage,
  reportsThisWeek,
} from '../lib/waitReports.js'

export default function WaitTimes() {
  const userReports = useMemo(() => loadWaitReports(), [])
  const weekCount = useMemo(() => reportsThisWeek(userReports), [userReports])

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Wait Times</h1>
          <p className="mt-1 text-sm text-stone-600">
            Averages mix demo seed data with reports from people like you — not
            live hospital queues.
          </p>
        </div>
        <Link
          to="/wait-times/report"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Report my wait
        </Link>
      </div>

      <p className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600">
        Reports this week (all facilities):{' '}
        <strong className="text-stone-800">{weekCount}</strong>
      </p>

      <ul className="space-y-4">
        {seed.facilities.map((f) => (
          <li
            key={f.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
              <h2 className="font-semibold text-stone-900">{f.name}</h2>
              <p className="mt-1 text-xs text-stone-600">
                <span className="font-medium text-stone-700">Busiest:</span>{' '}
                {f.busiestTimes}
              </p>
              <p className="mt-1 text-xs text-amber-800">
                <span className="font-medium">Tip:</span> {f.bestTimeTip}
              </p>
            </div>
            <ul className="divide-y divide-stone-100">
              {f.services.map((s) => {
                const avg = mergedServiceAverage(s, userReports, f.id)
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-stone-800">{s.label}</span>
                    <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                      ~{avg} min avg
                    </span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
