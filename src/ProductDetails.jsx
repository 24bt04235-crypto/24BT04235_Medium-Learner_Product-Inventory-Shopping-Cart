import { useParams, Link } from "react-router-dom";
import { rupee } from "./inventory";

export default function ProductDetails({ products, onAdd }) {
  const { id } = useParams();
  const p = products.find((x) => x.id === Number(id));

  if (!p) return <p className="empty">Product not found. <Link to="/products">Back</Link></p>;

  return (
    <div className="details">
      <img className="p-img large" src={p.image} alt={p.name} />
      <div>
        <span className="tag">{p.category}</span>
        <h2>{p.name}</h2>
        <p className="muted">Product ID: {p.id}</p>
        <p className="price large">{rupee(p.price)}</p>
        <p className={p.quantity ? "stock" : "stock out"}>
          {p.quantity ? `In stock: ${p.quantity}` : "Out of stock"}
        </p>
        <div className="actions">
          <Link to="/products"><button className="ghost">← Back</button></Link>
          <button className="primary" disabled={!p.quantity} onClick={() => onAdd(p)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}