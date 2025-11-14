# Waste Management System

Full-stack waste management system with IoT integration, real-time monitoring, and AI-powered waste classification.

## 🚀 Quick Deploy

### Backend (Render)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

1. Click "Deploy to Render"
2. Connect GitHub repository
3. Set Root Directory: `waste-segregator-backend`
4. Add environment variables (see below)

### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click "Deploy with Vercel"
2. Connect GitHub repository
3. Set Root Directory: `frontend`
4. Add `REACT_APP_API_URL` environment variable

## 🔧 Environment Variables

### Backend (Render)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secret_key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-render-backend.onrender.com
```

## 📦 Tech Stack

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, TailwindCSS
- **Cloud**: Cloudinary (images), MongoDB Atlas (database)
- **Deployment**: Render (backend), Vercel (frontend)

## 🎯 Features

- Real-time waste bin monitoring
- AI-powered waste classification
- Camera feed integration
- Raspberry Pi health monitoring
- Admin dashboard
- Anomaly detection

## 📖 Full Documentation

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.
