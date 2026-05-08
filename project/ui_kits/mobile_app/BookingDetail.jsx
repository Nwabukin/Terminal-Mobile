// BookingDetail.jsx — Owner-side request review screen w/ accept/decline

function BookingDetail({ onBack }) {
  return (
    <>
      <StatusBar />
      {/* Header */}
      <div style={{ height: 56, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 12px", gap: 12, flexShrink: 0 }}>
        <I.ChevL onClick={onBack} style={{ width: 22, height: 22, color: "var(--text-primary)", cursor: "pointer" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Request · BK-1041</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Adunni Construction Ltd</div>
        </div>
        <span className="badge warning">PENDING</span>
      </div>

      <div className="scroll" style={{ padding: "16px 20px 16px" }}>
        {/* Asset summary */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", gap: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: 6, background: "linear-gradient(135deg,#2a2a36,#1a1a22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A" }}>
            <I.Crane style={{ width: 32, height: 32 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Liebherr LTM 1200-5.1</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>200t · all-terrain · operator included</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>EQ-2019-LG · Surulere yard</div>
          </div>
        </div>

        {/* Schedule */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Schedule</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Start</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>May 10, 2026 · 06:00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>End</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>May 13, 2026 · 18:00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Duration</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>4 days · daily rate</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Site</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right" }}>Apapa Terminal · Gate 4</span>
          </div>
        </div>

        {/* Note */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Note from renter</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
          “Single 180t lift, container repositioning. Need certified rigging plan attached. Site access through gate 4 only — escort arranged on our side.”
        </div>

        {/* Money */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Money</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          {[
            { l: "Daily rate × 4", v: "₦180,000" },
            { l: "Mobilization", v: "₦15,000" },
            { l: "Platform fee (8%)", v: "−₦15,600", muted: true },
          ].map((r,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 13, color: r.muted ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{r.l}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: r.muted ? "var(--text-tertiary)" : "var(--text-primary)" }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 4, borderTop: "1px solid var(--border-active)" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Your payout</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "var(--forge)" }}>₦179,400</span>
          </div>
        </div>

        {/* Renter */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Renter</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--signal-dim)", color: "var(--signal-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>AC</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Adunni Construction Ltd</span>
              <I.Shield style={{ width: 14, height: 14, color: "var(--clear-soft)" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>23 bookings · 4.9★ · CAC verified</div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "12px 16px 14px", display: "flex", gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>Decline</button>
        <button className="btn btn-primary" style={{ flex: 1.6 }}>Accept request</button>
      </div>
    </>
  );
}

window.BookingDetail = BookingDetail;
