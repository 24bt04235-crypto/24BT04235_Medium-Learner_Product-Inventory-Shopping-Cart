import { useState } from "react";
import { Link } from "react-router-dom";
import { rupee } from "./inventory";

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