import rateLimit from 'express-rate-limit';

// Rate limiter for authentication attempts (15 min window, max 30 attempts per IP)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip during automated test suites
});

// General API rate limiter (15 min window, max 500 requests per IP)
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down',
  },
  skip: () => process.env.NODE_ENV === 'test',
});
