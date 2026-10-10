import { useState, useMemo, useEffect, Component } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Products from "./Products";
import ProductDetails from "./ProductDetails";
import Cart from "./Cart";
import Login, { AdminLogin } from "./Login";
import Admin from "./Admin";
import Home from "./Home";
import { getSession, getAdminSession, logout, addOrder } from "./auth";
import { CATEGORIES, getProducts, reduceStock, loadCart, saveCart, rupee } from "./inventory";
import "./App.css";

// Class component
class Footer extends Component {
  render() {
    const { count, total } = this.props;
    return (
      <footer>
        <span>🛍️ Cart: {count} {count === 1 ? "Item" : "Items"} &nbsp;|&nbsp; <b>Total: {rupee(total)}</b></span>
        {count > 0 && <Link to="/cart"><button className="primary">Checkout</button></Link>}
      </footer>
    );
  }
}

export default function App() {
  const [user, setUser] = useState(getSession());        // customer logged in THIS tab
  const [admin, setAdmin] = useState(getAdminSession()); // admin logged in THIS tab
  const [products, setProducts] = useState(getProducts); // inventory (stock drops after orders)

  // Re-sync when data changes in another tab (deleted customer, new stock levels...).
  useEffect(() => {
    const sync = () => { setUser(getSession()); setAdmin(getAdminSession()); setProducts(getProducts()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin area: separate login + separate layout (no store navbar/footer) */}
        <Route path="/admin-login" element={admin ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={setAdmin} />} />
        <Route path="/admin" element={admin ? <Admin onLogout={() => setAdmin(null)} /> : <Navigate to="/admin-login" replace />} />
        <Route
          path="*"
          element={<Store user={user} setUser={setUser} products={products} refreshProducts={() => setProducts(getProducts())} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// Search bar in the header: sends the query to the Products page via the URL.
function SearchBox() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const submit = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}`);
  };
  return (
    <form className="searchbox" onSubmit={submit}>
      <select value={cat} onChange={(e) => setCat(e.target.value)}>
        <option>All</option>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input placeholder="Search CartNova" value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="submit">🔍</button>
    </form>
  );
}

function Store({ user, setUser, products, refreshProducts }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => loadCart(user?.email, products)); // [{ id, qty }]

  // Load this customer's saved cart when they log in; save it whenever it changes.
  useEffect(() => { setCart(loadCart(user?.email, products)); }, [user?.email]);
  useEffect(() => { if (user) saveCart(user.email, cart); }, [cart]);

  const goLogin = (msg) => navigate("/login", { state: { msg } });
  const stockOf = (id) => products.find((p) => p.id === id)?.quantity ?? 0;

  const addToCart = (p) => {
    if (!user || !getSession()) { setUser(null); return goLogin("Please login or sign up to add items to your cart."); }
    setCart((c) => {
      const found = c.find((i) => i.id === p.id);
      if (!found) return stockOf(p.id) > 0 ? [...c, { id: p.id, qty: 1 }] : c;
      return c.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, stockOf(p.id)) } : i));
    });
  };

  const changeQty = (id, d) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(stockOf(id), i.qty + d)) } : i)));

  const removeItem = (id) => setCart((c) => c.filter((i) => i.id !== id));

  // Cart rows with full product details (always uses the latest stock).
  const cartItems = useMemo(
    () => cart.map((i) => ({ ...products.find((p) => p.id === i.id), qty: i.qty })).filter((i) => i.name),
    [cart, products]
  );
  const count = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems]);
  const total = useMemo(() => cartItems.reduce((s, i) => s + i.qty * i.price, 0), [cartItems]);

  const checkout = (shipTo) => {
    if (!getSession()) { setUser(null); return goLogin("Your account no longer exists. Please sign up again."); }
    const res = reduceStock(cartItems);           // checks stock, then reduces it
    if (res.error) { refreshProducts(); return alert(`${res.error}. Please update your cart.`); }
    addOrder(user, cartItems, total, shipTo);
    refreshProducts();
    alert(`Thank you ${shipTo}! Order placed.`);
    setCart([]);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCart([]);
    navigate("/");
  };

  return (
    <>
      <header className="topbar">
        <Link to="/" className="logo">🛒 Cart<b>Nova</b></Link>
        <SearchBox />
        <div className="top-right">
          {user ? (
            <div className="acct">
              <small>Hello, {user.name}</small>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="acct"><small>Hello, sign in</small><b>Account</b></Link>
          )}
          <Link to="/cart" className="cartlink">🛒<span className="badge">{count}</span><b>Cart</b></Link>
        </div>
      </header>
      <div className="subnav">
        <Link to="/products">☰ All</Link>
        <Link to="/products">Today's Deals</Link>
        {CATEGORIES.map((c) => <Link key={c} to={`/products?cat=${c}`}>{c}</Link>)}
        <Link to="/admin-login" className="push">Admin</Link>
      </div>
      <main>
        <Routes>
          <Route path="/" element={<Home products={products} />} />
          <Route path="/products" element={<Products products={products} onAdd={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} onAdd={addToCart} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route
            path="/cart"
            element={
              user ? (
                <Cart cart={cartItems} total={total} onQty={changeQty} onRemove={removeItem} onCheckout={checkout} />
              ) : (
                <Navigate to="/login" state={{ msg: "Please login to view your cart." }} replace />
              )
            }
          />
          <Route path="*" element={<p className="empty">Page not found.</p>} />
        </Routes>
      </main>
      <Footer count={count} total={total} />
    </>
  );
}