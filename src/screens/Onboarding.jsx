import { useState } from 'react'
import { supabase } from '../supabase'

// ── Progress dots ────────────────────────────────────────────────────
function ProgressDots({ current, total }) {
  return (
    <div className="ob-dots">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`ob-dot${i < current ? ' past' : ''}${i === current ? ' current' : ''}`}
        />
      ))}
    </div>
  )
}

function BackBtn({ onBack }) {
  return (
    <button className="ob-back" onClick={onBack}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}

// ── Step 0: Welcome ──────────────────────────────────────────────────
function StepWelcome({ onNext }) {
  return (
    <div className="ob-step">
      <div className="ob-welcome-brand">
        <p className="ob-welcome-eyebrow">Welcome to</p>
        <h1 className="ob-welcome-title">Tough Love</h1>
        <p className="ob-welcome-tagline">
          Beautiful by default.<br />Brutal by choice.
        </p>
      </div>

      <div className="ob-welcome-features">
        {[
          { icon: '⏱', label: 'Empathy Clock',          desc: 'See your time honestly — colour blocks, no numbers.' },
          { icon: '🎯', label: 'Goals + Accountability', desc: 'Set commitments with real, chosen consequences.' },
          { icon: '🛡', label: 'Built-in safety nets',   desc: 'Every punishment has an exit. We designed for real life.' },
        ].map(f => (
          <div key={f.label} className="ob-feature-row">
            <span className="ob-feature-icon">{f.icon}</span>
            <div>
              <p className="ob-feature-label">{f.label}</p>
              <p className="ob-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext}>Let's begin →</button>
    </div>
  )
}

// ── Step 1: Choose accountability ────────────────────────────────────
function ConsentRow({ icon, title, body, checked, onChange }) {
  return (
    <button
      className={`ob-consent-row${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="ob-consent-row-left">
        <span className="ob-consent-icon">{icon}</span>
        <div className="ob-consent-text">
          <p className="ob-consent-title">{title}</p>
          <p className="ob-consent-body">{body}</p>
        </div>
      </div>
      <div className={`toggle${checked ? ' on' : ''}`} style={{ pointerEvents: 'none' }} />
    </button>
  )
}

function StepConsent({ consents, setConsents, onNext, onBack }) {
  return (
    <div className="ob-step">
      <BackBtn onBack={onBack} />
      <div className="ob-step-header">
        <h2 className="ob-step-title">How hard do you want us to be?</h2>
        <p className="ob-step-body">
          All off by default. You consent here, then again per goal.
          No surprises — ever.
        </p>
      </div>

      <div className="ob-consent-list">
        <ConsentRow
          icon="✉️"
          title="Letter to Future You"
          body="Write yourself a note at the start of a goal. Deleted unread if you fail."
          checked={consents.letter}
          onChange={v => setConsents(c => ({ ...c, letter: v }))}
        />
        <ConsentRow
          icon="📋"
          title="Reality Check"
          body="Your screen shows honest facts about your behavior when you fail."
          checked={consents.reality_check}
          onChange={v => setConsents(c => ({ ...c, reality_check: v }))}
        />
        <ConsentRow
          icon="👁"
          title="Witness Mode"
          body="One person you choose gets notified if you break a commitment."
          checked={consents.witness}
          onChange={v => setConsents(c => ({ ...c, witness: v }))}
        />
      </div>

      <p className="ob-consent-note">Change these anytime in Settings → Brutal Mode.</p>
      <button className="btn-primary" onClick={onNext}>Continue →</button>
    </div>
  )
}

// ── Step 2: Permissions ──────────────────────────────────────────────
function StepPermissions({ onNext, onBack }) {
  const initial = 'Notification' in window ? Notification.permission : 'unsupported'
  const [status, setStatus] = useState(initial)

  async function allow() {
    if (!('Notification' in window)) { onNext(); return }
    const p = await Notification.requestPermission()
    setStatus(p)
    setTimeout(onNext, 600) // brief pause so the ✓ state is visible
  }

  return (
    <div className="ob-step">
      <BackBtn onBack={onBack} />
      <div className="ob-step-header">
        <h2 className="ob-step-title">One permission.</h2>
        <p className="ob-step-body">
          Notifications let us fire your wake alarm, remind you at bedtime,
          and alert your witness if Witness Mode is on.
        </p>
      </div>

      <div className="ob-permission-features">
        {['Wake alarm', 'Bedtime reminder', 'Witness alerts'].map(f => (
          <div key={f} className="ob-permission-row">
            <span className="ob-permission-check">✓</span>
            <span>{f}</span>
          </div>
        ))}
      </div>

      {status === 'granted' && (
        <div className="ob-granted">
          <span>✓</span>&nbsp;Notifications are on
        </div>
      )}

      <button className="btn-primary" onClick={status === 'granted' ? onNext : allow}>
        {status === 'granted' ? 'Continue →' : 'Allow notifications'}
      </button>

      {status !== 'granted' && (
        <button
          className="btn-ghost"
          onClick={onNext}
          style={{ width: '100%', textAlign: 'center' }}
        >
          Maybe later
        </button>
      )}
    </div>
  )
}

// ── Step 3: Safety net ───────────────────────────────────────────────
function StepSafetyNet({ onNext, onBack }) {
  return (
    <div className="ob-step">
      <BackBtn onBack={onBack} />
      <div className="ob-step-header">
        <h2 className="ob-step-title">We built in the exits.</h2>
        <p className="ob-step-body">
          Tough Love is hard by choice — not by design.
          Here's your safety net.
        </p>
      </div>

      <div className="ob-safety-list">
        {[
          {
            icon: '🛡',
            title: 'Streak Insurance',
            body: 'One free fail per month when your streak is high. Real life happens.',
          },
          {
            icon: '🚪',
            title: 'Escape Hatch',
            body: "Every punishment feature has a press-and-hold override. You're never truly trapped.",
          },
          {
            icon: '🔄',
            title: 'Failure Recovery',
            body: 'When you fail, we ask what went wrong — then help you try again, smaller and smarter.',
          },
        ].map(card => (
          <div key={card.title} className="ob-safety-card">
            <span className="ob-safety-icon">{card.icon}</span>
            <div>
              <p className="ob-safety-title">{card.title}</p>
              <p className="ob-safety-body">{card.body}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext}>Got it →</button>
    </div>
  )
}

// ── Step 4: First Win ────────────────────────────────────────────────
const STAKE_LEVELS = [
  { id: 'future',     label: 'Future',     sub: 'Money stakes · v2', icon: '💰', locked: true,  pct: '58%' },
  { id: 'reputation', label: 'Reputation', sub: 'With a witness',    icon: '👁',  locked: false, pct: '79%' },
  { id: 'willpower',  label: 'Willpower',  sub: 'Just yourself',     icon: '🧠', locked: false, pct: '100%' },
]
const LEVEL_ORDER = ['willpower', 'reputation', 'future']

function StakePyramid({ value, onChange }) {
  const selectedIdx = LEVEL_ORDER.indexOf(value)
  return (
    <div className="stake-pyramid">
      {STAKE_LEVELS.map(level => {
        const levelIdx = LEVEL_ORDER.indexOf(level.id)
        const filled   = !level.locked && levelIdx <= selectedIdx
        return (
          <div key={level.id} style={{ width: level.pct, margin: '0 auto' }}>
            <button
              className={`pyramid-level${filled ? ' selected' : ''}${level.locked ? ' locked' : ''}`}
              onClick={() => !level.locked && onChange(level.id)}
              disabled={level.locked}
            >
              <span className="pyramid-icon">{level.icon}</span>
              <div className="pyramid-text">
                <p className="pyramid-label">{level.label}</p>
                <p className="pyramid-sub">{level.sub}</p>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function StepFirstWin({ goalTitle, setGoalTitle, stakeLevel, setStakeLevel, onComplete, onBack, loading }) {
  return (
    <div className="ob-step">
      <BackBtn onBack={onBack} />
      <div className="ob-step-header">
        <h2 className="ob-step-title">Your first goal.</h2>
        <p className="ob-step-body">
          One commitment. Start small — you can always add more.
        </p>
      </div>

      <div className="ob-field">
        <p className="alarm-field-label">I will…</p>
        <input
          className="input-field"
          placeholder="e.g. Read for 20 minutes tonight"
          value={goalTitle}
          onChange={e => setGoalTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="ob-field">
        <p className="alarm-field-label">Stake level</p>
        <StakePyramid value={stakeLevel} onChange={setStakeLevel} />
        <p className="ob-pyramid-hint">
          Higher levels include everything below them.
        </p>
      </div>

      <button
        className="btn-primary"
        onClick={onComplete}
        disabled={!goalTitle.trim() || loading}
      >
        {loading ? 'Saving…' : 'Start my journey →'}
      </button>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────
const TOTAL_CONTENT_STEPS = 4 // steps 1–4, shown in progress dots

export default function Onboarding({ session, onComplete }) {
  const [step,       setStep]       = useState(0)
  const [consents,   setConsents]   = useState({ letter: false, reality_check: false, witness: false })
  const [goalTitle,  setGoalTitle]  = useState('')
  const [stakeLevel, setStakeLevel] = useState('willpower')
  const [loading,    setLoading]    = useState(false)

  function next() { setStep(s => s + 1) }
  function back() { setStep(s => s - 1) }

  async function finish() {
    if (!goalTitle.trim()) return
    setLoading(true)

    await supabase.from('profiles').update({
      onboarding_completed:  true,
      consent_letter:        consents.letter,
      consent_reality_check: consents.reality_check,
      consent_witness:       consents.witness,
    }).eq('id', session.user.id)

    try {
      await supabase.from('goals').insert({
        user_id:     session.user.id,
        title:       goalTitle.trim(),
        stake_level: stakeLevel,
      })
    } catch (_) {}

    setLoading(false)
    onComplete()
  }

  const steps = [
    <StepWelcome onNext={next} />,
    <StepConsent consents={consents} setConsents={setConsents} onNext={next} onBack={back} />,
    <StepPermissions onNext={next} onBack={back} />,
    <StepSafetyNet onNext={next} onBack={back} />,
    <StepFirstWin
      goalTitle={goalTitle}   setGoalTitle={setGoalTitle}
      stakeLevel={stakeLevel} setStakeLevel={setStakeLevel}
      onComplete={finish}     onBack={back} loading={loading}
    />,
  ]

  return (
    <div className="ob-screen">
      {step > 0 && (
        <div className="ob-dots-row">
          <ProgressDots current={step - 1} total={TOTAL_CONTENT_STEPS} />
        </div>
      )}
      <div className="ob-content" key={step}>
        {steps[step]}
      </div>
    </div>
  )
}
