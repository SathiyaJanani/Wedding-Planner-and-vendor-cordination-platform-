/**
 * High-performance sliding-window in-memory Rate Limiting Middleware
 * Zero-dependency, thread-safe, and role/user-aware.
 */

function createRateLimiter({
  windowMs = 60 * 1000, // 1 minute default
  max = 60,             // max requests per window
  message = 'Too many requests from this client. Please slow down and try again later.',
  keyGenerator = null
} = {}) {
  // Map of clientKey -> Array of timestamps
  const hitsMap = new Map();

  // Periodic cleanup of expired entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hitsMap.entries()) {
      const active = timestamps.filter(t => now - t < windowMs);
      if (active.length === 0) {
        hitsMap.delete(key);
      } else {
        hitsMap.set(key, active);
      }
    }
  }, Math.max(windowMs * 2, 60000));

  if (cleanupInterval.unref) {
    cleanupInterval.unref(); // Don't prevent process exit in test/watch modes
  }

  return function rateLimitMiddleware(req, res, next) {
    // Generate key: User ID if authenticated, else IP address
    const clientKey = keyGenerator
      ? keyGenerator(req)
      : (req.user && req.user.id)
        ? `user_${req.user.id}`
        : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip');

    const now = Date.now();
    const timestamps = hitsMap.get(clientKey) || [];

    // Filter out timestamps outside the sliding window
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    const currentHits = validTimestamps.length;

    // Remaining limit & reset calculation
    const remaining = Math.max(0, max - (currentHits + 1));
    const oldestTimestamp = validTimestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.max(1, resetTimeSeconds));

    if (currentHits >= max) {
      res.setHeader('Retry-After', Math.max(1, resetTimeSeconds));
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.max(1, resetTimeSeconds)
      });
    }

    validTimestamps.push(now);
    hitsMap.set(clientKey, validTimestamps);
    next();
  };
}

// Pre-configured rate limiters
const reportLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: 'Report generation rate limit exceeded. Please wait a moment before requesting new reports.'
});

const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Document upload rate limit exceeded. Please wait a minute before uploading additional files.'
});

const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many requests. Please slow down.'
});

const customerLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Action rate limit reached. Please wait a moment before trying again.'
});

module.exports = {
  createRateLimiter,
  reportLimiter,
  uploadLimiter,
  generalLimiter,
  customerLimiter
};
