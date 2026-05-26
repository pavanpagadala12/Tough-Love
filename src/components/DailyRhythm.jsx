import { useState, useEffect } from 'react'
import { buildRhythmSchedule, timeToMinutes, minutesToDisplay, getCurrentMinutes } from '../utils/rhythm'
import { requestPermission, scheduleRhythmDay, clearRhythmDay } from '../notifications'

const RHYTHM_KEY = 'tl_rhythm'
const RHYTHM_DEF = {
  enabled:    false,
  wake_time:  '07:00',
  sleep_time: '23:00',
  chronotype: 'intermediate',
  categories: { morning: true, focus: true, afternoon: true, sleep: true },
}

function loadRhythm() {
  try { return { ...RHYTHM_DEF, ...JSON.parse(localStorage.getItem(RHYTHM_KEY)) } }
  catch { return RHYTHM_DEF }
}
function saveRhythm(r) { localStorage.setItem(RHYTHM_KEY, JSON.stringify(r)) }

const CAT_LABELS = { morning: 'Morning', focus: 'Focus', afternoon: 'Afternoon', sleep: 'Sleep' }

function gapPx(diffMin) {
  if (diffMin <= 5)   return 4
  if (diffMin <= 15)  return 8
  if (diffMin <= 60)  return 20
  if (diffMin <= 120) return 34
  return 50
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`toggle${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    />
  )
}

export default function DailyRhythm() {
  const [rhythm,    setRhythm]    = useState(loadRhythm)
  const [showSetup, setShowSetup] = useState(false)
  const [now,       setNow]       = useState(getCurrentMinutes)

  useEffect(() => {
    const id = setInterval(() => setNow(getCurrentMinutes()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!rhythm.enabled) { clearRhythmDay(); return }
    const schedule = buildRhythmSchedule(rhythm.wake_time, rhythm.sleep_time, rhythm.chronotype)
    scheduleRhythmDay(schedule, rhythm.categories)
  }, [rhythm])

  function update(r) { setRhythm(r); saveRhythm(r) }

  async function handleEnable(enabled) {
    if (enabled) await requestPermission()
    update({ ...rhythm, enabled })
  }

  const wakeMin  = timeToMinutes(rhythm.wake_time)
  const sleepMin = timeToMinutes(rhythm.sleep_time)
  const sleepAdj = sleepMin <= wakeMin ? sleepMin + 1440 : sleepMin

  const schedule = buildRhythmSchedule(rhythm.wake_time, rhythm.sleep_time, rhythm.chronotype)

  const nowFromWake = (now - wakeMin + 1440) % 1440

  const enriched = schedule.map(e => ({
    ...e,
    fromWake: (e.minutes - wakeMin + 1440) % 1440,
    enabled:  rhythm.categories[e.category],
    past:     ((e.minutes - wakeMin + 1440) % 1440) < nowFromWake,
  }))

  // Index of first future event (where the Now line goes before it)
  const nowIdx = enriched.findIndex(e => !e.past)

  return (
    <div className="alarm-card rhythm-card">

      {/* ── Header ── */}
      <div className="alarm-card-header">
        <div className="alarm-card-header-left">
          <span className="alarm-card-icon">🕐</span>
          <p className="alarm-card-title">Daily Rhythm</p>
        </div>
        <div className="rhythm-header-right">
          <button className="rhythm-setup-btn" onClick={() => setShowSetup(true)}>Setup</button>
          <Toggle checked={rhythm.enabled} onChange={handleEnable} />
        </div>
      </div>

      {/* ── Anchor ── */}
      <p className="rhythm-anchor">
        {minutesToDisplay(wakeMin)} wake · {minutesToDisplay(sleepMin)} sleep ·{' '}
        <span className="rhythm-anchor-type">{rhythm.chronotype}</span>
      </p>

      {/* ── Category pills ── */}
      <div className="rhythm-cats">
        {Object.keys(CAT_LABELS).map(cat => (
          <button
            key={cat}
            className={`rhythm-cat rhythm-cat--${cat}${rhythm.categories[cat] ? ' active' : ''}`}
            onClick={() => update({
              ...rhythm,
              categories: { ...rhythm.categories, [cat]: !rhythm.categories[cat] },
            })}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className="rhythm-timeline">
        {enriched.map((event, i) => {
          const prev    = enriched[i - 1]
          const diffMin = i === 0 ? 0 : event.fromWake - prev.fromWake
          const gap     = gapPx(diffMin)

          return (
            <div key={event.id}>
              {/* Now line — before first future event, only if some events are past */}
              {i === nowIdx && nowIdx > 0 && <NowLine now={now} />}

              <div
                className={[
                  'rhythm-event',
                  `rhythm-event--${event.category}`,
                  event.past    ? 'rhythm-event--past' : '',
                  !event.enabled ? 'rhythm-event--off'  : '',
                ].filter(Boolean).join(' ')}
                style={{ '--gap': `${gap}px` }}
              >
                <span className="rhythm-event-time">{event.display}</span>

                <div className="rhythm-event-spine">
                  <div className="rhythm-event-dot" />
                  <div className="rhythm-event-line" />
                </div>

                <div className="rhythm-event-body">
                  <p className="rhythm-event-label">{event.icon} {event.label}</p>
                  {event.enabled && !event.past && (
                    <p className="rhythm-event-desc">{event.desc}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* ── Sleep target marker ── */}
        {(() => {
          const sleepFromWake = sleepAdj - wakeMin
          const last = enriched[enriched.length - 1]
          const gap  = last ? gapPx(sleepFromWake - last.fromWake) : 4
          return (
            <div className="rhythm-event rhythm-sleep-end" style={{ '--gap': `${gap}px` }}>
              <span className="rhythm-event-time">{minutesToDisplay(sleepMin)}</span>
              <div className="rhythm-event-spine">
                <div className="rhythm-event-dot rhythm-dot--sleep-end" />
              </div>
              <p className="rhythm-event-label rhythm-sleep-end-label">Sleep</p>
            </div>
          )
        })()}
      </div>

      {/* ── Setup sheet ── */}
      {showSetup && (
        <div className="sheet-backdrop" onClick={() => setShowSetup(false)}>
          <div className="sheet-overlay" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Daily Rhythm Setup</p>

            <div className="alarm-field">
              <p className="alarm-field-label">Wake time</p>
              <input
                type="time"
                className="time-input"
                value={rhythm.wake_time}
                onChange={e => update({ ...rhythm, wake_time: e.target.value })}
              />
            </div>

            <div className="alarm-field">
              <p className="alarm-field-label">Sleep target</p>
              <input
                type="time"
                className="time-input"
                value={rhythm.sleep_time}
                onChange={e => update({ ...rhythm, sleep_time: e.target.value })}
              />
            </div>

            <div className="alarm-field">
              <p className="alarm-field-label">Chronotype</p>
              <div className="window-picker">
                {['morning', 'intermediate', 'evening'].map(c => (
                  <button
                    key={c}
                    className={`window-pill${rhythm.chronotype === c ? ' active' : ''}`}
                    onClick={() => update({ ...rhythm, chronotype: c })}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
              <p className="alarm-field-hint">
                Morning waker or night owl? This shifts your peak focus window by up to 60 minutes.
              </p>
            </div>

            <button className="btn-ghost rhythm-setup-done" onClick={() => setShowSetup(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NowLine({ now }) {
  const h24  = Math.floor(now / 60)
  const mm   = now % 60
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  const h12  = h24 % 12 || 12
  const disp = `${h12}:${String(mm).padStart(2, '0')} ${ampm}`

  return (
    <div className="rhythm-now">
      <span className="rhythm-now-time">{disp}</span>
      <div className="rhythm-now-spine">
        <div className="rhythm-now-dot" />
      </div>
      <div className="rhythm-now-rule" />
    </div>
  )
}
