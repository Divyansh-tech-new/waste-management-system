#!/usr/bin/env python3
"""
Camera Feed Uploader for Waste Management System
Captures images and uploads them to the backend with AI predictions
"""

import os
import time
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_URL = os.getenv('API_URL', 'http://localhost:5000')
CAMERA_FEED_ENDPOINT = f'{API_URL}/api/camera-feed/upload'
IMAGE_PATH = os.getenv('CAMERA_IMAGE_PATH', 'D:/wastemain210DS/download.webp')
LOCATION = os.getenv('CAMERA_LOCATION', 'Main Collection Point - IIT Mandi')
DEVICE_ID = os.getenv('CAMERA_DEVICE_ID', 'camera-main')
UPLOAD_INTERVAL = int(os.getenv('CAMERA_UPLOAD_INTERVAL', '30'))  # seconds

# Mock AI prediction function (replace with actual AI model)
def predict_waste_category(image_path):
    """
    Simulated AI prediction for waste category
    Replace this with your actual AI model integration
    """
    import random
    
    categories = ['metal', 'biodegradable', 'non-biodegradable', 'plastic']
    predicted_category = random.choice(categories)
    confidence = round(random.uniform(75.0, 98.0), 2)
    
    return predicted_category, confidence

def upload_camera_feed(image_path):
    """
    Upload camera feed image to backend
    """
    try:
        # Check if image exists
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return False
        
        # Get AI prediction
        predicted_category, confidence = predict_waste_category(image_path)
        
        # Prepare the file for upload
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {
                'location': LOCATION,
                'predictedCategory': predicted_category,
                'confidence': confidence,
                'deviceId': DEVICE_ID
            }
            
            # Upload to backend
            response = requests.post(
                CAMERA_FEED_ENDPOINT,
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"✅ Image uploaded successfully at {datetime.now().strftime('%I:%M:%S %p')}")
                print(f"   Location: {LOCATION}")
                print(f"   Predicted: {predicted_category} ({confidence}% confidence)")
                print(f"   Image URL: {result['data']['imageUrl']}")
                return True
            else:
                print(f"❌ Upload failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Cannot connect to {API_URL}")
        print("   Make sure the backend server is running")
        return False
    except Exception as e:
        print(f"❌ Error uploading image: {e}")
        return False

def main():
    print("=" * 70)
    print("📷 Camera Feed Uploader - Waste Management System")
    print("=" * 70)
    print(f"API URL: {API_URL}")
    print(f"Location: {LOCATION}")
    print(f"Device ID: {DEVICE_ID}")
    print(f"Upload Interval: {UPLOAD_INTERVAL} seconds")
    print(f"Image Path: {IMAGE_PATH}")
    print("Press Ctrl+C to stop")
    print("=" * 70)
    
    # Upload immediately on start
    print("\n🔄 Uploading initial image...")
    upload_camera_feed(IMAGE_PATH)
    
    # Continuous upload loop
    upload_count = 1
    try:
        while True:
            time.sleep(UPLOAD_INTERVAL)
            upload_count += 1
            print(f"\n🔄 Upload #{upload_count} - {datetime.now().strftime('%I:%M:%S %p')}")
            upload_camera_feed(IMAGE_PATH)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("🛑 Camera feed uploader stopped by user")
        print(f"Total uploads: {upload_count}")
        print("=" * 70)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
