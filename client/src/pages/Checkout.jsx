import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, CreditCard, Banknote, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { products } from "../data/products";
import "./Checkout.css";

const FREE_SHIPPING_OVER = 10000;
const SHIPPING_FEE = 500;

const formatPrice = (n) => `Rs. ${n.toLocaleString("en-LK")}`;

// which product a cart item belongs to
const productIdOf = (item) => String(item.id);

// returns a message if something in the cart is not available any more
function stockProblem(items) {
  const wanted = {};
  items.forEach((item) => {
    const pid = productIdOf(item);
    wanted[pid] = (wanted[pid] || 0) + item.qty;
  });

  for (const pid of Object.keys(wanted)) {
    const product = products.find((p) => String(p.id) === pid);
    if (!product || product.stock === undefined) continue;

    if (product.stock === 0) {
      return `"${product.name}" is out of stock. Please remove it from your cart.`;
    }
    if (wanted[pid] > product.stock) {
      return `Only ${product.stock} of "${product.name}" left in stock. Please reduce the quantity in your cart.`;
    }
  }
  return "";
}

function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postal: "",
  });
  const [payment, setPayment] = useState("cod");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);

  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const changeCard = (e) => setCard({ ...card, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // make sure everything is still in stock
    const problem = stockProblem(items);
    if (problem) {
      setError(problem);
      return;
    }

    if (form.phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (payment === "card") {
      if (card.number.replace(/\D/g, "").length !== 16) {
        setError("Card number must be 16 digits (test card: 4242 4242 4242 4242).");
        return;
      }
      if (!card.expiry.trim() || card.cvc.replace(/\D/g, "").length < 3) {
        setError("Please enter the card expiry and a 3-digit CVC.");
        return;
      }
    }

    setBusy(true);
    try {
      const order = await placeOrder({
        items,
        payment: payment === "card" ? "Card (test)" : "Cash on Delivery",
        address: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postal: form.postal,
        },
      });

      clearCart();
      setPlaced(order);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  // Order confirmation
  if (placed) {
    return (
      <div className="co-done">
        <CheckCircle size={64} strokeWidth={1.4} />
        <h2>Thank you for your order!</h2>
        <p>Your order has been placed successfully.</p>
        <div className="co-done-box">
          <div>
            <span>Order number</span>
            <strong>{placed.number}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatPrice(placed.total)}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{placed.payment}</strong>
          </div>
        </div>
        <div className="co-done-actions">
          <Link to="/account/orders" className="btn">
            View my orders
          </Link>
          <Link to="/shop" className="co-link">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="co-done">
        <ShoppingBag size={56} strokeWidth={1.2} />
        <h2>Your cart is empty</h2>
        <p>Add some items before checking out.</p>
        <Link to="/shop" className="btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="co-page">
      <h2 className="co-title">
        <span className="script">Checkout</span>
      </h2>

      <form className="co-layout" onSubmit={submit}>
        <div className="co-main">
          <div className="co-block">
            <h3>Shipping details</h3>
            <div className="co-grid">
              <label>
                Full name
                <input name="name" value={form.name} onChange={change} required />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  type="tel"
                  placeholder="+94 77 000 0000"
                  value={form.phone}
                  onChange={change}
                  required
                />
              </label>
              <label className="full">
                Address
                <input
                  name="address"
                  placeholder="House number, street"
                  value={form.address}
                  onChange={change}
                  required
                />
              </label>
              <label>
                City
                <input name="city" value={form.city} onChange={change} required />
              </label>
              <label>
                Postal code
                <input name="postal" value={form.postal} onChange={change} />
              </label>
            </div>
          </div>

          <div className="co-block">
            <h3>Payment method</h3>

            <label className={payment === "cod" ? "pay-option active" : "pay-option"}>
              <input
                type="radio"
                name="payment"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
              />
              <Banknote size={22} />
              <div>
                <strong>Cash on Delivery</strong>
                <span>Pay when your order arrives.</span>
              </div>
            </label>

            <label className={payment === "card" ? "pay-option active" : "pay-option"}>
              <input
                type="radio"
                name="payment"
                checked={payment === "card"}
                onChange={() => setPayment("card")}
              />
              <CreditCard size={22} />
              <div>
                <strong>Credit / Debit card</strong>
                <span>Test mode only. No real payment is taken.</span>
              </div>
            </label>

            {payment === "card" && (
              <div className="co-grid card-fields">
                <label className="full">
                  Card number
                  <input
                    name="number"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={changeCard}
                  />
                </label>
                <label>
                  Expiry
                  <input
                    name="expiry"
                    placeholder="MM / YY"
                    value={card.expiry}
                    onChange={changeCard}
                  />
                </label>
                <label>
                  CVC
                  <input
                    name="cvc"
                    placeholder="123"
                    value={card.cvc}
                    onChange={changeCard}
                  />
                </label>
              </div>
            )}
          </div>

          {error && <p className="co-error">{error}</p>}
        </div>

        <aside className="co-summary">
          <h3>Order Summary</h3>

          <div className="co-items">
            {items.map((item) => (
              <div key={item.key} className="co-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>
                    Size {item.size} · Qty {item.qty}
                  </span>
                </div>
                <strong>{formatPrice(item.price * item.qty)}</strong>
              </div>
            ))}
          </div>

          <div className="co-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="co-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="co-row co-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button type="submit" className="btn co-place" disabled={busy}>
            {busy ? "Placing order..." : "Place Order"}
          </button>
          <Link to="/account/cart" className="co-link back">
            ← Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;