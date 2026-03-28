import { useMemo, useState } from 'react'
import { addVisit, loadVisits, saveVisits } from '../lib/visitsStorage.js'

const emptyForm = {
  date: '',
  facility: '',
  service: '',
  doctor: '',
  diagnosis: '',
  prescriptions: '',
  nextAppointment: '',
  notes: '',
}

export default function VisitJournal() {
  const [visits, setVisits] = useState(() => loadVisits())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [expandedId, setExpandedId] = useState(null)

  const sorted = useMemo(
    () => [...visits].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [visits],
  )

  function submit(e) {
    e.preventDefault()
    const next = addVisit({ ...form })
    setVisits(next)
    setForm(emptyForm)
    setOpen(false)
  }

  function removeVisit(id) {
    const next = loadVisits().filter((v) => v.id !== id)
    saveVisits(next)
    setVisits(next)
    setExpandedId(null)
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Visits</h1>
          <p className="mt-1 text-sm text-stone-600">
            Stored only on this browser — no login for the MVP.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-sm text-stone-500">
          No visits yet. Tap <strong>Add</strong> after your next appointment.
        </p>
      )}

      <ul className="space-y-2">
        {sorted.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() =>
                setExpandedId(expandedId === v.id ? null : v.id)
              }
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-left shadow-sm hover:border-brand-200"
            >
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-stone-900">
                  {v.facility || 'Visit'}
                </span>
                <span className="shrink-0 text-xs text-stone-500">{v.date}</span>
              </div>
              {v.service && (
                <p className="mt-1 text-xs text-stone-600">{v.service}</p>
              )}
            </button>

            {expandedId === v.id && (
              <div className="mt-2 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                {v.doctor && (
                  <p>
                    <span className="font-medium text-stone-900">Doctor:</span>{' '}
                    {v.doctor}
                  </p>
                )}
                {v.diagnosis && (
                  <p>
                    <span className="font-medium text-stone-900">
                      What they said / diagnosis:
                    </span>{' '}
                    {v.diagnosis}
                  </p>
                )}
                {v.prescriptions && (
                  <p>
                    <span className="font-medium text-stone-900">Drugs:</span>{' '}
                    {v.prescriptions}
                  </p>
                )}
                {v.nextAppointment && (
                  <p>
                    <span className="font-medium text-stone-900">Next visit:</span>{' '}
                    {v.nextAppointment}
                  </p>
                )}
                {v.notes && (
                  <p>
                    <span className="font-medium text-stone-900">Notes:</span>{' '}
                    {v.notes}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeVisit(v.id)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Delete entry
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visit-form-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
            <h2 id="visit-form-title" className="text-lg font-bold text-stone-900">
              Log a visit
            </h2>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <Field
                label="Date of visit"
                value={form.date}
                onChange={(v) => setForm((f) => ({ ...f, date: v }))}
                type="date"
                required
              />
              <Field
                label="Facility name"
                value={form.facility}
                onChange={(v) => setForm((f) => ({ ...f, facility: v }))}
                required
              />
              <Field
                label="Service / department"
                value={form.service}
                onChange={(v) => setForm((f) => ({ ...f, service: v }))}
              />
              <Field
                label="Doctor's name (optional)"
                value={form.doctor}
                onChange={(v) => setForm((f) => ({ ...f, doctor: v }))}
              />
              <Field
                label="What the doctor said / diagnosis"
                value={form.diagnosis}
                onChange={(v) => setForm((f) => ({ ...f, diagnosis: v }))}
                textarea
              />
              <Field
                label="Prescriptions"
                value={form.prescriptions}
                onChange={(v) => setForm((f) => ({ ...f, prescriptions: v }))}
                textarea
              />
              <Field
                label="Next appointment"
                value={form.nextAppointment}
                onChange={(v) =>
                  setForm((f) => ({ ...f, nextAppointment: v }))
                }
              />
              <Field
                label="Other notes"
                value={form.notes}
                onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                textarea
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  textarea,
  required,
}) {
  const cls =
    'mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-stone-900'
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cls}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          required={required}
        />
      )}
    </label>
  )
}
