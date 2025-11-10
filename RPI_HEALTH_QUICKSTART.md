# 🚀 Quick Start - RPI Health Monitor

## Step 1: Copy Files to Raspberry Pi

Copy these files to your Raspberry Pi:
```bash
# From your Windows machine to RPI
scp C:\Users\hp\health_watch.py pi@<rpi-ip>:~/
scp C:\Users\hp\rpi_requirements.txt pi@<rpi-ip>:~/
```

## Step 2: Setup RPI

SSH into your Raspberry Pi and run:

```bash
# Install Python dependencies
pip3 install pymongo python-dotenv

# Create .env file
nano .env
```

Add this to `.env` (replace with your MongoDB URI):
```
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/waste-management
RPI_DEVICE_ID=rpi-main
RPI_UPDATE_INTERVAL=5
RPI_BATCH_SIZE=10
```

## Step 3: Run the Monitor

```bash
# Make script executable
chmod +x health_watch.py

# Run it
python3 health_watch.py
```

You should see output like:
```
======================================================================
🍓 Raspberry Pi Health Monitor - MongoDB Integration
======================================================================
Device ID: rpi-main
Update Interval: 5s
Batch Size: 10 readings
Database: waste-management
Press Ctrl+C to stop
======================================================================
🟢 T= 58.3°C | Fan=   2 | Freq=1.80GHz | Throttle=0x0 | Issues: Normal
✅ Sent to MongoDB at 14:23:45
```

## Step 4: Start Backend (if not running)

In your Windows machine:
```powershell
cd d:\wastemain210DS\waste-segregator-backend
npm start
```

## Step 5: Start Frontend (if not running)

```powershell
cd d:\wastemain210DS\frontend
npm start
```

## Step 6: View Dashboard

Open browser and go to:
```
http://localhost:3000/rpi-health
```

## ✅ Verification Checklist

- [ ] Python script running on RPI without errors
- [ ] Data showing "Sent to MongoDB" every batch
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Dashboard shows "RPI Health" in navbar
- [ ] Health data visible on dashboard
- [ ] Auto-refresh working (toggle on/off)
- [ ] Temperature cards showing colored indicators
- [ ] Recent logs table populated

## 🎯 Testing

### Test Backend API:
```powershell
# Test backend health endpoint
curl http://localhost:5000/api/rpi-health/latest

# Should return JSON with latest health data
```

### Test Database:
```javascript
// MongoDB Compass or Shell
use waste-management
db.rpihealthlogs.find().sort({timestamp: -1}).limit(5)
```

## 🐛 Quick Fixes

**No data showing?**
```bash
# Check if Python script is running
ps aux | grep health_watch.py

# Check MongoDB connection
ping cluster.mongodb.net
```

**Backend not responding?**
```powershell
# Check if backend is running
netstat -an | findstr "5000"

# Restart backend
cd d:\wastemain210DS\waste-segregator-backend
npm start
```

**Frontend page blank?**
```powershell
# Check browser console for errors
# Verify route in App.js
# Clear browser cache and reload
```

## 📊 Expected Results

After a few minutes, you should see:
- Latest metrics cards updating
- Statistics showing averages
- Table filling with log entries
- Temperature color changes (green/yellow/red)
- Throttle status indicators

## 🎉 You're Done!

Your RPI health monitoring system is now integrated with the waste management dashboard!

---

**Need help?** Check `RPI_HEALTH_MONITOR_README.md` for detailed documentation.
