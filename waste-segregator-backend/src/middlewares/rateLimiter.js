// Rate limiting middleware to prevent abuse
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX) || 500, // increased from 100 to 500 for development
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development'
  },
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter limit for auth endpoints
  message: "Too many login attempts, please try again later.",
})

const rateLimitIoT = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Allow 60 requests per minute per API key
  keyGenerator: (req, res) => {
    // Rate limit by API key instead of IP
    return req.headers["x-api-key"] || req.ip
  },
  message: "Too many IoT requests, please try again later.",
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.path === "/health"
  },
})

module.exports = { limiter, strictLimiter, rateLimitIoT }
