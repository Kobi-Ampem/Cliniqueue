import { useState, useEffect } from 'react'
import { Plus, Calendar, MapPin, Trash2, Edit2, Loader } from 'lucide-react'
import api from '../lib/api'
import './Journal.css'

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  facility: '',
  service: '',
  doctor: '',
  diagnosis: '',
  prescriptions: '',
  nextDate: '',
  notes: ''
}

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await api.get('/api/journal')
      setEntries(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.warn('Failed to load journal from API, falling back to localStorage')
      const saved = localStorage.getItem('clinicplus_journal')
      setEntries(saved ? JSON.parse(saved) : [])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const res = await api.put(`/api/journal/${editingId}`, form)
        setEntries(entries.map(ent => ent.id === editingId ? res.data : ent))
      } else {
        const res = await api.post('/api/journal', form)
        setEntries([res.data, ...entries])
      }
      setEditingId(null)
      setShowForm(false)
      setForm({ ...emptyForm })
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (entry) => {
    setForm({
      date: entry.date,
      facility: entry.facility,
      service: entry.service,
      doctor: entry.doctor || '',
      diagnosis: entry.diagnosis || '',
      prescriptions: entry.prescriptions || '',
      nextDate: entry.nextDate || '',
      notes: entry.notes || '',
    })
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visit record? This cannot be undone.')) return
    try {
      await api.delete(`/api/journal/${id}`)
      setEntries(entries.filter(e => e.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete. Please try again.')
    }
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="journal-wrapper">
      <div className="page-header" style={{ '--header-color': 'rgba(16,185,129,0.05)' }}>
        <div className="container">
          <div className="page-header-inner">
            <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              📒
            </div>
            <div style={{ flex: 1 }}>
              <h1>My Visit Journal</h1>
              <p>Your personal health notebook. Remember what the doctor said and keep track of your medications.</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...emptyForm }); }}>
              <Plus size={16} />
              {showForm && !editingId ? 'Cancel' : 'Log New Visit'}
            </button>
          </div>

          {showForm && (
            <div className="journal-form-container animate-fade-up">
              <form className="journal-form" onSubmit={handleSubmit}>
                <h3>{editingId ? 'Edit Visit' : 'Log New Visit'}</h3>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="j-date">Date of Visit</label>
                    <input type="date" id="j-date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="j-facility">Hospital / Clinic Name</label>
                    <input type="text" id="j-facility" className="input" placeholder="e.g. KNUST Hospital" value={form.facility} onChange={e => setForm({...form, facility: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="j-service">Service or Department</label>
                    <input type="text" id="j-service" className="input" placeholder="e.g. Antenatal, OPD, Eye Clinic" value={form.service} onChange={e => setForm({...form, service: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="j-doctor">Doctor/Nurse Name (Optional)</label>
                    <input type="text" id="j-doctor" className="input" placeholder="Dr. Mensah" value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="j-diagnosis">What the doctor said / Diagnosis</label>
                  <textarea id="j-diagnosis" className="textarea" placeholder="Diagnosed with malaria. Told to rest and drink water." style={{minHeight:'80px'}} value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="j-prescriptions">Prescriptions / Medications</label>
                  <textarea id="j-prescriptions" className="textarea" placeholder={"1. Artemisinin combo - 1 tablet morning/evening for 3 days\n2. Paracetamol - 2 tablets every 8 hours"} style={{minHeight:'80px'}} value={form.prescriptions} onChange={e => setForm({...form, prescriptions: e.target.value})} />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="j-next">Next Appointment (Optional)</label>
                    <input type="date" id="j-next" className="input" value={form.nextDate} onChange={e => setForm({...form, nextDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="j-notes">Additional Notes</label>
                    <input type="text" id="j-notes" className="input" placeholder="Bring NHIS card next time" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><Loader size={16} className="spinner" /> Saving...</> : (editingId ? 'Save Changes' : 'Save Visit to Journal')}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="container pb-5">
        {loading ? (
          <div className="journal-empty">
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your journal...</p>
          </div>
        ) : entries.length === 0 && !showForm ? (
          <div className="journal-empty">
            <div className="journal-empty-icon">📒</div>
            <h3>Your journal is empty</h3>
            <p>Log your first hospital visit so you don't forget important instructions or prescriptions.</p>
            <button className="btn btn-secondary mt-4" onClick={() => setShowForm(true)}>Log a visit</button>
          </div>
        ) : (
          <div className="timeline-container">
            <h3 className="timeline-title">Past Visits</h3>
            <div className="timeline">
              {sortedEntries.map((entry) => (
                <div key={entry.id} className="timeline-item animate-fade-in">
                  <div className="timeline-dot" />
                  <div className="timeline-content card-glass">
                    <div className="tl-header">
                      <div className="tl-date">
                        <Calendar size={16} />
                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="tl-actions">
                        <button className="tl-action-btn" onClick={() => handleEdit(entry)} title="Edit"><Edit2 size={16}/></button>
                        <button className="tl-action-btn text-red" onClick={() => handleDelete(entry.id)} title="Delete"><Trash2 size={16}/></button>
                      </div>
                    </div>
                    
                    <div className="tl-main">
                      <h4 className="tl-facility"><MapPin size={16}/> {entry.facility}</h4>
                      <div className="tl-badges">
                        <span className="badge badge-informational">{entry.service}</span>
                        {entry.doctor && <span className="badge" style={{background:'var(--bg-surface)'}}>Dr. {entry.doctor}</span>}
                      </div>
                    </div>

                    {(entry.diagnosis || entry.prescriptions) && (
                      <div className="tl-details">
                        {entry.diagnosis && (
                          <div className="tl-block">
                            <h5>Diagnosis & Instructions</h5>
                            <p>{entry.diagnosis}</p>
                          </div>
                        )}
                        {entry.prescriptions && (
                          <div className="tl-block">
                            <h5>Medications</h5>
                            <p className="pre-line">{entry.prescriptions}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(entry.nextDate || entry.notes) && (
                      <div className="tl-footer">
                        {entry.nextDate && (
                          <div className="tl-next-appt">
                            <strong>Next Appt:</strong> {new Date(entry.nextDate).toLocaleDateString()}
                          </div>
                        )}
                        {entry.notes && <div className="tl-note"><em>Note:</em> {entry.notes}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
