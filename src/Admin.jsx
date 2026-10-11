import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, getOrders, getLogins, adminLogout, deleteOrder, deleteLogin, deleteUser, clearData, setOrderStatus } from "./auth";
import { rupee, getProducts, setStock } from "./inventory";

const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" });
const itemsText = (o) => o.items.map((i) => `${i.name} ×${i.qty}`).join(", ");

export default function Admin({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [tick, setTick] = useState(0);
  const [trackId, setTrackId] = useState(null); // order shown in the tracking window
  const navigate = useNavigate();

  // Live refresh: every 5s, and instantly when another tab changes localStorage.
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    const timer = setInterval(refresh, 5000);
    window.addEventListener("storage", refresh);
    return () => { clearInterval(timer); window.removeEventListener("storage", refresh); };
  }, []);

  const { users, orders, logins, inventory } = useMemo(
    () => ({
      users: getUsers(),
      orders: getOrders().slice().reverse(),  // newest first
      logins: getLogins().slice().reverse(),
      inventory: getProducts(),
    }),
    [tick]
  );

  const revenue = orders.reduce((s, o) => s + o.total, 0);

  const customers = users.map((u) => {
    const mine = orders.filter((o) => o.email === u.email);
    return { ...u, orderCount: mine.length, spent: mine.reduce((s, o) => s + o.total, 0) };
  });

  // Merged live feed of logins + orders, newest first.
  const feed = [
    ...logins.map((l) => ({ time: l.time, text: `${l.name} ${l.type === "signup" ? "signed up" : "logged in"}`, sub: l.email, kind: "login" })),
    ...orders.map((o) => ({ time: o.date, text: `${o.name} ordered ${itemsText(o)}`, sub: `${o.id} • ${rupee(o.total)}`, kind: "order" })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const handleLogout = () => { adminLogout(); onLogout(); navigate("/admin-login"); };

  // Ask for confirmation, run the delete, then refresh the data.
  const act = (msg, fn) => { if (window.confirm(msg)) { fn(); setTick((t) => t + 1); } };
  const bump = (id, qty) => { setStock(id, qty); setTick((t) => t + 1); };                 // manual stock change
  const changeStatus = (id, st) => { setOrderStatus(id, st); setTick((t) => t + 1); };      // delivery stage change
  const trackOrder = orders.find((o) => o.id === trackId);

  const clearMsg = {
    logins: "Delete ALL login activity?",
    orders: "Delete ALL orders?",
    customers: "Delete ALL customers along with their orders and login history?",
    inventory: "Reset all stock levels to their defaults?",
    overview: "Delete EVERYTHING (customers, orders, login history) and reset stock?",
  };

  const tabs = [["overview", "📊 Overview"], ["logins", "🔐 Login activity"], ["orders", "🧾 Orders"], ["customers", "👥 Customers"], ["inventory", "📦 Inventory"]];

  return (
    <div className="adm">
      <aside className="adm-side">
        <h3>⚙️ Admin</h3>
        {tabs.map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
        <div className="adm-bottom">
          <Link to="/products">← View store</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <section className="adm-main">
        <h2>{tabs.find((t) => t[0] === tab)[1]} <span className="muted">· auto-refreshes every 5s</span></h2>
        <button className="danger clear-btn" onClick={() => act(clearMsg[tab], () => clearData(tab === "overview" ? "all" : tab))}>
          🗑 {tab === "overview" ? "Delete everything" : tab === "inventory" ? "Reset stock to default" : `Clear all ${tab}`}
        </button>

        {tab === "overview" && (
          <>
            <div className="stats">
              <div><b>{users.length}</b><span>Customers</span></div>
              <div><b>{logins.length}</b><span>Logins</span></div>
              <div><b>{orders.length}</b><span>Orders</span></div>
              <div><b>{rupee(revenue)}</b><span>Revenue</span></div>
            </div>
            <h3>Live activity</h3>
            <ul className="feed">
              {feed.slice(0, 15).map((f, i) => (
                <li key={i} className={f.kind}>
                  <span>{f.kind === "order" ? "🛒" : "🔐"} <b>{f.text}</b><br /><span className="muted">{f.sub}</span></span>
                  <span className="muted">{fmt(f.time)}</span>
                </li>
              ))}
            </ul>
            {feed.length === 0 && <p className="empty">No activity yet.</p>}
          </>
        )}

        {tab === "logins" && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Email</th><th>Event</th><th>Time</th><th></th></tr></thead>
              <tbody>
                {logins.map((l, i) => (
                  <tr key={i}><td>{l.name}</td><td>{l.email}</td><td>{l.type === "signup" ? "Signed up" : "Logged in"}</td><td>{fmt(l.time)}</td>
                    <td><button className="danger" onClick={() => act("Delete this login entry?", () => deleteLogin(l.time, l.email))}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logins.length === 0 && <p className="empty">No logins yet.</p>}
          </div>
        )}

        {tab === "orders" && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>Customer</th><th>What they bought</th><th>Total</th><th>Time</th><th></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.name}<br /><span className="muted">{o.email}</span></td>
                    <td>{itemsText(o)}</td>
                    <td>{rupee(o.total)}</td>
                    <td>{fmt(o.date)}</td>
                    <td className="nowrap">
                      <button className="ghost" onClick={() => setTrackId(o.id)}>🚚 Track</button>{" "}
                      <button className="danger" onClick={() => act(`Delete order ${o.id}?`, () => deleteOrder(o.id))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="empty">No orders yet.</p>}
          </div>
        )}

        {tab === "customers" && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Last login</th><th>Logins</th><th>Orders</th><th>Spent</th><th></th></tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.email}>
                    <td>{c.name}</td><td>{c.email}</td><td>{fmt(c.createdAt)}</td><td>{fmt(c.lastLogin)}</td>
                    <td>{c.loginCount}</td><td>{c.orderCount}</td><td>{rupee(c.spent)}</td>
                    <td><button className="danger" onClick={() => act(`Delete ${c.name} and all their orders and login history?`, () => deleteUser(c.email))}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <p className="empty">No customers yet.</p>}
          </div>
        )}
        {tab === "inventory" && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Product</th><th>Category</th><th>Price</th><th>Stock left (edit)</th></tr></thead>
              <tbody>
                {inventory.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td><td>{p.name}</td><td>{p.category}</td><td>{rupee(p.price)}</td>
                    <td className={p.quantity === 0 ? "out" : ""}>
                      <span className="stepper">
                        <button className="ghost" disabled={p.quantity === 0} onClick={() => bump(p.id, p.quantity - 1)}>−</button>
                        <input key={p.quantity} type="number" min="0" defaultValue={p.quantity}
                          onBlur={(e) => bump(p.id, e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.target.blur()} />
                        <button className="ghost" onClick={() => bump(p.id, p.quantity + 1)}>+</button>
                        <button className="ghost" onClick={() => bump(p.id, p.quantity + 10)}>+10</button>
                      </span>
                      {p.quantity === 0 && " out of stock"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {trackOrder && (
        <TrackingModal order={trackOrder} onClose={() => setTrackId(null)} onStatus={(st) => changeStatus(trackOrder.id, st)} />
      )}
    </div>
  );
}

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

function TrackingModal({ order, onClose, onStatus }) {
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
            <div key={s.label} className={`step ${i < status ? "done" : ""} ${i === status ? "current" : ""}`} onClick={() => onStatus(i)}>
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

        <div className="modal-actions">
          <button className="ghost" disabled={status === 0} onClick={() => onStatus(status - 1)}>◀ Previous stage</button>
          <button className="primary" disabled={status === 4} onClick={() => onStatus(status + 1)}>Next stage ▶</button>
        </div>
      </div>
    </div>
  );
}
