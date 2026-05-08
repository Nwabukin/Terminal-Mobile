// Primitives.jsx — shared icons, status bar, tab bar, badges
// Exported to window for use across UI kit screens.

const { useState } = React;

// ─── Tabler-style outline icons (1.5 stroke) ───
const I = {
  Search:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  Map:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v16"/><path d="M15 6v16"/></svg>,
  List:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>,
  Calendar:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4M16 3v4"/></svg>,
  Message: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16v11H8l-4 4V6Z"/></svg>,
  User:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><circle cx="12" cy="12" r="10"/></svg>,
  Building:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21V9l9-5 9 5v12M3 21h18M9 21v-6h6v6M9 12h6"/></svg>,
  Plus:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  ChevR:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  ChevL:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 6l-6 6 6 6"/></svg>,
  ChevD:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  Close:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  Filter:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  Send:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12l18-9-7 18-3-7-8-2Z"/></svg>,
  Shield:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg>,
  Award:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 7 5-3 5 3-2-7"/></svg>,
  Camera:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>,
  Check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5 9-11"/></svg>,
  Truck:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/><path d="M2 17h2M6 17h12M20 17h2M2 17v-5h6l2-3h6v8M2 12h6"/></svg>,
  Crane:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21h18M5 21V8h14M19 8V4l-9 4M5 8l-2-2M9 21v-6h4v6"/></svg>,
  Container:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="14" width="8" height="6"/><rect x="13" y="14" width="8" height="6"/><rect x="6" y="8" width="8" height="6"/><rect x="10" y="2" width="8" height="6"/></svg>,
  Fence:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21V7M21 21V7M3 7h18M3 11h18M3 15h18M3 19h18M3 7l3-3h12l3 3"/></svg>,
  Pin:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Bell:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  Edit:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="M14 5l4 4"/></svg>,
  Settings:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  Logout:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 12h12M17 8l4 4-4 4M14 4H5v16h9"/></svg>,
};

// ─── Status bar (mock) ───
function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="right">
        <svg viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="0.5" fill="currentColor"/><rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/><rect x="10" y="2" width="3" height="10" rx="0.5" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor"/></svg>
        <svg viewBox="0 0 16 12" fill="none"><path d="M8 4c2 0 3.8.8 5.2 2L14.4 4.8C12.6 3 10.4 2 8 2S3.4 3 1.6 4.8L2.8 6C4.2 4.8 6 4 8 4Z" fill="currentColor"/><path d="M8 7.5c1.2 0 2.3.4 3.1 1.2L12.3 7.5C11.1 6.4 9.6 5.7 8 5.7s-3.1.7-4.3 1.8L4.9 8.7C5.7 7.9 6.8 7.5 8 7.5Z" fill="currentColor"/><circle cx="8" cy="10.5" r="1.2" fill="currentColor"/></svg>
        <svg viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" fill="none"/><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/><path d="M24 4v4c.7-.3 1.3-1 1.3-2S24.7 4.3 24 4Z" fill="currentColor" fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

// ─── Tab bar — renter mode default ───
function TabBar({ active = "search", onChange = () => {}, role = "renter" }) {
  const tabs = role === "owner"
    ? [
        { id: "listings", label: "Listings", icon: I.Building },
        { id: "bookings", label: "Bookings", icon: I.Calendar },
        { id: "messages", label: "Messages", icon: I.Message },
        { id: "profile",  label: "Profile",  icon: I.User },
      ]
    : [
        { id: "search",   label: "Search",   icon: I.Map },
        { id: "bookings", label: "Bookings", icon: I.Calendar },
        { id: "messages", label: "Messages", icon: I.Message },
        { id: "profile",  label: "Profile",  icon: I.User },
      ];
  return (
    <div className="tabbar">
      {tabs.map(t => {
        const Ic = t.icon;
        return (
          <div key={t.id} className={"tab" + (active === t.id ? " active" : "")} onClick={() => onChange(t.id)}>
            <Ic />
            <span className="lab">{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Phone shell ───
function Phone({ label, children }) {
  return (
    <div style={{ position: "relative" }}>
      <div className="phone">{children}</div>
      {label && <div className="phone-label">{label}</div>}
    </div>
  );
}

// ─── Resource type icon resolver ───
const ResourceIcon = ({ type, ...rest }) => {
  const map = { equipment: I.Crane, vehicle: I.Truck, warehouse: I.Building, terminal: I.Container, facility: I.Fence };
  const C = map[type] || I.Building;
  return <C {...rest} />;
};

// ─── Listing card ───
function ListingCard({ type = "equipment", title, sub, price, suffix = "/day", distance, available = true, onTap = () => {} }) {
  const typeMap = { equipment: I.Crane, vehicle: I.Truck, warehouse: I.Building, terminal: I.Container, facility: I.Fence };
  const TypeIc = typeMap[type] || I.Crane;
  return (
    <div className="lcard" onClick={onTap} style={{ cursor: "pointer" }}>
      <div className="photo">
        <TypeIc className="placeholder" style={{ width: 56, height: 56, color: "#52526A", opacity: 0.6 }} />
        <span className="chip-tl">{type}</span>
        {distance && <span className="chip-tr">{distance}</span>}
      </div>
      <div className="body">
        <div className="title">{title}</div>
        <div className="sub">
          <span className="dot" style={{ background: available ? "var(--clear-soft)" : "var(--text-tertiary)" }}></span>
          {sub}
        </div>
        <div className="foot">
          <div><span className="price">{price}</span> <span className="suffix">{suffix}</span></div>
          <button className="btn btn-primary btn-sm">Book</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { I, StatusBar, TabBar, Phone, ResourceIcon, ListingCard });
