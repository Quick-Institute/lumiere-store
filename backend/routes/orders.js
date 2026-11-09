const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendInvoiceEmail } = require("../utils/mailer");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const FREE_SHIPPING_OVER = 10000;
const SHIPPING_FEE = 500;
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// order numbers go #LM2001, #LM2002 ...
async function nextNumber() {
  const last = await Order.findOne({ number: { $exists: true } }).sort({ number: -1 });
  return last ? last.number + 1 : 2001;
}

// POST /api/orders (a customer places an order)
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts can't place orders." });
    }

    const { items, shipping, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 1. read real prices and stock from the database
    const lines = [];
    for (const it of items) {
      const qty = Number(it.qty);
      let product = null;
      try {
        product = await Product.findById(it.productId);
      } catch {
        product = null;
      }
      if (!product) {
        return res.status(400).json({
          message: "A product in your cart no longer exists. Please clear your cart.",
        });
      }
      if (!qty || qty < 1) {
        return res.status(400).json({ message: "Invalid quantity." });
      }
      if (product.stock < qty) {
        return res.status(400).json({
          message: `Only ${product.stock} left of ${product.name}.`,
        });
      }
      lines.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty,
        size: it.size || "",
        color: it.color || "",
      });
    }

    // 2. reduce stock (undo everything if one line fails)
    const done = [];
    for (const line of lines) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product, stock: { $gte: line.qty } },
        { $inc: { stock: -line.qty } }
      );
      if (!updated) {
        for (const d of done) {
          await Product.findByIdAndUpdate(d.product, { $inc: { stock: d.qty } });
        }
        return res.status(400).json({ message: `${line.name} just went out of stock.` });
      }
      done.push(line);
    }

    // 3. work out the money on the server and save the order
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

    const order = await Order.create({
      number: await nextNumber(),
      user: req.user.id,
      items: lines,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      shipping,
      paymentMethod: paymentMethod || "Cash on Delivery",
    });

    // 4. email the PDF invoice (runs in the background, never blocks the order)
    User.findById(req.user.id)
      .then((u) => (u ? sendInvoiceEmail(order, u.email) : null))
      .catch((e) => console.log("Invoice email failed:", e.message));

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Could not place the order." });
  }
});

// GET /api/orders/mine (my orders)
router.get("/mine", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders (admin: all orders)
router.get("/", protect, adminOnly, async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// PUT /api/orders/:id/status (admin changes the status)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const wasCancelled = order.status === "Cancelled";
    const willCancel = status === "Cancelled";

    if (willCancel && !wasCancelled) {
      // cancelling puts the stock back
      for (const it of order.items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.qty } });
      }
    } else if (!willCancel && wasCancelled) {
      // re-opening a cancelled order takes the stock out again
      const done = [];
      for (const it of order.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: it.product, stock: { $gte: it.qty } },
          { $inc: { stock: -it.qty } }
        );
        if (!updated) {
          for (const d of done) {
            await Product.findByIdAndUpdate(d.product, { $inc: { stock: d.qty } });
          }
          return res.status(400).json({ message: "Not enough stock to re-open this order." });
        }
        done.push(it);
      }
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Could not update the order." });
  }
});

module.exports = router;