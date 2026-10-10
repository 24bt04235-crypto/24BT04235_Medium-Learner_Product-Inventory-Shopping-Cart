import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rupee } from "./inventory";

const SLIDES = [
  { title: "New arrivals in Electronics", sub: "Laptops, headphones, speakers & more", cat: "Electronics", bg: "linear-gradient(135deg,#fde047,#f59e0b)", deco: ["💻", "🎧", "🖱️", "⌚"] },
  { title: "Make your space yours", sub: "Chairs, desks and lamps for home & office", cat: "Furniture", bg: "linear-gradient(135deg,#93c5fd,#6366f1)", deco: ["🪑", "🗄️", "💡", "🛋️"] },
  { title: "Sports & fitness essentials", sub: "Gear up for the season", cat: "Sports", bg: "linear-gradient(135deg,#86efac,#16a34a)", deco: ["⚽", "🏏", "🧴", "👟"] },
];

// [left, top, rotation] – decorations stay on the left/right edges, clear of the heading.
const POS = [["3%", "8%", -12], ["13%", "46%", 12], ["80%", "8%", 14], ["89%", "46%", -10]];

const ICONS = { Electronics: "💻", Furniture: "🛋️", Stationery: "✏️", Clothing: "👕", Books: "📚", Sports: "⚽", Kitchen: "🍳" };

export default function Home({ products }) {
  const [slide, setSlide] = useState(0);

  // Auto-rotate banner every 5 seconds.
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [slide]);

  const go = (d) => setSlide((s) => (s + d + SLIDES.length) % SLIDES.length);
  const s = SLIDES[slide];

  const categories = [...new Set(products.map((p) => p.category))];

  // Horizontal "shelves" of products (each shows up to 6 items).
  const shelves = [
    { title: "Budget picks", link: "/products", items: [...products].sort((a, b) => a.price - b.price).slice(0, 6) },
    ...["Electronics", "Furniture", "Clothing"].map((c) => ({
      title: `Top in ${c}`, link: `/products?cat=${c}`, items: products.filter((p) => p.category === c).slice(0, 6),
    })),
  ];

  return (
    <div className="home">
      <section className="banner" style={{ background: s.bg }}>
        {s.deco.map((e, i) => (
          <span key={i} className="deco" style={{ left: POS[i][0], top: POS[i][1], transform: `rotate(${POS[i][2]}deg)` }}>{e}</span>
        ))}
        <button className="arrow left" onClick={() => go(-1)}>❮</button>
        <div className="banner-text">
          <h1>{s.title}</h1>
          <p>{s.sub}</p>
          <Link to={`/products?cat=${s.cat}`}><button className="primary big">Shop now</button></Link>
        </div>
        <button className="arrow right" onClick={() => go(1)}>❯</button>
      </section>

      <section className="cat-strip">
        <h3>Shop by category</h3>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c} to={`/products?cat=${c}`} className="cat-chip">
              <span className={`cat-circle cat-${c.toLowerCase()}`}>{ICONS[c] || "🛍️"}</span>
              <b>{c}</b>
              <small>{products.filter((p) => p.category === c).length} items</small>
            </Link>
          ))}
        </div>
      </section>

      {shelves.map((sh) => (
        <section className="shelf" key={sh.title}>
          <div className="shelf-head">
            <h3>{sh.title}</h3>
            <Link to={sh.link}>See all</Link>
          </div>
          <div className="shelf-grid">
            {sh.items.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="shelf-item">
                <img className="shelf-img" src={p.image} alt={p.name} />
                <span className="shelf-name">{p.name}</span>
                <b>{rupee(p.price)}</b>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}