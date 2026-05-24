import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimer } from '../hooks/useTimer'

const DURATIONS = [15, 25, 45, 60]
const BLOCKS = 30
const COLS = 6

function getTimerColor(fraction) {
  if (fraction > 0.5) return '#7C6FF7'
  if (fraction > 0.2) return '#F59E0B'
  return '#EF4444'
}

function getStatusLabel(fraction, status, duration) {
  if (status === 'idle')   return `${duration} min session`
  if (status === 'done')   return 'Well done.'
  if (status === 'paused') return 'Paused — pick back up when ready'
  if (fraction > 0.7)  return 'Plenty of time'
  if (fraction > 0.4)  return 'Stay focused'
  if (fraction > 0.15) return 'Getting close'
  return 'The final stretch'
}

function TimerBlocks({ fraction }) {
  const color = getTimerColor(fraction)
  const filledFloat = Math.max(0, Math.min(BLOCKS, fraction * BLOCKS))

  return (
    <div className="timer-grid">
      {Array.from({ length: BLOCKS }, (_, i) => {
        let fill
        if (i < Math.floor(filledFloat))       fill = 1
        else if (i === Math.floor(filledFloat)) fill = filledFloat % 1
        else                                    fill = 0

        return (
          <div key={i} className="timer-block">
            <div
              className="timer-block-fill"
              style={{ width: `${fill * 100}%`, background: color }}
            />
          </div>
        )
      })}
    </div>
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

  return (
    <>
      <div className="screen-header">
        <p className="label">Empathy Clock</p>
        <h1 className="screen-header-title">Your time,<br />clearly.</h1>
      </div>

      <div className="screen-body">
        {/* Duration picker — only shown when idle */}
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

        {/* Timer block grid */}
        <div className="timer-card">
          <TimerBlocks fraction={status === 'idle' ? 1 : fraction} />
          <p className="timer-status-label">
            {getStatusLabel(fraction, status, selectedDuration)}
          </p>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          {status === 'idle' && (
            <button className="btn-primary" onClick={start}>
              Start session
            </button>
          )}
          {status === 'running' && (
            <>
              <button className="btn-primary" onClick={pause}>Pause</button>
              <button className="btn-ghost" onClick={reset}>Reset</button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button className="btn-primary" onClick={start}>Resume</button>
              <button className="btn-ghost" onClick={reset}>Reset</button>
            </>
          )}
          {status === 'done' && (
            <button className="btn-primary" onClick={reset}>New session</button>
          )}
        </div>

        <div className="section-divider" />

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
    </>
  )
}
