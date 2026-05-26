import { useNavigate } from 'react-router-dom'

/* ── Data ─────────────────────────────────────────────────────────── */
const CLOCK_TOOLS = [
  {
    id: 'timer',
    icon: '⏱',
    title: 'Focus Timer',
    desc: 'Color blocks that shrink as time runs out. No numbers — just honest decay.',
    size: 'wide',
  },
  {
    id: 'wake',
    icon: '🌅',
    title: 'Wake Alarm',
    desc: 'Fires in your lightest sleep window. You wake easier, feel less wrecked.',
    size: 'normal',
  },
  {
    id: 'reverse',
    icon: '🌙',
    title: 'Reverse Alarm',
    desc: 'At bedtime, your screen fades to grayscale. Scrolling gets boring on purpose.',
    size: 'normal',
  },
  {
    id: 'doom',
    icon: '📱',
    title: 'Doomscroll Stopwatch',
    desc: "Seeing '43 minutes gone' is the whole intervention.",
    size: 'normal',
  },
  {
    id: 'world',
    icon: '🌍',
    title: 'World Clock',
    desc: 'See who is in the zone, awake, or sleeping. Overlap bar included.',
    size: 'normal',
  },
]

const CARROTS = [
  { icon: '🎉', title: 'Care Package', desc: 'A moment of celebration on every completion.' },
  { icon: '⏳', title: 'Time Bank', desc: 'Complete goals to earn guilt-free scrolling minutes.' },
  { icon: '🔥', title: 'Streak Tracking', desc: 'Milestones at 3, 7, 14, 30, 60, and 100 days.' },
  { icon: '🛡️', title: 'Streak Insurance', desc: 'One free pass per month on 7-day+ streaks.' },
]

const STICKS = [
  {
    icon: '✉️',
    title: 'Letter to Future You',
    desc: 'Write at the start. Read only on success. Deleted unread on failure.',
    size: 'wide',
  },
  {
    icon: '📋',
    title: 'Reality Check',
    desc: 'On failure, honest facts about what just happened.',
    size: 'normal',
  },
  {
    icon: '👁',
    title: 'Witness Mode',
    desc: 'One person gets notified if you break a commitment.',
    size: 'normal',
  },
]

const PREMIUM = [
  { icon: '💰', title: 'Money Stakes', desc: 'Fail a goal, donate to a cause you hate.' },
  { icon: '🤝', title: 'The Pact', desc: 'Two-person accountability. One fails — both feel it.' },
  { icon: '🖼', title: 'Wallpaper Hijack', desc: 'Your lockscreen shows your commitment in text.' },
]

/* ── Logo SVG (inline for the cracked clock) ────────────────────── */
function ClockLogo({ size = 36 }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <circle cx="50" cy="50" r="50" fill="#0D0D12" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(124,111,247,0.18)" strokeWidth="14" />
      <path d="M 50 16 A 34 34 0 1 1 26 74" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 17 59 A 34 34 0 0 1 50 16" fill="none" stroke="#7C6FF7" strokeWidth="5.5" strokeLinecap="round" />
      <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(124,111,247,0.38)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="74,26 44,48 56,52 26,74" fill="none" stroke="rgba(248,246,255,0.92)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Bento card ──────────────────────────────────────────────────── */
function BentoCard({ icon, title, desc, wide, accent }) {
  return (
    <div className={`bento-card${wide ? ' bento-wide' : ''}${accent ? ' bento-accent' : ''}`}>
      <span className="bento-icon">{icon}</span>
      <p className="bento-title">{title}</p>
      <p className="bento-desc">{desc}</p>
    </div>
  )
}

/* ── Feature grid card (2-col) ───────────────────────────────────── */
function FeatureCard({ icon, title, desc, locked }) {
  return (
    <div className={`lp2-card${locked ? ' lp2-card-locked' : ''}`}>
      <span className="lp2-card-icon">{icon}</span>
      <p className="lp2-card-title">{title}</p>
      <p className="lp2-card-desc">{desc}</p>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="lp2">

      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header className="lp2-header">
        <div className="lp2-header-logo">
          <ClockLogo size={28} />
          <span className="lp2-header-name">Tough Love</span>
        </div>
        <button className="lp2-header-cta" onClick={() => navigate('/clock')}>
          Open app →
        </button>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="lp2-hero">
        {/* Aurora glow blobs */}
        <div className="lp2-aurora lp2-aurora-1" />
        <div className="lp2-aurora lp2-aurora-2" />

        <div className="lp2-hero-content">
          <div className="lp2-eyebrow-pill">Free productivity PWA</div>

          <h1 className="lp2-headline">
            Time,<br />
            <span className="lp2-gradient-text">honestly.</span>
          </h1>

          <p className="lp2-hero-sub">
            The only clock app that shows you time as it really is —
            and holds you to what you said you would do.
          </p>

          <button className="lp2-cta-btn" onClick={() => navigate('/clock')}>
            Start for free
          </button>

          {/* Stats bar */}
          <div className="lp2-stats">
            <span className="lp2-stat">5 clock tools</span>
            <span className="lp2-stat-dot">·</span>
            <span className="lp2-stat">Always free</span>
            <span className="lp2-stat-dot">·</span>
            <span className="lp2-stat">3 stake modes</span>
          </div>
        </div>
      </section>

      {/* ── Philosophy callout ─────────────────────────────────────── */}
      <div className="lp2-quote">
        <p className="lp2-quote-text">
          Most productivity apps are pure stick or pure carrot.
          Tough Love does both — openly, with your full consent.
          You choose how accountable you want to be.
        </p>
      </div>

      {/* ── Empathy Clock bento ────────────────────────────────────── */}
      <section className="lp2-section">
        <div className="lp2-free-badge">Free forever</div>
        <p className="lp2-section-eyebrow">The Empathy Clock</p>
        <h2 className="lp2-section-title">Five tools that show you time as it really is</h2>

        <div className="lp2-bento">
          <BentoCard wide icon="⏱" title="Focus Timer"
            desc="Color blocks shrink as time runs out. No numbers — just honest visual decay that you feel, not count." />
          <BentoCard icon="🌅" title="Wake Alarm"
            desc="Fires in your lightest sleep window. Wake easier, feel less wrecked." />
          <BentoCard icon="🌙" title="Reverse Alarm"
            desc="Screen fades to grayscale at bedtime. Scrolling gets boring on purpose." />
          <BentoCard icon="📱" title="Doomscroll Stopwatch"
            desc="Seeing '43 minutes gone' is the whole intervention." />
          <BentoCard icon="🌍" title="World Clock"
            desc="Who's in the zone, awake, or asleep. Overlap bar included." />
        </div>
      </section>

      {/* ── Carrots ────────────────────────────────────────────────── */}
      <section className="lp2-section">
        <p className="lp2-section-eyebrow">Carrots</p>
        <h2 className="lp2-section-title">Success should feel earned</h2>
        <div className="lp2-grid-2">
          {CARROTS.map(c => <FeatureCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* ── Sticks ─────────────────────────────────────────────────── */}
      <section className="lp2-section lp2-section-sticks">
        <p className="lp2-section-eyebrow">Sticks — always opt-in</p>
        <h2 className="lp2-section-title">Real stakes.<br />Your choice.</h2>
        <p className="lp2-section-body">
          Two-step consent every time. One press-and-hold escape hatch on every feature.
          You are never trapped.
        </p>

        <div className="lp2-bento">
          {/* Letter is wide */}
          <BentoCard wide accent icon="✉️" title="Letter to Future You"
            desc="Write yourself a note at goal start. You read it only if you succeed. Deleted unread on failure." />
          <BentoCard accent icon="📋" title="Reality Check"
            desc="On failure, your screen shows honest facts about what just happened." />
          <BentoCard accent icon="👁" title="Witness Mode"
            desc="One person you choose gets notified when you break a commitment." />
        </div>
      </section>

      {/* ── Mid CTA ────────────────────────────────────────────────── */}
      <div className="lp2-mid-cta">
        <p className="lp2-mid-cta-label">No trial. No paywall. No upsell guilt.</p>
        <h2 className="lp2-mid-cta-title">All of the above, free.</h2>
        <button className="lp2-cta-btn" onClick={() => navigate('/clock')}>
          Open the clock →
        </button>
      </div>

      {/* ── Premium teaser ─────────────────────────────────────────── */}
      <section className="lp2-section lp2-section-premium">
        <div className="lp2-premium-badge">Coming in v2</div>
        <p className="lp2-section-eyebrow" style={{ color: 'rgba(245,158,11,0.7)' }}>Premium</p>
        <h2 className="lp2-section-title" style={{ opacity: 0.75 }}>For people who want more brutal</h2>
        <p className="lp2-section-body">
          The free tier is a real product, not a demo. When you want higher stakes, v2 is coming.
        </p>
        <div className="lp2-grid-2">
          {PREMIUM.map(p => <FeatureCard key={p.title} {...p} locked />)}
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────────── */}
      <section className="lp2-footer-cta">
        <div className="lp2-aurora lp2-aurora-footer" />
        <ClockLogo size={48} />
        <h2 className="lp2-footer-title">Start with the clock.</h2>
        <p className="lp2-footer-sub">
          No account required. No payment. Just honest tools.
        </p>
        <button className="lp2-cta-btn" onClick={() => navigate('/clock')}>
          Get started →
        </button>
        <p className="lp2-footer-note">
          Already have an account?{' '}
          <button className="lp2-text-link" onClick={() => navigate('/goals')}>
            Open Goals →
          </button>
        </p>
      </section>

    </div>
  )
}
