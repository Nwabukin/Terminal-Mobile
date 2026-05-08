// ThreadScreen.jsx — chat between renter and owner

function ThreadScreen({ onBack }) {
  const messages = [
    { id: 1, mine: false, text: "Yes, the LTM 1200 is available May 10–13. Where do you need it?", time: "14:32" },
    { id: 2, mine: true, text: "Apapa container terminal, gate 4. Single lift, ~180 t.", time: "14:35" },
    { id: 3, mine: false, text: "Confirmed. We'll mobilize from Surulere yard, ETA 06:00 May 10.", time: "14:38" },
    { id: 4, mine: false, text: "Operator details and rigging plan attached on confirmation.", time: "14:38" },
    { id: 5, mine: true, text: "Sending the request now.", time: "14:40" },
  ];

  return (
    <>
      <StatusBar />
      {/* Header */}
      <div style={{ height: 56, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 12px", gap: 10, flexShrink: 0 }}>
        <I.ChevL onClick={onBack} style={{ width: 22, height: 22, color: "var(--text-primary)", cursor: "pointer" }} />
        <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--forge-dim)", color: "var(--forge-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>OA</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Olumide Adebayo</span>
            <I.Shield style={{ width: 12, height: 12, color: "var(--clear-soft)" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>typically replies in &lt;1h</div>
        </div>
      </div>

      {/* Booking banner */}
      <div style={{ margin: 12, padding: "10px 12px", background: "var(--signal-dim)", border: "1px solid #3B82F644", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <I.Calendar style={{ width: 16, height: 16, color: "var(--signal-soft)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--signal-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Pending request</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>May 10 – May 13 · ₦180,000</div>
        </div>
        <I.ChevR style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
      </div>

      {/* Messages */}
      <div className="scroll" style={{ padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", margin: "8px 0" }}>Today · 14:30</div>
        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%",
              padding: "8px 12px",
              borderRadius: m.mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.mine ? "var(--forge-dim)" : "var(--surface-elevated)",
              color: m.mine ? "var(--forge-light)" : "var(--text-primary)",
              fontSize: 14, lineHeight: 1.4,
            }}>
              {m.text}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m.mine ? "rgba(255,140,36,0.6)" : "var(--text-tertiary)", marginTop: 4, textAlign: "right" }}>
                {m.time} {m.mine && "✓✓"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "10px 12px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <div className="input" style={{ flex: 1 }}>
          <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Message…</span>
        </div>
        <button className="btn btn-primary btn-icon" style={{ width: 44, height: 44 }}>
          <I.Send style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </>
  );
}

window.ThreadScreen = ThreadScreen;
