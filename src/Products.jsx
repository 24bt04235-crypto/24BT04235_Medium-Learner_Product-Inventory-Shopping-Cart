import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";

export default function Products({ products, onAdd }) {
  const [params] = useSearchParams(); // ?q=...&cat=... comes from header search / home links
  const [search, setSearch] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("cat") || "All");

  useEffect(() => {
    setSearch(params.get("q") || "");
    setCategory(params.get("cat") || "All");
  }, [params]);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (category === "All" || p.category === category)
      ),
    [products, search, category]
  );

  return (
    <div>
      <h2>Products <span className="muted">({filtered.length})</span></h2>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      </form>

      <div className="grid">
        {filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
      </div>
      {filtered.length === 0 && <p className="empty">No products found.</p>}
    </div>
  );
}

// Reusable search input
function SearchBar({ value, onChange }) {
  return (
    <label>Search:
      <input placeholder="e.g. Laptop" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// Reusable category dropdown
function CategoryFilter({ categories, value, onChange }) {
  return (
    <label>Category:
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>
    </label>
  );
}