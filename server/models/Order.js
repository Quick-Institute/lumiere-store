const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        image: String,
        price: Number,
        qty: Number,
        size: String,
        color: String,
      },
    ],
    total: { type: Number, required: true },
    shipping: {
      name: String,
      phone: String,
      address: String,
      city: String,
    },
    paymentMethod: { type: String, default: "card" },
    paymentStatus: { type: String, default: "Unpaid" },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);