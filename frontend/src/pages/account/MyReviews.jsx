import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { products } from "../../data/products";
import "./AccountPages.css";

const STORAGE_KEY = "lumiere_reviews";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function MyReviews() {
  const { user } = useAuth();
  const [all, setAll] = useState(loadAll);

  const mine = all.filter((r) => r.email === user.email);

  const remove = (id) => {
    if (!window.confirm("Delete this review?")) return;
    const next = all.filter((r) => r.id !== id);
    setAll(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <h1>My Reviews</h1>
      <p className="dash-sub">Reviews you have written for products.</p>

      {mine.length === 0 ? (
        <>
          <p className="dash-sub">
            You haven't written any reviews yet. Open a product and share your thoughts.
          </p>
          <Link to="/shop" className="btn dash-btn">
            Browse the shop
          </Link>
        </>
      ) : (
        <div className="mr-list">
          {mine.map((r) => {
            const product = products.find((p) => p.id === r.productId);
            return (
              <div key={r.id} className="mr-card">
                <div
                  className="mr-photo"
                  style={{ backgroundImage: product ? `url(${product.image})` : "none" }}
                />
                <div className="mr-body">
                  <div className="mr-top">
                    <strong>{product ? product.name : "Product"}</strong>
                    <span>{r.date}</span>
                  </div>
                  <div className="mr-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={15}
                        fill={i <= r.rating ? "#e0a458" : "none"}
                        color="#e0a458"
                      />
                    ))}
                  </div>
                  <p>{r.comment}</p>
                  <div className="mr-actions">
                    {product && (
                      <Link to={`/product/${product.id}`}>
                        <Pencil size={14} /> Edit
                      </Link>
                    )}
                    <button onClick={() => remove(r.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default MyReviews;