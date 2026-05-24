import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import CarePackage from '../components/CarePackage'
import RealityCheck from '../components/RealityCheck'
import StreakInsuranceSheet from '../components/StreakInsuranceSheet'

// ── Stake Pyramid ────────────────────────────────────────────────────
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

// ── Stick toggle row ─────────────────────────────────────────────────
function StickRow({ icon, label, desc, checked, onChange }) {
  return (
    <button
      className={`ob-consent-row${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="ob-consent-row-left">
        <span className="ob-consent-icon">{icon}</span>
        <div className="ob-consent-text">
          <p className="ob-consent-title">{label}</p>
          <p className="ob-consent-body">{desc}</p>
        </div>
      </div>
      <div className={`toggle${checked ? ' on' : ''}`} style={{ pointerEvents: 'none' }} />
    </button>
  )
}

// ── Add Goal sheet ───────────────────────────────────────────────────
function AddGoalSheet({ userId, consents, onSaved, onClose }) {
  const [title,        setTitle]        = useState('')
  const [stakeLevel,   setStakeLevel]   = useState('willpower')
  const [stickLetter,  setStickLetter]  = useState(false)
  const [stickReality, setStickReality] = useState(false)
  const [stickWitness, setStickWitness] = useState(false)
  const [letterText,   setLetterText]   = useState('')
  const [witnessName,  setWitnessName]  = useState('')
  const [witnessEmail, setWitnessEmail] = useState('')
  const [loading,      setLoading]      = useState(false)

  const hasAnyStick = consents.letter || consents.reality_check || consents.witness

  async function save() {
    if (!title.trim()) return
    if (stickWitness && (!witnessName.trim() || !witnessEmail.trim())) return
    setLoading(true)

    const { data: goal, error } = await supabase.from('goals').insert({
      user_id:            userId,
      title:              title.trim(),
      stake_level:        stakeLevel,
      stick_letter:       stickLetter,
      stick_reality_check: stickReality,
      stick_witness:      stickWitness,
    }).select().single()

    if (error || !goal) { setLoading(false); return }

    // Save letter
    if (stickLetter && letterText.trim()) {
      await supabase.from('letters').insert({
        user_id: userId,
        goal_id: goal.id,
        content: letterText.trim(),
      })
    }

    // Save witness
    if (stickWitness && witnessName.trim() && witnessEmail.trim()) {
      await supabase.from('witnesses').insert({
        user_id:       userId,
        goal_id:       goal.id,
        witness_name:  witnessName.trim(),
        witness_email: witnessEmail.trim(),
      })
    }

    setLoading(false)
    onSaved(goal)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-overlay" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">New goal</h2>

        <div className="ob-field">
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

        {hasAnyStick && (
          <div className="ob-field">
            <p className="alarm-field-label">Brutal Mode — this goal</p>
            <div className="ob-consent-list">
              {consents.letter && (
                <StickRow
                  icon="✉️"
                  label="Letter to Future You"
                  desc="Write yourself a note now. Deleted unread if you fail."
                  checked={stickLetter}
                  onChange={setStickLetter}
                />
              )}
              {consents.reality_check && (
                <StickRow
                  icon="📋"
                  label="Reality Check"
                  desc="On failure, your screen shows honest facts about this goal."
                  checked={stickReality}
                  onChange={setStickReality}
                />
              )}
              {consents.witness && (
                <StickRow
                  icon="👁"
                  label="Witness Mode"
                  desc="One person gets notified if you break this commitment."
                  checked={stickWitness}
                  onChange={setStickWitness}
                />
              )}
            </div>
          </div>
        )}

        {stickLetter && (
          <div className="ob-field">
            <p className="alarm-field-label">Your letter</p>
            <textarea
              className="input-field letter-textarea"
              placeholder="Dear future me, I chose this goal because…"
              value={letterText}
              onChange={e => setLetterText(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <p className="ob-pyramid-hint">You'll only read this if you succeed.</p>
          </div>
        )}

        {stickWitness && (
          <div className="ob-field">
            <p className="alarm-field-label">Your witness</p>
            <input
              className="input-field"
              placeholder="Their name"
              value={witnessName}
              onChange={e => setWitnessName(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <input
              className="input-field"
              type="email"
              placeholder="Their email"
              value={witnessEmail}
              onChange={e => setWitnessEmail(e.target.value)}
            />
            <p className="ob-pyramid-hint">They get one email if you fail. You send it — no surprises for them.</p>
          </div>
        )}

        <div className="sheet-actions">
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn-primary"
            style={{ flex: 2 }}
            disabled={!title.trim() || loading || (stickWitness && (!witnessName.trim() || !witnessEmail.trim()))}
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
function GoalCard({ goal, streak, onComplete, onFail, onDelete }) {
  const [busy,       setBusy]       = useState(false)
  const [todayState, setTodayState] = useState(null) // 'done' | 'failed' | null

  const stakeInfo = STAKE_LEVELS.find(s => s.id === goal.stake_level) ?? STAKE_LEVELS[2]
  const isActive  = goal.status === 'active'

  async function handleComplete() {
    setBusy(true)
    await onComplete(goal, streak)
    setTodayState('done')
    setBusy(false)
  }

  async function handleFail() {
    setBusy(true)
    await onFail(goal, streak)
    setTodayState('failed')
    setBusy(false)
  }

  return (
    <div className={`goal-card${!isActive ? ' goal-card-inactive' : ''}`}>
      <div className="goal-card-top">
        <div className="goal-card-meta">
          <span className="goal-stake-badge">{stakeInfo.icon} {stakeInfo.label}</span>
          {isActive && <StreakBadge count={streak?.current_streak ?? 0} />}
        </div>
        <p className="goal-title">{goal.title}</p>
        {isActive && (goal.stick_letter || goal.stick_reality_check || goal.stick_witness) && (
          <div className="goal-sticks">
            {goal.stick_letter        && <span className="goal-stick-pill">✉️ Letter</span>}
            {goal.stick_reality_check && <span className="goal-stick-pill">📋 Reality Check</span>}
            {goal.stick_witness       && <span className="goal-stick-pill">👁 Witness</span>}
          </div>
        )}
      </div>

      {isActive && todayState === null && (
        <div className="goal-card-actions">
          <button className="goal-btn goal-btn-complete" onClick={handleComplete} disabled={busy}>
            {busy ? '…' : '✓ Done today'}
          </button>
          <button className="goal-btn goal-btn-fail" onClick={handleFail} disabled={busy}>
            {busy ? '…' : '✗ Failed'}
          </button>
        </div>
      )}

      {isActive && todayState === 'done' && (
        <div className="goal-today-feedback goal-today-done">
          ✓ Logged — streak extended. See you tomorrow.
        </div>
      )}

      {isActive && todayState === 'failed' && (
        <div className="goal-today-feedback goal-today-failed">
          Logged. Streak reset. You can still try again tomorrow.
        </div>
      )}

      {!isActive && (
        <div className="goal-card-status">
          <span className={`goal-status-pill goal-status-${goal.status}`}>
            {goal.status === 'completed' ? '✓ Complete' : '✗ Failed'}
          </span>
          <button className="goal-delete-btn" onClick={() => onDelete(goal.id)}>Remove</button>
        </div>
      )}
    </div>
  )
}

// ── Letter reveal overlay ────────────────────────────────────────────
function LetterReveal({ content, goalTitle, onDismiss }) {
  return (
    <div className="care-backdrop visible" onClick={onDismiss}>
      <div className="care-card visible letter-reveal-card" onClick={e => e.stopPropagation()}>
        <p className="care-eyebrow">A note from past you</p>
        <h2 className="care-title" style={{ fontSize: 20 }}>{goalTitle}</h2>
        <div className="letter-content">
          <p>{content}</p>
        </div>
        <button className="btn-primary care-dismiss" onClick={onDismiss}>Close →</button>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────
export default function Goals() {
  const [userId,       setUserId]       = useState(null)
  const [consents,     setConsents]     = useState({ letter: false, reality_check: false, witness: false })
  const [goals,        setGoals]        = useState([])
  const [streaks,      setStreaks]      = useState({})
  const [loading,      setLoading]      = useState(true)
  const [showAdd,      setShowAdd]      = useState(false)
  const [careGoal,     setCareGoal]     = useState(null)
  const [letterReveal, setLetterReveal] = useState(null)  // { content, goalTitle }
  const [realityGoal,  setRealityGoal]  = useState(null)  // goal that failed (for Reality Check)
  const [timeBankMin,  setTimeBankMin]  = useState(0)
  const [insuranceStreak, setInsuranceStreak] = useState(null)  // streak count when insurance fires

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('consent_letter, consent_reality_check, consent_witness')
        .eq('id', user.id)
        .single()
      if (profile) {
        setConsents({
          letter:       profile.consent_letter       ?? false,
          reality_check: profile.consent_reality_check ?? false,
          witness:      profile.consent_witness      ?? false,
        })
      }
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

    await supabase.from('streaks').upsert({
      user_id: userId, goal_id: goal.id,
      current_streak: newStreak, longest_streak: maxStreak,
      last_completed_at: now,
    }, { onConflict: 'user_id,goal_id' })

    await supabase.from('time_bank_entries').insert({
      user_id: userId, goal_id: goal.id, minutes: 5, reason: 'goal_completed',
    })

    await supabase.from('goal_sessions').insert({
      user_id: userId, goal_id: goal.id, outcome: 'completed',
    })

    // Reveal letter if it exists
    if (goal.stick_letter) {
      const { data: letter } = await supabase
        .from('letters')
        .select('content')
        .eq('goal_id', goal.id)
        .is('deleted_at', null)
        .single()
      if (letter?.content) {
        setLetterReveal({ content: letter.content, goalTitle: goal.title })
      }
    }

    await loadData(userId)
    setCareGoal({ goal, streak: newStreak })
  }

  async function handleFail(goal, streak) {
    const now           = new Date().toISOString()
    const curStreak     = streak?.current_streak ?? 0
    const curMonth      = now.slice(0, 7)
    const insuranceUsed = streak?.insurance_used_month

    if (curStreak >= 7 && insuranceUsed !== curMonth) {
      const { error: e1 } = await supabase.from('streaks').upsert({
        user_id: userId, goal_id: goal.id,
        current_streak: curStreak, longest_streak: streak?.longest_streak ?? curStreak,
        last_completed_at: now, insurance_used_month: curMonth,
      }, { onConflict: 'user_id,goal_id' })
      if (e1) console.error('streaks upsert:', e1)

      const { error: e2 } = await supabase.from('goal_sessions').insert({
        user_id: userId, goal_id: goal.id, outcome: 'failed', streak_insurance_used: true,
      })
      if (e2) console.error('goal_sessions insert:', e2)

      await loadData(userId)
      setInsuranceStreak(curStreak)
      return
    }

    const { error: e3 } = await supabase.from('streaks').upsert({
      user_id: userId, goal_id: goal.id,
      current_streak: 0, longest_streak: streak?.longest_streak ?? 0,
      last_completed_at: now,
    }, { onConflict: 'user_id,goal_id' })
    if (e3) console.error('streaks upsert:', e3)

    await supabase.from('goal_sessions').insert({
      user_id: userId, goal_id: goal.id, outcome: 'failed',
    })

    // Delete letter (null content)
    if (goal.stick_letter) {
      await supabase.from('letters')
        .update({ content: null, deleted_at: now })
        .eq('goal_id', goal.id)
        .is('deleted_at', null)
    }

    // Witness — open pre-filled mailto
    if (goal.stick_witness) {
      const { data: witness } = await supabase
        .from('witnesses')
        .select('witness_name, witness_email')
        .eq('goal_id', goal.id)
        .single()
      if (witness) {
        const subject = encodeURIComponent(`I broke my commitment: ${goal.title}`)
        const body    = encodeURIComponent(
          `Hi ${witness.witness_name},\n\nI told you I would "${goal.title}" and I didn't do it today.\n\nI'm being honest because I said I would be.\n\n— sent via Tough Love`
        )
        window.open(`mailto:${witness.witness_email}?subject=${subject}&body=${body}`)
        await supabase.from('witnesses')
          .update({ notified_at: now })
          .eq('goal_id', goal.id)
      }
    }

    await loadData(userId)

    if (goal.stick_reality_check) {
      setRealityGoal({ ...goal, lostStreak: curStreak })
    }
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
        <AddGoalSheet
          userId={userId}
          consents={consents}
          onSaved={handleGoalSaved}
          onClose={() => setShowAdd(false)}
        />
      )}

      {careGoal && (
        <CarePackage
          goalTitle={careGoal.goal.title}
          streakCount={careGoal.streak}
          onDismiss={() => setCareGoal(null)}
        />
      )}

      {letterReveal && (
        <LetterReveal
          content={letterReveal.content}
          goalTitle={letterReveal.goalTitle}
          onDismiss={() => setLetterReveal(null)}
        />
      )}

      {realityGoal && (
        <RealityCheck
          goal={realityGoal}
          lostStreak={realityGoal.lostStreak}
          onDismiss={() => setRealityGoal(null)}
        />
      )}

      {insuranceStreak !== null && (
        <StreakInsuranceSheet
          streakCount={insuranceStreak}
          onDismiss={() => setInsuranceStreak(null)}
        />
      )}
    </>
  )
}
