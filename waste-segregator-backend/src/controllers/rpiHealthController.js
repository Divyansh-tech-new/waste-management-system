const RpiHealthLog = require('../models/RpiHealthLog');

/**
 * @desc    Get all RPI health logs with pagination
 * @route   GET /api/rpi-health
 * @access  Public
 */
exports.getAllHealthLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const deviceId = req.query.deviceId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await RpiHealthLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await RpiHealthLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching RPI health logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RPI health logs',
      error: error.message,
    });
  }
};

/**
 * @desc    Get latest health log
 * @route   GET /api/rpi-health/latest
 * @access  Public
 */
exports.getLatestHealthLog = async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'rpi-main';
    
    const log = await RpiHealthLog.findOne({ deviceId })
      .sort({ timestamp: -1 });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'No health logs found',
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching latest health log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest health log',
      error: error.message,
    });
  }
};

/**
 * @desc    Get health statistics
 * @route   GET /api/rpi-health/stats
 * @access  Public
 */
exports.getHealthStats = async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'rpi-main';
    const hours = parseInt(req.query.hours) || 24;
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await RpiHealthLog.aggregate([
      {
        $match: {
          deviceId,
          timestamp: { $gte: since },
        },
      },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          maxTemp: { $max: '$temperature' },
          minTemp: { $min: '$temperature' },
          avgFreq: { $avg: '$cpuFrequency' },
          maxFreq: { $max: '$cpuFrequency' },
          minFreq: { $min: '$cpuFrequency' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : null,
      period: `Last ${hours} hours`,
    });
  } catch (error) {
    console.error('Error fetching health stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new health log (used by RPI script)
 * @route   POST /api/rpi-health
 * @access  Public (consider adding API key auth)
 */
exports.createHealthLog = async (req, res) => {
  try {
    const { temperature, fanState, cpuFrequency, throttleStatus, deviceId } = req.body;

    if (!temperature || !fanState || !cpuFrequency || !throttleStatus) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Decode throttle status
    const throttleHex = parseInt(throttleStatus, 16);
    const throttleDecoded = {
      underVoltage: (throttleHex & 0x1) !== 0,
      freqCapped: (throttleHex & 0x2) !== 0,
      throttled: (throttleHex & 0x4) !== 0,
      softTempLimit: (throttleHex & 0x8) !== 0,
    };

    const healthLog = await RpiHealthLog.create({
      temperature,
      fanState,
      cpuFrequency,
      throttleStatus,
      throttleDecoded,
      deviceId: deviceId || 'rpi-main',
    });

    res.status(201).json({
      success: true,
      data: healthLog,
    });
  } catch (error) {
    console.error('Error creating health log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create health log',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete old health logs
 * @route   DELETE /api/rpi-health/cleanup
 * @access  Admin
 */
exports.cleanupOldLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await RpiHealthLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old health logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup logs',
      error: error.message,
    });
  }
};
