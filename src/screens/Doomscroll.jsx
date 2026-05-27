import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import UsageStats from '../plugins/UsageStats'

const WAKING_DAY_MS = 16 * 3600 * 1000

function fmt(ms) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return '<1m'
}

function getDayPct(totalMs) {
  return Math.min(100, (totalMs / WAKING_DAY_MS) * 100)
}

function AppRow({ app, totalMs }) {
  const pct = Math.min(100, (app.timeMs / totalMs) * 100)
  return (
    <div className="doom-app-row">
      <div className="doom-app-meta">
        <span className="doom-app-name">{app.appName}</span>
        <span className="doom-app-time">{fmt(app.timeMs)}</span>
      </div>
      <div className="doom-app-track">
        <div className="doom-app-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function PermissionGate({ onGranted }) {
  const [checking, setChecking] = useState(true)
  const [denied,   setDenied]   = useState(false)

  useEffect(() => {
    UsageStats.hasPermission().then(({ granted }) => {
      if (granted) onGranted()
      else { setDenied(true); setChecking(false) }
    })
  }, [onGranted])

  async function openSettings() {
    await UsageStats.openPermissionSettings()
    // Re-check after returning from settings
    setTimeout(async () => {
      const { granted } = await UsageStats.hasPermission()
      if (granted) onGranted()
    }, 1000)
  }

  if (checking) return <div className="doom-permission-wrap"><p className="doom-label">Checking…</p></div>

  return (
    <div className="doom-permission-wrap">
      <div className="doom-permission-icon">📊</div>
      <h2 className="doom-permission-title">Usage access needed</h2>
      <p className="doom-permission-body">
        Tough Love needs one permission to read how long you spend in each app.
        It never leaves your device.
      </p>
      <div className="doom-permission-steps">
        {['Tap "Open Settings" below', 'Find "Tough Love"', 'Toggle Usage Access on', 'Come back here'].map((s, i) => (
          <div key={i} className="doom-permission-step">
            <span className="doom-permission-step-num">{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <button className="doom-btn-start" onClick={openSettings}>
        Open Settings →
      </button>
    </div>
  )
}

function UsageDashboard() {
  const [apps,     setApps]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [lastFetch, setLastFetch] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { apps: raw } = await UsageStats.getTodayUsage()
      const sorted = [...raw].sort((a, b) => b.timeMs - a.timeMs).slice(0, 10)
      setApps(sorted)
      setLastFetch(new Date())
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 60 * 1000) // refresh every minute
    return () => clearInterval(id)
  }, [load])

  const totalMs  = apps.reduce((s, a) => s + a.timeMs, 0)
  const dayPct   = getDayPct(totalMs)
  const intensity = Math.min(1, totalMs / (4 * 3600 * 1000)) // maxes at 4h
  const overlayOpacity = (intensity * 0.28).toFixed(3)

  return (
    <div className="doom-dashboard">
      <div className="doom-red-overlay" style={{ opacity: overlayOpacity }} />

      {/* Day drain bar */}
      <div className="doom-drain-wrap">
        <div className="doom-drain-header">
          <span className="doom-drain-label">Your waking day</span>
          <span className="doom-drain-pct">{dayPct.toFixed(1)}% on apps</span>
        </div>
        <div className="doom-drain-track">
          <div className="doom-drain-fill" style={{ width: `${dayPct}%` }} />
        </div>
      </div>

      {/* Total */}
      <div className="doom-total-row">
        <div>
          <p className="doom-total-label">Total today</p>
          <p className="doom-total-time">{loading ? '—' : fmt(totalMs)}</p>
        </div>
        <button className="doom-refresh-btn" onClick={load} disabled={loading}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* App list */}
      {loading && apps.length === 0 ? (
        <p className="doom-label" style={{ marginTop: 16 }}>Loading…</p>
      ) : apps.length === 0 ? (
        <p className="doom-label" style={{ marginTop: 16 }}>No app usage recorded yet today.</p>
      ) : (
        <div className="doom-app-list">
          {apps.map(app => (
            <AppRow key={app.packageName} app={app} totalMs={totalMs} />
          ))}
        </div>
      )}

      {lastFetch && (
        <p className="doom-last-fetch">
          Updated {lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

export default function Doomscroll() {
  const navigate  = useNavigate()
  const [granted, setGranted] = useState(false)

  return (
    <div className="doomscroll-screen">
      <div className="back-header" style={{ position: 'relative', zIndex: 1 }}>
        <button className="back-button" onClick={() => navigate('/clock')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="back-header-title">Doomscroll Tracker</span>
      </div>

      <div className="doomscroll-body" style={{ paddingTop: 16 }}>
        {granted
          ? <UsageDashboard />
          : <PermissionGate onGranted={() => setGranted(true)} />
        }
      </div>
    </div>
  )
}
