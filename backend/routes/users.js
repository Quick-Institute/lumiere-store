const express = require("express");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/users (admin: all users, no passwords)
router.get("/", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// DELETE /api/users/:id (admin removes a customer)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin accounts can't be removed." });
    }
    await user.deleteOne();
    res.json({ message: "User removed." });
  } catch (err) {
    res.status(404).json({ message: "User not found." });
  }
});

module.exports = router;