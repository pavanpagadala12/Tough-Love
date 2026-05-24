import { useEffect } from 'react'

export function WakeAlarmOverlay({ onDismiss }) {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())

  useEffect(() => {
    if ('vibrate' in navigator) navigator.vibrate([400, 200, 400, 200, 400])
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Good morning ☀️', { body: 'Your alarm is going off.' })
    }
  }, [])

  return (
    <div className="wake-overlay">
      <div className="wake-overlay-content">
        <p className="wake-overlay-time">{time}</p>
        <p className="wake-overlay-greeting">Good morning.</p>
        <p className="wake-overlay-sub">You asked for this one.</p>
        <button className="wake-dismiss-btn" onClick={onDismiss}>
          I'm up
        </button>
      </div>
    </div>
  )
}

export function ReverseAlarmOverlay({ onDismiss }) {
  return (
    <div className="reverse-overlay">
      <div className="reverse-overlay-card">
        <div className="reverse-overlay-icon">🌙</div>
        <p className="reverse-overlay-title">Time to rest.</p>
        <p className="reverse-overlay-body">
          Your screen is fading. Your future self thanks you.
        </p>
        <button className="reverse-dismiss-btn" onClick={onDismiss}>
          Dismiss
        </button>
        <p className="reverse-dismiss-note">(You know you shouldn't keep scrolling.)</p>
      </div>
    </div>
  )
}
