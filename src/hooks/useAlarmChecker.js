import { useEffect, useRef } from 'react'

const WAKE_KEY    = 'tl_wake_alarm'
const REVERSE_KEY = 'tl_reverse_alarm'
const FIRED_KEY   = 'tl_alarm_fired'

const WAKE_DEF    = { enabled: false, target_time: '07:00', light_sleep_window_minutes: 30, days_of_week: [1,2,3,4,5,6,7] }
const REVERSE_DEF = { enabled: false, target_time: '23:00', days_of_week: [1,2,3,4,5,6,7] }

function load(key, def) {
  try { return { ...def, ...JSON.parse(localStorage.getItem(key)) } }
  catch { return def }
}

function timeToSecs(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 3600 + m * 60
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function hasFiredToday(type) {
  try {
    return (JSON.parse(localStorage.getItem(FIRED_KEY)) || {})[type] === todayISO()
  } catch { return false }
}

function markFired(type) {
  try {
    const fired = JSON.parse(localStorage.getItem(FIRED_KEY)) || {}
    fired[type] = todayISO()
    localStorage.setItem(FIRED_KEY, JSON.stringify(fired))
  } catch {}
}

export function useAlarmChecker({ onWakeFire, onReverseFire }) {
  const wakeRef    = useRef(onWakeFire)
  const reverseRef = useRef(onReverseFire)

  // Keep refs current without re-running the interval
  useEffect(() => { wakeRef.current    = onWakeFire    })
  useEffect(() => { reverseRef.current = onReverseFire })

  useEffect(() => {
    function check() {
      const now       = new Date()
      const nowSecs   = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay() // 1=Mon … 7=Sun

      const wake    = load(WAKE_KEY,    WAKE_DEF)
      const reverse = load(REVERSE_KEY, REVERSE_DEF)

      // Wake: fire at start of the light-sleep window
      if (wake.enabled && !hasFiredToday('wake') && wake.days_of_week.includes(dayOfWeek)) {
        const windowStart = timeToSecs(wake.target_time) - wake.light_sleep_window_minutes * 60
        if (nowSecs >= windowStart && nowSecs < windowStart + 60) {
          markFired('wake')
          wakeRef.current()
        }
      }

      // Reverse: fire at target bedtime
      if (reverse.enabled && !hasFiredToday('reverse') && reverse.days_of_week.includes(dayOfWeek)) {
        const targetSecs = timeToSecs(reverse.target_time)
        if (nowSecs >= targetSecs && nowSecs < targetSecs + 60) {
          markFired('reverse')
          reverseRef.current()
        }
      }
    }

    const id = setInterval(check, 30000)
    check() // also check immediately on mount
    return () => clearInterval(id)
  }, []) // empty — interval is stable; callbacks accessed via refs
}
