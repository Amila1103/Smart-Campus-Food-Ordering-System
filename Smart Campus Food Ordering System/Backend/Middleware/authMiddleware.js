import jwt from "jsonwebtoken";

export const verifyStaffToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.staff = decoded;
    next();
  } catch (error) {
    console.log("verifyStaffToken error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.staff || !allowedRoles.includes(req.staff.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      console.log("allowRoles error:", error);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};