import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { api } from "../api";
import { useOrders } from "../context/OrderContext";
import "./Checkout.css";

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const { refresh } = useOrders();
  const [state, setState] = useState("checking");
  const [message, setMessage] = useState("");
  const [number, setNumber] = useState("");

  useEffect(() => {
    const orderId = params.get("order");
    const sessionId = params.get("session_id");

    if (!orderId || !sessionId) {
      setState("error");
      setMessage("Payment details are missing.");
      return;
    }

    let stop = false;
    api("/payments/confirm", { method: "POST", body: { orderId, sessionId } })
      .then((order) => {
        if (stop) return;
        setNumber("#LM" + order.number);
        setState("paid");
        refresh();
      })
      .catch((err) => {
        if (stop) return;
        setState("error");
        setMessage(err.message);
      });

    return () => {
      stop = true;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="co-done">
        <h2>Confirming your payment...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="co-done">
        <XCircle size={64} strokeWidth={1.4} />
        <h2>We could not confirm the payment</h2>
        <p>{message}</p>
        <div className="co-done-actions">
          <Link to="/account/orders" className="btn">
            View my orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="co-done">
      <CheckCircle size={64} strokeWidth={1.4} />
      <h2>Payment successful!</h2>
      <p>Thank you. Your card payment was received.</p>
      <div className="co-done-box">
        <div>
          <span>Order number</span>
          <strong>{number}</strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>Paid (Stripe test)</strong>
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

export function PaymentCancelled() {
  return (
    <div className="co-done">
      <XCircle size={64} strokeWidth={1.4} />
      <h2>Payment cancelled</h2>
      <p>Your order was saved but it is still unpaid.</p>
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