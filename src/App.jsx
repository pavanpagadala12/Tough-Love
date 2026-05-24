import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAlarmChecker } from './hooks/useAlarmChecker'
import Auth from './screens/Auth'
import Home from './screens/Home'
import Goals from './screens/Goals'
import Settings from './screens/Settings'
import Doomscroll from './screens/Doomscroll'
import WorldClock from './screens/WorldClock'
import Alarms from './screens/Alarms'
import BottomNav from './components/BottomNav'
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

  if (session === undefined) return <div className="splash" />
  if (!session) return <Auth />
  return <AuthenticatedApp session={session} />
}

function AuthenticatedApp({ session }) {
  const [wakeActive,    setWakeActive]    = useState(false)
  const [reverseActive, setReverseActive] = useState(false)

  const onWakeFire    = useCallback(() => setWakeActive(true),    [])
  const onReverseFire = useCallback(() => setReverseActive(true), [])

  useAlarmChecker({ onWakeFire, onReverseFire })

  return (
    <BrowserRouter>
      <main className={`screen-area${reverseActive ? ' grayscale' : ''}`}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/doomscroll"  element={<Doomscroll />} />
          <Route path="/world-clock" element={<WorldClock />} />
          <Route path="/alarms"      element={<Alarms />} />
          <Route path="/goals"       element={<Goals />} />
          <Route path="/settings"    element={<Settings session={session} />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />

      {wakeActive && (
        <WakeAlarmOverlay onDismiss={() => setWakeActive(false)} />
      )}
      {reverseActive && (
        <ReverseAlarmOverlay onDismiss={() => setReverseActive(false)} />
      )}
    </BrowserRouter>
  )
}
