const CameraFeed = require("../models/CameraFeed");
const { cloudinary } = require("../config/cloudinary");

/**
 * @desc    Upload image to camera feed
 * @route   POST /api/camera-feed/upload
 * @access  Public (can be restricted with API key)
 */
exports.uploadCameraImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { location, predictedCategory, confidence, deviceId } = req.body;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "camera-feeds",
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto:good" },
      ],
    });

    // Mark all previous feeds as not live
    await CameraFeed.updateMany({ isLive: true }, { isLive: false });

    // Create new camera feed record
    const cameraFeed = await CameraFeed.create({
      location: location || "Main Collection Point - IIT Mandi",
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      predictedCategory: predictedCategory || "unknown",
      confidence: confidence ? parseFloat(confidence) : 0,
      deviceId: deviceId || "camera-main",
      metadata: {
        resolution: `${result.width}x${result.height}`,
        format: result.format,
        size: result.bytes,
      },
    });

    res.status(201).json({
      success: true,
      message: "Camera feed image uploaded successfully",
      data: cameraFeed,
    });
  } catch (error) {
    console.error("Error uploading camera feed image:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};

/**
 * @desc    Get latest live camera feed
 * @route   GET /api/camera-feed/latest
 * @access  Public
 */
exports.getLatestFeed = async (req, res) => {
  try {
    const latestFeed = await CameraFeed.findOne({ isLive: true })
      .sort({ createdAt: -1 })
      .select("-__v");

    if (!latestFeed) {
      return res.status(404).json({
        success: false,
        message: "No live camera feed available",
      });
    }

    res.status(200).json({
      success: true,
      data: latestFeed,
    });
  } catch (error) {
    console.error("Error fetching latest camera feed:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching camera feed",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all camera feed history
 * @route   GET /api/camera-feed/history
 * @access  Public
 */
exports.getFeedHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1, location } = req.query;

    const query = {};
    if (location) {
      query.location = location;
    }

    const feeds = await CameraFeed.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("-__v");

    const total = await CameraFeed.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feeds.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: feeds,
    });
  } catch (error) {
    console.error("Error fetching camera feed history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feed history",
      error: error.message,
    });
  }
};

/**
 * @desc    Update camera feed prediction
 * @route   PUT /api/camera-feed/:id
 * @access  Private/Admin
 */
exports.updateFeedPrediction = async (req, res) => {
  try {
    const { predictedCategory, confidence } = req.body;

    const feed = await CameraFeed.findByIdAndUpdate(
      req.params.id,
      {
        predictedCategory,
        confidence,
      },
      { new: true, runValidators: true }
    );

    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Camera feed not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Camera feed updated successfully",
      data: feed,
    });
  } catch (error) {
    console.error("Error updating camera feed:", error);
    res.status(500).json({
      success: false,
      message: "Error updating camera feed",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete camera feed
 * @route   DELETE /api/camera-feed/:id
 * @access  Private/Admin
 */
exports.deleteFeed = async (req, res) => {
  try {
    const feed = await CameraFeed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Camera feed not found",
      });
    }

    // Delete from Cloudinary
    if (feed.cloudinaryId) {
      await cloudinary.uploader.destroy(feed.cloudinaryId);
    }

    await feed.deleteOne();

    res.status(200).json({
      success: true,
      message: "Camera feed deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting camera feed:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting camera feed",
      error: error.message,
    });
  }
};
