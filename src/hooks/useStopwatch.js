import { useState, useEffect, useRef, useCallback } from 'react'

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startTimeRef = useRef(null)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)
  }, [elapsed])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setElapsed(0)
    setRunning(false)
    startTimeRef.current = null
  }, [])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return { elapsed, running, start, stop, reset }
}
