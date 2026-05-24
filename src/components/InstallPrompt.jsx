import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'tl_install_dismissed'

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIos,        setShowIos]        = useState(false)
  const [visible,        setVisible]        = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    if (isIos()) {
      setShowIos(true)
      setVisible(true)
      return
    }

    function handler(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
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
