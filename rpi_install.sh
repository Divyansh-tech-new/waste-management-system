#!/bin/bash
# Raspberry Pi Health Monitor - Installation Script
# Run this on your Raspberry Pi to set everything up

set -e

echo "======================================================================"
echo "🔧 Raspberry Pi Health Monitor - Installation Script"
echo "======================================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Installation directory
INSTALL_DIR="$HOME/health-monitor"

echo ""
echo -e "${YELLOW}Step 1: Installing Python dependencies...${NC}"
sudo apt update
sudo apt install -y python3-pip

echo ""
echo -e "${YELLOW}Step 2: Installing Python packages...${NC}"
pip3 install requests python-dotenv

echo ""
echo -e "${YELLOW}Step 3: Creating installation directory...${NC}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo ""
echo -e "${YELLOW}Step 4: Downloading health monitor script...${NC}"

# Create the health_watch_api.py file
cat > health_watch_api.py << 'SCRIPT_EOF'
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
SCRIPT_EOF

chmod +x health_watch_api.py

echo ""
echo -e "${YELLOW}Step 5: Creating environment configuration...${NC}"

# Prompt for API URL
echo ""
echo -e "${GREEN}Please enter your backend API URL:${NC}"
echo "Examples:"
echo "  - http://localhost:5000 (if backend is on this Pi)"
echo "  - http://192.168.1.100:5000 (if backend is on another computer)"
echo "  - https://your-backend.vercel.app (if deployed to cloud)"
echo ""
read -p "API URL: " api_url

# Prompt for device ID
echo ""
read -p "Device ID (default: rpi-main): " device_id
device_id=${device_id:-rpi-main}

# Create .env file
cat > .env << ENV_EOF
API_URL=$api_url
RPI_DEVICE_ID=$device_id
RPI_UPDATE_INTERVAL=5
RPI_API_SEND_INTERVAL=600
ENV_EOF

echo ""
echo -e "${GREEN}✅ Environment file created!${NC}"

echo ""
echo -e "${YELLOW}Step 6: Testing the health monitor...${NC}"
echo "Running a quick test (will stop after 10 seconds)..."
timeout 10 python3 health_watch_api.py || true

echo ""
echo ""
echo "======================================================================"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "======================================================================"
echo ""
echo "📁 Installation directory: $INSTALL_DIR"
echo ""
echo "🚀 To run manually:"
echo "   cd $INSTALL_DIR"
echo "   python3 health_watch_api.py"
echo ""
echo "🔄 To run as a service (auto-start on boot):"
echo "   sudo bash $INSTALL_DIR/install_service.sh"
echo ""
echo "⚙️  Configuration file: $INSTALL_DIR/.env"
echo ""
echo "======================================================================"

# Create service installer script
cat > install_service.sh << 'SERVICE_EOF'
#!/bin/bash
# Install health monitor as a systemd service

INSTALL_DIR="$HOME/health-monitor"

echo "Creating systemd service..."

sudo tee /etc/systemd/system/health-monitor.service > /dev/null << EOF
[Unit]
Description=Raspberry Pi Health Monitor
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/python3 $INSTALL_DIR/health_watch_api.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable health-monitor.service
sudo systemctl start health-monitor.service

echo ""
echo "✅ Service installed!"
echo ""
echo "Check status: sudo systemctl status health-monitor.service"
echo "View logs:    sudo journalctl -u health-monitor.service -f"
echo "Stop:         sudo systemctl stop health-monitor.service"
echo "Disable:      sudo systemctl disable health-monitor.service"
SERVICE_EOF

chmod +x install_service.sh

echo ""
echo -e "${YELLOW}Service installer created: $INSTALL_DIR/install_service.sh${NC}"
