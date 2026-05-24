import { useEffect, useState } from 'react'

const MILESTONE_MSGS = {
  3:   "3 days straight. The habit is forming.",
  7:   "One week. You're building something real.",
  14:  "Two weeks solid. This is who you are now.",
  30:  "30 days. A full month of showing up.",
  60:  "60 days. Most people quit by now. You didn't.",
  100: "100 days. You're in rare company.",
}

const PARTICLES = ['⭐', '✨', '🎉', '💫', '🌟']

function Particle({ style, emoji }) {
  return <span className="care-particle" style={style}>{emoji}</span>
}

export default function CarePackage({ goalTitle, streakCount, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const milestoneMsg = MILESTONE_MSGS[streakCount] ?? null
  const isMilestone  = Boolean(milestoneMsg)

  const particles = Array.from({ length: 12 }, (_, i) => ({
    emoji: PARTICLES[i % PARTICLES.length],
    style: {
      left:             `${Math.random() * 100}%`,
      animationDelay:   `${Math.random() * 0.6}s`,
      animationDuration:`${0.8 + Math.random() * 0.6}s`,
      fontSize:         `${16 + Math.random() * 14}px`,
    },
  }))

  function handleDismiss() {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div className={`care-backdrop${visible ? ' visible' : ''}`} onClick={handleDismiss}>
      <div className={`care-card${visible ? ' visible' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="care-particles" aria-hidden>
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        <div className="care-body">
          <p className="care-eyebrow">Goal complete</p>
          <h2 className="care-title">{goalTitle}</h2>

          <div className="care-streak">
            <span className="care-streak-fire">🔥</span>
            <span className="care-streak-num">{streakCount}</span>
            <span className="care-streak-label">{streakCount === 1 ? 'day' : 'days'}</span>
          </div>

          {milestoneMsg && (
            <div className="care-milestone">
              <p>{milestoneMsg}</p>
            </div>
          )}

          <p className="care-bank-note">+5 minutes added to your Time Bank.</p>

          <button className="btn-primary care-dismiss" onClick={handleDismiss}>
            {isMilestone ? 'Keep the streak →' : 'Keep going →'}
          </button>
        </div>
      </div>
    </div>
  )
}
