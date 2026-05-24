export default function GuestGate({ title, desc, onLogin }) {
  return (
    <div className="guest-gate">
      <div className="guest-gate-icon">🔒</div>
      <p className="guest-gate-title">{title}</p>
      <p className="guest-gate-desc">{desc}</p>
      <button className="btn-primary" onClick={onLogin}>Sign in with Google</button>
    </div>
  )
}
