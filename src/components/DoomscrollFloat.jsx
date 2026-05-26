import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatStopwatch } from '../utils/time'
import { isGranted } from '../notifications'

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.55)
    setTimeout(() => ctx.close(), 1200)
  } catch (_) {}
}

export default function DoomscrollFloat({ elapsed, running, stop }) {
  const navigate      = useNavigate()
  const { pathname }  = useLocation()
  const lastMarkRef   = useRef(0)

  // Reset beep tracker when timer clears
  useEffect(() => { if (elapsed === 0) lastMarkRef.current = 0 }, [elapsed])

  // 10-minute beep + notification
  useEffect(() => {
    if (!running) return
    const mark = Math.floor(elapsed / 600) // 600 s = 10 min
    if (mark > 0 && mark > lastMarkRef.current) {
      lastMarkRef.current = mark
      playBeep()
      if (isGranted()) {
        new Notification(`${mark * 10} minutes gone`, {
          body: 'Still scrolling? Maybe time to stop.',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
        })
      }
    }
  }, [elapsed, running])

  // Don't render on the doomscroll screen itself, or when not running
  if (!running || pathname === '/doomscroll') return null

  const minutes = Math.floor(elapsed / 60)
  const label =
    minutes < 5  ? 'Just a few minutes… right?' :
    minutes < 15 ? `${minutes} minutes. Still going?` :
    minutes < 30 ? `${minutes} minutes of your life.` :
    minutes < 60 ? `${minutes} minutes gone.` :
                   `Over an hour. Time to stop.`

  return createPortal(
    <div className="doom-float" onClick={() => navigate('/doomscroll')}>
      <div className="doom-float-row">
        <div className="doom-float-left">
          <span className="doom-float-dot" />
          <span className="doom-float-time">{formatStopwatch(elapsed)}</span>
        </div>
        <button
          className="doom-float-stop"
          aria-label="Stop timer"
          onClick={e => { e.stopPropagation(); stop() }}
        >
          ■
        </button>
      </div>
      <p className="doom-float-label">{label}</p>
    </div>,
    document.body
  )
}
