export default function StreakInsuranceSheet({ streakCount, onDismiss }) {
  return (
    <div className="si-backdrop" onClick={onDismiss}>
      <div className="si-sheet" onClick={e => e.stopPropagation()}>
        <div className="si-icon">🛡️</div>
        <h2 className="si-title">Streak protected</h2>
        <p className="si-body">
          Your {streakCount}-day streak is safe. Streak Insurance covered this one —
          one free pass per month on streaks of 7 days or more.
        </p>
        <p className="si-sub">Back tomorrow. You&apos;ve got this.</p>
        <button className="btn-primary" onClick={onDismiss}>Got it</button>
      </div>
    </div>
  )
}
