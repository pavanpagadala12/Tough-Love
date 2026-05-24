import { supabase } from '../supabase'

export default function Settings({ session }) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <div className="screen-header">
        <p className="label">Preferences</p>
        <h1 className="screen-header-title">Settings</h1>
      </div>

      <div className="screen-body">
        <div>
          <p className="settings-section-title">Account</p>
          <div className="settings-group">
            <div className="settings-row">
              <span className="settings-row-label">Email</span>
              <span className="settings-row-value">{session.user.email}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="settings-section-title">Brutal Mode</p>
          <div className="settings-group">
            <div className="placeholder-block" style={{ borderRadius: 'var(--radius)' }}>
              <p className="label">Consent &amp; Punishments</p>
              <p className="placeholder-title">Phase 4</p>
              <p className="text-sm text-2" style={{ marginTop: 4 }}>
                Opt in to accountability features here.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="settings-group">
            <button
              onClick={handleSignOut}
              className="settings-row"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
              }}
            >
              <span className="settings-row-label" style={{ color: 'var(--danger)' }}>
                Sign out
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
