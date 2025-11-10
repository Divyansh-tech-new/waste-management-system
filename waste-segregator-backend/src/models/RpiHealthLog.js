const mongoose = require('mongoose');

const rpiHealthLogSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: true,
      description: 'CPU temperature in Celsius',
    },
    fanState: {
      type: String,
      required: true,
      description: 'Current state of the cooling fan',
    },
    cpuFrequency: {
      type: Number,
      required: true,
      description: 'CPU frequency in GHz',
    },
    throttleStatus: {
      type: String,
      required: true,
      description: 'Throttle status hex code',
    },
    throttleDecoded: {
      underVoltage: { type: Boolean, default: false },
      freqCapped: { type: Boolean, default: false },
      throttled: { type: Boolean, default: false },
      softTempLimit: { type: Boolean, default: false },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    deviceId: {
      type: String,
      default: 'rpi-main',
      description: 'Identifier for the Raspberry Pi device',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by timestamp
rpiHealthLogSchema.index({ timestamp: -1 });
rpiHealthLogSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('RpiHealthLog', rpiHealthLogSchema);
