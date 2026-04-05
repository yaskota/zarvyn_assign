import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Check header as fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    req.user = decoded; // { id, role, ... }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};