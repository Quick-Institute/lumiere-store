import { useState } from "react";
import { Star, Trash2, MessageSquareHeart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./ProductReviews.css";

const STORAGE_KEY = "lumiere_reviews";

const ratingWords = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

// Sample reviews so the section is not empty (demo data)
const sampleReviews = [
  {
    id: "sample-1",
    email: "sample1",
    name: "Nimali P.",
    rating: 5,
    comment: "Beautiful quality and the fit is perfect. Delivery was quick too!",
    date: "2026-10-12",
  },
  {
    id: "sample-2",
    email: "sample2",
    name: "Sachini F.",
    rating: 4,
    comment: "Lovely fabric and very comfortable. Slightly different shade in daylight.",
    date: "2026-10-04",
  },
];

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function Stars({ value, size = 16 }) {
  return (
    <span className="rv-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(value) ? "#e0a458" : "none"}
          color="#e0a458"
        />
      ))}
    </span>
  );
}

function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [all, setAll] = useState(loadAll);

  const mine = user ? all.find((r) => r.productId === productId && r.email === user.email) : null;

  const [rating, setRating] = useState(mine ? mine.rating : 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine ? mine.comment : "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const real = all.filter((r) => r.productId === productId);
  const reviews = [...real, ...sampleReviews];
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const persist = (next) => {
    setAll(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }

    const review = {
      id: mine ? mine.id : `r-${Date.now()}`,
      productId,
      email: user.email,
      name: user.name,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    const others = all.filter((r) => r.id !== review.id);
    persist([review, ...others]);
    setSaved(true);
  };

  const remove = () => {
    persist(all.filter((r) => r.id !== mine.id));
    setRating(0);
    setComment("");
    setSaved(false);
  };

  const shown = hover || rating;

  return (
    <section className="rv-section">
      <div className="container">
        <div className="rv-heading">
          <p className="label">What customers say</p>
          <h2>
            Customer <span className="script">Reviews</span>
          </h2>
        </div>

        <div className="rv-layout">
          <div className="rv-side">
            <div className="rv-summary">
              <div className="rv-score">
                <strong>{average.toFixed(1)}</strong>
                <Stars value={average} size={20} />
                <span>
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="rv-bars">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = reviews.filter((r) => r.rating === n).length;
                  const percent = (count / reviews.length) * 100;
                  return (
                    <div key={n} className="rv-bar-row">
                      <span>{n}</span>
                      <Star size={12} fill="#e0a458" color="#e0a458" />
                      <div className="rv-bar">
                        <div style={{ width: `${percent}%` }} />
                      </div>
                      <em>{count}</em>
                    </div>
                  );
                })}
              </div>
            </div>

            {user?.role === "admin" ? (
              <p className="rv-note">Admin accounts can read reviews but not write them.</p>
            ) : (
              <form className="rv-form" onSubmit={submit}>
                <h3>{mine ? "Update your review" : "Write a review"}</h3>
                <p className="rv-form-sub">Tell others what you think.</p>

                <div className="rv-pick" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${i} star${i === 1 ? "" : "s"}`}
                      onMouseEnter={() => setHover(i)}
                      onClick={() => setRating(i)}
                    >
                      <Star
                        size={30}
                        fill={i <= shown ? "#e0a458" : "none"}
                        color="#e0a458"
                      />
                    </button>
                  ))}
                  <span className="rv-word">{ratingWords[shown]}</span>
                </div>

                <textarea
                  rows="5"
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                {error && <p className="rv-error">{error}</p>}
                {saved && <p className="rv-saved">Thank you! Your review has been saved.</p>}

                <div className="rv-actions">
                  <button type="submit" className="btn">
                    {mine ? "Update review" : "Submit review"}
                  </button>
                  {mine && (
                    <button type="button" className="rv-delete" onClick={remove}>
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <div className="rv-list">
            {reviews.map((r) => (
              <div key={r.id} className="rv-item">
                <div className="rv-avatar">{r.name.charAt(0).toUpperCase()}</div>
                <div className="rv-content">
                  <div className="rv-head">
                    <strong>{r.name}</strong>
                    <span>{r.date}</span>
                  </div>
                  <Stars value={r.rating} size={14} />
                  <p>{r.comment}</p>
                </div>
              </div>
            ))}

            {real.length === 0 && (
              <div className="rv-first">
                <MessageSquareHeart size={22} />
                Be the first to share your own review of this product.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductReviews;