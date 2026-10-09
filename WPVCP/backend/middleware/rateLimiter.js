const rateLimit = require('express-rate-limit');

// Custom handler for returning structured JSON response on rate limit hit
const createLimiter = ({ customMessage, ...options }) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: customMessage || 'Too many requests. Please wait a moment and try again.'
      });
    },
    ...options
  });
};

// 1. Auth Limiter: Login, Register, Forgot Password, Reset Password, Google Auth
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // allow 60 attempts per 15 minutes for comfortable testing and evaluation
  customMessage: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// 2. Chatbot Limiter
const chatbotLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 messages per minute
  customMessage: 'Chatbot rate limit reached. Please wait a few seconds before asking another question.'
});

// 3. Message Limiter: Chat between users
const messageLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 messages per minute
  customMessage: 'Message dispatch rate limit reached. Please wait a moment before sending more messages.'
});

// 4. Payment Limiter: Payment processing
const paymentLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 payment operations per minute
  customMessage: 'Payment transaction limit reached. Please wait a moment before initiating another transaction.'
});

// 5. Support Ticket Limiter
const supportLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 tickets per 15 minutes
  customMessage: 'Support ticket creation limit reached. Please wait before creating additional tickets.'
});

// 6. Vendor Request Limiter
const vendorRequestLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute
  customMessage: 'Too many vendor requests submitted in a short interval. Please wait a moment.'
});

// 7. General API Limiter (fallback protection)
const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per IP
  customMessage: 'API rate limit exceeded. Please try again later.'
});

module.exports = {
  authLimiter,
  chatbotLimiter,
  messageLimiter,
  paymentLimiter,
  supportLimiter,
  vendorRequestLimiter,
  generalLimiter
};
