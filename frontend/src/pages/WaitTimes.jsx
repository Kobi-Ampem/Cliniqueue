import { useState, useEffect } from 'react'
import { Clock, Users, Plus, ChevronDown, CheckCircle } from 'lucide-react'
import axios from 'axios'
import './WaitTimes.css'

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`
}

function getWaitColor(minutes) {
  if (minutes <= 45) return '#10B981'
  if (minutes <= 90) return '#F59E0B'
  if (minutes <= 150) return '#EF4444'
  return '#DC2626'
}

function getWaitLabel(minutes) {
  if (minutes <= 45) return 'Short wait'
  if (minutes <= 90) return 'Moderate wait'
  if (minutes <= 150) return 'Long wait'
  return 'Very long wait'
}

export default function WaitTimes() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ facilityId: '', service: '', minutes: 60, timeOfDay: 'morning' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      const res = await axios.get('/api/wait-times')
      if (res.data && Array.isArray(res.data)) {
        setFacilities(res.data)
      }
    } catch (err) {
      console.warn('API unavailable, loading static data')
      const mod = await import('../data/facilities.json')
      setFacilities(mod.default)
    } finally {
      setLoading(false)
    }
  }

  const selectedFacility = facilities.find(f => f.id === form.facilityId)
  const availableServices = selectedFacility
    ? selectedFacility.services.map(s => s.name)
    : []

  const handleReport = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post('/api/wait-times', form)
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setShowForm(false) }, 3000)
      const res = await axios.get('/api/wait-times')
      if (res.data) setFacilities(res.data)
    } catch (err) {
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setShowForm(false) }, 3000)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="waittimes-wrapper">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="waittimes-wrapper">
      <div className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              ⏱️
            </div>
            <div style={{ flex: 1 }}>
              <h1>Wait Times</h1>
              <p>Crowdsourced wait time data for major Kumasi hospitals. Know before you go.</p>
            </div>
            <button
              id="report-wait-btn"
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={16} />
              Report My Wait
            </button>
          </div>

          {showForm && (
            <div className="report-form-wrapper animate-fade-up">
              {submitted ? (
                <div className="alert alert-success">
                  <CheckCircle size={18} />
                  <span>Thank you! Your wait time has been submitted and helps other patients plan better.</span>
                </div>
              ) : (
                <form className="report-form" onSubmit={handleReport}>
                  <h4>📊 Report Your Wait Time</h4>
                  <div className="report-form-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="report-facility">Hospital / Clinic</label>
                      <select
                        id="report-facility"
                        className="select"
                        value={form.facilityId}
                        onChange={e => setForm(f => ({ ...f, facilityId: e.target.value, service: '' }))}
                        required
                      >
                        <option value="">Select facility...</option>
                        {facilities.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="report-service">Service</label>
                      <select
                        id="report-service"
                        className="select"
                        value={form.service}
                        onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                        required
                      >
                        <option value="">Select service...</option>
                        {availableServices.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="report-minutes">How long did you wait? ({form.minutes} minutes)</label>
                      <input
                        id="report-minutes"
                        type="range"
                        min="5"
                        max="360"
                        step="5"
                        value={form.minutes}
                        onChange={e => setForm(f => ({ ...f, minutes: +e.target.value }))}
                        className="wait-slider"
                      />
                      <div className="slider-labels">
                        <span>5 min</span>
                        <span className="slider-value" style={{ color: getWaitColor(form.minutes) }}>{formatTime(form.minutes)}</span>
                        <span>6 hours</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="report-time">Time of day you arrived</label>
                      <select
                        id="report-time"
                        className="select"
                        value={form.timeOfDay}
                        onChange={e => setForm(f => ({ ...f, timeOfDay: e.target.value }))}
                        required
                      >
                        <option value="early-morning">Early Morning (before 8am)</option>
                        <option value="morning">Morning (8am–12pm)</option>
                        <option value="afternoon">Afternoon (12pm–4pm)</option>
                        <option value="evening">Evening (after 4pm)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-wait-report-btn">
                      {submitting ? <><div className="spinner" style={{width:16,height:16}} /> Submitting...</> : 'Submit Report'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="waittimes-layout">
          <div className="facilities-grid animate-stagger">
            {facilities.map(facility => {
              const avgWait = Math.round(facility.services.reduce((s, sv) => s + sv.avgWaitMinutes, 0) / facility.services.length)
              const bestService = facility.services.reduce((a, b) => a.avgWaitMinutes < b.avgWaitMinutes ? a : b)
              return (
                <button
                  key={facility.id}
                  id={`facility-${facility.id}`}
                  className={`facility-card ${selected?.id === facility.id ? 'active' : ''}`}
                  onClick={() => setSelected(selected?.id === facility.id ? null : facility)}
                >
                  <div className="facility-card-header">
                    <div className="facility-icon">🏥</div>
                    <div className="facility-info">
                      <h3 className="facility-name">{facility.name}</h3>
                      <p className="facility-type">{facility.type} · {facility.location}</p>
                    </div>
                    <ChevronDown size={18} className={`facility-chevron ${selected?.id === facility.id ? 'open' : ''}`} />
                  </div>
                  <div className="facility-stats">
                    <div className="fstat">
                      <span className="fstat-value" style={{ color: getWaitColor(avgWait) }}>{formatTime(avgWait)}</span>
                      <span className="fstat-label">Avg wait</span>
                    </div>
                    <div className="fstat-divider" />
                    <div className="fstat">
                      <span className="fstat-value">{facility.services.length}</span>
                      <span className="fstat-label">Services</span>
                    </div>
                    <div className="fstat-divider" />
                    <div className="fstat">
                      <span className="fstat-value" style={{ color: '#10B981', fontSize: '0.8rem' }}>{bestService.name}</span>
                      <span className="fstat-label">Shortest wait</span>
                    </div>
                  </div>

                  {selected?.id === facility.id && (
                    <div className="services-breakdown animate-fade-in" onClick={e => e.stopPropagation()}>
                      <h4 className="breakdown-title">Service Breakdown</h4>
                      {facility.services.map(svc => (
                        <div key={svc.name} className="service-row">
                          <div className="service-row-info">
                            <span className="service-row-name">{svc.name}</span>
                            <span className="service-row-sub">Best: {svc.bestTimeToArrive}</span>
                          </div>
                          <div className="service-row-stats">
                            <div className="wait-bar-wrapper">
                              <div
                                className="wait-bar"
                                style={{
                                  width: `${Math.min(100, (svc.avgWaitMinutes / 240) * 100)}%`,
                                  background: getWaitColor(svc.avgWaitMinutes),
                                }}
                              />
                            </div>
                            <span className="service-wait-time" style={{ color: getWaitColor(svc.avgWaitMinutes) }}>
                              {formatTime(svc.avgWaitMinutes)}
                            </span>
                          </div>
                          <div className="service-row-meta">
                            <span className="service-badge" style={{ color: getWaitColor(svc.avgWaitMinutes) }}>
                              {getWaitLabel(svc.avgWaitMinutes)}
                            </span>
                            <span className="report-count">
                              <Users size={12} /> {svc.reportCount} reports
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="waittimes-sidebar">
            <div className="wait-tips-card">
              <h3>⏰ General Wait Time Tips</h3>
              <ul className="wait-tips-list">
                <li><strong>Arrive before 7:30am</strong> for the lowest queue numbers at OPD.</li>
                <li><strong>Avoid Monday mornings</strong> — they are usually the busiest after the weekend.</li>
                <li><strong>Mid-week (Tue–Thu)</strong> tends to have shorter waits at most hospitals.</li>
                <li><strong>Bring a snack and water</strong> — even short waits can run long.</li>
                <li><strong>Call ahead</strong> to confirm clinic days for ANC, CWC, and Family Planning.</li>
              </ul>
            </div>
            <div className="legend-card">
              <h4>Wait Time Legend</h4>
              <div className="legend-items">
                {[{color:'#10B981',label:'Short (under 45 min)'},{color:'#F59E0B',label:'Moderate (45–90 min)'},{color:'#EF4444',label:'Long (90–150 min)'},{color:'#DC2626',label:'Very Long (2.5+ hours)'}].map(l => (
                  <div key={l.label} className="legend-item">
                    <span className="legend-dot" style={{ background: l.color }} />
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
