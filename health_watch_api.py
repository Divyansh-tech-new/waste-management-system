#!/usr/bin/env python3
"""
Raspberry Pi Health Monitor with API Upload
Sends health metrics to backend API instead of direct MongoDB writes
"""
import subprocess
import time
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_URL = os.getenv('API_URL', 'http://localhost:5000')
HEALTH_API_ENDPOINT = f'{API_URL}/api/rpi-health'
DEVICE_ID = os.getenv('RPI_DEVICE_ID', 'rpi-main')
UPDATE_INTERVAL = int(os.getenv('RPI_UPDATE_INTERVAL', '5'))
API_SEND_INTERVAL = int(os.getenv('RPI_API_SEND_INTERVAL', '600'))

def get_temp():
    try:
        out = subprocess.check_output(["vcgencmd", "measure_temp"]).decode()
        return float(out.replace("temp=", "").replace("'C", "").strip())
    except:
        return 0.0

def get_throttled():
    try:
        out = subprocess.check_output(["vcgencmd", "get_throttled"]).decode().strip()
        return out.split("=")[1]
    except:
        return "0x0"

def get_fan_state():
    try:
        with open("/sys/class/thermal/cooling_device0/cur_state") as f:
            return f.read().strip()
    except:
        try:
            with open("/sys/class/hwmon/hwmon0/pwm1") as f:
                pwm = int(f.read().strip())
                return str(int(pwm / 255 * 100))
        except:
            return "N/A"

def get_freq():
    try:
        with open("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq") as f:
            return round(int(f.read().strip()) / 1_000_000, 2)
    except:
        return 0.0

def decode_throttle(x):
    try:
        v = int(x, 16)
        issues = []
        if v & 0x1: issues.append("Under-voltage detected")
        if v & 0x2: issues.append("Frequency capped")
        if v & 0x4: issues.append("Currently throttled")
        if v & 0x8: issues.append("Soft temperature limit reached")
        if v & 0x10000: issues.append("Under-voltage occurred")
        if v & 0x20000: issues.append("Frequency capping occurred")
        if v & 0x40000: issues.append("Throttling occurred")
        if v & 0x80000: issues.append("Soft temperature limit occurred")
        return issues if issues else ["Normal"]
    except:
        return ["Unknown"]

def send_to_api(data):
    """
    Send health data to backend API
    """
    try:
        response = requests.post(
            HEALTH_API_ENDPOINT,
            json=data,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            return True, result
        else:
            print(f"\n❌ API Error: {response.status_code} - {response.text}")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Connection Error: Cannot connect to {API_URL}")
        print("   Make sure the backend server is running")
        return False, None
    except Exception as e:
        print(f"\n❌ Error sending to API: {e}")
        return False, None

def main():
    print("=" * 70)
    print("🔧 Raspberry Pi Health Monitor - API Upload Mode")
    print("=" * 70)
    print(f"API URL: {API_URL}")
    print(f"Device ID: {DEVICE_ID}")
    print(f"Update Interval: {UPDATE_INTERVAL}s")
    print(f"API Send Interval: {API_SEND_INTERVAL}s")
    print("Press Ctrl+C to stop")
    print("=" * 70)

    last_api = time.time()
    upload_count = 0

    try:
        while True:
            temp = get_temp()
            fan = get_fan_state()
            throttle_hex = get_throttled()
            freq = get_freq()

            now = time.time()
            next_api = max(0, API_SEND_INTERVAL - (now - last_api))

            # Display current metrics
            print(f"\rT={temp:.1f}°C | Fan={fan} | Freq={freq:.2f}GHz | Throttle={throttle_hex} | Next upload in {next_api:.0f}s", end="", flush=True)

            # Send to API at specified interval
            if now - last_api >= API_SEND_INTERVAL:
                data = {
                    "temperature": temp,
                    "fanState": fan,
                    "cpuFrequency": freq,
                    "throttleStatus": throttle_hex,
                    "deviceId": DEVICE_ID,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                success, result = send_to_api(data)
                if success:
                    upload_count += 1
                    print(f"\n✅ Upload #{upload_count} - Sent to API at {datetime.now().strftime('%I:%M:%S %p')}")
                    print(f"   Temperature: {temp:.1f}°C")
                    print(f"   Status: {', '.join(decode_throttle(throttle_hex))}")
                
                last_api = now

            time.sleep(UPDATE_INTERVAL)

    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("🛑 Health monitor stopped by user")
        print(f"Total uploads: {upload_count}")
        print("=" * 70)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
