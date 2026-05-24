export default function Home() {
  return (
    <>
      <div className="screen-header">
        <p className="label">Empathy Clock</p>
        <h1 className="screen-header-title">Your time,<br />clearly.</h1>
      </div>

      <div className="screen-body">
        <div className="placeholder-block" style={{ minHeight: 220 }}>
          <p className="label">Visual Time Decay</p>
          <p className="placeholder-title">Phase 2</p>
          <p className="text-sm text-2" style={{ marginTop: 4 }}>
            Shrinking color blocks — no numbers.
          </p>
        </div>

        <div className="placeholder-block" style={{ minHeight: 110 }}>
          <p className="label">Doomscroll Stopwatch</p>
          <p className="placeholder-title">Phase 2</p>
        </div>

        <div className="placeholder-block" style={{ minHeight: 110 }}>
          <p className="label">World Clock</p>
          <p className="placeholder-title">Phase 2</p>
        </div>

        <div className="placeholder-block" style={{ minHeight: 110 }}>
          <p className="label">Alarms</p>
          <p className="placeholder-title">Phase 3</p>
        </div>
      </div>
    </>
  )
}
