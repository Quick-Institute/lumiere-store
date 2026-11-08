import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, CreditCard, Banknote, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { products } from "../data/products";
import { api } from "../api";
import CardPayment from "../components/CardPayment";
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
  const { placeOrder, refresh } = useOrders();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postal: "",
  });
  const [payment, setPayment] = useState("cod");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [paying, setPaying] = useState(null); // { order, clientSecret }

  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

    setBusy(true);

    // 1. save the order (stock goes down on the server)
    let order = null;
    try {
      order = await placeOrder({
        items,
        payment: payment === "card" ? "Card (Stripe test)" : "Cash on Delivery",
        address: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postal: form.postal,
        },
      });
      clearCart();
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }

    // 2. card payment: show the card form on this page
    if (payment === "card") {
      try {
        const data = await api("/payments/create-intent", {
          method: "POST",
          body: { orderId: order.id },
        });
        setPaying({ order, clientSecret: data.clientSecret });
        window.scrollTo(0, 0);
        setBusy(false);
        return;
      } catch (err) {
        setNotice(
          `Your order was placed, but the card payment could not be started (${err.message}). The order is saved as unpaid.`
        );
      }
    }

    setPlaced(order);
    window.scrollTo(0, 0);
    setBusy(false);
  };

  // Card payment step
  if (paying) {
    return (
      <div className="co-page">
        <h2 className="co-title">
          <span className="script">Card payment</span>
        </h2>
        <div className="co-block" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h3>Order {paying.order.number}</h3>
          <p style={{ marginBottom: 16 }}>
            Amount to pay: <strong>{formatPrice(paying.order.total)}</strong>
          </p>
          <CardPayment
            order={paying.order}
            clientSecret={paying.clientSecret}
            onPaid={() => {
              setPlaced({ ...paying.order, payment: "Card (Stripe test) - Paid" });
              setPaying(null);
              refresh();
              window.scrollTo(0, 0);
            }}
            onLater={() => {
              setNotice("Your order is saved as unpaid.");
              setPlaced(paying.order);
              setPaying(null);
              window.scrollTo(0, 0);
            }}
          />
        </div>
      </div>
    );
  }

  // Order confirmation
  if (placed) {
    return (
      <div className="co-done">
        <CheckCircle size={64} strokeWidth={1.4} />
        <h2>Thank you for your order!</h2>
        <p>Your order has been placed successfully.</p>
        {notice && <p>{notice}</p>}
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
                <span>Stripe test mode. No real payment is taken.</span>
              </div>
            </label>

          
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
            {busy ? "Please wait..." : payment === "card" ? "Continue to payment" : "Place Order"}
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