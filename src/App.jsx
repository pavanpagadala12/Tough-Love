import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { useAlarmChecker } from './hooks/useAlarmChecker'
import Landing from './screens/Landing'
import Home from './screens/Home'
import Goals from './screens/Goals'
import Settings from './screens/Settings'
import Doomscroll from './screens/Doomscroll'
import WorldClock from './screens/WorldClock'
import Alarms from './screens/Alarms'
import Onboarding from './screens/Onboarding'
import BottomNav from './components/BottomNav'
import LoginSheet from './components/LoginSheet'
import { WakeAlarmOverlay, ReverseAlarmOverlay } from './components/AlarmOverlays'
import InstallPrompt from './components/InstallPrompt'

function ConditionalBottomNav() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return <BottomNav />
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

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
      .then(({ data, error }) => {
        if (error) console.error('profile fetch:', error)
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

  // All protected routes redirect to landing if not logged in
  function guard(element) {
    if (session) return element
    return <Navigate to="/" replace />
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
              {/* Landing — only public page */}
              <Route
                path="/"
                element={
                  <Landing
                    session={session}
                    onShowLogin={() => setShowLogin(true)}
                  />
                }
              />

              {/* All other routes require login */}
              <Route path="/clock"       element={guard(<Home />)} />
              <Route path="/doomscroll"  element={guard(<Doomscroll />)} />
              <Route path="/world-clock" element={guard(<WorldClock />)} />
              <Route path="/alarms"      element={guard(<Alarms />)} />
              <Route path="/goals"       element={guard(<Goals />)} />
              <Route path="/settings"    element={guard(<Settings session={session} />)} />
              <Route path="*"            element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ConditionalBottomNav />
        </>
      )}

      {wakeActive    && <WakeAlarmOverlay    onDismiss={() => setWakeActive(false)} />}
      {reverseActive && <ReverseAlarmOverlay onDismiss={() => setReverseActive(false)} />}
      {showLogin     && <LoginSheet onClose={() => setShowLogin(false)} />}
      <InstallPrompt />
    </BrowserRouter>
  )
}
