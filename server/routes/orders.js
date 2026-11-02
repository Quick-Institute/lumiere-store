const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders (logged-in user places an order)
router.post("/", protect, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 1. read real prices and stock from the database
    const lines = [];
    for (const it of items) {
      const qty = Number(it.qty);
      const product = await Product.findById(it.productId);
      if (!product) {
        return res.status(400).json({ message: "A product in your cart no longer exists." });
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

    // 3. save the order
    const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const order = await Order.create({
      user: req.user.id,
      items: lines,
      total,
      shipping,
      paymentMethod: paymentMethod || "card",
    });

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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    // cancelling puts the stock back
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const it of order.items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.qty } });
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