# Tough Love — Project Instructions for Claude Code

## Who I am
I'm Pavan. I'm not a professional developer. I describe what I want;
you build it. I make product and design decisions; you handle
implementation. I previously built a deployed PWA called Alfred
(personal finance tracker) with React + Vite + Supabase + Vercel, so
I know that stack reasonably well.

## What Tough Love is
A "Carrot and Stick" productivity PWA. The free tier is a beautiful,
fully-functional empathy clock with soft accountability features. The
paid tier (v2 — not in v1 scope) unlocks brutal stake options.

The product wedge: most productivity apps are pure stick (blocking)
or pure carrot (gamification). Tough Love does both, openly, with
explicit consent. The user CHOOSES their level of pain.

The differentiation that matters:
1. Stake choice is a first-class feature, not a hidden setting
2. Failure-recovery is built in (most apps make you feel bad for failing)
3. The empathy clock is so useful you'd use it even without the rest
4. Onboarding literally asks "how do you want to be punished"

## v1 scope — locked, do not expand without explicit conversation

**Empathy Clock (Phase 1) — full product foundation:**
- Visual Time Decay timer (shrinking color blocks, not numbers)
- Circadian-Aligned Wake alarm (light-sleep window)
- Reverse Alarm (screen fades to grayscale at bedtime)
- Doomscroll Stopwatch (floating timer over selected apps)
- World Clock with Availability Rings + overlap slider

**Carrots — make success feel earned:**
- Care Package (celebratory screen on goal completion)
- Time Bank (earned minutes for guilt-free scrolling)
- Streak counter with milestone visualization
- Streak Insurance (one free fail per month at high streaks)

**Sticks — Tier 1 only, opt-in per goal:**
- Letter to Future You (write at goal start; deleted unread on failure)
- Reality Check wallpaper (text-only, e.g. "you wasted 2 hours today")
- Witness Mode (one nominated friend notified on fail)

**Onboarding:**
- 5 screens: Welcome → Choose Punishments → Permissions → Safety Net → First Win
- Stake Pyramid visual when setting any goal (willpower / reputation / money)

**NOT in v1 (deferred):**
- Wallpaper Hijack with anti-cheat loop
- Dyslexic Keyboard (custom Android keyboard — needs native)
- Spoiler Penalty (one-shot weapon, not sustainable)
- Geofencing / sunset sync / Crash Override (all Phase 2)
- Money stakes / donate-to-hated-charity (defer until v2)
- The Pact (two-user feature)

If I ask for any of the above during v1 work, push back and remind me
we agreed they're v2. Don't silently build them.

## Tech stack (locked)
- React + Vite frontend (PWA from day one)
- Supabase: Postgres + Auth + Row Level Security — free tier only
- Vercel for deployment — free tier only
- GitHub for code
- Manifest.json + service worker — installable on phone home screen
- Web Push API for notifications
- Zero monthly cost — never suggest paid services without flagging clearly
- Android-native is v2 — DO NOT propose React Native, Capacitor, etc. for v1

## Wellbeing and ethics rules (these are non-negotiable)
Productivity-punishment apps can genuinely harm users if built carelessly.
The following are HARD rules:

1. **Consent is paramount.** No "punishment" feature activates without
   the user explicitly opting in on the punishment toggle screen, and
   then ALSO explicitly choosing it per-goal. Two-step consent always.

2. **The Escape Hatch must work, always.** Every punishment feature
   must have an Emergency Override (press-and-hold 5 seconds). If a
   feature can't be escaped, don't ship it.

3. **No body-image punishments. Ever.** No "ugly selfie" wallpaper, no
   weight-based shaming, no appearance-based mockery. Reality Check
   text is the brutal ceiling — facts about behavior, never about body.

4. **Failure-recovery on every failure path.** When the user fails a
   goal, the next screen must offer a constructive next step (try
   again with smaller goal, set up Streak Insurance, etc.) — not just
   the punishment then a dead end.

5. **No dark patterns.** No fake urgency, no guilt-tripping for upsells,
   no "are you sure you want to disable" 7-step flows. The app is honest
   about being tough; that means being honest in every other interaction too.

6. **Free tier must be a real product.** The Forest mistake we don't
   repeat: free users get the full Empathy Clock + all soft punishments
   + all carrots. Paid tier (v2) is for users who want MORE brutal,
   not for users who want basics.

## Workflow rules — same painful lessons from Alfred

1. **Plan before you build.** For any non-trivial change, tell me the
   plan in plain English before writing code. Wait for my "go ahead."

2. **One topic per task.** Don't bundle. UI tweak ≠ also "improve" the
   data model. If you spot something else that needs doing, say so —
   don't do it.

3. **Mockups before big visual rebuilds.** Render the layout (SVG or
   ASCII or a sketch description) for me to approve before writing
   the code. We rebuilt the Alfred home screen three times because
   I skipped this. Don't skip this.

4. **Compile-check after every change.** Run a syntax/parse check
   before telling me a change is done. Never hand me broken code.

5. **Verify your own edits.** After editing, re-read the section you
   changed to confirm. Don't trust your edits blindly.

6. **Non-destructive database changes only.** Never DROP a column,
   never rename a column, never delete data. Always additive: new
   columns with defaults so old rows keep working.

7. **Push back honestly.** If I ask for something that breaks the
   design, contradicts a wellbeing rule, hurts performance, or
   contradicts a previous decision — tell me before building it.
   I want a collaborator, not a yes-machine.

8. **Concise commit messages.** Format: short imperative.
   "add witness mode invite flow" not multi-paragraph essays.

9. **No hardcoded locale.** Currency, time format, timezone, language
   — always pull from user profile/settings even if there's only one
   user today.

10. **Mobile-first.** Phone is the primary device. Test layouts at
    ~390px width. Desktop is a nice-to-have, not the priority.

## Aesthetic direction
- Dark, modern, refined — NOT punishing in visual tone
- The aesthetic should be CALM. The app is tough but the design is gentle.
  This contrast is the brand.
- One confident accent color (TBD with me) + one secondary, that's it
- Real depth: subtle gradients, layered shadows, never flat boxes
- Hierarchy is everything: one hero element per screen, others recede
- Serif (e.g. Fraunces) for big display numbers, mono or clean sans for
  data, clean sans for UI text
- Real motion: gentle entrance animations, eased transitions, never jarring
- The Doomscroll Stopwatch is the ONE exception: it can be visually
  aggressive (red, large, hard to ignore) because that's its job

## Files I care about
- `src/App.jsx` — main app (or App.tsx if we go TypeScript — discuss first)
- `src/supabase.js` — backend client
- `src/notifications.js` — push notification helpers
- `public/manifest.json` — PWA manifest
- `public/service-worker.js` — PWA service worker
- `CLAUDE.md` — this file (always read it first)
- `README.md` — human-readable project doc
- `.env` — secrets, NEVER commit (must be in .gitignore from day one)

## At the start of every session
1. Read this CLAUDE.md fully
2. Read README.md for current project state
3. Run `git status` so we both see what's uncommitted
4. Ask me what we're working on today
5. If I propose something out of v1 scope, point it out before agreeing

## What NOT to do
- Don't refactor "for cleanliness" unless I ask
- Don't add dependencies without asking
- Don't push to git without my okay
- Don't write multi-page summaries when one paragraph is enough
- Don't apologize for asking clarifying questions — ask them
- Don't propose Android-native code, React Native, or Capacitor for v1
- Don't add a punishment feature without the wellbeing rules above
- Don't ship a feature without its corresponding Escape Hatch

## When you hit ambiguity
Ask ONE clear question with 2-4 specific options. Don't guess and
build the wrong thing — we've learned this is more expensive than
a 30-second clarification.

## Naming + tone
- Product name: Tough Love
- Punishment system name (in-app): Brutal Mode
- The mascot from the PDF (cute mascot with baseball bat) is still
  on the table — discuss before designing
- Brand voice: honest, warm, direct. Like a coach who actually
  cares, not a drill sergeant.

  