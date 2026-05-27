import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatStopwatch } from '../utils/time'

const WAKING_DAY_SECONDS = 16 * 3600

function getDayPct(elapsed) {
  return Math.min(100, (elapsed / WAKING_DAY_SECONDS) * 100)
}

function getRedIntensity(elapsed) {
  return Math.min(1, elapsed / 3600)
}

function getOpportunityCards(elapsed) {
  const minutes = Math.max(1, Math.floor(elapsed / 60))
  const pages   = Math.max(1, Math.round(minutes * 1.5))
  const words   = Math.max(50, minutes * 40)
  return [
    { icon: '📖', text: `Read ${pages} page${pages !== 1 ? 's' : ''} of a book` },
    { icon: '🚶', text: `Taken a ${minutes}-minute walk outside` },
    { icon: '✍️', text: `Written ${words.toLocaleString()} words` },
    { icon: '📞', text: minutes >= 5 ? "Called someone you haven't spoken to in a while" : 'Sent 10 meaningful messages' },
    { icon: '🧘', text: minutes >= 10 ? `Done a ${minutes}-minute meditation` : 'Done a breathing exercise' },
    { icon: '💪', text: minutes >= 15 ? `Finished a ${minutes}-minute workout` : 'Done 3 sets of pushups' },
  ]
}

function DayDrainBar({ elapsed }) {
  const pct     = getDayPct(elapsed)
  const display = pct < 0.1 ? '<0.1' : pct.toFixed(1)
  return (
    <div className="doom-drain-wrap">
      <div className="doom-drain-header">
        <span className="doom-drain-label">Your waking day</span>
        <span className="doom-drain-pct">{display}% gone</span>
      </div>
      <div className="doom-drain-track">
        <div className="doom-drain-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function OpportunityCard({ elapsed }) {
  const [index,   setIndex]   = useState(0)
  const [fade,    setFade]    = useState(true)
  const cards = getOpportunityCards(elapsed)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % cards.length)
        setFade(true)
      }, 350)
    }, 6000)
    return () => clearInterval(id)
  }, [cards.length])

  const card = cards[index]

  return (
    <div className={`doom-opportunity${fade ? ' visible' : ''}`}>
      <p className="doom-opportunity-label">In that time you could have…</p>
      <div className="doom-opportunity-card">
        <span className="doom-opportunity-icon">{card.icon}</span>
        <p className="doom-opportunity-text">{card.text}</p>
      </div>
    </div>
  )
}

export default function Doomscroll({ elapsed, running, start, stop, reset }) {
  const navigate   = useNavigate()
  const intensity  = getRedIntensity(elapsed)
  const overlayOpacity = (intensity * 0.28).toFixed(3)

  return (
    <div className="doomscroll-screen">
      <div
        className="doom-red-overlay"
        style={{ opacity: overlayOpacity }}
      />

      <div className="back-header" style={{ position: 'relative', zIndex: 1 }}>
        <button className="back-button" onClick={() => navigate('/clock')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="back-header-title">Doomscroll Stopwatch</span>
      </div>

      <div className="doomscroll-body">

        <DayDrainBar elapsed={elapsed} />

        {running && (
          <div className="doom-live-row">
            <span className="doom-live-dot" />
            <span className="doom-live-label">Tracking</span>
          </div>
        )}

        <div className="doom-time">{formatStopwatch(elapsed)}</div>

        {elapsed > 0
          ? <OpportunityCard elapsed={elapsed} />
          : <p className="doom-label">Ready to be honest with yourself?</p>
        }

        <div className="doom-controls">
          {!running && elapsed === 0 && (
            <button className="doom-btn-start" onClick={start}>Start timing</button>
          )}
          {running && (
            <button className="doom-btn-stop" onClick={stop}>Stop</button>
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

        {elapsed > 0 && !running && (
          <button className="doom-done-btn" onClick={() => { reset(); navigate('/clock') }}>
            Done scrolling
          </button>
        )}

      </div>
    </div>
  )
}
