// OwnerDashboard.jsx — Provider home: KPIs, requests, fleet snapshot

function OwnerDashboard({ onOpenRequest }) {
  return (
    <>
      <StatusBar />
      <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Sahel Heavy Equipment</div>
          <h1 className="tds-h1" style={{ marginTop: 2 }}>Yard overview</h1>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <I.Bell style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
          <span style={{ position: "absolute", top: 6, right: 8, width: 8, height: 8, background: "var(--forge)", borderRadius: 999, border: "2px solid var(--surface)" }}></span>
        </div>
      </div>

      <div className="scroll" style={{ padding: "8px 20px 16px" }}>
        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Earnings (mo)", value: "₦4.2M", delta: "+18%", deltaPos: true },
            { label: "Utilization", value: "72%", delta: "+4 pp", deltaPos: true },
            { label: "Open requests", value: "5", delta: "3 new", deltaPos: null },
            { label: "Avg. response", value: "42m", delta: "−8m", deltaPos: true },
          ].map((k,i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{k.value}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: k.deltaPos === true ? "var(--clear-soft)" : k.deltaPos === false ? "var(--coral)" : "var(--text-secondary)", marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Earnings sparkline */}
        <div style={{ marginTop: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Last 30 days</span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>₦4.2M / ₦5.5M target</span>
          </div>
          <svg viewBox="0 0 320 60" style={{ width: "100%", height: 60, display: "block" }}>
            <defs>
              <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF8C24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF8C24" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,40 L20,38 L40,42 L60,30 L80,32 L100,22 L120,28 L140,18 L160,24 L180,14 L200,20 L220,12 L240,16 L260,8 L280,14 L300,6 L320,10 L320,60 L0,60 Z" fill="url(#spark)" />
            <path d="M0,40 L20,38 L40,42 L60,30 L80,32 L100,22 L120,28 L140,18 L160,24 L180,14 L200,20 L220,12 L240,16 L260,8 L280,14 L300,6 L320,10" fill="none" stroke="#FF8C24" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Pending requests */}
        <div style={{ marginTop: 20, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="tds-h3">Pending requests <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(3)</span></h2>
          <span style={{ fontSize: 12, color: "var(--forge)", fontWeight: 500 }}>View all</span>
        </div>

        {[
          { name: "Adunni C.", asset: "Liebherr LTM 1200", dates: "May 10 – 13", amt: "₦180,000", time: "2m ago", new: true },
          { name: "Tunde O.", asset: "Mantis crawler", dates: "May 22", amt: "₦65,000", time: "1h ago", new: true },
          { name: "Ifeoma R.", asset: "Flatbed 30t", dates: "May 18 – 19", amt: "₦24,000", time: "3h ago", new: false },
        ].map((r,i) => (
          <div key={i} onClick={onOpenRequest} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderLeft: r.new ? "3px solid var(--forge)" : "1px solid var(--border)",
            paddingLeft: r.new ? 13 : 16,
            borderRadius: 8, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)" }}>{r.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{r.asset}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
              <span style={{ color: "var(--text-tertiary)" }}>{r.dates}</span>
              <span style={{ color: "var(--forge-light)" }}>{r.amt}</span>
            </div>
          </div>
        ))}

        {/* Fleet */}
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <h2 className="tds-h3">Your fleet <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(8)</span></h2>
        </div>
        {[
          { name: "Liebherr LTM 1200-5.1", status: "active", booked: "Out: May 10 – 13" },
          { name: "Mantis 6010 crawler", status: "available", booked: "Available" },
          { name: "Flatbed 30t · LSR-441-XA", status: "maintenance", booked: "Service until May 9" },
        ].map((f,i) => {
          const dot = { active: "var(--forge)", available: "var(--clear)", maintenance: "var(--amber)" }[f.status];
          return (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flexShrink: 0 }}></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{f.booked}</div>
              </div>
              <I.ChevR style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
            </div>
          );
        })}
      </div>
    </>
  );
}

window.OwnerDashboard = OwnerDashboard;
