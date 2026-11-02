const jwt = require("jsonwebtoken");

// Checks the token. Adds req.user = { id, role } if it is valid.
const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

// Use after protect. Only lets admins through.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Admin access only." });
};

module.exports = { protect, adminOnly };