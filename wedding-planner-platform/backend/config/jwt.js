const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wpvcp_production_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function verifyTokenWithDetails(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded, expired: false };
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return { valid: false, decoded: null, expired: isExpired, error: err.message };
  }
}

function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken,
  verifyTokenWithDetails,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
