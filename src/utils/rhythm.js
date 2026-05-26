export function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesToDisplay(min) {
  const m   = ((min % 1440) + 1440) % 1440
  const h24 = Math.floor(m / 60)
  const mm  = m % 60
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  const h12  = h24 % 12 || 12
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`
}

export function getCurrentMinutes() {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

const CHRONOTYPE_SHIFT = { morning: -15, intermediate: 0, evening: 60 }

const EVENTS = [
  // Morning Protocol
  { id: 'hydrate',    offset: 0,   category: 'morning',   icon: '💧', label: 'Hydrate',              desc: 'Drink 500ml — overnight dehydration measurably slows cognition.' },
  { id: 'sunlight',   offset: 5,   category: 'morning',   icon: '☀️',  label: 'Get outside',          desc: '10–30 min sunlight anchors your circadian clock for the whole day.' },
  { id: 'caffeine',   offset: 90,  category: 'morning',   icon: '☕', label: 'Caffeine opens',       desc: 'Adenosine has rebuilt — caffeine is now maximally effective.' },
  // Focus Rhythm
  { id: 'deepwork',   offset: 120, category: 'focus',     icon: '🧠', label: 'Deep work block',      desc: 'Cortisol peak + rising body temp = your peak analytical window.' },
  { id: 'break1',     offset: 210, category: 'focus',     icon: '⏸',  label: 'Ultradian break',      desc: '15–20 min genuine rest. Step away — no email, no screen.' },
  { id: 'break2',     offset: 300, category: 'focus',     icon: '⏸',  label: 'Ultradian break',      desc: 'Second rest window. Your next 90-min block starts fully fresh.' },
  // Afternoon
  { id: 'nap',        offset: 360, category: 'afternoon', icon: '😴', label: 'Nap window',           desc: 'NASA protocol: 10–26 min only. Hard stop — avoid entering deep sleep.' },
  { id: 'lastcaff',   offset: 390, category: 'afternoon', icon: '☕', label: 'Last caffeine',        desc: '7-hr half-life. After this, caffeine protects your deep sleep tonight.' },
  { id: 'break3',     offset: 390, category: 'focus',     icon: '⏸',  label: 'Ultradian break',      desc: 'Third ultradian rest window.' },
  { id: 'exercise',   offset: 540, category: 'afternoon', icon: '🏋️', label: 'Exercise window',      desc: 'Body temp peaks — 3–21% better strength and power vs. morning (science-backed).' },
  // Sleep Prep — offsets relative to sleep target
  { id: 'stopeating', sleepOffset: -180, category: 'sleep', icon: '🍽', label: 'Stop eating',        desc: 'Eating near sleep suppresses insulin while melatonin is rising.' },
  { id: 'winddown',   sleepOffset: -120, category: 'sleep', icon: '📵', label: 'Screen wind-down',   desc: 'Blue light delays melatonin onset by 1.5–3 hrs — protect this window.' },
  { id: 'sleepprep',  sleepOffset: -60,  category: 'sleep', icon: '🚿', label: 'Sleep prep',         desc: 'Warm shower now accelerates sleep onset by ~10 min (5,322-person meta-analysis).' },
  { id: 'journal',    sleepOffset: -45,  category: 'sleep', icon: '📝', label: 'Journal',            desc: "Write tomorrow's top 3 tasks + 3 wins today. Measurably reduces sleep latency." },
]

export function buildRhythmSchedule(wakeTime, sleepTime, chronotype) {
  const wakeMin  = timeToMinutes(wakeTime)
  const sleepMin = timeToMinutes(sleepTime)
  const sleepAdj = sleepMin <= wakeMin ? sleepMin + 1440 : sleepMin
  const shift    = CHRONOTYPE_SHIFT[chronotype] ?? 0

  return EVENTS.map(e => {
    const baseOffset = e.sleepOffset !== undefined
      ? sleepAdj + e.sleepOffset
      : wakeMin + e.offset + (e.category === 'focus' ? shift : 0)
    const minutes = ((baseOffset % 1440) + 1440) % 1440
    return { ...e, minutes, display: minutesToDisplay(minutes) }
  }).sort((a, b) => {
    const toWakeOffset = m => ((m - wakeMin + 1440) % 1440)
    return toWakeOffset(a.minutes) - toWakeOffset(b.minutes)
  })
}
