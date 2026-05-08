// ListingDetail.jsx — full listing detail w/ hero photo, price block, specs, sticky CTA

function ListingDetail({ onBack, onBook, onMessage }) {
  return (
    <>
      <StatusBar />
      <div className="scroll" style={{ paddingBottom: 100 }}>
        {/* Hero */}
        <div style={{ position: "relative", aspectRatio: "16/10", background: "linear-gradient(135deg,#2a2a36 30%,#3a2820 70%,#1a1a22)" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A", opacity: 0.5 }}>
            <I.Crane style={{ width: 80, height: 80 }} />
          </div>
          <div onClick={onBack} style={{ position: "absolute", top: 12, left: 16, width: 40, height: 40, borderRadius: 999, background: "rgba(12,12,15,0.6)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
            <I.ChevL style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ position: "absolute", top: 12, left: 64 }}>
            <span className="chip active" style={{ background: "var(--forge-dim)", color: "var(--forge-light)", borderColor: "var(--forge)" }}>Equipment</span>
          </div>
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
            {[0,1,2,3].map(i => (
              <span key={i} style={{ width: i===0 ? 16 : 6, height: 6, borderRadius: 999, background: i===0 ? "#fff" : "rgba(255,255,255,0.4)" }}></span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 0" }}>
          <h1 className="tds-display-3" style={{ margin: 0 }}>LIEBHERR LTM 1200-5.1</h1>
          <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>3.4 km</span>
            <span style={{ color: "var(--text-tertiary)" }}>·</span>
            <span>Lagos Island</span>
            <span style={{ color: "var(--text-tertiary)" }}>·</span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--clear-soft)" }}></span>
            <span>Available</span>
          </div>

          {/* Price block */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Daily</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--forge)" }}>₦45,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Weekly</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>₦300,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Monthly</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>₦1,200,000</span>
            </div>
          </div>

          {/* About */}
          <h3 className="tds-h3" style={{ marginTop: 24, marginBottom: 8, color: "var(--text-tertiary)" }}>About</h3>
          <p className="tds-body-1" style={{ color: "var(--text-primary)" }}>
            All-terrain mobile crane, 200t capacity, 50 m main boom, certified operator included. Self-contained transport — no escort needed within Lagos State.
          </p>

          {/* Specs */}
          <h3 className="tds-h3" style={{ marginTop: 24, marginBottom: 12, color: "var(--text-tertiary)" }}>Specifications</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontFamily: "var(--font-mono)", fontSize: 13 }}>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Capacity</div>200 t</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Boom</div>50 m</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Year</div>2019</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Operator</div>Included</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Hours</div>4,210 h</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Reg.</div>EQ-2019-LG</div>
          </div>

          {/* Owner */}
          <h3 className="tds-h3" style={{ marginTop: 24, marginBottom: 12, color: "var(--text-tertiary)" }}>Owner</h3>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--forge-dim)", color: "var(--forge-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>OA</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Olumide Adebayo</span>
                <I.Shield style={{ width: 14, height: 14, color: "var(--clear-soft)" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Member since 2024 · 47 bookings</div>
            </div>
            <I.ChevR style={{ width: 18, height: 18, color: "var(--text-tertiary)" }} />
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "12px 16px 14px", display: "flex", gap: 10 }}>
        <button className="btn btn-secondary" onClick={onMessage} style={{ flex: 1 }}>
          <I.Message style={{ width: 16, height: 16 }} />Message
        </button>
        <button className="btn btn-primary" onClick={onBook} style={{ flex: 1.6 }}>Request booking</button>
      </div>
    </>
  );
}

window.ListingDetail = ListingDetail;
