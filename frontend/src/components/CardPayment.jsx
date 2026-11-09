import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../api";

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = key ? loadStripe(key) : null;

const formatPrice = (n) => `Rs. ${n.toLocaleString("en-LK")}`;

function PayForm({ order, onPaid, onLater }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");

    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/account/orders" },
      redirect: "if_required",
    });

    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }

    try {
      await api("/payments/confirm", {
        method: "POST",
        body: { orderId: order.id, paymentIntentId: paymentIntent.id },
      });
      onPaid();
    } catch (e2) {
      setError(e2.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={pay}>
      <PaymentElement />
      {error && <p className="co-error" style={{ marginTop: 12 }}>{error}</p>}
      <button type="submit" className="btn co-place" disabled={!stripe || busy} style={{ marginTop: 16 }}>
        {busy ? "Processing..." : `Pay ${formatPrice(order.total)}`}
      </button>
      <button
        type="button"
        className="co-link"
        onClick={onLater}
        disabled={busy}
        style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", cursor: "pointer" }}
      >
        Pay later
      </button>
    </form>
  );
}

function CardPayment({ order, clientSecret, onPaid, onLater }) {
  if (!stripePromise) {
    return <p className="co-error">Card payments are not set up (missing Stripe public key).</p>;
  }
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe", variables: { colorPrimary: "#6b4fbb" } },
      }}
    >
      <PayForm order={order} onPaid={onPaid} onLater={onLater} />
    </Elements>
  );
}

export default CardPayment;