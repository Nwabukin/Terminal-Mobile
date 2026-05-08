// BookingsScreen.jsx — renter bookings list

const { useState: useStateBK } = React;

function BookingsScreen() {
  const [filter, setFilter] = useStateBK("all");

  const bookings = [
    { id: 1, title: "Liebherr LTM 1200 · 4 days", dates: "May 10 – May 13", amt: "₦180,000", status: "active", payment: "paid" },
    { id: 2, title: "Flatbed truck 30t · 2 days", dates: "May 18 – May 19", amt: "₦24,000", status: "pending", payment: "unpaid" },
    { id: 3, title: "Mantis crawler crane · 1 day", dates: "May 22", amt: "₦65,000", status: "confirmed", payment: "unpaid" },
    { id: 4, title: "Cold storage warehouse · 1 mo", dates: "Apr 1 – May 1", amt: "₦450,000", status: "completed", payment: "paid" },
    { id: 5, title: "Container yard 12 acres", dates: "Mar 15 – Apr 15", amt: "₦1,800,000", status: "cancelled", payment: "unpaid" },
  ];

  const visible = filter === "all" ? bookings :
    filter === "past" ? bookings.filter(b => ["completed","cancelled","declined"].includes(b.status)) :
    bookings.filter(b => b.status === filter);

  const badgeFor = (s) => {
    const map = { active: ["success","ACTIVE"], pending: ["warning","PENDING"], confirmed: ["info","CONFIRMED"], completed: ["success","COMPLETED"], cancelled: ["neutral","CANCELLED"], declined: ["danger","DECLINED"] };
    return map[s];
  };

  return (
    <>
      <StatusBar />
      <div style={{ padding: "12px 20px 8px", flexShrink: 0 }}>
        <h1 className="tds-h1">My bookings</h1>
      </div>
      <div style={{ padding: "8px 20px 12px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
        {["all","active","pending","past"].map(f => (
          <span key={f} className={"chip" + (filter === f ? " active" : "")} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</span>
        ))}
      </div>

      <div className="scroll" style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map(b => {
          const [variant, label] = badgeFor(b.status);
          const isActive = b.status === "active";
          const isMuted = ["completed","cancelled"].includes(b.status);
          return (
            <div key={b.id} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: isActive ? "3px solid var(--clear)" : "1px solid var(--border)",
              paddingLeft: isActive ? 13 : 16,
              borderRadius: 8, padding: "14px 16px",
              opacity: isMuted ? 0.6 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, textDecoration: b.status === "cancelled" ? "line-through" : "none" }}>{b.title}</span>
                <span className={"badge " + variant}>{label}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>{b.dates}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{b.amt}</span>
              </div>
              {b.payment === "unpaid" && b.status !== "cancelled" && (
                <div style={{ fontSize: 11, color: "var(--amber)", fontFamily: "var(--font-body)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--amber)" }}></span>Awaiting payment
                </div>
              )}
              {b.payment === "paid" && (
                <div style={{ fontSize: 11, color: "var(--clear-soft)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <I.Check style={{ width: 12, height: 12 }} />
                  <span style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>Paid</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

window.BookingsScreen = BookingsScreen;
