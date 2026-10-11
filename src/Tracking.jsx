import { rupee } from "./inventory";

export const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" });

// ---------- Order tracking window (dummy shipping data) ----------
const STAGES = [
  { icon: "📝", label: "Order placed", where: "Order confirmed and payment received" },
  { icon: "📦", label: "Packed", where: "Packed at CartNova Fulfilment Centre, Ahmedabad" },
  { icon: "🚚", label: "Shipped", where: "In transit – Mumbai Sorting Hub" },
  { icon: "🛵", label: "Out for delivery", where: "At the local delivery hub near the customer" },
  { icon: "🏠", label: "Delivered", where: "Delivered to the customer" },
];

const WAREHOUSE = { name: "CartNova Fulfilment Centre", lines: ["Plot 21, GIDC Industrial Estate", "Sanand, Ahmedabad, Gujarat – 382110"], phone: "+91 79 4000 1234" };

// Dummy delivery addresses – one is picked for each customer from their email.
const ADDRESSES = [
  ["Flat 402, Sunrise Residency", "MG Road, Bengaluru, Karnataka – 560001"],
  ["12/B, Lotus Apartments", "Andheri West, Mumbai, Maharashtra – 400053"],
  ["House 7, Sector 15", "Gurugram, Haryana – 122001"],
  ["34, Green Park Colony", "Anna Nagar, Chennai, Tamil Nadu – 600040"],
  ["Plot 9, Jubilee Hills", "Hyderabad, Telangana – 500033"],
];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// canEdit = true for the admin (can change the delivery stage); false for customers (view only).
export function TrackingModal({ order, onClose, onStatus, canEdit = false }) {
  const status = order.status ?? 0;
  const times = order.stageTimes || { 0: order.date };
  const address = ADDRESSES[hash(order.email) % ADDRESSES.length];
  const phone = "+91 9" + String(hash(order.email)).padStart(9, "0").slice(0, 9);
  const trackingNo = "CNV" + String(hash(order.id)).padStart(10, "0").slice(0, 10);
  const eta = new Date(new Date(order.date).getTime() + 5 * 86400000).toLocaleDateString("en-IN", { dateStyle: "medium" });

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>✕</button>
        <h2>🚚 Shipment {order.id}</h2>
        <p className="muted">
          Tracking no. <b>{trackingNo}</b> · Carrier: CartNova Express ·{" "}
          {status === 4 ? <b className="ok">Delivered ✔</b> : <>Expected by <b>{eta}</b></>}
        </p>

        {/* progress tracker – click a step to jump to it */}
        <div className="steps">
          <div className="steps-line"><div className="steps-fill" style={{ width: `${(status / (STAGES.length - 1)) * 100}%` }} /></div>
          {STAGES.map((s, i) => (
            <div key={s.label} className={`step ${i < status ? "done" : ""} ${i === status ? "current" : ""}`} onClick={() => canEdit && onStatus(i)} style={canEdit ? undefined : { cursor: "default" }}>
              <div className="dot">{i <= status ? s.icon : i + 1}</div>
              <b>{s.label}</b>
              <small>{times[i] ? fmt(times[i]) : "Pending"}</small>
            </div>
          ))}
        </div>

        <div className="now"><b>Current status:</b> {STAGES[status].where}</div>

        <div className="addr-grid">
          <div className="addr from"><h4>📤 Shipping from</h4><b>{WAREHOUSE.name}</b>{WAREHOUSE.lines.map((l) => <p key={l}>{l}</p>)}<p>{WAREHOUSE.phone}</p></div>
          <div className="addr to"><h4>📍 Delivery address</h4><b>{order.name}</b>{address.map((l) => <p key={l}>{l}</p>)}<p>{phone}</p><p className="muted">{order.email}</p></div>
          <div className="addr track"><h4>🧾 Order summary</h4>
            {order.items.map((i) => <p key={i.name}>{i.name} ×{i.qty} <span className="muted">{rupee(i.price * i.qty)}</span></p>)}
            <b>Total: {rupee(order.total)}</b>
          </div>
        </div>

        {canEdit ? (
          <div className="modal-actions">
            <button className="ghost" disabled={status === 0} onClick={() => onStatus(status - 1)}>◀ Previous stage</button>
            <button className="primary" disabled={status === 4} onClick={() => onStatus(status + 1)}>Next stage ▶</button>
          </div>
        ) : (
          <p className="muted">This page updates automatically as your order moves.</p>
        )}
      </div>
    </div>
  );
}
