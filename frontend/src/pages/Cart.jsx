import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import "./Cart.css";

const FREE_SHIPPING_OVER = 10000;
const SHIPPING_FEE = 500;

const formatPrice = (n) => `Rs. ${n.toLocaleString("en-LK")}`;

const stockOf = (id) => {
  const p = products.find((x) => x.id === Number(id));
  return p ? p.stock : undefined;
};

function Cart() {
  const { items, updateQty, removeItem, clearCart, subtotal } = useCart();

  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remaining = FREE_SHIPPING_OVER - subtotal;

  // total quantity per product (same product in different sizes shares the stock)
  const totals = items.reduce((map, i) => {
    map[i.id] = (map[i.id] || 0) + i.qty;
    return map;
  }, {});

  // a message for an item, or "" when everything is fine
  const warningFor = (item) => {
    const stock = stockOf(item.id);
    if (stock === undefined) return { text: "", blocked: false };
    if (stock === 0) {
      return { text: "Out of stock. Please remove this item.", blocked: true };
    }
    if (totals[item.id] > stock) {
      return {
        text: `Only ${stock} left in stock. Please reduce the quantity.`,
        blocked: true,
      };
    }
    if (stock <= 5) {
      return { text: `Only ${stock} left`, blocked: false };
    }
    return { text: "", blocked: false };
  };

  const hasProblem = items.some((i) => warningFor(i).blocked);

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag size={56} strokeWidth={1.2} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2 className="cart-title">
        My <span className="script">Cart</span>
      </h2>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => {
            const warning = warningFor(item);
            const stock = stockOf(item.id);
            const atLimit = stock !== undefined && totals[item.id] >= stock;

            return (
              <div key={item.key} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-img">
                  <img src={item.image} alt={item.name} />
                </Link>

                <div className="cart-info">
                  <Link to={`/product/${item.id}`} className="cart-name">
                    {item.name}
                  </Link>
                  <p className="cart-meta">
                    Size: {item.size}
                    <span className="cart-dot" style={{ background: item.color }} />
                  </p>
                  <p className="cart-unit">{formatPrice(item.price)}</p>
                  {warning.text && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#c0475f",
                      }}
                    >
                      {warning.text}
                    </p>
                  )}
                </div>

                <div className="qty-box">
                  <button
                    onClick={() => updateQty(item.key, item.qty - 1)}
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.key, item.qty + 1)}
                    aria-label="Increase"
                    disabled={atLimit}
                    style={atLimit ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="cart-line-total">{formatPrice(item.price * item.qty)}</p>

                <button
                  className="cart-remove"
                  onClick={() => removeItem(item.key)}
                  aria-label="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          <div className="cart-actions">
            <Link to="/shop" className="continue-link">
              ← Continue shopping
            </Link>
            <button className="clear-cart" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        </div>

        <aside className="cart-summary">
          <h3>Order Summary</h3>

          <div className="sum-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>

          {shipping > 0 && (
            <p className="ship-note">Add {formatPrice(remaining)} more for free shipping.</p>
          )}

          <div className="sum-row sum-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {hasProblem ? (
            <>
              <button
                className="btn checkout-btn"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                Proceed to Checkout
              </button>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: "#c0475f",
                  textAlign: "center",
                }}
              >
                Please fix the items marked in red first.
              </p>
            </>
          ) : (
            <Link to="/account/checkout" className="btn checkout-btn">
              Proceed to Checkout
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Cart;