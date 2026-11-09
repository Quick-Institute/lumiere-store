import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Star, Minus, Plus, ShoppingBag, Truck, RefreshCw } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductReviews from "../components/ProductReviews";
import { products } from "../data/products";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "./ProductDetails.css";

const formatPrice = (amount) => `Rs. ${amount.toLocaleString("en-LK")}`;

// used only when a product has no description of its own
const descriptions = {
  dresses: "A graceful dress made from soft, breathable fabric. Designed to move beautifully and feel comfortable all day.",
  tops: "A soft, easy-to-style top that pairs well with almost everything in your wardrobe.",
  pants: "Relaxed, flattering pants with a comfortable fit and a clean, modern line.",
  jackets: "A well-cut jacket that finishes any outfit, from everyday looks to special occasions.",
  bags: "A roomy, well-made bag with a timeless shape that goes with every outfit.",
};

function ProductDetails() {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSize("");
    setColor(product ? product.colors[0] : "");
    setQty(1);
    setMessage("");
    setAdded(false);
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <section className="container not-found">
        <h1>Product not found</h1>
        <Link to="/shop" className="btn">
          Back to Shop
        </Link>
      </section>
    );
  }

  const liked = has(product.id);

  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock <= 5;
  const maxQty = product.stock ?? 99;

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    setAdded(false);

    if (out) {
      setMessage("Sorry, this product is out of stock.");
      return;
    }
    if (user?.role === "admin") {
      setMessage("Admin accounts can't shop. Please log in as a customer.");
      return;
    }
    if (product.sizes.length > 0 && !size) {
      setMessage("Please select a size.");
      return;
    }

    addToCart(product, {
      size: size || "One size",
      color,
      qty,
    });
    setMessage("Added to your cart!");
    setAdded(true);
  };

  const handleHeart = () => {
    if (user?.role === "admin") {
      setAdded(false);
      setMessage("Admin accounts don't have a wishlist.");
      return;
    }
    toggle(product.id);
  };

  return (
    <>
      <div className="container pd-crumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{" "}
        <Link to={`/shop?category=${product.category}`}>{product.category}</Link> /{" "}
        <span>{product.name}</span>
      </div>

      <div className="container pd-layout">
        <div
          className="pd-image"
          style={{ backgroundImage: `url(${product.image})` }}
        >
          {product.discount && (
            <span className="discount-tag">-{product.discount}%</span>
          )}
        </div>

        <div className="pd-info">
          <p className="label">{product.category}</p>
          <h1>{product.name}</h1>

          <div className="pd-rating">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(product.rating) ? "#e0a458" : "none"}
                color="#e0a458"
              />
            ))}
            <span>
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <p className="pd-price">
            <span className={product.oldPrice ? "sale" : ""}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
          </p>

          {product.stock !== undefined && (
            <p
              style={{
                margin: "0 0 14px",
                fontWeight: 600,
                color: out ? "#777" : low ? "#c0475f" : "#2c7a4b",
              }}
            >
              {out
                ? "Out of stock"
                : low
                ? `Only ${product.stock} left in stock`
                : `In stock: ${product.stock}`}
            </p>
          )}

          <p className="pd-desc">
            {product.description || descriptions[product.category]}
          </p>

          <div className="pd-block">
            <h4>Color</h4>
            <div className="pd-swatches">
              {product.colors.map((c) => (
                <button
                  key={c}
                  aria-label={`Color ${c}`}
                  className={color === c ? "swatch active" : "swatch"}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {product.sizes.length > 0 && (
            <div className="pd-block">
              <h4>Size</h4>
              <div className="pd-sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={size === s ? "chip active" : "chip"}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-block">
            <h4>Quantity</h4>
            <div className="pd-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty(Math.min(maxQty, qty + 1))}
                aria-label="More"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="pd-actions">
            <button
              className="btn"
              onClick={handleAdd}
              disabled={out}
              style={out ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              <ShoppingBag size={18} /> {out ? "Out of stock" : "Add to Cart"}
            </button>
            <button
              className={liked ? "pd-heart liked" : "pd-heart"}
              onClick={handleHeart}
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          {message && (
            <p className="pd-message">
              {message}{" "}
              {added && (
                <Link to="/account/cart" style={{ textDecoration: "underline" }}>
                  View cart →
                </Link>
              )}
            </p>
          )}

          <div className="pd-perks">
            <p>
              <Truck size={16} /> Free shipping on orders over Rs. 10,000
            </p>
            <p>
              <RefreshCw size={16} /> 30-day easy returns
            </p>
          </div>
        </div>
      </div>

      <ProductReviews key={product.id} productId={product.id} />

      {related.length > 0 && (
        <section className="container pd-related">
          <h2>You may also like</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default ProductDetails;