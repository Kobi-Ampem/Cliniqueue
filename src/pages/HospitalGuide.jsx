import { useState, useEffect } from 'react'
import { CheckCircle, FileText, Clock, AlertCircle, ChevronDown, ChevronUp, Share2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import hospitalServices from '../data/hospitalServices.json'
import './HospitalGuide.css'

export default function HospitalGuide() {
  const [selected, setSelected] = useState(null)
  const [expandedSection, setExpandedSection] = useState('process')
  const { currentLang, translate } = useLanguage()
  const [translated, setTranslated] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    if (!selected || currentLang === 'en') {
      setTranslated(null)
      return
    }
    setIsTranslating(true)
    const doTranslate = async () => {
      try {
        const [titleRes, descRes, nhisRes, timeRes, ...rest] = await Promise.all([
          translate(selected.title, currentLang),
          translate(selected.description, currentLang),
          translate(selected.nhisCoverage, currentLang),
          translate(selected.estimatedTime, currentLang),
          ...selected.documents.map(d => translate(d, currentLang)),
        ])
        const docCount = selected.documents.length
        const translatedDocs = rest.slice(0, docCount)
        const processSteps = await Promise.all(selected.process.map(p => translate(p, currentLang)))
        const tips = await Promise.all(selected.tips.map(t => translate(t, currentLang)))
        setTranslated({
          title: titleRes,
          description: descRes,
          nhisCoverage: nhisRes,
          estimatedTime: timeRes,
          documents: translatedDocs,
          process: processSteps,
          tips,
        })
      } catch (e) {
        console.warn('Translation error', e)
      } finally {
        setIsTranslating(false)
      }
    }
    doTranslate()
  }, [selected, currentLang, translate])

  const display = translated || selected

  const sections = selected ? [
    {
      id: 'process',
      icon: '📋',
      label: 'Step-by-Step Process',
      content: (display?.process || selected.process).map((step, i) => (
        <li key={i} className="process-step">
          <span className="process-num">{i + 1}</span>
          <span>{step}</span>
        </li>
      )),
      type: 'list',
    },
    {
      id: 'documents',
      icon: '📁',
      label: 'Documents to Bring',
      content: (display?.documents || selected.documents).map((doc, i) => (
        <li key={i} className="doc-item">
          <CheckCircle size={15} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
          <span>{doc}</span>
        </li>
      )),
      type: 'list',
    },
    {
      id: 'nhis',
      icon: '🏷️',
      label: 'NHIS Coverage',
      content: <p className="nhis-text">{display?.nhisCoverage || selected.nhisCoverage}</p>,
      type: 'custom',
    },
    {
      id: 'tips',
      icon: '💡',
      label: 'Tips & Advice',
      content: (display?.tips || selected.tips).map((tip, i) => (
        <li key={i} className="tip-item">
          <span>•</span>
          <span>{tip}</span>
        </li>
      )),
      type: 'list',
    },
  ] : []

  const handleShare = async () => {
    if (!selected) return
    const text = `ClinicPlus — ${selected.title}\n\nDocuments to bring:\n${selected.documents.map(d => `• ${d}`).join('\n')}\n\nProcess:\n${selected.process.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\nNHIS: ${selected.nhisCoverage}\n\nTime: ${selected.estimatedTime}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `ClinicPlus — ${selected.title}`, text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Checklist copied to clipboard!')
      }
    } catch (e) { console.warn(e) }
  }

  return (
    <div className="guide-wrapper">
      <div className="page-header" style={{ '--header-color': 'rgba(37,99,235,0.05)' }}>
        <div className="container">
          <div className="page-header-inner">
            <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
              🏥
            </div>
            <div>
              <h1>Hospital Guide</h1>
              <p>Select a service to see what to bring, what to expect, and what NHIS covers.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="guide-layout">
          {/* Service Selector */}
          <div className="service-list animate-stagger">
            {hospitalServices.map(svc => (
              <button
                key={svc.id}
                id={`service-${svc.id}`}
                className={`service-item ${selected?.id === svc.id ? 'active' : ''}`}
                onClick={() => { setSelected(svc); setExpandedSection('process'); setTranslated(null); }}
                style={{ '--svc-color': svc.color }}
              >
                <span className="svc-emoji">{svc.emoji}</span>
                <div className="svc-info">
                  <span className="svc-name">{svc.title}</span>
                  <span className="svc-desc">{svc.description.substring(0, 60)}...</span>
                </div>
                <ChevronDown size={16} className="svc-chevron" />
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="guide-detail">
            {!selected ? (
              <div className="guide-empty">
                <div className="guide-empty-icon">🏥</div>
                <h3>Select a Hospital Service</h3>
                <p>Choose a service from the left to see full preparation details, NHIS coverage, and step-by-step process.</p>
              </div>
            ) : (
              <div className="guide-detail-content animate-fade-in" key={selected.id}>
                {/* Header */}
                <div className="guide-detail-header" style={{ '--gd-color': selected.color }}>
                  <div className="gd-emoji">{selected.emoji}</div>
                  <div className="gd-info">
                    <h2>{isTranslating ? 'Translating...' : (display?.title || selected.title)}</h2>
                    <p>{isTranslating ? '' : (display?.description || selected.description)}</p>
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={handleShare} id="share-checklist-btn">
                    <Share2 size={14} /> Share
                  </button>
                </div>

                {/* Quick Info */}
                <div className="guide-quick-info">
                  <div className="quick-info-item">
                    <Clock size={16} style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <span className="qi-label">Estimated Time</span>
                      <span className="qi-value">{display?.estimatedTime || selected.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="quick-info-item">
                    <FileText size={16} style={{ color: 'var(--color-primary-light)' }} />
                    <div>
                      <span className="qi-label">Documents Needed</span>
                      <span className="qi-value">{selected.documents.length} items</span>
                    </div>
                  </div>
                  <div className="quick-info-item">
                    <AlertCircle size={16} style={{ color: 'var(--color-secondary)' }} />
                    <div>
                      <span className="qi-label">Cost (with NHIS)</span>
                      <span className="qi-value">{selected.cost?.split('.')[0] || 'See NHIS tab'}</span>
                    </div>
                  </div>
                </div>

                {/* Accordion Sections */}
                <div className="guide-sections">
                  {isTranslating ? (
                    <div className="flex items-center gap-3" style={{ padding: '2rem', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <div className="spinner" />
                      <span>Translating to {currentLang.toUpperCase()}...</span>
                    </div>
                  ) : sections.map(sec => (
                    <div key={sec.id} className="guide-section">
                      <button
                        className={`guide-section-header ${expandedSection === sec.id ? 'open' : ''}`}
                        onClick={() => setExpandedSection(sec.id === expandedSection ? null : sec.id)}
                        id={`guide-${sec.id}-toggle`}
                      >
                        <span>{sec.icon} {sec.label}</span>
                        {expandedSection === sec.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSection === sec.id && (
                        <div className="guide-section-body">
                          {sec.type === 'list' ? (
                            <ul className={`guide-list ${sec.id}-list`}>{sec.content}</ul>
                          ) : sec.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
