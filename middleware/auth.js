import jwt from "jsonwebtoken";

// Protects routes that require login
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing access token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = decoded.sub; // attach user ID for later use
    next(); // continue to next handler
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
