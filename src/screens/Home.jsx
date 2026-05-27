import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimer } from '../hooks/useTimer'
import { supabase } from '../supabase'

const DURATIONS = [15, 25, 45, 60]

const R    = 88
const CX   = 100
const CY   = 100
const CIRC = 2 * Math.PI * R   // ≈ 553

function getTimerColor(fraction) {
  if (fraction > 0.5) return '#7C6FF7'   // purple
  if (fraction > 0.2) return '#F59E0B'   // amber
  return '#EF4444'                        // red
}

function getStatusLabel(fraction, status, duration) {
  if (status === 'idle')   return `${duration} min`
  if (status === 'done')   return 'Well done.'
  if (status === 'paused') return 'Paused'
  if (fraction > 0.7)  return 'Plenty of time'
  if (fraction > 0.4)  return 'Stay focused'
  if (fraction > 0.15) return 'Getting close'
  return 'Final stretch'
}

function CircularTimer({ fraction, status }) {
  const filled = status === 'idle' ? 1 : Math.max(0, Math.min(1, fraction))
  const dash   = CIRC * filled
  const gap    = CIRC - dash
  const color  = getTimerColor(status === 'idle' ? 1 : fraction)

  return (
    <svg viewBox="0 0 200 200" className="ct-svg" aria-hidden>
      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />

      {/* Progress ring */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        transform={`rotate(-90 ${CX} ${CY})`}
        filter="url(#glow)"
        style={{ transition: 'stroke-dasharray 0.6s ease, stroke 1.5s ease' }}
      />
    </svg>
  )
}

function DueDateChip({ dueAt }) {
  if (!dueAt) return null
  const due   = new Date(dueAt)
  const today = new Date(); today.setHours(0,0,0,0)
  const diff  = Math.ceil((due - today) / 86400000)
  const label = diff < 0 ? 'Overdue' : diff === 0 ? 'Due today' : diff === 1 ? 'Due tomorrow'
              : `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  return <span className={`home-goal-chip${diff < 0 ? ' overdue' : ''}`}>{label}</span>
}

function TodaysGoals({ navigate }) {
  const [goals,   setGoals]   = useState([])
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [goalsRes, streaksRes] = await Promise.all([
        supabase.from('goals').select('id,title,cadence,due_at,status')
          .eq('user_id', user.id).eq('status', 'active')
          .order('created_at', { ascending: true }).limit(3),
        supabase.from('streaks').select('goal_id,current_streak').eq('user_id', user.id),
      ])

      if (goalsRes.data)   setGoals(goalsRes.data)
      if (streaksRes.data) {
        const map = {}
        streaksRes.data.forEach(s => { map[s.goal_id] = s.current_streak })
        setStreaks(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null

  return (
    <div className="home-goals-section">
      <div className="home-goals-header">
        <p className="label">Today's commitments</p>
        <button className="home-goals-seeall" onClick={() => navigate('/goals')}>
          See all →
        </button>
      </div>

      {goals.length === 0 ? (
        <button className="home-goals-empty" onClick={() => navigate('/goals')}>
          + Set your first goal →
        </button>
      ) : (
        <div className="home-goals-list">
          {goals.map(goal => {
            const isDaily   = (goal.cadence ?? 'daily') === 'daily'
            const streak    = streaks[goal.id] ?? 0
            return (
              <button
                key={goal.id}
                className="home-goal-row"
                onClick={() => navigate('/goals')}
              >
                <div className="home-goal-left">
                  {isDaily
                    ? <span className="home-goal-chip">{streak > 0 ? `🔥 ${streak}` : '—'}</span>
                    : <DueDateChip dueAt={goal.due_at} />
                  }
                  <span className="home-goal-title">{goal.title}</span>
                </div>
                <span className="home-goal-arrow">→</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [selectedDuration, setSelectedDuration] = useState(25)
  const durationSeconds = selectedDuration * 60
  const { remaining, status, start, pause, reset } = useTimer(durationSeconds)
  const fraction = remaining / durationSeconds
  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'done') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session complete', { body: 'You did it. Well done.' })
      }
    }
  }, [status])

  const color = getTimerColor(status === 'idle' ? 1 : fraction)

  return (
    <>
      <div className="screen-header">
        <p className="label">Empathy Clock</p>
        <h1 className="screen-header-title">Your time,<br />clearly.</h1>
      </div>

      <div className="screen-body">
        <div className="home-desktop">

          {/* Left column — timer */}
          <div className="home-col-left">
            <div className="ct-wrapper">
              <CircularTimer fraction={fraction} status={status} />
              <div className="ct-center">
                <p className="ct-label" style={{ color }}>
                  {getStatusLabel(fraction, status, selectedDuration)}
                </p>
              </div>
            </div>

            {(status === 'idle' || status === 'done') && (
              <div className="duration-picker">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    className={`duration-pill${selectedDuration === d ? ' active' : ''}`}
                    onClick={() => { setSelectedDuration(d); reset() }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            )}

            <div className="timer-controls">
              {status === 'idle'    && <button className="btn-primary" onClick={start}>Start session</button>}
              {status === 'running' && (
                <>
                  <button className="btn-primary" onClick={pause}>Pause</button>
                  <button className="btn-ghost" onClick={reset}>Reset</button>
                </>
              )}
              {status === 'paused'  && (
                <>
                  <button className="btn-primary" onClick={start}>Resume</button>
                  <button className="btn-ghost" onClick={reset}>Reset</button>
                </>
              )}
              {status === 'done'    && <button className="btn-primary" onClick={reset}>New session</button>}
            </div>
          </div>

          {/* Right column — tools */}
          <div className="home-col-right">
            <p className="label" style={{ paddingLeft: 2 }}>More tools</p>

            <button className="tool-card" onClick={() => navigate('/doomscroll')}>
              <div className="tool-card-text">
                <p className="tool-card-title">Doomscroll Tracker</p>
                <p className="tool-card-body">See exactly how long you spend in each app.</p>
              </div>
              <span className="tool-card-arrow">→</span>
            </button>

            <button className="tool-card" onClick={() => navigate('/world-clock')}>
              <div className="tool-card-text">
                <p className="tool-card-title">World Clock</p>
                <p className="tool-card-body">See who's awake, in the zone, or asleep.</p>
              </div>
              <span className="tool-card-arrow">→</span>
            </button>

            <button className="tool-card" onClick={() => navigate('/alarms')}>
              <div className="tool-card-text">
                <p className="tool-card-title">Alarms</p>
                <p className="tool-card-body">Wake smart. Wind down with a fading screen.</p>
              </div>
              <span className="tool-card-arrow">→</span>
            </button>
          </div>

        </div>

        <TodaysGoals navigate={navigate} />
      </div>
    </>
  )
}
