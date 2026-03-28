import { Link } from 'react-router-dom'
import { Shield, Hospital, Clock, BookOpen, ArrowRight, ChevronRight } from 'lucide-react'
import './Home.css'

const features = [
  {
    to: '/first-aid',
    id: 'home-first-aid-card',
    icon: '🆘',
    lucideIcon: Shield,
    title: 'First Aid Guide',
    tagline: 'Priority #1',
    description: '13 emergencies. Step-by-step instructions. No jargon. Works in English, Twi, Ewe, and Ga.',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.05))',
    border: 'rgba(239,68,68,0.3)',
    accent: '#EF4444',
    glow: 'rgba(239,68,68,0.2)',
    badge: '⚡ Life-saving',
  },
  {
    to: '/hospital-guide',
    id: 'home-hospital-guide-card',
    icon: '🏥',
    lucideIcon: Hospital,
    title: 'Hospital Guide',
    tagline: 'Priority #2',
    description: '12 services covered. Know exactly what documents to bring, the process, and what NHIS covers.',
    gradient: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(29,78,216,0.05))',
    border: 'rgba(37,99,235,0.3)',
    accent: '#2563EB',
    glow: 'rgba(37,99,235,0.2)',
    badge: '📋 Be prepared',
  },
  {
    to: '/wait-times',
    id: 'home-wait-times-card',
    icon: '⏱️',
    lucideIcon: Clock,
    title: 'Wait Times',
    tagline: 'Priority #3',
    description: 'Crowdsourced wait times for 5 Kumasi hospitals. Know before you go. Report your own wait.',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.05))',
    border: 'rgba(245,158,11,0.3)',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.2)',
    badge: '📊 Community data',
  },
  {
    to: '/journal',
    id: 'home-journal-card',
    icon: '📒',
    lucideIcon: BookOpen,
    title: 'Visit Journal',
    tagline: 'Priority #4',
    description: 'Your personal health notebook. Log visits, prescriptions, and remember what the doctor said.',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))',
    border: 'rgba(16,185,129,0.3)',
    accent: '#10B981',
    glow: 'rgba(16,185,129,0.2)',
    badge: '📝 Your notebook',
  },
]

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-glow hero-bg-glow-1" />
        <div className="hero-bg-glow hero-bg-glow-2" />
        <div className="container">
          <div className="hero-content animate-fade-up">
            <div className="hero-badge">
              <span>🇬🇭</span>
              <span>Built for Ghana · Hackathon 2025</span>
            </div>
            <h1 className="hero-title">
              Your hospital visit,
              <span className="hero-title-accent"> simplified</span>
              <br />— in any language.
            </h1>
            <p className="hero-subtitle">
              ClinicPlus helps Ghanaians handle health emergencies, prepare for hospital visits,
              understand wait times, and keep track of their health — in English, Twi, Ewe, and Ga.
            </p>
            <div className="hero-actions">
              <Link to="/first-aid" id="hero-first-aid-btn" className="btn btn-primary">
                <Shield size={18} />
                Open First Aid Guide
              </Link>
              <Link to="/hospital-guide" id="hero-guide-btn" className="btn btn-secondary">
                Prepare for Visit
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="hero-langs">
              <span className="hero-lang-pill">🇬🇭 English</span>
              <span className="hero-lang-pill">🌍 Twi</span>
              <span className="hero-lang-pill">🌍 Ewe</span>
              <span className="hero-lang-pill">🌍 Ga</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-label">Four features. One journey.</div>
          <h2 className="features-title">Everything you need,<br />before, during & after.</h2>
          <div className="features-grid animate-stagger">
            {features.map(feature => (
              <Link
                key={feature.to}
                to={feature.to}
                id={feature.id}
                className="feature-card"
                style={{
                  '--card-gradient': feature.gradient,
                  '--card-border': feature.border,
                  '--card-glow': feature.glow,
                }}
              >
                <div className="feature-card-top">
                  <div className="feature-emoji" aria-hidden="true">{feature.icon}</div>
                  <span className="feature-badge">{feature.badge}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-tagline" style={{ color: feature.accent }}>{feature.tagline}</p>
                <p className="feature-desc">{feature.description}</p>
                <div className="feature-cta">
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">13</span>
              <span className="stat-label">First Aid Emergencies</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Hospital Services Covered</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Kumasi Hospitals Tracked</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">4</span>
              <span className="stat-label">Languages Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Language CTA */}
      <section className="lang-cta-section">
        <div className="container">
          <div className="lang-cta-card">
            <div className="lang-cta-icon">🌍</div>
            <div className="lang-cta-text">
              <h3>Healthcare information in the language you think in</h3>
              <p>Switch between English, Twi, Ewe, and Ga from the top of any screen. Powered by GhanaNLP.</p>
            </div>
            <div className="lang-cta-flags">
              <div className="lang-flag-item"><span>🇬🇭</span><span>EN</span></div>
              <div className="lang-flag-item"><span>🌍</span><span>TW</span></div>
              <div className="lang-flag-item"><span>🌍</span><span>EWE</span></div>
              <div className="lang-flag-item"><span>🌍</span><span>GA</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
