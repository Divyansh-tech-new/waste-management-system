#!/usr/bin/env python3
"""
Raspberry Pi Health Monitor with MongoDB Integration
Monitors: CPU temperature, fan state, throttle status, CPU frequency
Sends data to waste management system MongoDB database
"""

import subprocess
import time
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration - MongoDB URI
# You can change this to 'http://localhost:5000' for local testing
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://divyansh4078233:Mayanegi@cluster0.spb1r.mongodb.net/waste-management')
DEVICE_ID = os.getenv('RPI_DEVICE_ID', 'rpi-main')
UPDATE_INTERVAL = int(os.getenv('RPI_UPDATE_INTERVAL', '5'))  # seconds
BATCH_SIZE = int(os.getenv('RPI_BATCH_SIZE', '1'))  # Send to DB every N readings (1 = send immediately)

# MongoDB connection
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    health_collection = db['rpihealthlogs']
    print(f"✅ Connected to MongoDB: {db.name}")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    print("💡 Make sure MONGO_URI is set in .env file or environment")
    exit(1)

def get_temp():
    """Get CPU temperature in Celsius"""
    try:
        out = subprocess.check_output(["vcgencmd", "measure_temp"]).decode()
        return float(out.replace("temp=", "").replace("'C", "").strip())
    except Exception as e:
        print(f"⚠️  Error reading temperature: {e}")
        return 0.0

def get_throttled():
    """Get throttle status as hex string"""
    try:
        out = subprocess.check_output(["vcgencmd", "get_throttled"]).decode().strip()
        return out.split("=")[1]
    except Exception as e:
        print(f"⚠️  Error reading throttle status: {e}")
        return "0x0"

def get_fan_state():
    """Get fan state from cooling device"""
    try:
        with open("/sys/class/thermal/cooling_device0/cur_state") as f:
            return f.read().strip()
    except Exception:
        # Try alternative path
        try:
            with open("/sys/class/hwmon/hwmon0/pwm1") as f:
                pwm = int(f.read().strip())
                return str(int(pwm / 255 * 100))  # Convert to percentage
        except Exception as e:
            return "N/A"

def get_freq():
    """Get current CPU frequency in GHz"""
    try:
        with open("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq") as f:
            return round(int(f.read().strip()) / 1_000_000, 2)
    except Exception as e:
        print(f"⚠️  Error reading frequency: {e}")
        return 0.0

def decode_throttle(throttle_hex):
    """Decode throttle status into human-readable issues"""
    try:
        value = int(throttle_hex, 16)
        issues = []
        if value & 0x1:
            issues.append("Under-voltage detected")
        if value & 0x2:
            issues.append("Frequency capped")
        if value & 0x4:
            issues.append("Currently throttled")
        if value & 0x8:
            issues.append("Soft temperature limit reached")
        if value & 0x10000:
            issues.append("Under-voltage occurred")
        if value & 0x20000:
            issues.append("Frequency capping occurred")
        if value & 0x40000:
            issues.append("Throttling occurred")
        if value & 0x80000:
            issues.append("Soft temperature limit occurred")
        return issues if issues else ["Normal"]
    except:
        return ["Unknown"]

def send_to_mongodb(data):
    """Send health data to MongoDB"""
    try:
        result = health_collection.insert_one(data)
        return result.inserted_id is not None
    except Exception as e:
        print(f"❌ Error sending to MongoDB: {e}")
        return False

def main():
    print("=" * 70)
    print("🍓 Raspberry Pi Health Monitor - MongoDB Integration")
    print("=" * 70)
    print(f"Device ID: {DEVICE_ID}")
    print(f"Update Interval: {UPDATE_INTERVAL}s")
    print(f"Batch Size: {BATCH_SIZE} readings")
    print(f"Database: {db.name}")
    print("Press Ctrl+C to stop")
    print("=" * 70)
    
    reading_count = 0
    last_db_send = time.time()
    
    try:
        while True:
            # Collect metrics
            temp = get_temp()
            fan = get_fan_state()
            throttle_hex = get_throttled()
            freq = get_freq()
            
            # Prepare data for MongoDB
            health_data = {
                "temperature": temp,
                "fanState": fan,
                "cpuFrequency": freq,
                "throttleStatus": throttle_hex,
                "deviceId": DEVICE_ID,
                "timestamp": datetime.now(datetime.UTC) if hasattr(datetime, 'UTC') else datetime.utcnow(),
            }
            
            # Display current status
            throttle_issues = decode_throttle(throttle_hex)
            status_color = "🟢" if temp < 60 else "🟡" if temp < 75 else "🔴"
            
            print(f"\r{status_color} T={temp:5.1f}°C | Fan={fan:>4} | "
                  f"Freq={freq:4.2f}GHz | Throttle={throttle_hex} | "
                  f"Issues: {', '.join(throttle_issues[:2]):<30}", 
                  end="", flush=True)
            
            reading_count += 1
            
            # Send to MongoDB every BATCH_SIZE readings or every 60 seconds
            current_time = time.time()
            if reading_count >= BATCH_SIZE or (current_time - last_db_send) >= 60:
                print()  # New line before DB message
                if send_to_mongodb(health_data):
                    print(f"✅ Sent to MongoDB at {datetime.now().strftime('%H:%M:%S')}")
                reading_count = 0
                last_db_send = current_time
            
            time.sleep(UPDATE_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("🛑 Monitoring stopped by user")
        print("=" * 70)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    finally:
        client.close()
        print("👋 MongoDB connection closed")

if __name__ == "__main__":
    main()
