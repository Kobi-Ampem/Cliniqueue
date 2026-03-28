import { useState, useEffect } from 'react'
import { BookOpen, Plus, Calendar, MapPin, Search, Trash2, Edit2 } from 'lucide-react'
import './Journal.css'

export default function Journal() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('clinicplus_journal')
    return saved ? JSON.parse(saved) : []
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    facility: '',
    service: '',
    doctor: '',
    diagnosis: '',
    prescriptions: '',
    nextDate: '',
    notes: ''
  })

  useEffect(() => {
    localStorage.setItem('clinicplus_journal', JSON.stringify(entries))
  }, [entries])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setEntries(entries.map(ent => ent.id === editingId ? { ...form, id: editingId, updatedAt: new Date().toISOString() } : ent))
      setEditingId(null)
    } else {
      setEntries([
        { id: Date.now().toString(), createdAt: new Date().toISOString(), ...form },
        ...entries
      ])
    }
    setShowForm(false)
    setForm({ date: new Date().toISOString().split('T')[0], facility: '', service: '', doctor: '', diagnosis: '', prescriptions: '', nextDate: '', notes: '' })
  }

  const handleEdit = (entry) => {
    setForm(entry)
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this visit record? This cannot be undone.')) {
      setEntries(entries.filter(e => e.id !== id))
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
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...form, facility: '', diagnosis: '', service: '' }); }}>
              <Plus size={16} />
              {showForm && !editingId ? 'Cancel' : 'Log New Visit'}
            </button>
          </div>

          {/* Form */}
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
                  <textarea id="j-prescriptions" className="textarea" placeholder="1. Artemisnin combo - 1 table morning/evening for 3 days&#10;2. Paracetamol - 2 tablets every 8 hours" style={{minHeight:'80px'}} value={form.prescriptions} onChange={e => setForm({...form, prescriptions: e.target.value})} />
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
                  <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Save Visit to Journal'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="container pb-5">
        {entries.length === 0 && !showForm ? (
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
