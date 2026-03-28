import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import firstAidData from '../data/firstAidData.json'
import './FirstAid.css'

const SEVERITY_LABELS = {
  critical: { label: 'Critical — Life Threatening', cls: 'badge-critical', icon: '🔴' },
  urgent: { label: 'Urgent', cls: 'badge-urgent', icon: '🟠' },
  informational: { label: 'Informational', cls: 'badge-informational', icon: '🟢' },
}

export default function FirstAid() {
  const [selected, setSelected] = useState(null)
  const [translatedSteps, setTranslatedSteps] = useState(null)
  const [translatedTitle, setTranslatedTitle] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const { currentLang, translate } = useLanguage()

  const translateSelected = useCallback(async (item, lang) => {
    if (!item || lang === 'en') {
      setTranslatedSteps(null)
      setTranslatedTitle(null)
      return
    }
    setIsTranslating(true)
    try {
      const [titleRes, ...stepResults] = await Promise.all([
        translate(item.title, lang),
        ...item.steps.map(s => translate(s, lang)),
      ])
      setTranslatedTitle(titleRes)
      setTranslatedSteps(stepResults)
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

  const displaySteps = translatedSteps || selected?.steps
  const displayTitle = translatedTitle || selected?.title

  return (
    <div className="firstaid-wrapper">
      {/* Page header */}
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
          {/* Grid */}
          <div className="emergency-grid animate-stagger">
            {firstAidData.map(item => (
              <button
                key={item.id}
                id={`first-aid-${item.id}`}
                className={`emergency-card ${selected?.id === item.id ? 'active' : ''}`}
                onClick={() => {
                  setSelected(item)
                  setTranslatedSteps(null)
                  setTranslatedTitle(null)
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

          {/* Detail Panel */}
          <div className="aid-detail">
            {!selected ? (
              <div className="aid-detail-empty">
                <div className="aid-empty-icon">🆘</div>
                <h3>Select an Emergency</h3>
                <p>Choose an emergency type from the left to see step-by-step first aid instructions.</p>
              </div>
            ) : (
              <div className="aid-detail-content animate-fade-in" key={selected.id}>
                {/* Header */}
                <div className="aid-detail-header">
                  <div className="aid-detail-emoji">{selected.emoji}</div>
                  <div className="aid-detail-title-block">
                    <h2>
                      {isTranslating ? <span className="translating-text"><span className="spinner" style={{display:'inline-block', width:16, height:16}}/> Translating...</span> : displayTitle}
                    </h2>
                    <p>{selected.subtitle}</p>
                  </div>
                  <span className={`badge ${SEVERITY_LABELS[selected.severity]?.cls}`}>
                    {SEVERITY_LABELS[selected.severity]?.icon} {SEVERITY_LABELS[selected.severity]?.label}
                  </span>
                </div>

                {/* Steps */}
                <div className="aid-steps">
                  <h4 className="aid-steps-title">📋 Step-by-Step Instructions</h4>
                  {isTranslating ? (
                    <div className="flex items-center gap-3" style={{ padding: '2rem', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <div className="spinner" />
                      <span>Translating to {currentLang.toUpperCase()}...</span>
                    </div>
                  ) : (
                    <ol className="steps-list">
                      {(displaySteps || selected.steps).map((step, i) => (
                        <li key={i} className="step-item">
                          <div className="step-number">{i + 1}</div>
                          <p className="step-text">{step}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* Warnings */}
                {selected.warnings && selected.warnings.length > 0 && (
                  <div className="aid-warnings">
                    <h4><AlertTriangle size={16} /> Do NOT do these things</h4>
                    <ul>
                      {selected.warnings.map((w, i) => (
                        <li key={i}>❌ {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* When to go */}
                <div className="aid-hospital-cta">
                  <div className="aid-hospital-icon">🏥</div>
                  <div>
                    <h4>When to go to the hospital</h4>
                    <p>{selected.whenToGoToHospital}</p>
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
