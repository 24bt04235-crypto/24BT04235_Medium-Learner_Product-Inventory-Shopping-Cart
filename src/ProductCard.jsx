import { Link } from "react-router-dom";
import { rupee } from "./inventory";

// Reusable product card (used by the Products page).
export default function ProductCard({ product, onAdd }) {
  const outOfStock = product.quantity === 0;
  return (
    <div className="card">
      <img className="p-img" src={product.image} alt={product.name} />
      <span className="tag">{product.category}</span>
      <h3>{product.name}</h3>
      <p className="price">{rupee(product.price)}</p>
      <p className={outOfStock ? "stock out" : "stock"}>
        {outOfStock ? "Out of stock" : `In stock: ${product.quantity}`}
      </p>
      <div className="actions">
        <Link to={`/product/${product.id}`}><button className="ghost">View Details</button></Link>
        <button className="primary" disabled={outOfStock} onClick={() => onAdd(product)}>Add to Cart</button>
      </div>
    </div>
  );
}
