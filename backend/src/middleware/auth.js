const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  let token = req.cookies.token;

  // Fallback to Authorization header if cookie is missing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn(`[Auth] No token found for request: ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('[Auth] FATAL: JWT_SECRET is not defined!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    console.log(`[Auth] Verified: ${payload.sub} (${payload.role})`);
    next();
  } catch (e) {
    console.error(`[Auth] Token verification failed for ${token.substring(0, 10)}...: ${e.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
