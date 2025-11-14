#!/usr/bin/env python3
"""
Integrated RPI Camera + AI Prediction + Upload to Backend
Combines Testing.py AI model with camera_feed_uploader.py
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import json
import time
import cv2
import numpy as np
import serial
import sys
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- CONFIGURATION ---
MODEL_WEIGHTS_PATH = "best_garbage_10class_balanced_aug.pth"
CLASS_MAP_PATH = "class_map_10class_balanced_aug.json"
NUM_CLASSES = 10
device = torch.device("cpu")

# API Configuration
API_URL = os.getenv('API_URL', 'http://localhost:5000')
CAMERA_FEED_ENDPOINT = f'{API_URL}/api/camera-feed/upload'
LOCATION = os.getenv('CAMERA_LOCATION', 'Main Collection Point - IIT Mandi')
DEVICE_ID = os.getenv('CAMERA_DEVICE_ID', 'rpi-camera-1')
UPLOAD_INTERVAL = int(os.getenv('CAMERA_UPLOAD_INTERVAL', '30'))

# ESP32 Configuration (optional)
ESP32_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200
ser = None

print("=" * 70)
print("🍓 RPI Camera + AI + Upload Integration")
print("=" * 70)
print(f"API URL: {API_URL}")
print(f"Location: {LOCATION}")
print(f"Device ID: {DEVICE_ID}")
print(f"Upload Interval: {UPLOAD_INTERVAL}s")
print("=" * 70)

# --- LOAD AI MODEL ---
try:
    print("\n📦 Loading AI Model...")
    
    # Load class mappings
    with open(CLASS_MAP_PATH, 'r') as f:
        class_to_idx = json.load(f)
    idxToClass = {v: k for k, v in class_to_idx.items()}
    print(f"✅ Loaded {len(idxToClass)}-class map")
    
    # Category mapping
    category_map = {
        'biological': 'biodegradable',
        'metal': 'metal',
        'battery': 'non-biodegradable',
        'cardboard': 'biodegradable',
        'clothes': 'non-biodegradable',
        'glass': 'non-biodegradable',
        'paper': 'biodegradable',
        'plastic': 'plastic',
        'shoes': 'non-biodegradable',
        'trash': 'non-biodegradable'
    }
    
    # Load model
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, NUM_CLASSES)
    stateDict = torch.load(MODEL_WEIGHTS_PATH, map_location=device)
    
    if isinstance(stateDict, dict) and not any(k.startswith('conv1') for k in stateDict.keys()):
        for k in ['state_dict', 'model_state_dict', 'net']:
            if k in stateDict:
                stateDict = stateDict[k]
                break
    
    model.load_state_dict(stateDict)
    model = model.to(device)
    model.eval()
    print("✅ AI Model loaded successfully")
    
except Exception as e:
    print(f"❌ ERROR loading AI model: {e}")
    sys.exit(1)

# --- IMAGE TRANSFORMS ---
imagenet_stats = {'mean': [0.485, 0.456, 0.406],
                  'std': [0.229, 0.224, 0.225]}
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(imagenet_stats['mean'], imagenet_stats['std'])
])

# --- ESP32 SERIAL (OPTIONAL) ---
try:
    ser = serial.Serial(ESP32_PORT, BAUD_RATE, timeout=1)
    print(f"✅ Connected to ESP32 on {ESP32_PORT}")
    time.sleep(2)
except Exception as e:
    print(f"⚠️  ESP32 not connected (running inference-only mode)")

def capture_and_predict():
    """
    Capture image from camera and run AI prediction
    """
    print("\n📷 Capturing image...")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("❌ Cannot open camera")
        return None, None, None, None
    
    # Capture frame
    for _ in range(5):  # Warm up camera
        ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Failed to capture frame")
        return None, None, None, None
    
    print("✅ Image captured")
    
    # Run AI inference
    print("🤖 Running AI prediction...")
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_frame)
    tensorImg = transform(pil_image).unsqueeze(0).to(device)
    
    start_time = time.time()
    with torch.no_grad():
        output = model(tensorImg)
        probs = torch.softmax(output[0], dim=0)
        top_idx = probs.argmax().item()
        confidence = probs[top_idx].item() * 100
    inference_time = (time.time() - start_time) * 1000
    
    specific_class = idxToClass.get(top_idx, f"class_{top_idx}")
    final_category = category_map.get(specific_class, "unknown")
    
    print(f"✅ Prediction: {final_category} ({confidence:.2f}%)")
    print(f"   Specific: {specific_class}")
    print(f"   Inference: {inference_time:.2f}ms")
    
    # Add label to image
    label_text = f"{final_category} ({confidence:.1f}%)"
    (w, h), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv2.rectangle(frame, (0, 0), (w + 20, h + 15), (0, 0, 0), -1)
    cv2.putText(frame, label_text, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
    
    # Save image
    output_filename = f"capture_{time.strftime('%Y%m%d_%H%M%S')}.jpg"
    cv2.imwrite(output_filename, frame)
    print(f"💾 Saved: {output_filename}")
    
    # Send to ESP32 if connected
    if ser:
        try:
            ser.write(f"{final_category}\n".encode('utf-8'))
            print(f"📡 Sent to ESP32: {final_category}")
        except Exception as e:
            print(f"⚠️  ESP32 send error: {e}")
    
    return output_filename, final_category, specific_class, confidence

def upload_to_backend(image_path, predicted_category, confidence):
    """
    Upload image to backend API
    """
    try:
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return False
        
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {
                'location': LOCATION,
                'predictedCategory': predicted_category,
                'confidence': confidence,
                'deviceId': DEVICE_ID
            }
            
            response = requests.post(
                CAMERA_FEED_ENDPOINT,
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"✅ Uploaded to backend")
                print(f"   URL: {result['data']['imageUrl']}")
                return True
            else:
                print(f"❌ Upload failed: {response.status_code}")
                return False
                
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {API_URL}")
        print("   Make sure backend is running on your PC")
        return False
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False

def main():
    """
    Main loop: capture, predict, upload
    """
    upload_count = 0
    
    try:
        while True:
            upload_count += 1
            print(f"\n{'='*70}")
            print(f"🔄 Cycle #{upload_count} - {datetime.now().strftime('%I:%M:%S %p')}")
            print('='*70)
            
            # Capture and predict
            image_path, category, specific, confidence = capture_and_predict()
            
            if image_path:
                # Upload to backend
                success = upload_to_backend(image_path, category, confidence)
                
                if success:
                    print(f"✅ Cycle completed successfully")
                    # Optionally delete local image after upload
                    # os.remove(image_path)
                else:
                    print(f"⚠️  Upload failed, image saved locally: {image_path}")
            else:
                print("❌ Capture/prediction failed")
            
            # Wait before next cycle
            print(f"\n⏳ Waiting {UPLOAD_INTERVAL} seconds...")
            time.sleep(UPLOAD_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("🛑 Stopped by user")
        print(f"Total uploads: {upload_count}")
        print("=" * 70)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    finally:
        if ser:
            ser.close()

if __name__ == "__main__":
    main()
