// MapScreen.jsx — Renter home, full-bleed map with floating search + peek sheet

const { useState: useStateMap } = React;

function MapScreen({ onOpenListing }) {
  const [selectedPin, setSelectedPin] = useStateMap(2);

  const pins = [
    { id: 0, type: "equipment", price: "₦45k/d", x: 22, y: 38 },
    { id: 1, type: "vehicle",   price: "₦12k/d", x: 48, y: 24 },
    { id: 2, type: "equipment", price: "₦78k/d", x: 60, y: 50 },
    { id: 3, type: "warehouse", price: "₦80k/mo", x: 78, y: 42 },
    { id: 4, type: "terminal",  price: "500 TEU", x: 35, y: 64 },
    { id: 5, type: "vehicle",   price: "₦18k/d", x: 70, y: 70 },
  ];

  return (
    <>
      <StatusBar />

      {/* Map area (flex:1) */}
      <div className="mapmock" style={{ position: "relative" }}>
        {/* Floating search */}
        <div style={{ position: "absolute", top: 12, left: 16, right: 16, zIndex: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="input" style={{ background: "rgba(19,19,24,0.92)", backdropFilter: "blur(8px)", borderRadius: 12, flex: 1, height: 44, border: "1px solid var(--border)" }}>
              <I.Search style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
              <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Search Lagos…</span>
            </div>
            <div style={{ width: 44, height: 44, background: "rgba(19,19,24,0.92)", border: "1px solid var(--border)", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--forge)" }}>
              <I.User style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            <span className="chip">Type <I.ChevD /></span>
            <span className="chip">50 km</span>
            <span className="chip active"><span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }}></span>Available</span>
          </div>
        </div>

        {/* User location */}
        <div style={{ position: "absolute", left: "50%", top: "55%", transform: "translate(-50%,-50%)" }}>
          <div className="user-pin"></div>
        </div>

        {/* Pins */}
        {pins.map(p => {
          const Ic = ({ equipment: I.Crane, vehicle: I.Truck, warehouse: I.Building, terminal: I.Container })[p.type] || I.Crane;
          return (
            <div key={p.id}
              onClick={() => setSelectedPin(p.id)}
              style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-100%)", cursor: "pointer" }}>
              <div className={"pin-bubble" + (selectedPin === p.id ? " selected" : "")}>
                <Ic />
                <span>{p.price}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Peek sheet */}
      <div className="sheet" style={{ position: "static", flexShrink: 0 }}>
        <div className="handle"></div>
        <div className="body">
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <div style={{ width: 84, height: 84, borderRadius: 6, background: "linear-gradient(135deg,#2a2a36,#131318)", display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A", flexShrink: 0 }}>
              <I.Crane style={{ width: 36, height: 36 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Liebherr LTM 1200-5.1</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--clear-soft)" }}></span>
                  Lagos Island · <span style={{ fontFamily: "var(--font-mono)" }}>3.4 km</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--forge)" }}>₦45,000<span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-body)" }}> /day</span></span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}>Details</button>
            <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={onOpenListing}>Request booking</button>
          </div>
        </div>
      </div>
    </>
  );
}

window.MapScreen = MapScreen;
