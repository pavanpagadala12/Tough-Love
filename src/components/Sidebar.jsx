import { NavLink } from 'react-router-dom'

function ClockLogo() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
      <circle cx="50" cy="50" r="50" fill="#0D0D12" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(124,111,247,0.18)" strokeWidth="14" />
      <path d="M 50 16 A 34 34 0 1 1 26 74" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 17 59 A 34 34 0 0 1 50 16" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
      <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(124,111,247,0.38)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(248,246,255,0.92)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const tabs = [
  {
    to: '/clock',
    label: 'Clock',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ClockLogo />
        <span className="sidebar-brand-name">Tough Love</span>
      </div>

      <nav className="sidebar-nav">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-item-icon">{icon}</span>
            <span className="sidebar-item-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">v1 · Free forever</p>
      </div>
    </aside>
  )
}
