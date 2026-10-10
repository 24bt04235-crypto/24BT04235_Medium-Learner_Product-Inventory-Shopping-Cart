import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login, register, adminLogin } from "./auth";

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = isSignup
      ? register(form.name, form.email, form.password)
      : login(form.email, form.password);
    if (res.error) return setError(res.error);
    onLogin(res.user);
    navigate("/products");
  };

  return (
    <form className="auth-box" onSubmit={handleSubmit}>
      <h2>{isSignup ? "Create account" : "Login"}</h2>
      {state?.msg && <p className="notice">{state.msg}</p>}
      {error && <p className="error">{error}</p>}
      {isSignup && (
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
      )}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" minLength={4} value={form.password} onChange={handleChange} required />
      <button className="primary" type="submit">{isSignup ? "Sign up" : "Login"}</button>
      <p className="muted">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(!isSignup); setError(""); }}>
          {isSignup ? "Login" : "Sign up"}
        </a>
      </p>
    </form>
  );
}

// Separate admin login page (not the customer login).
export function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = adminLogin(form.email, form.password);
    if (res.error) return setError(res.error);
    onLogin(res.admin);
    navigate("/admin");
  };

  return (
    <div className="admin-login-page">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>🔒 Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <input name="email" type="email" placeholder="Admin email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button className="primary" type="submit">Login</button>
        <Link to="/">← Back to store</Link>
      </form>
    </div>
  );
}