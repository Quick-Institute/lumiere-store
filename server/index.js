const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Lumiere API is running" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
// creates the admin account once, if it doesn't exist yet
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@lumiere.lk").toLowerCase();
  const exists = await User.findOne({ email });
  if (!exists) {
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 10);
    await User.create({ name: "Admin", email, password, role: "admin" });
    console.log("Admin account created:", email);
  }
}

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });