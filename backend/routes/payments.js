const express = require("express");
const https = require("https");
const Stripe = require("stripe");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

const router = express.Router();

const CURRENCY = "lkr"; // charge in Sri Lankan rupees

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    // local testing only: antivirus on this laptop replaces the certificate
    httpAgent: new https.Agent({ rejectUnauthorized: false }),
  });
}

// finds the order, only if it belongs to the logged-in customer
async function ownOrder(req, id) {
  try {
    const order = await Order.findById(id);
    if (!order || String(order.user) !== String(req.user.id)) return null;
    return order;
  } catch {
    return null;
  }
}

// POST /api/payments/create-intent  { orderId }
router.post("/create-intent", protect, async (req, res) => {
  try {
    const stripe = stripeClient();
    if (!stripe) return res.status(500).json({ message: "Card payments are not set up." });

    const order = await ownOrder(req, req.body.orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ message: "This order is already paid." });
    }

    // the amount always comes from the saved order, never from the browser
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      description: `Lumiere order #LM${order.number}`,
      metadata: { orderId: String(order._id) },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.log("Stripe error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/confirm  { orderId, paymentIntentId }
router.post("/confirm", protect, async (req, res) => {
  try {
    const stripe = stripeClient();
    if (!stripe) return res.status(500).json({ message: "Card payments are not set up." });

    const order = await ownOrder(req, req.body.orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const intent = await stripe.paymentIntents.retrieve(req.body.paymentIntentId);
    const okAmount = intent.amount === Math.round(order.total * 100);
    const okOrder = intent.metadata && intent.metadata.orderId === String(order._id);

    if (intent.status !== "succeeded" || !okAmount || !okOrder) {
      return res.status(400).json({ message: "Payment was not completed." });
    }

    order.paymentStatus = "Paid";
    await order.save();
    res.json({ ok: true, paymentStatus: "Paid" });
  } catch (err) {
    console.log("Stripe confirm error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;