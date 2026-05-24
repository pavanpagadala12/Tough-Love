# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Tough Love

A "Carrot and Stick" productivity PWA. Beautiful by default, brutal by
choice.

## What it is

Tough Love is a clock app for people who want to be honest with
themselves about their time. The free tier is a fully-functional
empathy clock: a focus timer that shows time as shrinking color blocks
instead of numbers, an alarm that wakes you in your lightest sleep
phase, a reverse alarm that grayscales your screen at bedtime to
break the doomscroll, a doomscroll stopwatch that times your
TikTok/Instagram sessions, and a world clock with availability rings
for international contacts.

On top of that foundation, the user can opt into soft accountability
features when they set a goal: a Letter to Future You (deleted unread
if you fail), a Reality Check wallpaper (text-only facts about your
behavior), and Witness Mode (one nominated friend gets notified if
you break a commitment). Every punishment is consent-gated twice
(once at install, once per goal) and every punishment has a
press-and-hold Escape Hatch.

## Who it's for

People who've tried Forest, Opal, or Alarmy and bounced off because
the free tier was a demo, not a product — and who want their
productivity tools to be honest instead of cute.

## What v1 ships (the only thing being built right now)

1. The Empathy Clock — timer, alarm, reverse alarm, doomscroll
   stopwatch, world clock
2. Carrots — Care Package, Time Bank, streak tracking, Streak Insurance
3. Sticks — Letter to Future You, Reality Check wallpaper, Witness Mode
4. Five-screen onboarding (Welcome → Consent → Permissions →
   Safety Net → First Win)
5. Stake Pyramid visual for setting goals (willpower / reputation /
   future: money)

## What is NOT in v1 (deferred to v2)

Wallpaper Hijack with anti-cheat, Dyslexic Keyboard, Spoiler Penalty,
geofencing, sunset auto-sync, Crash Override, money stakes, donate-
to-hated-charity, the Pact (two-user mode). All of these are real
ideas — they're just not the v1 fight.

## Tech stack

React + Vite + Supabase + Vercel. PWA from day one. Zero monthly cost.
Android-native is a v2 conversation, not v1.

## Philosophy

The brand is honest, warm, and direct — like a coach who actually
cares, not a drill sergeant. The aesthetic is calm; the consequences
are real. This contrast is the product.
