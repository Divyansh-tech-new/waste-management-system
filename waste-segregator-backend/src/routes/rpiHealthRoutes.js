const express = require('express');
const router = express.Router();
const {
  getAllHealthLogs,
  getLatestHealthLog,
  getHealthStats,
  createHealthLog,
  cleanupOldLogs,
} = require('../controllers/rpiHealthController');

// GET all health logs with pagination and filters
router.get('/', getAllHealthLogs);

// GET latest health log
router.get('/latest', getLatestHealthLog);

// GET health statistics
router.get('/stats', getHealthStats);

// POST create new health log (used by RPI)
router.post('/', createHealthLog);

// DELETE cleanup old logs
router.delete('/cleanup', cleanupOldLogs);

module.exports = router;
