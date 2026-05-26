import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimer } from '../hooks/useTimer'

const DURATIONS = [15, 25, 45, 60]

const R    = 88
const CX   = 100
const CY   = 100
const CIRC = 2 * Math.PI * R   // ≈ 553

function getTimerColor(fraction) {
  if (fraction > 0.5) return '#7C6FF7'   // purple
  if (fraction > 0.2) return '#F59E0B'   // amber
  return '#EF4444'                        // red
}

function getStatusLabel(fraction, status, duration) {
  if (status === 'idle')   return `${duration} min`
  if (status === 'done')   return 'Well done.'
  if (status === 'paused') return 'Paused'
  if (fraction > 0.7)  return 'Plenty of time'
  if (fraction > 0.4)  return 'Stay focused'
  if (fraction > 0.15) return 'Getting close'
  return 'Final stretch'
}

function CircularTimer({ fraction, status }) {
  const filled = status === 'idle' ? 1 : Math.max(0, Math.min(1, fraction))
  const dash   = CIRC * filled
  const gap    = CIRC - dash
  const color  = getTimerColor(status === 'idle' ? 1 : fraction)

  return (
    <svg viewBox="0 0 200 200" className="ct-svg" aria-hidden>
      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />

      {/* Progress ring */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        transform={`rotate(-90 ${CX} ${CY})`}
        filter="url(#glow)"
        style={{ transition: 'stroke-dasharray 0.6s ease, stroke 1.5s ease' }}
      />
    </svg>
  )
}

export default function Home() {
  const [selectedDuration, setSelectedDuration] = useState(25)
  const durationSeconds = selectedDuration * 60
  const { remaining, status, start, pause, reset } = useTimer(durationSeconds)
  const fraction = remaining / durationSeconds
  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'done') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session complete', { body: 'You did it. Well done.' })
      }
    }
  }, [status])

  const color = getTimerColor(status === 'idle' ? 1 : fraction)

  return (
    <>
      <div className="screen-header">
        <p className="label">Empathy Clock</p>
        <h1 className="screen-header-title">Your time,<br />clearly.</h1>
      </div>

      <div className="screen-body">
        <div className="home-desktop">

          {/* Left column — timer */}
          <div className="home-col-left">
            <div className="ct-wrapper">
              <CircularTimer fraction={fraction} status={status} />
              <div className="ct-center">
                <p className="ct-label" style={{ color }}>
                  {getStatusLabel(fraction, status, selectedDuration)}
                </p>
              </div>
            </div>

            {(status === 'idle' || status === 'done') && (
              <div className="duration-picker">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    className={`duration-pill${selectedDuration === d ? ' active' : ''}`}
                    onClick={() => { setSelectedDuration(d); reset() }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            )}

            <div className="timer-controls">
              {status === 'idle'    && <button className="btn-primary" onClick={start}>Start session</button>}
              {status === 'running' && (
                <>
                  <button className="btn-primary" onClick={pause}>Pause</button>
                  <button className="btn-ghost" onClick={reset}>Reset</button>
                </>
              )}
              {status === 'paused'  && (
                <>
                  <button className="btn-primary" onClick={start}>Resume</button>
                  <button className="btn-ghost" onClick={reset}>Reset</button>
                </>
              )}
              {status === 'done'    && <button className="btn-primary" onClick={reset}>New session</button>}
            </div>
          </div>

          {/* Right column — tools */}
          <div className="home-col-right">
            <p className="label" style={{ paddingLeft: 2 }}>More tools</p>

            <button className="tool-card" onClick={() => navigate('/doomscroll')}>
              <div className="tool-card-text">
                <p className="tool-card-title">Doomscroll Stopwatch</p>
                <p className="tool-card-body">Time your next scroll session honestly.</p>
              </div>
              <span className="tool-card-arrow">→</span>
            </button>

            <button className="tool-card" onClick={() => navigate('/world-clock')}>
              <div className="tool-card-text">
                <p className="tool-card-title">World Clock</p>
                <p className="tool-card-body">See who's awake, in the zone, or asleep.</p>
              </div>
              <span className="tool-card-arrow">→</span>
            </button>

            <button className="tool-card" onClick={() => navigate('/alarms')}>
              <div className="tool-card-text">
                <p className="tool-card-title">Alarms</p>
                <p className="tool-card-body">Wake smart. Wind down with a fading screen.</p>
              </div>
              <span className="tool-card-arrow">→</span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
