import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "./ProductCard.css";

const formatPrice = (amount) => `Rs. ${amount.toLocaleString("en-LK")}`;

function ProductCard({ product }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();

  const liked = has(product.id);

  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock <= 5;

  const handleHeart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") return;
    toggle(product.id);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <Link
          to={`/product/${product.id}`}
          className="product-photo"
          style={{
            backgroundImage: `url(${product.image})`,
            opacity: out ? 0.5 : 1,
          }}
          aria-label={product.name}
        />

        {product.discount && (
          <span className="discount-tag">-{product.discount}%</span>
        )}

        <button
          className={liked ? "wishlist liked" : "wishlist"}
          onClick={handleHeart}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>

        <Link to={`/product/${product.id}`} className="quick-add">
          <ShoppingBag size={16} /> View Details
        </Link>
      </div>

      <Link to={`/product/${product.id}`}>
        <h3 className="product-name">{product.name}</h3>
      </Link>

      <p className="product-price">
        <span className={product.oldPrice ? "price sale" : "price"}>
          {formatPrice(product.price)}
        </span>
        {product.oldPrice && (
          <span className="old-price">{formatPrice(product.oldPrice)}</span>
        )}
      </p>

      <div className="product-rating">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={14}
            fill={product.reviews > 0 && i < Math.round(product.rating) ? "#e0a458" : "none"}
            color="#e0a458"
          />
        ))}
        <span>{product.reviews > 0 ? `(${product.reviews})` : "No reviews yet"}</span>
      </div>

      {product.stock !== undefined && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            fontWeight: 500,
            color: out ? "#777" : low ? "#c0475f" : "#2c7a4b",
          }}
        >
          {out
            ? "Out of stock"
            : low
            ? `Only ${product.stock} left`
            : `In stock: ${product.stock}`}
        </p>
      )}

      <div className="color-dots">
        {product.colors.map((color) => (
          <span key={color} className="color-dot" style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}

export default ProductCard;