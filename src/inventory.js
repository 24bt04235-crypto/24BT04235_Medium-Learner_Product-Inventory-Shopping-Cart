export const rupee = (n) => "₹" + n.toLocaleString("en-IN");

// Inventory data + stock & cart persistence (localStorage).
const STOCK = "ps_stock", CART = "ps_cart_";

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

// Base inventory (default stock levels)
export const PRODUCTS = [
  { id: 1, name: "Laptop", category: "Electronics", price: 55000, quantity: 5, image: "/images/laptop.png" },
  { id: 2, name: "Mouse", category: "Electronics", price: 800, quantity: 20, image: "/images/mouse.png" },
  { id: 3, name: "Headphones", category: "Electronics", price: 2500, quantity: 12, image: "/images/headphones.png" },
  { id: 4, name: "Smart Watch", category: "Electronics", price: 6000, quantity: 0, image: "/images/smart-watch.png" },
  { id: 5, name: "Chair", category: "Furniture", price: 4500, quantity: 8, image: "/images/chair.png" },
  { id: 6, name: "Study Desk", category: "Furniture", price: 7500, quantity: 4, image: "/images/study-desk.png" },
  { id: 7, name: "Notebook", category: "Stationery", price: 100, quantity: 50, image: "/images/notebook.png" },
  { id: 8, name: "Pen Set", category: "Stationery", price: 250, quantity: 40, image: "/images/pen-set.png" },
  { id: 9, name: "T-Shirt", category: "Clothing", price: 599, quantity: 30, image: "/images/t-shirt.png" },
  { id: 10, name: "Sneakers", category: "Clothing", price: 2999, quantity: 15, image: "/images/sneakers.png" },
  { id: 11, name: "Jacket", category: "Clothing", price: 3499, quantity: 6, image: "/images/jacket.png" },
  { id: 12, name: "Novel", category: "Books", price: 350, quantity: 25, image: "/images/novel.png" },
  { id: 13, name: "Cricket Bat", category: "Sports", price: 1800, quantity: 9, image: "/images/cricket-bat.png" },
  { id: 14, name: "Football", category: "Sports", price: 700, quantity: 18, image: "/images/football.png" },
  { id: 15, name: "Water Bottle", category: "Sports", price: 450, quantity: 35, image: "/images/water-bottle.png" },
  { id: 16, name: "Coffee Mug", category: "Kitchen", price: 299, quantity: 40, image: "/images/coffee-mug.png" },
  { id: 17, name: "Mixer Grinder", category: "Kitchen", price: 3200, quantity: 7, image: "/images/mixer-grinder.png" },
  { id: 18, name: "Bluetooth Speaker", category: "Electronics", price: 1999, quantity: 10, image: "/images/bluetooth-speaker.png" },
  { id: 19, name: "Table Lamp", category: "Furniture", price: 1200, quantity: 14, image: "/images/table-lamp.png" },
  { id: 20, name: "Cookbook", category: "Books", price: 450, quantity: 22, image: "/images/cookbook.png" },
];

export const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];

// Current inventory = base data + saved stock levels (stock drops after each order).
export function getProducts() {
  const stock = read(STOCK, {});
  return PRODUCTS.map((p) => ({ ...p, quantity: stock[p.id] ?? p.quantity }));
}

// Checks stock and reduces it. Returns { ok: true } or { error: "..." }.
export function reduceStock(items) {
  const current = getProducts();
  for (const i of items) {
    const p = current.find((x) => x.id === i.id);
    if (!p || i.qty > p.quantity) return { error: `Only ${p ? p.quantity : 0} left of ${i.name}` };
  }
  const stock = {};
  current.forEach((p) => { stock[p.id] = p.quantity; });
  items.forEach((i) => { stock[i.id] -= i.qty; });
  localStorage.setItem(STOCK, JSON.stringify(stock));
  return { ok: true };
}

export const resetStock = () => localStorage.removeItem(STOCK);

// Cart is saved per customer so it survives a page refresh. Stored as [{ id, qty }].
export function loadCart(email, products) {
  if (!email) return [];
  return read(CART + email, [])
    .map((i) => {
      const p = products.find((x) => x.id === i.id);
      return p && p.quantity > 0 ? { id: i.id, qty: Math.min(i.qty, p.quantity) } : null;
    })
    .filter(Boolean);
}
export const saveCart = (email, cart) => localStorage.setItem(CART + email, JSON.stringify(cart));
export const removeCart = (email) => localStorage.removeItem(CART + email);
export const removeAllCarts = () =>
  Object.keys(localStorage).filter((k) => k.startsWith(CART)).forEach((k) => localStorage.removeItem(k));