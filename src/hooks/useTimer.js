import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(durationSeconds) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [status, setStatus] = useState('idle') // idle | running | paused | done
  const intervalRef = useRef(null)
  const endTimeRef = useRef(null)

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = useCallback(() => {
    stopInterval()
    endTimeRef.current = Date.now() + remaining * 1000
    setStatus('running')
    intervalRef.current = setInterval(() => {
      const r = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemaining(r)
      if (r === 0) {
        stopInterval()
        setStatus('done')
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Session complete', { body: 'You did it. Well done.' })
        }
      }
    }, 200)
  }, [remaining])

  const pause = useCallback(() => {
    stopInterval()
    setStatus('paused')
  }, [])

  const reset = useCallback(() => {
    stopInterval()
    setRemaining(durationSeconds)
    setStatus('idle')
    endTimeRef.current = null
  }, [durationSeconds])

  // Reset remaining when duration changes while idle
  useEffect(() => {
    if (status === 'idle') setRemaining(durationSeconds)
  }, [durationSeconds, status])

  // Cleanup on unmount
  useEffect(() => () => stopInterval(), [])

  return { remaining, status, start, pause, reset }
}
