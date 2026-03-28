import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import axios from 'axios'
import './FirstAid.css'

const SEVERITY_LABELS = {
  critical: { label: 'Critical — Life Threatening', cls: 'badge-critical', icon: '🔴' },
  urgent: { label: 'Urgent', cls: 'badge-urgent', icon: '🟠' },
  informational: { label: 'Informational', cls: 'badge-informational', icon: '🟢' },
}

export default function FirstAid() {
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [translated, setTranslated] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const { currentLang, translate } = useLanguage()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await axios.get('/api/first-aid')
      setEmergencies(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.warn('API unavailable, loading static data')
      const mod = await import('../data/firstAidData.json')
      setEmergencies(mod.default)
    } finally {
      setLoading(false)
    }
  }

  const translateSelected = useCallback(async (item, lang) => {
    if (!item || lang === 'en') {
      setTranslated(null)
      return
    }
    setIsTranslating(true)
    try {
      const [titleRes, subtitleRes, hospitalRes, ...rest] = await Promise.all([
        translate(item.title, lang),
        translate(item.subtitle, lang),
        translate(item.whenToGoToHospital, lang),
        ...item.steps.map(s => translate(s, lang)),
      ])
      const stepResults = rest.slice(0, item.steps.length)

      const warningResults = await Promise.all(
        item.warnings.map(w => translate(w, lang))
      )

      setTranslated({
        title: titleRes,
        subtitle: subtitleRes,
        whenToGoToHospital: hospitalRes,
        steps: stepResults,
        warnings: warningResults,
      })
    } catch (e) {
      console.warn('Translation error', e)
    } finally {
      setIsTranslating(false)
    }
  }, [translate])

  useEffect(() => {
    if (selected) {
      translateSelected(selected, currentLang)
    }
  }, [selected, currentLang, translateSelected])

  const displayTitle = translated?.title || selected?.title
  const displaySubtitle = translated?.subtitle || selected?.subtitle
  const displaySteps = translated?.steps || selected?.steps
  const displayWarnings = translated?.warnings || selected?.warnings
  const displayHospital = translated?.whenToGoToHospital || selected?.whenToGoToHospital

  if (loading) {
    return (
      <div className="firstaid-wrapper">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="firstaid-wrapper">
      <div className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)' }}>
              🆘
            </div>
            <div>
              <h1>First Aid Guide</h1>
              <p>Step-by-step emergency instructions. Select an emergency below.</p>
            </div>
          </div>
          <div className="disclaimer alert alert-warning mt-3">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>This is <strong>first aid guidance only</strong>. Always call for professional medical help in a real emergency. Content sourced from WHO &amp; Red Cross guidelines.</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="firstaid-layout">
          <div className="emergency-grid animate-stagger">
            {emergencies.map(item => (
              <button
                key={item.id}
                id={`first-aid-${item.id}`}
                className={`emergency-card ${selected?.id === item.id ? 'active' : ''}`}
                onClick={() => {
                  setSelected(item)
                  setTranslated(null)
                }}
                style={{ '--em-color': item.color }}
              >
                <span className="emergency-emoji">{item.emoji}</span>
                <span className="emergency-name">{item.title}</span>
                <span className="emergency-sub">{item.subtitle}</span>
                {selected?.id === item.id && (
                  <span className="emergency-selected-indicator">
                    <ChevronRight size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="aid-detail">
            {!selected ? (
              <div className="aid-detail-empty">
                <div className="aid-empty-icon">🆘</div>
                <h3>Select an Emergency</h3>
                <p>Choose an emergency type from the left to see step-by-step first aid instructions.</p>
              </div>
            ) : (
              <div className="aid-detail-content animate-fade-in" key={selected.id}>
                <div className="aid-detail-header">
                  <div className="aid-detail-emoji">{selected.emoji}</div>
                  <div className="aid-detail-title-block">
                    <h2>
                      {isTranslating ? <span className="translating-text"><span className="spinner" style={{display:'inline-block', width:16, height:16}}/> Translating...</span> : displayTitle}
                    </h2>
                    <p>{isTranslating ? '' : displaySubtitle}</p>
                  </div>
                  <span className={`badge ${SEVERITY_LABELS[selected.severity]?.cls}`}>
                    {SEVERITY_LABELS[selected.severity]?.icon} {SEVERITY_LABELS[selected.severity]?.label}
                  </span>
                </div>

                <div className="aid-steps">
                  <h4 className="aid-steps-title">📋 Step-by-Step Instructions</h4>
                  {isTranslating ? (
                    <div className="flex items-center gap-3" style={{ padding: '2rem', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <div className="spinner" />
                      <span>Translating to {currentLang.toUpperCase()}...</span>
                    </div>
                  ) : (
                    <ol className="steps-list">
                      {(displaySteps || []).map((step, i) => (
                        <li key={i} className="step-item">
                          <div className="step-number">{i + 1}</div>
                          <p className="step-text">{step}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {selected.warnings && selected.warnings.length > 0 && (
                  <div className="aid-warnings">
                    <h4><AlertTriangle size={16} /> Do NOT do these things</h4>
                    {isTranslating ? (
                      <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Translating...</div>
                    ) : (
                      <ul>
                        {(displayWarnings || []).map((w, i) => (
                          <li key={i}>❌ {w}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="aid-hospital-cta">
                  <div className="aid-hospital-icon">🏥</div>
                  <div>
                    <h4>When to go to the hospital</h4>
                    <p>{isTranslating ? 'Translating...' : displayHospital}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
