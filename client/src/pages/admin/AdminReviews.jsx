import { useState } from "react";
import { Star, Trash2, MessageSquare, Award } from "lucide-react";
import { products } from "../../data/products";
import "./AdminPages.css";

const STORAGE_KEY = "lumiere_reviews";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function AdminReviews() {
  const [reviews, setReviews] = useState(loadAll);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const remove = (r) => {
    if (!window.confirm(`Delete the review by ${r.name}?`)) return;
    const next = reviews.filter((x) => x.id !== r.id);
    setReviews(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <h1>Reviews</h1>
      <p className="dash-sub">See what customers say and remove inappropriate reviews.</p>

      <div className="ar-stats">
        <div className="ar-stat">
          <div className="ar-icon">
            <MessageSquare size={20} />
          </div>
          <div>
            <span>Total reviews</span>
            <strong>{reviews.length}</strong>
          </div>
        </div>

        <div className="ar-stat">
          <div className="ar-icon">
            <Star size={20} />
          </div>
          <div>
            <span>Average rating</span>
            <strong>{reviews.length ? average.toFixed(1) : "-"}</strong>
          </div>
        </div>

        <div className="ar-stat">
          <div className="ar-icon">
            <Award size={20} />
          </div>
          <div>
            <span>5-star reviews</span>
            <strong>{reviews.filter((r) => r.rating === 5).length}</strong>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="dash-sub">No customer reviews yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                const product = products.find((p) => p.id === r.productId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="prod-cell">
                        <span
                          className="thumb"
                          style={{
                            backgroundImage: product ? `url(${product.image})` : "none",
                          }}
                        />
                        {product ? product.name : "Product"}
                      </div>
                    </td>
                    <td>{r.name}</td>
                    <td>
                      <span className="rv-admin-stars">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i <= r.rating ? "#e0a458" : "none"}
                            color="#e0a458"
                          />
                        ))}
                      </span>
                    </td>
                    <td className="rv-admin-comment">{r.comment}</td>
                    <td className="rv-admin-date">{r.date}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() => remove(r)}
                          aria-label="Delete review"
                          className="danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminReviews;