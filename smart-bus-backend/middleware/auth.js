import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export const requireAuth = (roles = []) => {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Authorization token missing' });

      const payload = jwt.verify(token, JWT_SECRET);
      req.user = { id: payload.userId, role: payload.role };

      if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export default { requireAuth };
