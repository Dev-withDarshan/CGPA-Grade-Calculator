import jwt from 'jsonwebtoken';

/**
 * authMiddleware — Verifies JWT from "Authorization: Bearer <token>" header.
 * Attaches req.userId (MongoDB _id) on success. Returns 401 on failure.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export default authMiddleware;
