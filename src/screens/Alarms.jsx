import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WAKE_KEY    = 'tl_wake_alarm'
const REVERSE_KEY = 'tl_reverse_alarm'

const WAKE_DEF    = { enabled: false, target_time: '07:00', light_sleep_window_minutes: 30, days_of_week: [1,2,3,4,5,6,7] }
const REVERSE_DEF = { enabled: false, target_time: '23:00', days_of_week: [1,2,3,4,5,6,7] }

function load(key, def) {
  try { return { ...def, ...JSON.parse(localStorage.getItem(key)) } }
  catch { return def }
}

function persist(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const p = await Notification.requestPermission()
  return p === 'granted'
}

const DAYS = [
  { num: 1, label: 'M' }, { num: 2, label: 'T' }, { num: 3, label: 'W' },
  { num: 4, label: 'T' }, { num: 5, label: 'F' }, { num: 6, label: 'S' },
  { num: 7, label: 'S' },
]

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

function DayPicker({ value, onChange }) {
  function toggle(day) {
    if (value.includes(day)) {
      if (value.length === 1) return
      onChange(value.filter(d => d !== day))
    } else {
      onChange([...value, day].sort((a, b) => a - b))
    }
  }
  return (
    <div className="day-picker">
      {DAYS.map(({ num, label }) => (
        <button
          key={num}
          className={`day-pill${value.includes(num) ? ' active' : ''}`}
          onClick={() => toggle(num)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function AlarmCard({ title, icon, alarm, onUpdate, children }) {
  async function handleToggle(enabled) {
    if (enabled) await requestNotifPermission()
    onUpdate({ ...alarm, enabled })
  }

  return (
    <div className="alarm-card">
      <div className="alarm-card-header">
        <div className="alarm-card-header-left">
          <span className="alarm-card-icon">{icon}</span>
          <p className="alarm-card-title">{title}</p>
        </div>
        <Toggle checked={alarm.enabled} onChange={handleToggle} />
      </div>

      {alarm.enabled && (
        <div className="alarm-card-body">
          {children}
          <div className="alarm-field">
            <p className="alarm-field-label">Repeat</p>
            <DayPicker
              value={alarm.days_of_week}
              onChange={days => onUpdate({ ...alarm, days_of_week: days })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Alarms() {
  const navigate = useNavigate()
  const [wake,    setWake]    = useState(() => load(WAKE_KEY,    WAKE_DEF))
  const [reverse, setReverse] = useState(() => load(REVERSE_KEY, REVERSE_DEF))

  function updateWake(a)    { setWake(a);    persist(WAKE_KEY,    a) }
  function updateReverse(a) { setReverse(a); persist(REVERSE_KEY, a) }

  return (
    <>
      <div className="back-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="back-header-title">Alarms</span>
      </div>

      <div className="screen-body" style={{ paddingTop: 20 }}>

        {/* Wake Alarm */}
        <AlarmCard title="Wake Alarm" icon="🌅" alarm={wake} onUpdate={updateWake}>
          <div className="alarm-field">
            <p className="alarm-field-label">Target wake time</p>
            <input
              type="time"
              className="time-input"
              value={wake.target_time}
              onChange={e => updateWake({ ...wake, target_time: e.target.value })}
            />
          </div>
          <div className="alarm-field">
            <p className="alarm-field-label">Light sleep window</p>
            <div className="window-picker">
              {[15, 20, 30].map(w => (
                <button
                  key={w}
                  className={`window-pill${wake.light_sleep_window_minutes === w ? ' active' : ''}`}
                  onClick={() => updateWake({ ...wake, light_sleep_window_minutes: w })}
                >
                  {w} min
                </button>
              ))}
            </div>
            <p className="alarm-field-hint">
              The alarm fires at the start of this window before your target time — giving you the best
              chance of waking in a lighter sleep phase rather than deep sleep.
            </p>
          </div>
        </AlarmCard>

        {/* Reverse Alarm */}
        <AlarmCard title="Reverse Alarm" icon="🌙" alarm={reverse} onUpdate={updateReverse}>
          <div className="alarm-field">
            <p className="alarm-field-label">Bedtime</p>
            <input
              type="time"
              className="time-input"
              value={reverse.target_time}
              onChange={e => updateReverse({ ...reverse, target_time: e.target.value })}
            />
          </div>
          <div className="alarm-field">
            <p className="alarm-field-hint">
              At bedtime, your screen gently fades to grayscale over two minutes.
              The colour is gone — scrolling gets less rewarding, and your eyes
              thank you.
            </p>
          </div>
        </AlarmCard>

        <div className="alarm-notice">
          <p>
            Alarms fire while Tough Love is open in your browser. For the most
            reliable experience, add this app to your home screen.
          </p>
        </div>

      </div>
    </>
  )
}
