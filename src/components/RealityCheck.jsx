import { useState, useRef, useEffect } from 'react'

const HOLD_MS = 5000

export default function RealityCheck({ goal, lostStreak, onDismiss }) {
  const [visible,   setVisible]   = useState(false)
  const [holdPct,   setHoldPct]   = useState(0)
  const [holding,   setHolding]   = useState(false)
  const holdStart   = useRef(null)
  const rafRef      = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function startHold() {
    holdStart.current = Date.now()
    setHolding(true)
    function tick() {
      const elapsed = Date.now() - holdStart.current
      const pct     = Math.min(100, (elapsed / HOLD_MS) * 100)
      setHoldPct(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        dismiss()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function cancelHold() {
    cancelAnimationFrame(rafRef.current)
    setHolding(false)
    setHoldPct(0)
    holdStart.current = null
  }

  function dismiss() {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  const failedDate = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className={`rc-backdrop${visible ? ' visible' : ''}`}>
      <div className="rc-content">
        <p className="rc-eyebrow">{failedDate}</p>

        <h1 className="rc-headline">
          You didn&apos;t<br />
          <span className="rc-goal-title">{goal.title}</span>
        </h1>

        {lostStreak > 0 && (
          <p className="rc-streak-lost">
            {lostStreak}-day streak lost.
          </p>
        )}

        <p className="rc-body">
          That&apos;s the honest truth. No judgment — just facts.
          You can try again. Smaller if you need to. The goal
          matters more than the streak.
        </p>

        <p className="rc-escape-hint">Hold to dismiss</p>

        <button
          className="rc-hold-btn"
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
        >
          <svg className="rc-hold-ring" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="19" />
            <circle
              cx="22" cy="22" r="19"
              className="rc-hold-ring-fill"
              style={{ strokeDashoffset: `${119.38 * (1 - holdPct / 100)}` }}
            />
          </svg>
          <span className="rc-hold-icon">🛡</span>
        </button>

        <p className="rc-hold-label">{holding ? 'Keep holding…' : 'Press & hold to exit'}</p>
      </div>
    </div>
  )
}
