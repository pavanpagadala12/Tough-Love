import { useState, useRef, useEffect } from 'react'
import { getFailureRecovery } from '../ai'

const HOLD_MS = 5000

export default function RealityCheck({ goal, lostStreak, onDismiss }) {
  const [visible,   setVisible]   = useState(false)
  const [holdPct,   setHoldPct]   = useState(0)
  const [holding,   setHolding]   = useState(false)
  const [phase,     setPhase]     = useState('check') // 'check' | 'recovery'
  const [aiAdvice,  setAiAdvice]  = useState(null)
  const holdStart  = useRef(null)
  const rafRef     = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    // Pre-load AI advice while user reads the check screen
    getFailureRecovery({
      title: goal.title,
      lostStreak: lostStreak ?? 0,
      recentFailCount: goal.recentFailCount ?? 0,
    }).then(msg => { if (msg) setAiAdvice(msg) })
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
        setHolding(false)
        setPhase('recovery')
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

        {phase === 'check' && (
          <>
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
          </>
        )}

        {phase === 'recovery' && (
          <>
            <p className="rc-eyebrow">What next?</p>

            <h1 className="rc-headline" style={{ fontSize: '1.75rem' }}>
              One miss doesn&apos;t<br />end the story.
            </h1>

            {aiAdvice && (
              <div className="rc-ai-card">
                <span className="ai-badge">AI coach</span>
                <p className="rc-ai-text">{aiAdvice}</p>
              </div>
            )}

            <div className="rc-recovery-list">
              <div className="rc-recovery-row">
                <span className="rc-recovery-icon">🔄</span>
                <div>
                  <p className="rc-recovery-title">Try again tomorrow</p>
                  <p className="rc-recovery-body">Same goal, fresh day. Streaks restart — that&apos;s fine.</p>
                </div>
              </div>
              <div className="rc-recovery-row">
                <span className="rc-recovery-icon">🎯</span>
                <div>
                  <p className="rc-recovery-title">Make it smaller</p>
                  <p className="rc-recovery-body">Edit the goal to something you can actually hit right now.</p>
                </div>
              </div>
              <div className="rc-recovery-row">
                <span className="rc-recovery-icon">🛡️</span>
                <div>
                  <p className="rc-recovery-title">Check Streak Insurance</p>
                  <p className="rc-recovery-body">On a 7-day+ streak? One free pass per month — it might have saved you.</p>
                </div>
              </div>
            </div>

            <button className="btn-primary" style={{ marginTop: 24 }} onClick={dismiss}>
              Got it →
            </button>
          </>
        )}

      </div>
    </div>
  )
}
