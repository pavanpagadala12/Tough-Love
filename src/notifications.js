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
