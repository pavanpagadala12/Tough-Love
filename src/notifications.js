// Push notification helpers
// v1: local Notification API only — no server push yet
// v2: add VAPID subscription when backend push endpoint is ready

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

export function isGranted() {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function fireLocalNotification(title, body, icon = '/favicon.svg') {
  if (!isGranted()) return null
  return new Notification(title, { body, icon, badge: '/favicon.svg' })
}

// ── Daily Rhythm notifications ─────────────────────────────────────
let rhythmTimeouts = []

export function scheduleRhythmDay(schedule, categories) {
  clearRhythmDay()
  if (!isGranted()) return

  const nowMs = Date.now()

  schedule.forEach(event => {
    if (!categories[event.category]) return

    const target = new Date()
    target.setHours(Math.floor(event.minutes / 60), event.minutes % 60, 0, 0)

    const msUntil = target.getTime() - nowMs
    if (msUntil <= 0) return

    const id = setTimeout(() => fireLocalNotification(event.label, event.desc), msUntil)
    rhythmTimeouts.push(id)
  })
}

export function clearRhythmDay() {
  rhythmTimeouts.forEach(id => clearTimeout(id))
  rhythmTimeouts = []
}
