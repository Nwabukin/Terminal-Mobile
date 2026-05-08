// app.jsx — Terminal Mobile UI Kit landing page

const { useState } = React;

function PhoneFrame({ children }) {
  return (
    <div className="phone">
      <div className="phone-screen">{children}</div>
    </div>
  );
}

function MapScreenLive() {
  const [showReq, setShowReq] = useState(false);
  return (
    <React.Fragment>
      <MapScreen onOpenListing={() => setShowReq(true)} />
      {showReq && <RequestBooking onClose={() => setShowReq(false)} onSent={() => setShowReq(false)} />}
    </React.Fragment>
  );
}

function ListingDetailLive() {
  const [showReq, setShowReq] = useState(false);
  return (
    <React.Fragment>
      <ListingDetail onBack={() => {}} onBook={() => setShowReq(true)} onMessage={() => {}} />
      {showReq && <RequestBooking onClose={() => setShowReq(false)} onSent={() => setShowReq(false)} />}
    </React.Fragment>
  );
}

function RequestBookingLive() {
  return (
    <React.Fragment>
      <ListingDetail onBack={() => {}} onBook={() => {}} onMessage={() => {}} />
      <RequestBooking onClose={() => {}} onSent={() => {}} />
    </React.Fragment>
  );
}

const ART_W = 410, ART_H = 780;

function ArtPhone({ children }) {
  return (
    <div style={{ width: ART_W, height: ART_H, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0d" }}>
      <PhoneFrame>{children}</PhoneFrame>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas
      title="Terminal · Mobile UI Kit"
      subtitle="React reference implementation of the seven core mobile screens. Drag, reorder, focus."
      bg="var(--abyss)"
    >
      <DCSection id="renter" title="Renter flow" subtitle="Discover, review, request">
        <DCArtboard id="map" label="Map (renter home)" width={ART_W} height={ART_H}>
          <ArtPhone><MapScreenLive /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="listing" label="Listing detail" width={ART_W} height={ART_H}>
          <ArtPhone><ListingDetailLive /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="request" label="Request booking · 3-step sheet" width={ART_W} height={ART_H}>
          <ArtPhone><RequestBookingLive /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="bookings" label="My bookings" width={ART_W} height={ART_H}>
          <ArtPhone><BookingsScreen /></ArtPhone>
        </DCArtboard>
      </DCSection>

      <DCSection id="messaging" title="Messaging" subtitle="Renter and owner threads anchored to a booking">
        <DCArtboard id="thread" label="Message thread" width={ART_W} height={ART_H}>
          <ArtPhone><ThreadScreen onBack={() => {}} /></ArtPhone>
        </DCArtboard>
      </DCSection>

      <DCSection id="owner" title="Owner flow" subtitle="Yard overview and request review">
        <DCArtboard id="owner-dash" label="Owner dashboard" width={ART_W} height={ART_H}>
          <ArtPhone><OwnerDashboard onOpenRequest={() => {}} /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="booking-detail" label="Booking detail (owner)" width={ART_W} height={ART_H}>
          <ArtPhone><BookingDetail onBack={() => {}} /></ArtPhone>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
