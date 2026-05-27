const MODEL = 'gemini-2.0-flash'
const BASE  = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const SYSTEM = `You are the Tough Love goal coach — honest, warm, and direct.
Like a coach who genuinely cares, not a drill sergeant.
Never use filler phrases like "Certainly!" or "Great question!".
Get straight to the point.`

async function callGemini(userPrompt, maxTokens = 180) {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    console.error('[AI] VITE_GEMINI_API_KEY is not set')
    return null
  }
  try {
    const res = await fetch(`${BASE}?key=${key}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${SYSTEM}\n\n${userPrompt}` }]
        }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.75 },
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[AI] Gemini error', res.status, err)
      return `Error ${res.status} — ${err?.error?.message ?? 'check API key'}`
    }
    const json = await res.json()
    return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
  } catch (e) {
    console.error('[AI] fetch failed', e)
    return null
  }
}

// Goal coach — called on demand from GoalCard
export async function getGoalCoaching({ title, streak, completedCount, failedCount }) {
  return callGemini(
    `Daily habit: "${title}"
Current streak: ${streak} day${streak === 1 ? '' : 's'}
Last 14 days: ${completedCount} done, ${failedCount} missed

In exactly 2 sentences: give one honest observation about their pattern, then one specific actionable suggestion.`
  )
}

// Failure recovery — called after marking a daily goal failed
export async function getFailureRecovery({ title, lostStreak, recentFailCount }) {
  return callGemini(
    `The user just failed their daily habit: "${title}"
Streak lost: ${lostStreak} day${lostStreak === 1 ? '' : 's'}
Failures in the last 2 weeks: ${recentFailCount}

In exactly 2 sentences: give one specific thing they can do differently tomorrow.
Be direct. No sugarcoating, no piling on.`
  )
}

const FALLBACK_PROMPTS = [
  'Why does this goal actually matter to me right now?',
  'What will I be able to do or feel once I\'ve built this habit?',
  'What would I tell myself if I almost gave up halfway through?',
]

// Letter prompts — called when "Letter to Future You" is toggled on
export async function getLetterPrompts(goalTitle) {
  const text = await callGemini(
    `Generate exactly 3 short, emotionally resonant reflection questions to help someone write a "Letter to Future Self" about this goal: "${goalTitle}"

Help them explore their deeper motivation and what success would truly mean to them.
Return only the 3 questions, one per line. No numbering. No bullets. No quotes. Just the questions.`,
    120
  )
  if (!text) return FALLBACK_PROMPTS
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3)
  return lines.length >= 2 ? lines : FALLBACK_PROMPTS
}
