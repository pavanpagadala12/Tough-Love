export default function Goals() {
  return (
    <>
      <div className="screen-header">
        <p className="label">Commitments</p>
        <h1 className="screen-header-title">Goals</h1>
      </div>

      <div className="screen-body">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-2)' }}>
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" />
            </svg>
          </div>
          <p className="empty-state-title">No goals yet</p>
          <p className="empty-state-body">
            Set a commitment and choose how accountable you want to be.
          </p>
        </div>

        <div className="placeholder-block">
          <p className="label">Goal creation + Stake Pyramid</p>
          <p className="placeholder-title">Phase 5</p>
          <p className="text-sm text-2" style={{ marginTop: 4 }}>
            Carrots, sticks, and the path between.
          </p>
        </div>
      </div>
    </>
  )
}
