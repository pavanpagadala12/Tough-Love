import { useNavigate } from 'react-router-dom'
import { formatStopwatch } from '../utils/time'

export default function Doomscroll({ elapsed, running, start, stop, reset }) {
  const navigate = useNavigate()

  const minutes = Math.floor(elapsed / 60)
  const honestLabel =
    elapsed === 0          ? 'Ready to be honest with yourself?' :
    minutes < 5            ? 'Just a few minutes… right?' :
    minutes < 15           ? `${minutes} minutes. Still going?` :
    minutes < 30           ? `${minutes} minutes of your life.` :
    minutes < 60           ? `${minutes} minutes gone.` :
                             `Over an hour. Time to stop.`

  return (
    <div className="doomscroll-screen">
      {/* Sub-header */}
      <div className="back-header">
        <button className="back-button" onClick={() => navigate('/clock')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="back-header-title">Doomscroll Stopwatch</span>
      </div>

      <div className="doomscroll-body">
        {/* Blinking indicator */}
        {running && (
          <div className="doom-live-row">
            <span className="doom-live-dot" />
            <span className="doom-live-label">Tracking</span>
          </div>
        )}

        {/* Big time display */}
        <div className="doom-time">{formatStopwatch(elapsed)}</div>

        {/* Honest label */}
        <p className="doom-label">{honestLabel}</p>

        {/* Controls */}
        <div className="doom-controls">
          {!running && elapsed === 0 && (
            <button className="doom-btn-start" onClick={start}>
              Start timing
            </button>
          )}
          {running && (
            <button className="doom-btn-stop" onClick={stop}>
              Stop
            </button>
          )}
          {!running && elapsed > 0 && (
            <>
              <button className="doom-btn-start" onClick={start}>Resume</button>
              <button className="btn-ghost" onClick={reset} style={{ color: 'rgba(239,68,68,0.6)' }}>
                Reset
              </button>
            </>
          )}
        </div>

        {/* Escape hatch — always visible */}
        {elapsed > 0 && !running && (
          <button className="doom-done-btn" onClick={() => { reset(); navigate('/clock') }}>
            Done scrolling
          </button>
        )}
      </div>
    </div>
  )
}
