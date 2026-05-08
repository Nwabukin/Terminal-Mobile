// RequestBooking.jsx — 3-step booking request sheet (full)

const { useState: useStateRB } = React;

function RequestBooking({ onClose, onSent }) {
  const [step, setStep] = useStateRB(0);
  const [duration, setDuration] = useStateRB("daily");
  const days = 4;
  const totalDaily = "₦180,000";

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <>
          <h2 className="tds-h1" style={{ marginBottom: 4 }}>Pick your dates</h2>
          <p className="tds-body-2" style={{ marginBottom: 20 }}>Selected dates determine availability.</p>
          {/* Calendar mock */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>May 2026</span>
              <div style={{ display: "flex", gap: 8 }}>
                <I.ChevL style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
                <I.ChevR style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginBottom: 6 }}>
              {["S","M","T","W","T","F","S"].map((d,i) => <span key={i}>{d}</span>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {Array.from({ length: 35 }).map((_,i) => {
                const day = i - 4; // start padding
                const inRange = day >= 10 && day <= 13;
                const isStart = day === 10, isEnd = day === 13;
                const past = day > 0 && day < 8;
                if (day < 1 || day > 31) return <span key={i}></span>;
                return (
                  <div key={i} style={{
                    height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: past ? "var(--text-tertiary)" : (inRange ? "#fff" : "var(--text-primary)"),
                    background: inRange ? "var(--forge)" : "transparent",
                    borderRadius: isStart ? "4px 0 0 4px" : isEnd ? "0 4px 4px 0" : (inRange ? 0 : 4),
                    textDecoration: past ? "line-through" : "none",
                    opacity: past ? 0.5 : 1,
                  }}>{day}</div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--surface-elevated)", borderRadius: 4, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Selected</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>May 10 – May 13 · 4 days</span>
          </div>
        </>
      );
      case 1: return (
        <>
          <h2 className="tds-h1" style={{ marginBottom: 4 }}>Duration</h2>
          <p className="tds-body-2" style={{ marginBottom: 20 }}>Pick the rate that fits your timeline.</p>
          {[
            { id: "daily",   label: "Daily",   price: "₦45,000", total: "₦180,000 (4 days)" },
            { id: "weekly",  label: "Weekly",  price: "₦300,000", total: "₦300,000 (1 wk min)" },
            { id: "monthly", label: "Monthly", price: "₦1,200,000", total: "Not available for 4 days" },
          ].map(o => (
            <div key={o.id} onClick={() => o.id !== "monthly" && setDuration(o.id)}
              style={{
                background: duration === o.id ? "var(--forge-dim)" : "var(--surface)",
                border: duration === o.id ? "1px solid var(--forge)" : "1px solid var(--border)",
                borderRadius: 8, padding: 16, marginBottom: 10, cursor: "pointer",
                opacity: o.id === "monthly" ? 0.4 : 1,
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{o.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: duration === o.id ? "var(--forge-light)" : "var(--text-primary)" }}>{o.price}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{o.total}</div>
            </div>
          ))}
        </>
      );
      case 2: return (
        <>
          <h2 className="tds-h1" style={{ marginBottom: 4 }}>Review &amp; send</h2>
          <p className="tds-body-2" style={{ marginBottom: 20 }}>Owner reviews your request before payment.</p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: 6, background: "linear-gradient(135deg,#2a2a36,#1a1a22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A" }}>
                <I.Crane style={{ width: 32, height: 32 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Liebherr LTM 1200-5.1</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>May 10 – May 13 · 4 days · daily</div>
              </div>
            </div>
            <hr className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--forge)" }}>{totalDaily}</span>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Note to owner (optional)</label>
            <div className="input" style={{ height: 80, alignItems: "flex-start", paddingTop: 12 }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Need delivery to Apapa yard…</span>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: "var(--surface)", borderRadius: "12px 12px 0 0", maxHeight: "92%", display: "flex", flexDirection: "column", boxShadow: "0 -8px 32px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "8px 0 0" }}>
          <div style={{ width: 36, height: 4, background: "var(--border-active)", borderRadius: 999, margin: "0 auto 12px" }}></div>
        </div>
        <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Step {step + 1} of 3</span>
          <I.Close onClick={onClose} style={{ width: 22, height: 22, color: "var(--text-secondary)", cursor: "pointer" }} />
        </div>
        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <div style={{ height: 2, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${((step+1)/3)*100}%`, height: "100%", background: "var(--forge)" }}></div>
          </div>
        </div>
        <div className="scroll" style={{ padding: "0 20px 16px" }}>
          {renderStep()}
        </div>
        <div style={{ padding: "12px 16px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 2
            ? <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(step + 1)}>Continue</button>
            : <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={onSent}>Send request</button>}
        </div>
      </div>
    </div>
  );
}

window.RequestBooking = RequestBooking;
