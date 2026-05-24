import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAlarmChecker } from './hooks/useAlarmChecker'
import Home from './screens/Home'
import Goals from './screens/Goals'
import Settings from './screens/Settings'
import Doomscroll from './screens/Doomscroll'
import WorldClock from './screens/WorldClock'
import Alarms from './screens/Alarms'
import Onboarding from './screens/Onboarding'
import BottomNav from './components/BottomNav'
import GuestGate from './components/GuestGate'
import LoginSheet from './components/LoginSheet'
import { WakeAlarmOverlay, ReverseAlarmOverlay } from './components/AlarmOverlays'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Brief splash only while we check the stored session (usually <200ms)
  if (session === undefined) return <div className="splash" />

  return <MainApp session={session} />
}

function MainApp({ session }) {
  const [profile,       setProfile]       = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(!session)
  const [wakeActive,    setWakeActive]    = useState(false)
  const [reverseActive, setReverseActive] = useState(false)
  const [showLogin,     setShowLogin]     = useState(false)

  useEffect(() => {
    if (!session) { setProfile(null); setProfileLoaded(true); return }
    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data ?? { onboarding_completed: false })
        setProfileLoaded(true)
      })
  }, [session?.user.id])

  const onWakeFire    = useCallback(() => setWakeActive(true),    [])
  const onReverseFire = useCallback(() => setReverseActive(true), [])
  useAlarmChecker({ onWakeFire, onReverseFire })

  if (session && !profileLoaded) return <div className="splash" />

  function handleOnboardingComplete() {
    setProfile(p => ({ ...p, onboarding_completed: true }))
  }

  const needsOnboarding = session && !profile?.onboarding_completed

  function requireAuth(element, gateTitle, gateDesc) {
    if (session) return element
    return (
      <GuestGate
        title={gateTitle}
        desc={gateDesc}
        onLogin={() => setShowLogin(true)}
      />
    )
  }

  return (
    <BrowserRouter>
      {needsOnboarding ? (
        <main className="screen-area">
          <Routes>
            <Route
              path="*"
              element={<Onboarding session={session} onComplete={handleOnboardingComplete} />}
            />
          </Routes>
        </main>
      ) : (
        <>
          <main className={`screen-area${reverseActive ? ' grayscale' : ''}`}>
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/doomscroll"  element={<Doomscroll />} />
              <Route path="/world-clock" element={<WorldClock />} />
              <Route path="/alarms"      element={<Alarms />} />
              <Route
                path="/goals"
                element={requireAuth(
                  <Goals />,
                  'Goals need an account',
                  'Track commitments, build streaks, and unlock Brutal Mode.'
                )}
              />
              <Route
                path="/settings"
                element={requireAuth(
                  <Settings session={session} />,
                  'Sign in to access settings',
                  'Manage your account and Brutal Mode preferences.'
                )}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <BottomNav />
        </>
      )}

      {wakeActive    && <WakeAlarmOverlay    onDismiss={() => setWakeActive(false)} />}
      {reverseActive && <ReverseAlarmOverlay onDismiss={() => setReverseActive(false)} />}
      {showLogin     && <LoginSheet onClose={() => setShowLogin(false)} />}
    </BrowserRouter>
  )
}
