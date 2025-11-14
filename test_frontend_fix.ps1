#!/usr/bin/env pwsh
# Frontend Update Fix - Automated Testing Script

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🔧 Frontend Update Fix - Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health
Write-Host "Test 1: Checking Backend Server..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -UseBasicParsing
    Write-Host "✅ Backend is RUNNING" -ForegroundColor Green
    Write-Host "   Timestamp: $($healthResponse.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Please start backend: cd waste-segregator-backend; npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Camera Feed API
Write-Host "Test 2: Checking Camera Feed API..." -ForegroundColor Yellow
try {
    $cameraResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/camera-feed/latest" -UseBasicParsing
    if ($cameraResponse.success) {
        Write-Host "✅ Camera Feed API is WORKING" -ForegroundColor Green
        Write-Host "   Location: $($cameraResponse.data.location)" -ForegroundColor Gray
        Write-Host "   Category: $($cameraResponse.data.predictedCategory)" -ForegroundColor Gray
        Write-Host "   Confidence: $($cameraResponse.data.confidence)%" -ForegroundColor Gray
        Write-Host "   Image URL: $($cameraResponse.data.imageUrl.Substring(0, [Math]::Min(50, $cameraResponse.data.imageUrl.Length)))..." -ForegroundColor Gray
        Write-Host "   Is Live: $($cameraResponse.data.isLive)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Camera Feed API returned success=false" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "⚠️  No camera feed data available (404)" -ForegroundColor Yellow
        Write-Host "   Run: python camera_feed_uploader.py" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Camera Feed API Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: RPI Health API
Write-Host "Test 3: Checking RPI Health API..." -ForegroundColor Yellow
try {
    $healthDataResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/rpi-health/latest" -UseBasicParsing
    if ($healthDataResponse.success) {
        Write-Host "✅ RPI Health API is WORKING" -ForegroundColor Green
        Write-Host "   Temperature: $($healthDataResponse.data.temperature)°C" -ForegroundColor Gray
        Write-Host "   CPU Frequency: $($healthDataResponse.data.cpuFrequency) GHz" -ForegroundColor Gray
        Write-Host "   Fan State: $($healthDataResponse.data.fanState)" -ForegroundColor Gray
        Write-Host "   Throttle Status: $($healthDataResponse.data.throttleStatus)" -ForegroundColor Gray
        Write-Host "   Device ID: $($healthDataResponse.data.deviceId)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  RPI Health API returned success=false" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "⚠️  No RPI health data available (404)" -ForegroundColor Yellow
        Write-Host "   Run: python health_watch_api.py" -ForegroundColor Yellow
    } else {
        Write-Host "❌ RPI Health API Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Frontend Port
Write-Host "Test 4: Checking Frontend Server..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Frontend is RUNNING on port 3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not responding on port 3000" -ForegroundColor Yellow
    Write-Host "   Please start frontend: cd frontend; npm start" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: CORS Configuration
Write-Host "Test 5: Checking CORS Configuration..." -ForegroundColor Yellow
$envPath = "D:\wastemain210DS\waste-segregator-backend\.env"
if (Test-Path $envPath) {
    $corsConfig = Get-Content $envPath | Select-String "FRONTEND_URL"
    if ($corsConfig) {
        Write-Host "✅ CORS configured: $corsConfig" -ForegroundColor Green
    } else {
        Write-Host "⚠️  FRONTEND_URL not set in .env" -ForegroundColor Yellow
        Write-Host "   Add to .env: FRONTEND_URL=http://localhost:3000" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .env file not found in backend" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📊 DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ = Working correctly" -ForegroundColor Green
Write-Host "⚠️  = Needs attention" -ForegroundColor Yellow
Write-Host "❌ = Critical issue" -ForegroundColor Red
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. If backend APIs are working but frontend not updating:" -ForegroundColor White
Write-Host "   → Hard refresh browser (Ctrl + F5)" -ForegroundColor Yellow
Write-Host "   → Clear browser cache (Ctrl + Shift + Delete)" -ForegroundColor Yellow
Write-Host "   → Check browser console (F12) for errors" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. If camera feed returns 404:" -ForegroundColor White
Write-Host "   → Run: python camera_feed_uploader.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. If RPI health returns 404:" -ForegroundColor White
Write-Host "   → Run: python health_watch_api.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Open browser and check:" -ForegroundColor White
Write-Host "   → http://localhost:3000 (Dashboard)" -ForegroundColor Yellow
Write-Host "   → Press F12 → Console tab (check for errors)" -ForegroundColor Yellow
Write-Host "   → Press F12 → Network tab (check API calls)" -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
