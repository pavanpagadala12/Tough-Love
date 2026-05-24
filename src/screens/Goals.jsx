import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import CarePackage from '../components/CarePackage'

// ── Stake Pyramid (reused from onboarding) ───────────────────────────
const STAKE_LEVELS = [
  { id: 'future',     label: 'Future',     sub: 'Money stakes · v2', icon: '💰', locked: true,  pct: '58%' },
  { id: 'reputation', label: 'Reputation', sub: 'With a witness',    icon: '👁',  locked: false, pct: '79%' },
  { id: 'willpower',  label: 'Willpower',  sub: 'Just yourself',     icon: '🧠', locked: false, pct: '100%' },
]
const LEVEL_ORDER = ['willpower', 'reputation', 'future']

function StakePyramid({ value, onChange }) {
  const selectedIdx = LEVEL_ORDER.indexOf(value)
  return (
    <div className="stake-pyramid">
      {STAKE_LEVELS.map(level => {
        const levelIdx = LEVEL_ORDER.indexOf(level.id)
        const filled   = !level.locked && levelIdx <= selectedIdx
        return (
          <div key={level.id} style={{ width: level.pct, margin: '0 auto' }}>
            <button
              className={`pyramid-level${filled ? ' selected' : ''}${level.locked ? ' locked' : ''}`}
              onClick={() => !level.locked && onChange(level.id)}
              disabled={level.locked}
            >
              <span className="pyramid-icon">{level.icon}</span>
              <div className="pyramid-text">
                <p className="pyramid-label">{level.label}</p>
                <p className="pyramid-sub">{level.sub}</p>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Add Goal sheet ───────────────────────────────────────────────────
function AddGoalSheet({ userId, onSaved, onClose }) {
  const [title,      setTitle]      = useState('')
  const [stakeLevel, setStakeLevel] = useState('willpower')
  const [loading,    setLoading]    = useState(false)

  async function save() {
    if (!title.trim()) return
    setLoading(true)
    const { data, error } = await supabase.from('goals').insert({
      user_id:     userId,
      title:       title.trim(),
      stake_level: stakeLevel,
    }).select().single()
    setLoading(false)
    if (!error && data) onSaved(data)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-overlay" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">New goal</h2>

        <div className="ob-field" style={{ marginBottom: 4 }}>
          <p className="alarm-field-label">I will…</p>
          <input
            className="input-field"
            placeholder="e.g. Read for 20 minutes tonight"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
            autoFocus
          />
        </div>

        <div className="ob-field">
          <p className="alarm-field-label">Stake level</p>
          <StakePyramid value={stakeLevel} onChange={setStakeLevel} />
          <p className="ob-pyramid-hint">Higher levels include everything below them.</p>
        </div>

        <div className="sheet-actions">
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn-primary"
            style={{ flex: 2 }}
            disabled={!title.trim() || loading}
            onClick={save}
          >
            {loading ? 'Saving…' : 'Add goal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Streak badge ─────────────────────────────────────────────────────
function StreakBadge({ count }) {
  if (!count) return null
  const milestones = [3, 7, 14, 30, 60, 100]
  const next = milestones.find(m => m > count) ?? null
  return (
    <div className="streak-badge">
      <span className="streak-fire">🔥</span>
      <span className="streak-count">{count}</span>
      {next && <span className="streak-next">→{next}</span>}
    </div>
  )
}

// ── Goal card ────────────────────────────────────────────────────────
function GoalCard({ goal, streak, userId, onComplete, onFail, onDelete }) {
  const stakeInfo = STAKE_LEVELS.find(s => s.id === goal.stake_level) ?? STAKE_LEVELS[2]
  const isActive  = goal.status === 'active'

  return (
    <div className={`goal-card${!isActive ? ' goal-card-inactive' : ''}`}>
      <div className="goal-card-top">
        <div className="goal-card-meta">
          <span className="goal-stake-badge">
            {stakeInfo.icon} {stakeInfo.label}
          </span>
          {isActive && <StreakBadge count={streak?.current_streak ?? 0} />}
        </div>

        <p className="goal-title">{goal.title}</p>
      </div>

      {isActive && (
        <div className="goal-card-actions">
          <button className="goal-btn goal-btn-complete" onClick={() => onComplete(goal, streak)}>
            ✓ Done today
          </button>
          <button className="goal-btn goal-btn-fail" onClick={() => onFail(goal, streak)}>
            ✗ Failed
          </button>
        </div>
      )}

      {!isActive && (
        <div className="goal-card-status">
          <span className={`goal-status-pill goal-status-${goal.status}`}>
            {goal.status === 'completed' ? '✓ Complete' : '✗ Failed'}
          </span>
          <button className="goal-delete-btn" onClick={() => onDelete(goal.id)}>
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────
export default function Goals() {
  const [userId,      setUserId]      = useState(null)
  const [goals,       setGoals]       = useState([])
  const [streaks,     setStreaks]     = useState({})
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)
  const [careGoal,    setCareGoal]    = useState(null)   // goal that just completed
  const [timeBankMin, setTimeBankMin] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const loadData = useCallback(async (uid) => {
    if (!uid) return
    const [goalsRes, streaksRes, tbRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('streaks').select('*').eq('user_id', uid),
      supabase.from('time_bank_entries').select('minutes').eq('user_id', uid),
    ])
    if (goalsRes.data)  setGoals(goalsRes.data)
    if (streaksRes.data) {
      const map = {}
      streaksRes.data.forEach(s => { map[s.goal_id] = s })
      setStreaks(map)
    }
    if (tbRes.data) {
      const total = tbRes.data.reduce((sum, e) => sum + (e.minutes ?? 0), 0)
      setTimeBankMin(Math.max(0, total))
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData(userId) }, [userId, loadData])

  function handleGoalSaved(newGoal) {
    setGoals(gs => [newGoal, ...gs])
    setShowAdd(false)
  }

  async function handleComplete(goal, streak) {
    const now       = new Date().toISOString()
    const newStreak = (streak?.current_streak ?? 0) + 1
    const maxStreak = Math.max(newStreak, streak?.longest_streak ?? 0)

    // Upsert streak
    await supabase.from('streaks').upsert({
      user_id:           userId,
      goal_id:           goal.id,
      current_streak:    newStreak,
      longest_streak:    maxStreak,
      last_completed_at: now,
    }, { onConflict: 'user_id,goal_id' })

    // Award time bank minutes (5 per completion)
    await supabase.from('time_bank_entries').insert({
      user_id: userId,
      goal_id: goal.id,
      minutes: 5,
      reason:  'goal_completed',
    })

    // Log session
    await supabase.from('goal_sessions').insert({
      user_id: userId,
      goal_id: goal.id,
      outcome: 'completed',
    })

    await loadData(userId)
    setCareGoal({ goal, streak: newStreak })
  }

  async function handleFail(goal, streak) {
    const now           = new Date().toISOString()
    const curStreak     = streak?.current_streak ?? 0
    const curMonth      = now.slice(0, 7)   // 'YYYY-MM'
    const insuranceUsed = streak?.insurance_used_month

    // Streak Insurance: if streak >= 7 and insurance not used this month
    if (curStreak >= 7 && insuranceUsed !== curMonth) {
      await supabase.from('streaks').upsert({
        user_id:              userId,
        goal_id:              goal.id,
        current_streak:       curStreak,
        longest_streak:       streak?.longest_streak ?? curStreak,
        last_completed_at:    now,
        insurance_used_month: curMonth,
      }, { onConflict: 'user_id,goal_id' })

      await supabase.from('goal_sessions').insert({
        user_id: userId, goal_id: goal.id,
        outcome: 'failed', streak_insurance_used: true,
      })
      await loadData(userId)
      alert(`Streak insurance used! Your ${curStreak}-day streak is protected. One free pass per month.`)
      return
    }

    // Normal failure — reset streak
    await supabase.from('streaks').upsert({
      user_id:           userId,
      goal_id:           goal.id,
      current_streak:    0,
      longest_streak:    streak?.longest_streak ?? 0,
      last_completed_at: now,
    }, { onConflict: 'user_id,goal_id' })

    await supabase.from('goal_sessions').insert({
      user_id: userId, goal_id: goal.id, outcome: 'failed',
    })
    await loadData(userId)
  }

  async function handleDelete(goalId) {
    await supabase.from('goals').delete().eq('id', goalId)
    setGoals(gs => gs.filter(g => g.id !== goalId))
  }

  const activeGoals   = goals.filter(g => g.status === 'active')
  const inactiveGoals = goals.filter(g => g.status !== 'active')

  return (
    <>
      <div className="screen-header">
        <p className="label">Commitments</p>
        <h1 className="screen-header-title">Goals</h1>
      </div>

      <div className="screen-body">
        {/* Time Bank summary */}
        {timeBankMin > 0 && (
          <div className="time-bank-bar">
            <span className="time-bank-icon">⏱</span>
            <div>
              <p className="time-bank-label">Time Bank</p>
              <p className="time-bank-mins">{timeBankMin} free minutes earned</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <p className="empty-state-body">Loading…</p>
          </div>
        ) : (
          <>
            {activeGoals.length === 0 && inactiveGoals.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-2)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="2" x2="12" y2="5" />
                  </svg>
                </div>
                <p className="empty-state-title">No goals yet</p>
                <p className="empty-state-body">Set a commitment and choose how accountable you want to be.</p>
              </div>
            )}

            {activeGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                streak={streaks[goal.id]}
                userId={userId}
                onComplete={handleComplete}
                onFail={handleFail}
                onDelete={handleDelete}
              />
            ))}

            {inactiveGoals.length > 0 && (
              <>
                <div className="section-divider" />
                <p className="label" style={{ paddingLeft: 2 }}>Past goals</p>
                {inactiveGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    streak={streaks[goal.id]}
                    userId={userId}
                    onComplete={handleComplete}
                    onFail={handleFail}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </>
        )}

        <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowAdd(true)}>
          + New goal
        </button>
      </div>

      {showAdd && userId && (
        <AddGoalSheet userId={userId} onSaved={handleGoalSaved} onClose={() => setShowAdd(false)} />
      )}

      {careGoal && (
        <CarePackage
          goalTitle={careGoal.goal.title}
          streakCount={careGoal.streak}
          onDismiss={() => setCareGoal(null)}
        />
      )}
    </>
  )
}
