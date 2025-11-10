const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
require("dotenv").config()

const app = express()

// security / networking
app.set("trust proxy", 1) // needed if behind a proxy (for rate limiter)
app.use(helmet())
app.use(morgan("dev"))

const { securityHeaders, dataSanitization, xssSanitization, preventHpp } = require("./middlewares/securityHeaders")
const { limiter, strictLimiter, rateLimitIoT } = require("./middlewares/rateLimiter")
const errorHandler = require("./middlewares/errorHandler")

app.use(securityHeaders)

// CORS: support comma-separated FRONTEND_URL or single origin.
// safe check function ensures only allowed origins are accepted.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true)
      return callback(new Error("CORS policy: This origin is not allowed"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    maxAge: 86400,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.use(dataSanitization)
app.use(xssSanitization)
app.use(preventHpp)

// rate limiting for general routes (adjust limits in your limiter middleware)
app.use(limiter)

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", timestamp: new Date() })
})

// API routes (IoT route uses its own rate limit)
app.use("/api/iot", rateLimitIoT, require("./routes/iotRoutes"))
app.use("/api/bins", require("./routes/binRoutes"))
app.use("/api/images", require("./routes/imageRoutes"))
app.use("/api/commands", require("./routes/commandRoutes"))
app.use("/api/maintenance", require("./routes/maintenanceRoutes"))
app.use("/api/workers", require("./routes/workerRoutes"))
app.use("/api/analytics", require("./routes/analyticsRoutes"))
app.use("/api/feedback", require("./routes/feedbackRoutes"))
app.use("/api/admin", require("./routes/adminAuthRoutes"))
app.use("/api/pending-actions", require("./routes/pendingActionsRoutes"))
app.use("/api/team", require("./routes/teamRoutes"))
app.use("/api/waste-data", require("./routes/wasteDataRoutes"))
app.use("/api/rpi-health", require("./routes/rpiHealthRoutes"))

// fallback 404 — should be before the global error handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  })
})

// global error handler — handles multer, cloudinary and other thrown errors
app.use(errorHandler)

module.exports = app
