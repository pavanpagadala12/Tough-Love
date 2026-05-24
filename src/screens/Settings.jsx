import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`toggle${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    />
  )
}

function SettingsToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="settings-row settings-toggle-row">
      <div className="settings-toggle-text">
        <span className="settings-row-label">{label}</span>
        {desc && <span className="settings-row-desc">{desc}</span>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function Settings({ session }) {
  const [consents, setConsents] = useState({
    letter:       false,
    reality_check: false,
    witness:      false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('consent_letter, consent_reality_check, consent_witness')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setConsents({
            letter:       data.consent_letter       ?? false,
            reality_check: data.consent_reality_check ?? false,
            witness:      data.consent_witness      ?? false,
          })
        }
      })
  }, [session.user.id])

  async function updateConsent(key, value) {
    const updated = { ...consents, [key]: value }
    setConsents(updated)
    setSaving(true)
    await supabase.from('profiles').update({
      consent_letter:        updated.letter,
      consent_reality_check: updated.reality_check,
      consent_witness:       updated.witness,
    }).eq('id', session.user.id)
    setSaving(false)
  }

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

        {/* Account */}
        <div>
          <p className="settings-section-title">Account</p>
          <div className="settings-group">
            <div className="settings-row">
              <span className="settings-row-label">Email</span>
              <span className="settings-row-value">{session.user.email}</span>
            </div>
          </div>
        </div>

        {/* Brutal Mode */}
        <div>
          <p className="settings-section-title">Brutal Mode</p>
          <p className="settings-section-desc">
            Global consent. You&apos;ll also opt in per goal — two steps, every time.
            {saving && <span className="settings-saving"> Saving…</span>}
          </p>
          <div className="settings-group">
            <SettingsToggleRow
              label="Letter to Future You"
              desc="Write yourself a note at the start of a goal. Deleted unread if you fail."
              checked={consents.letter}
              onChange={v => updateConsent('letter', v)}
            />
            <SettingsToggleRow
              label="Reality Check"
              desc="On failure, your screen shows honest facts about your behavior."
              checked={consents.reality_check}
              onChange={v => updateConsent('reality_check', v)}
            />
            <SettingsToggleRow
              label="Witness Mode"
              desc="One person you choose gets notified if you break a commitment."
              checked={consents.witness}
              onChange={v => updateConsent('witness', v)}
            />
          </div>
        </div>

        {/* Sign out */}
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
