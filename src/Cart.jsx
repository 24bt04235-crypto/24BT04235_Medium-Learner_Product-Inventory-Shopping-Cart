import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { rupee, getProducts } from "./inventory";
import { getOrders } from "./auth";
import { TrackingModal, fmt } from "./Tracking";

export default function Cart({ cart, total, onQty, onRemove, onCheckout }) {
  const [name, setName] = useState("");

  if (cart.length === 0)
    return (
      <div className="hero">
        <h2>Your cart is empty 🛒</h2>
        <Link to="/products"><button className="primary">Browse Products</button></Link>
      </div>
    );

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.map((i) => (
        <div className="row" key={i.id}>
          <span className="item"><img className="cart-img" src={i.image} alt={i.name} /> <b>{i.name}</b> <span className="muted">{rupee(i.price)}</span></span>
          <span className="qty">
            <button className="ghost" disabled={i.qty <= 1} onClick={() => onQty(i.id, -1)}>−</button>
            <b>{i.qty}</b>
            <button className="ghost" disabled={i.qty >= i.quantity} onClick={() => onQty(i.id, 1)}>+</button>
            <b className="sub">{rupee(i.price * i.qty)}</b>
            <button className="danger" onClick={() => onRemove(i.id)}>Remove</button>
          </span>
        </div>
      ))}
      <h3 className="total">Total: {rupee(total)}</h3>
      <form className="checkout" onSubmit={(e) => { e.preventDefault(); onCheckout(name); setName(""); }}>
        <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="primary" type="submit">Place Order</button>
      </form>
    </div>
  );
}

// ---------- Customer: order history + order details ----------
const STAGE_NAMES = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];

export function MyOrders({ user }) {
  const [tick, setTick] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [expanded, setExpanded] = useState({}); // orders whose full product list is open
  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  // Refresh every 5s and when the admin changes something in another tab.
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    const timer = setInterval(refresh, 5000);
    window.addEventListener("storage", refresh);
    return () => { clearInterval(timer); window.removeEventListener("storage", refresh); };
  }, []);

  const orders = useMemo(() => getOrders().filter((o) => o.email === user.email).reverse(), [tick, user.email]);
  const images = useMemo(() => Object.fromEntries(getProducts().map((p) => [p.name, p.image])), []);
  const openOrder = orders.find((o) => o.id === openId);

  if (orders.length === 0)
    return (
      <div className="hero">
        <h2>You have no orders yet 📦</h2>
        <Link to="/products"><button className="primary">Start Shopping</button></Link>
      </div>
    );

  return (
    <div>
      <h2>My Orders <span className="muted">({orders.length})</span></h2>
      {orders.map((o) => (
        <div className="order-card" key={o.id}>
          <div className="oc-head">
            <div><small>ORDER PLACED</small><b>{fmt(o.date)}</b></div>
            <div><small>TOTAL</small><b>{rupee(o.total)}</b></div>
            <div><small>ORDER ID</small><b>{o.id}</b></div>
            <div className="oc-right"><span className={`status s${o.status ?? 0}`}>{STAGE_NAMES[o.status ?? 0]}</span></div>
          </div>
          <div className="oc-body">
            <div className="oc-thumbs">
              {o.items.slice(0, 4).map((i) => (
                <div className="thumb" key={i.name} title={`${i.name} × ${i.qty}`}>
                  {images[i.name] && <img src={images[i.name]} alt={i.name} />}
                  <span className="qty">×{i.qty}</span>
                </div>
              ))}
              {o.items.length > 4 && (
                <button className="thumb more" onClick={() => toggle(o.id)} title="Show all products">+{o.items.length - 4}</button>
              )}
            </div>
            <div className="oc-summary">
              <b>{o.items.reduce((s, i) => s + i.qty, 0)} items</b>
              <span className="muted">
                {o.items.slice(0, 3).map((i) => i.name).join(", ")}
                {o.items.length > 3 && ` and ${o.items.length - 3} more`}
              </span>
              {o.items.length > 4 && (
                <button className="linkish" onClick={() => toggle(o.id)}>
                  {expanded[o.id] ? "▴ Hide all products" : `▾ Show all ${o.items.length} products`}
                </button>
              )}
              <div className="oc-bar"><div style={{ width: `${((o.status ?? 0) / 4) * 100}%` }} /></div>
            </div>
            <button className="primary" onClick={() => setOpenId(o.id)}>🚚 View details &amp; tracking</button>
          </div>
          {expanded[o.id] && (
            <div className="oc-all">
              {o.items.map((i) => (
                <div className="all-item" key={i.name}>
                  {images[i.name] && <img src={images[i.name]} alt={i.name} />}
                  <div>
                    <b>{i.name}</b>
                    <span className="muted">{rupee(i.price)} × {i.qty}</span>
                  </div>
                  <b>{rupee(i.price * i.qty)}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {openOrder && <TrackingModal order={openOrder} onClose={() => setOpenId(null)} />}
    </div>
  );
}
