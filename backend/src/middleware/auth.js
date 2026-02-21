const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "fleetflow_secret_2024");
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireManager = (req, res, next) => {
  if (req.user.role !== "MANAGER") return res.status(403).json({ error: "Manager access required" });
  next();
};

module.exports = { authenticate, requireManager };
