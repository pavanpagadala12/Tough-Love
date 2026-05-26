import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'tl_install_dismissed_ts'
const COOLDOWN_MS   = 3 * 24 * 60 * 60 * 1000 // 3 days

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isDismissed() {
  const ts = localStorage.getItem(DISMISSED_KEY)
  if (!ts) return false
  return Date.now() - Number(ts) < COOLDOWN_MS
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIos,        setShowIos]        = useState(false)
  const [visible,        setVisible]        = useState(false)

  // Listen for beforeinstallprompt for the entire session.
  // The browser can re-fire it after the user rejects the native prompt,
  // so we keep the listener alive rather than removing it on first fire.
  useEffect(() => {
    if (isStandalone()) return

    function handler(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!isDismissed()) setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // iOS — show once on mount if not dismissed
  useEffect(() => {
    if (isStandalone()) return
    if (isIos() && !isDismissed()) {
      setShowIos(true)
      setVisible(true)
    }
  }, [])

  function dismiss() {
    // Store a timestamp; prompt returns after 3 days so accidental dismissal isn't permanent
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      setVisible(false)
    }
    // If the user cancelled the native dialog, we leave the banner open.
    // When the browser re-fires beforeinstallprompt, the handler above will
    // refresh deferredPrompt so they can try the install again.
  }

  if (!visible) return null

  return (
    <div className="install-banner">
      <div className="install-banner-icon">📲</div>
      <div className="install-banner-text">
        {showIos
          ? <p>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for the best experience.</p>
          : <p>Add <strong>Tough Love</strong> to your home screen for alarms and offline use.</p>
        }
      </div>
      {!showIos && (
        <button className="install-btn-install" onClick={install}>Install</button>
      )}
      <button className="install-btn-close" onClick={dismiss} aria-label="Dismiss">×</button>
    </div>
  )
}
