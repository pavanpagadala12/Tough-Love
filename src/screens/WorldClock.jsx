import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLocalTime, getLocalHour, getLocalDay, getAvailability, getUserTimezone } from '../utils/time'

const STORAGE_KEY = 'tl_world_clock_locations'

const CITY_OPTIONS = [
  { label: 'New York',     timezone: 'America/New_York' },
  { label: 'Los Angeles',  timezone: 'America/Los_Angeles' },
  { label: 'Chicago',      timezone: 'America/Chicago' },
  { label: 'Toronto',      timezone: 'America/Toronto' },
  { label: 'São Paulo',    timezone: 'America/Sao_Paulo' },
  { label: 'Mexico City',  timezone: 'America/Mexico_City' },
  { label: 'London',       timezone: 'Europe/London' },
  { label: 'Paris',        timezone: 'Europe/Paris' },
  { label: 'Berlin',       timezone: 'Europe/Berlin' },
  { label: 'Dubai',        timezone: 'Asia/Dubai' },
  { label: 'Mumbai',       timezone: 'Asia/Kolkata' },
  { label: 'Bangkok',      timezone: 'Asia/Bangkok' },
  { label: 'Singapore',    timezone: 'Asia/Singapore' },
  { label: 'Hong Kong',    timezone: 'Asia/Hong_Kong' },
  { label: 'Beijing',      timezone: 'Asia/Shanghai' },
  { label: 'Seoul',        timezone: 'Asia/Seoul' },
  { label: 'Tokyo',        timezone: 'Asia/Tokyo' },
  { label: 'Sydney',       timezone: 'Australia/Sydney' },
  { label: 'Cairo',        timezone: 'Africa/Cairo' },
  { label: 'Johannesburg', timezone: 'Africa/Johannesburg' },
]

const AVAIL_COLORS = {
  work:  '#10B981',
  awake: '#F59E0B',
  sleep: 'rgba(255,255,255,0.1)',
}

const AVAIL_LABELS = {
  work:  'In the zone',
  awake: 'Awake',
  sleep: 'Sleeping',
}

function loadLocations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function saveLocations(locs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locs))
}

function ClockCard({ location, now, isHome, onRemove }) {
  const time = getLocalTime(now, location.timezone)
  const day  = getLocalDay(now, location.timezone)
  const hour = getLocalHour(now, location.timezone)
  const avail = getAvailability(hour)

  return (
    <div className="wc-card">
      <div className="wc-card-left">
        <div className="wc-avail-dot" style={{ background: AVAIL_COLORS[avail] }} />
        <div>
          <p className="wc-city">{location.label}{isHome ? ' (you)' : ''}</p>
          <p className="wc-day">{day} · {AVAIL_LABELS[avail]}</p>
        </div>
      </div>
      <div className="wc-card-right">
        <p className="wc-time">{time}</p>
        {!isHome && (
          <button className="wc-remove" onClick={() => onRemove(location.timezone)} aria-label="Remove">
            ×
          </button>
        )}
      </div>
    </div>
  )
}

function OverlapBar({ locations, now }) {
  const allZones = locations.map(l => l.timezone)

  return (
    <div>
      <p className="label" style={{ marginBottom: 8 }}>Best overlap today</p>
      <div className="overlap-bar">
        {Array.from({ length: 24 }, (_, h) => {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0)
          const isCurrent = now.getHours() === h

          const allWork  = allZones.every(tz => getAvailability(getLocalHour(d, tz)) === 'work')
          const allAwake = allZones.every(tz => {
            const a = getAvailability(getLocalHour(d, tz))
            return a === 'work' || a === 'awake'
          })

          const bg = allWork ? '#10B981' : allAwake ? '#F59E0B' : 'var(--surface-hi)'

          return (
            <div
              key={h}
              className={`overlap-cell${isCurrent ? ' current' : ''}`}
              style={{ background: bg }}
              title={`${h}:00`}
            />
          )
        })}
      </div>
      <div className="overlap-legend">
        <span><span className="legend-dot" style={{ background: '#10B981' }} />All working</span>
        <span><span className="legend-dot" style={{ background: '#F59E0B' }} />All awake</span>
        <span><span className="legend-dot" style={{ background: 'var(--surface-hi)' }} />Someone sleeping</span>
      </div>
    </div>
  )
}

export default function WorldClock() {
  const navigate  = useNavigate()
  const homeZone  = getUserTimezone()
  const [saved, setSaved]     = useState(loadLocations)
  const [now, setNow]         = useState(new Date())
  const [showSheet, setShowSheet] = useState(false)
  const [search, setSearch]   = useState('')

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  function addLocation(city) {
    if (city.timezone === homeZone) return
    if (saved.some(s => s.timezone === city.timezone)) return
    const next = [...saved, city]
    setSaved(next)
    saveLocations(next)
    setShowSheet(false)
    setSearch('')
  }

  function removeLocation(timezone) {
    const next = saved.filter(l => l.timezone !== timezone)
    setSaved(next)
    saveLocations(next)
  }

  const homeLocation = { label: homeZone.split('/').pop().replace(/_/g, ' '), timezone: homeZone }
  const allLocations = [homeLocation, ...saved]

  const filteredCities = CITY_OPTIONS.filter(c =>
    c.timezone !== homeZone &&
    !saved.some(s => s.timezone === c.timezone) &&
    (c.label.toLowerCase().includes(search.toLowerCase()) ||
     c.timezone.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="wc-screen">
      <div className="back-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="back-header-title">World Clock</span>
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>
        {/* Clock cards */}
        <div className="wc-list">
          {allLocations.map((loc, i) => (
            <ClockCard
              key={loc.timezone}
              location={loc}
              now={now}
              isHome={i === 0}
              onRemove={removeLocation}
            />
          ))}
        </div>

        {/* Overlap bar (only shown with 2+ zones) */}
        {allLocations.length >= 2 && (
          <OverlapBar locations={allLocations} now={now} />
        )}

        {/* Add location */}
        <button className="btn-primary" onClick={() => setShowSheet(true)}>
          + Add location
        </button>
      </div>

      {/* Add location sheet */}
      {showSheet && (
        <div className="sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Add a location</p>
            <input
              className="input-field"
              placeholder="Search cities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: 12 }}
            />
            <div className="sheet-list">
              {filteredCities.map(city => (
                <button key={city.timezone} className="sheet-city-row" onClick={() => addLocation(city)}>
                  <span className="sheet-city-name">{city.label}</span>
                  <span className="sheet-city-tz">{getLocalTime(now, city.timezone)}</span>
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-sm text-2" style={{ padding: '12px 0' }}>No results</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
