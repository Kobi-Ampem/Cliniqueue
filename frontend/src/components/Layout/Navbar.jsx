import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { useLanguage, LANGUAGES } from '../../context/LanguageContext'
import './Navbar.css'

export default function Navbar() {
  const { currentLang, setCurrentLang, translating } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/first-aid', label: 'First Aid' },
    { to: '/hospital-guide', label: 'Hospital Guide' },
    { to: '/wait-times', label: 'Wait Times' },
    { to: '/journal', label: 'My Journal' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Heart size={18} />
          </div>
          <span className="brand-text">Clinic<span className="brand-plus">Plus</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Language Selector */}
          <div className="lang-selector">
            {translating && <span className="lang-spinner" />}
            <select
              id="language-select"
              className="lang-select"
              value={currentLang}
              onChange={e => setCurrentLang(e.target.value)}
              aria-label="Select language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
