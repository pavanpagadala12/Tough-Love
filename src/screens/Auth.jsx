import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <h1 className="auth-brand-name">
          Tough<span className="auth-brand-dot"> </span>Love
        </h1>
        <p className="auth-brand-sub">
          Beautiful by default.<br />Brutal by choice.
        </p>
      </div>

      {sent ? (
        <div className="auth-sent">
          <div className="auth-sent-icon">✉️</div>
          <p className="auth-sent-title">Check your email</p>
          <p className="auth-sent-body">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <button className="btn-ghost" onClick={() => setSent(false)}>
            Use a different email
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
      )}
    </div>
  )
}
