const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  uploadCameraImage,
  getLatestFeed,
  getFeedHistory,
  updateFeedPrediction,
  deleteFeed,
} = require("../controllers/cameraFeedController");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Public routes
router.post("/upload", upload.single("image"), uploadCameraImage);
router.get("/latest", getLatestFeed);
router.get("/history", getFeedHistory);

// Admin routes (add authentication middleware as needed)
router.put("/:id", updateFeedPrediction);
router.delete("/:id", deleteFeed);

module.exports = router;
