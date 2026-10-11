// Frontend-only demo auth (no backend).
// DATA (users, orders, login history) -> localStorage (shared by all tabs, read by the admin).
// SESSIONS (who is logged in)         -> sessionStorage (separate per browser tab),
// so a customer and the admin can be logged in at the same time in different tabs.
import { resetStock, removeCart, removeAllCarts } from "./inventory";

const USERS = "ps_users", ORDERS = "ps_orders", LOGINS = "ps_logins";
const SESSION = "ps_session", ADMIN_SESSION = "ps_admin_session";

export const ADMIN = { name: "Admin", email: "admin@store.com", password: "admin123" };

const read = (store, k, d) => { try { return JSON.parse(store.getItem(k)) ?? d; } catch { return d; } };
const write = (store, k, v) => store.setItem(k, JSON.stringify(v));

export const getUsers = () => read(localStorage, USERS, []);
export const getOrders = () => read(localStorage, ORDERS, []);
export const getLogins = () => read(localStorage, LOGINS, []);

// ---------- Customer ----------
// A customer session is only valid while the account still exists (admin may delete it).
export const getSession = () => {
  const s = read(sessionStorage, SESSION, null);
  if (s && !getUsers().some((u) => u.email === s.email)) {
    sessionStorage.removeItem(SESSION);
    return null;
  }
  return s;
};

const startSession = (u, type) => {
  const session = { name: u.name, email: u.email };
  write(localStorage, LOGINS, [...getLogins(), { ...session, type, time: new Date().toISOString() }]);
  write(sessionStorage, SESSION, session);
  return { user: session };
};

export function register(name, email, password) {
  email = email.trim().toLowerCase();
  if (email === ADMIN.email || getUsers().some((u) => u.email === email))
    return { error: "This email is already registered." };
  const now = new Date().toISOString();
  const user = { name: name.trim(), email, password, createdAt: now, lastLogin: now, loginCount: 1 };
  write(localStorage, USERS, [...getUsers(), user]);
  return startSession(user, "signup");
}

export function login(email, password) {
  email = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return { error: "Invalid email or password." };
  user.lastLogin = new Date().toISOString();
  user.loginCount += 1;
  write(localStorage, USERS, users);
  return startSession(user, "login");
}

export const logout = () => sessionStorage.removeItem(SESSION);

// ---------- Admin (completely separate login) ----------
export const getAdminSession = () => read(sessionStorage, ADMIN_SESSION, null);

export function adminLogin(email, password) {
  if (email.trim().toLowerCase() !== ADMIN.email || password !== ADMIN.password)
    return { error: "Invalid admin credentials." };
  const admin = { name: ADMIN.name, email: ADMIN.email };
  write(sessionStorage, ADMIN_SESSION, admin);
  return { admin };
}

export const adminLogout = () => sessionStorage.removeItem(ADMIN_SESSION);

// ---------- Orders ----------
export function addOrder(user, items, total, shipTo) {
  const order = {
    id: "ORD" + Date.now().toString().slice(-7),
    name: user.name,
    email: user.email,
    shipTo,
    items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    total,
    date: new Date().toISOString(),
  };
  write(localStorage, ORDERS, [...getOrders(), order]);
}

// Delivery stage of an order: 0 placed, 1 packed, 2 shipped, 3 out for delivery, 4 delivered.
export function setOrderStatus(id, status) {
  const orders = getOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  const times = {};
  Object.entries(o.stageTimes || { 0: o.date }).forEach(([k, v]) => { if (Number(k) <= status) times[k] = v; });
  if (!times[status]) times[status] = new Date().toISOString();
  o.status = status;
  o.stageTimes = times;
  write(localStorage, ORDERS, orders);
}

// ---------- Admin delete helpers ----------
export const deleteOrder = (id) => write(localStorage, ORDERS, getOrders().filter((o) => o.id !== id));

export const deleteLogin = (time, email) =>
  write(localStorage, LOGINS, getLogins().filter((l) => !(l.time === time && l.email === email)));

// Deleting a customer also removes their orders and login history.
export function deleteUser(email) {
  write(localStorage, USERS, getUsers().filter((u) => u.email !== email));
  write(localStorage, ORDERS, getOrders().filter((o) => o.email !== email));
  write(localStorage, LOGINS, getLogins().filter((l) => l.email !== email));
  removeCart(email);
}

export function clearData(kind) {
  const keys = { logins: [LOGINS], orders: [ORDERS], customers: [USERS, ORDERS, LOGINS], all: [USERS, ORDERS, LOGINS], inventory: [] }[kind];
  keys.forEach((k) => localStorage.removeItem(k));
  if (kind === "customers" || kind === "all") removeAllCarts();
  if (kind === "inventory" || kind === "all") resetStock();
}
