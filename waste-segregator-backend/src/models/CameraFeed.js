const mongoose = require("mongoose");
const { WASTE_CATEGORIES } = require("../config/constants");

const cameraFeedSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, "Location is required"],
      default: "Main Collection Point - IIT Mandi",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    cloudinaryId: {
      type: String,
      unique: true,
      sparse: true,
    },
    predictedCategory: {
      type: String,
      enum: {
        values: [...Object.values(WASTE_CATEGORIES), "unknown"],
        message: "Predicted category must be one of: metal, biodegradable, non-biodegradable, plastic, others, unknown",
      },
    },
    confidence: {
      type: Number,
      min: [0, "Confidence cannot be less than 0"],
      max: [100, "Confidence cannot exceed 100"],
    },
    isLive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deviceId: {
      type: String,
      default: "camera-main",
    },
    metadata: {
      resolution: String,
      format: String,
      size: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cameraFeedSchema.index({ isLive: 1, createdAt: -1 });
cameraFeedSchema.index({ location: 1, createdAt: -1 });

// Virtual for formatted timestamp
cameraFeedSchema.virtual("formattedTimestamp").get(function () {
  const timestamp = this.updatedAt || this.createdAt || new Date();
  return timestamp.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
});

cameraFeedSchema.set("toJSON", { virtuals: true });
cameraFeedSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("CameraFeed", cameraFeedSchema);
