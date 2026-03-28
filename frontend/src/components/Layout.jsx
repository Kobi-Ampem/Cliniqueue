import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.js'
import { NAV_ICONS } from './navIcons.js'

const nav = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/first-aid', label: 'First Aid', icon: 'firstAid' },
  { to: '/prepare', label: 'Prepare', icon: 'prepare' },
  { to: '/wait-times', label: 'Wait', icon: 'wait' },
  { to: '/visits', label: 'Visits', icon: 'visits' },
]

function LanguageSelect() {
  const { lang, setLang, langs, translationWarning } = useLanguage()

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="sr-only" htmlFor="lang-select">
        Language
      </label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm font-medium text-stone-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {langs.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      {translationWarning === 'unavailable' && (
        <p className="max-w-[14rem] text-right text-xs text-amber-700">
          Translation unavailable — showing English. Check Khaya API key, CORS,
          or use a backend proxy.
        </p>
      )}
    </div>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 font-sans text-stone-800">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex w-full items-center justify-between gap-3">
          <NavLink to="/" className="min-w-0 flex-1 text-left">
            <p className="truncate text-5xl font-bold leading-tight tracking-tight text-brand-700 sm:text-4xl">
              cliniKLAN
            </p>
            <p className="truncate text-sm text-stone-500 sm:text-base">
              Your hospital visit, simplified
            </p>
          </NavLink>
          <LanguageSelect />
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white/95 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur"
        aria-label="Main"
      >
        <ul className="mx-auto flex max-w-lg justify-between">
          {nav.map(({ to, label, icon }) => {
            const Icon = NAV_ICONS[icon]
            return (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    [
                      'flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium sm:text-xs',
                      isActive
                        ? 'text-brand-700'
                        : 'text-stone-500 hover:text-stone-700',
                    ].join(' ')
                  }
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
