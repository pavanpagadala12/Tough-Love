export function formatStopwatch(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export function getLocalTime(date, timezone, hour12 = true) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  }).format(date)
}

export function getLocalHour(date, timezone) {
  const v = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).format(date)
  )
  return v === 24 ? 0 : v
}

export function getLocalDay(date, timezone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function getAvailability(hour) {
  if (hour >= 9 && hour < 18) return 'work'
  if ((hour >= 6 && hour < 9) || (hour >= 18 && hour < 22)) return 'awake'
  return 'sleep'
}

export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
