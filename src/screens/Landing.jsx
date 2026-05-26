import { useNavigate } from 'react-router-dom'

const CLOCK_TOOLS = [
  {
    icon: '⏱',
    title: 'Focus Timer',
    desc: 'Color blocks that shrink as time runs out. No numbers — just honest visual decay. You feel the time, not just count it.',
  },
  {
    icon: '🌅',
    title: 'Wake Alarm',
    desc: 'Fires in your lightest sleep window, not at a hard number. You wake easier and feel less wrecked.',
  },
  {
    icon: '🌙',
    title: 'Reverse Alarm',
    desc: 'At bedtime, your screen slowly fades to grayscale. Scrolling gets boring on purpose. Sleep wins.',
  },
  {
    icon: '📱',
    title: 'Doomscroll Stopwatch',
    desc: "Times your scroll sessions honestly. Seeing '43 minutes gone' is the whole intervention.",
  },
  {
    icon: '🌍',
    title: 'World Clock',
    desc: 'See who is in the zone, awake, or asleep. Overlap bar shows the best meeting window at a glance.',
  },
]

const CARROTS = [
  {
    icon: '🎉',
    title: 'Care Package',
    desc: 'A celebratory moment when you complete a goal. Particles, a milestone message, the works.',
  },
  {
    icon: '⏳',
    title: 'Time Bank',
    desc: 'Every completed goal earns guilt-free scrolling minutes. Real rewards for real effort.',
  },
  {
    icon: '🔥',
    title: 'Streak Tracking',
    desc: 'Milestone markers at 3, 7, 14, 30, 60, and 100 days. Your consistency, visualized.',
  },
  {
    icon: '🛡️',
    title: 'Streak Insurance',
    desc: 'One free pass per month on streaks of 7+ days. Because life happens and we know it.',
  },
]

const STICKS = [
  {
    icon: '✉️',
    title: 'Letter to Future You',
    desc: 'Write yourself a note at the start of a goal. You only read it if you succeed. If you fail, it is deleted unread.',
  },
  {
    icon: '📋',
    title: 'Reality Check',
    desc: 'On failure, your screen shows honest facts about what just happened. Text only — no cruelty, just truth.',
  },
  {
    icon: '👁',
    title: 'Witness Mode',
    desc: 'One person you choose gets notified if you break a commitment. You write and send the email yourself.',
  },
]

const PREMIUM = [
  {
    icon: '💰',
    title: 'Money Stakes',
    desc: 'Put real money on the line. Fail a goal and it donates to a cause you hate. No half-measures.',
  },
  {
    icon: '🤝',
    title: 'The Pact',
    desc: 'Two-user accountability. You both commit to something. One person fails — both feel it.',
  },
  {
    icon: '🖼',
    title: 'Wallpaper Hijack',
    desc: 'Your lockscreen becomes your commitment, in text. Anti-cheat loop included. No escaping it easily.',
  },
]

function FeatureRow({ icon, title, desc, locked }) {
  return (
    <div className={`lp-feature-row${locked ? ' locked' : ''}`}>
      <span className="lp-feature-icon">{icon}</span>
      <div className="lp-feature-text">
        <p className="lp-feature-title">{title}</p>
        <p className="lp-feature-desc">{desc}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="lp">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-logo-row">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
            <circle cx="50" cy="50" r="50" fill="#0D0D12" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(124,111,247,0.18)" strokeWidth="14" />
            <path d="M 50 16 A 34 34 0 1 1 26 74" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 17 59 A 34 34 0 0 1 50 16" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
            <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(124,111,247,0.38)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(248,246,255,0.92)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="lp-logo-name">Tough Love</span>
        </div>

        <h1 className="lp-headline">
          Time,<br />honestly.
        </h1>

        <p className="lp-sub">
          The only clock app that shows you time as it really is —
          and holds you to what you said you would do.
        </p>

        <button className="lp-cta-btn" onClick={() => navigate('/clock')}>
          Start for free
        </button>
        <p className="lp-cta-note">No account needed. Everything below is free.</p>
      </section>

      {/* ── Philosophy callout ─────────────────────────────────────────── */}
      <section className="lp-callout">
        <p className="lp-callout-text">
          Most productivity apps are pure stick (blocking) or pure carrot
          (gamification). Tough Love does both — openly, with your full consent.
          You choose your level of accountability. The app just keeps you honest.
        </p>
      </section>

      {/* ── Empathy Clock tools ────────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-free-badge">Free forever</div>
        <p className="lp-section-eyebrow">The Empathy Clock</p>
        <h2 className="lp-section-title">Five tools that show you time as it really is</h2>
        <div className="lp-feature-list">
          {CLOCK_TOOLS.map(f => <FeatureRow key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── Carrots ───────────────────────────────────────────────────── */}
      <section className="lp-section">
        <p className="lp-section-eyebrow">Carrots</p>
        <h2 className="lp-section-title">Success should feel earned</h2>
        <p className="lp-section-body">
          Every goal you complete builds on the last. The system rewards real progress — not streaks for streak's sake.
        </p>
        <div className="lp-feature-list">
          {CARROTS.map(f => <FeatureRow key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── Sticks ────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <p className="lp-section-eyebrow">Sticks — opt-in, always</p>
        <h2 className="lp-section-title">Real accountability.<br />Your choice.</h2>
        <p className="lp-section-body">
          Every stick requires two steps of consent — once in Settings, once when you set the goal.
          Every single one has a press-and-hold Escape Hatch.
          You are never trapped.
        </p>
        <div className="lp-feature-list">
          {STICKS.map(f => <FeatureRow key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── Mid CTA ───────────────────────────────────────────────────── */}
      <section className="lp-mid-cta">
        <h2 className="lp-mid-cta-title">All of the above,<br />free. No catch.</h2>
        <p className="lp-mid-cta-sub">
          The free tier is a real product, not a demo.
          We made this mistake studying other apps — we did not repeat it.
        </p>
        <button className="lp-cta-btn" onClick={() => navigate('/clock')}>
          Open the clock →
        </button>
      </section>

      {/* ── Premium teaser ────────────────────────────────────────────── */}
      <section className="lp-section lp-section-premium">
        <div className="lp-premium-badge">Coming in v2</div>
        <p className="lp-section-eyebrow" style={{ color: 'rgba(245,158,11,0.7)' }}>Premium — for people who want more brutal</p>
        <h2 className="lp-section-title" style={{ opacity: 0.8 }}>Higher stakes. More consequences.</h2>
        <p className="lp-section-body">
          If soft accountability is not enough, v2 raises the ceiling.
          Money, mutual commitments, and lockscreen takeovers.
        </p>
        <div className="lp-feature-list">
          {PREMIUM.map(f => <FeatureRow key={f.title} {...f} locked />)}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="lp-footer-cta">
        <div className="lp-footer-logo">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <circle cx="50" cy="50" r="50" fill="#0D0D12" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(124,111,247,0.18)" strokeWidth="14" />
            <path d="M 50 16 A 34 34 0 1 1 26 74" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 17 59 A 34 34 0 0 1 50 16" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
            <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(124,111,247,0.38)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(248,246,255,0.92)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="lp-footer-title">Start with the clock.</h2>
        <p className="lp-footer-sub">
          No account required. No payment. Just honest tools for honest people.
        </p>
        <button className="lp-cta-btn" onClick={() => navigate('/clock')}>
          Get started →
        </button>
        <p className="lp-cta-note" style={{ marginTop: 16 }}>
          Already using it?{' '}
          <button className="lp-signin-link" onClick={() => navigate('/clock')}>
            Open the app
          </button>
        </p>
      </section>

    </div>
  )
}
