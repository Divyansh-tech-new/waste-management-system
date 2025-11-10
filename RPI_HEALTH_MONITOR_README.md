# Raspberry Pi Health Monitor Integration

This system monitors Raspberry Pi health metrics and displays them in the waste management dashboard.

## 🎯 Features

- **Real-time Monitoring**: CPU temperature, frequency, fan state, throttle status
- **MongoDB Integration**: All metrics stored in the same database as waste management system
- **Beautiful Dashboard**: React-based UI with green theme matching the waste management design
- **Auto-refresh**: Dashboard updates every 10 seconds (can be toggled)
- **Statistics**: 24-hour averages, min/max values
- **Alert System**: Visual indicators for temperature warnings and throttling

## 📁 Files Created/Modified

### Backend (waste-segregator-backend)
- `src/models/RpiHealthLog.js` - MongoDB schema for health logs
- `src/controllers/rpiHealthController.js` - API controller with endpoints
- `src/routes/rpiHealthRoutes.js` - Routes for health API
- `src/app.js` - Added route registration

### Frontend (frontend/src)
- `pages/RpiHealthLogs.jsx` - Main health dashboard page
- `App.js` - Added route for /rpi-health
- `components/layout/Navbar.jsx` - Added RPI Health menu item

### Python Script (Raspberry Pi)
- `health_watch.py` - Updated with MongoDB integration
- `rpi_requirements.txt` - Python dependencies

## 🚀 Setup Instructions

### 1. Backend Setup

The backend is already configured! The following endpoints are available:

```
GET  /api/rpi-health          - Get paginated health logs
GET  /api/rpi-health/latest   - Get latest health log
GET  /api/rpi-health/stats    - Get statistics (24h default)
POST /api/rpi-health          - Create new health log (used by RPI)
DELETE /api/rpi-health/cleanup - Cleanup old logs
```

### 2. Raspberry Pi Setup

On your Raspberry Pi, install Python dependencies:

```bash
# Install dependencies
pip3 install pymongo python-dotenv

# Or use the requirements file
pip3 install -r rpi_requirements.txt
```

Create a `.env` file on your Raspberry Pi:

```bash
# MongoDB connection (same as your backend)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/waste-management

# Optional configuration
RPI_DEVICE_ID=rpi-main
RPI_UPDATE_INTERVAL=5
RPI_BATCH_SIZE=10
```

Run the health monitor:

```bash
python3 health_watch.py
```

### 3. Frontend Access

Start your frontend and navigate to:
```
http://localhost:3000/rpi-health
```

Or click the "RPI Health" link in the navigation bar.

## 🎨 Dashboard Features

### Real-time Cards
- **Temperature Card**: Shows current CPU temperature with color-coded warnings
  - Green: < 60°C (Normal)
  - Yellow: 60-75°C (Warning)
  - Red: > 75°C (Critical)
- **CPU Frequency Card**: Current processor frequency in GHz
- **Fan State Card**: Current cooling fan state
- **Throttle Status Card**: Shows if system is being throttled

### Statistics Panel
24-hour overview showing:
- Average, max, min temperature
- Average, max frequency
- Total readings count

### Logs Table
Detailed table showing:
- Timestamp of each reading
- Temperature, frequency, fan state
- Throttle status (hex code)
- Decoded issues (Under-voltage, Frequency capped, etc.)

## 📊 API Examples

### Get Latest Health Data
```bash
curl http://localhost:5000/api/rpi-health/latest
```

### Get Recent Logs with Pagination
```bash
curl "http://localhost:5000/api/rpi-health?page=1&limit=50"
```

### Get Statistics
```bash
curl "http://localhost:5000/api/rpi-health/stats?hours=24"
```

### Manually Post Data (for testing)
```bash
curl -X POST http://localhost:5000/api/rpi-health \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 58.5,
    "fanState": "2",
    "cpuFrequency": 1.8,
    "throttleStatus": "0x0",
    "deviceId": "rpi-test"
  }'
```

## 🔧 Configuration

### Python Script Environment Variables
- `MONGO_URI` - MongoDB connection string (required)
- `RPI_DEVICE_ID` - Unique identifier for your RPI (default: "rpi-main")
- `RPI_UPDATE_INTERVAL` - Seconds between readings (default: 5)
- `RPI_BATCH_SIZE` - Readings before sending to DB (default: 10)

### Frontend Environment Variables
Add to `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

## 🎯 Throttle Status Decoder

The script decodes the throttle status hex value:
- `0x1` - Under-voltage detected
- `0x2` - ARM frequency capped
- `0x4` - Currently throttled
- `0x8` - Soft temperature limit active
- `0x10000` - Under-voltage has occurred
- `0x20000` - ARM frequency capping has occurred
- `0x40000` - Throttling has occurred
- `0x80000` - Soft temperature limit has occurred

## 🧹 Maintenance

### Cleanup Old Logs
```bash
# Delete logs older than 7 days
curl -X DELETE "http://localhost:5000/api/rpi-health/cleanup?days=7"
```

### Database Indexes
The following indexes are automatically created:
- `timestamp: -1` - For efficient time-based queries
- `deviceId: 1, timestamp: -1` - For device-specific queries

## 🐛 Troubleshooting

### Python Script Issues

**"Failed to connect to MongoDB"**
- Check your `MONGO_URI` in `.env` file
- Ensure MongoDB Atlas allows connections from RPI IP
- Verify internet connection on RPI

**"vcgencmd: command not found"**
- Script is designed for Raspberry Pi OS
- Some metrics may not work on other systems

### Frontend Issues

**"Failed to load RPI health data"**
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Verify CORS settings in backend

**No data showing**
- Make sure Python script is running on RPI
- Check MongoDB connection
- Wait a few minutes for data to accumulate

## 📈 Performance

- Python script uses minimal resources (~5MB RAM)
- Batch sends reduce MongoDB writes
- Frontend auto-refresh can be toggled to save bandwidth
- Indexes optimize query performance

## 🔐 Security Recommendations

1. Add API key authentication for POST endpoint
2. Use environment variables for sensitive data
3. Set up MongoDB Atlas IP whitelist
4. Enable HTTPS for production
5. Add rate limiting for health endpoints

## 📝 Future Enhancements

- Email/SMS alerts for critical temperature
- Historical charts and graphs
- Multiple RPI device support with comparison
- Export logs to CSV
- Predictive analytics for failures
- Integration with system alerts

## 🤝 Contributing

To add new metrics:
1. Update Python `health_watch.py` to collect metric
2. Update MongoDB model `RpiHealthLog.js`
3. Update frontend `RpiHealthLogs.jsx` to display metric

---

**Built with ❤️ for Smart Waste Management System**
