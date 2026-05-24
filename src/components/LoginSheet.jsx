import { useState } from 'react'
import { supabase } from '../supabase'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.2 0-9.6-3.3-11.3-8L6 33.8C9.3 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C37 38.1 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}

export default function LoginSheet({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleGoogle() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: window.location.origin },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-overlay login-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="login-sheet-body">
          <h2 className="login-sheet-title">Sign in to continue</h2>
          <p className="login-sheet-desc">
            Goals, streaks, and accountability features require an account.
            The clock and tools are always free.
          </p>

          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <GoogleIcon />
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {error && <p className="auth-error">{error}</p>}
        </div>

        <button className="btn-ghost login-sheet-cancel" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  )
}
