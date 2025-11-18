# Quick Deployment Guide

## ✅ Your App Will Have Permanent URLs!

Once deployed, you'll get:
- **Frontend**: `https://your-app-name.vercel.app` (stays forever)
- **Backend**: `https://your-backend.onrender.com` (stays forever)

You can update code anytime, and it will auto-deploy to the same URLs!

---

## 🚀 Step 1: Deploy Backend (Render - Free)

### Option A: Using Render (Recommended)

1. **Go to**: https://render.com
2. **Sign up/Login** with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. **Configure**:
   - **Name**: `waste-backend` (or any name)
   - **Root Directory**: `waste-segregator-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://divyansh4078233:Mayanegi@cluster0.spb1r.mongodb.net/waste-management
   JWT_SECRET=negiNegi336911#4$1as
   JWT_ACCESS_SECRET=3pFZ9K7rUwD1sLqE8yJbV0nGxHtQzRcM2aNdWfXiP4oT
   JWT_REFRESH_SECRET=X1uQ9mWzV0rK5nF8bJcE7tH2yL6pS3gT4oAqN9vR5dUjY
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   IOT_API_KEY=test-api-key-123
   CLOUDINARY_CLOUD_NAME=deqzetctp
   CLOUDINARY_API_KEY=251755738777254
   CLOUDINARY_API_SECRET=he5zK0UWxWNA2sCQr1J0RK5P3pM
   ADMIN_EMAIL_1=b24122@students.iitmandi.ac.in
   ADMIN_PASSWORD_1=gadhaa1136@gmail.com
   ADMIN_EMAIL_2=b24489@students.iitmandi.ac.in
   ADMIN_PASSWORD_2=gadhii436@gmail.com
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   *(You'll update FRONTEND_URL after deploying frontend)*

7. Click **"Create Web Service"**
8. **Copy your backend URL**: `https://waste-backend-xxxx.onrender.com`

---

## 🎨 Step 2: Deploy Frontend (Vercel - Free)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. Click **"Add New Project"**
4. **Import** your GitHub repository
5. **Configure**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

6. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`
   - (Use the URL from Step 1)

7. Click **"Deploy"**
8. **Copy your frontend URL**: `https://your-app.vercel.app`

---

## 🔄 Step 3: Update CORS (Important!)

1. Go back to **Render Dashboard**
2. Open your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`
5. The service will auto-redeploy

---

## ✨ Done! Your App is Live!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Already on MongoDB Atlas ✅

---

## 🔄 How to Update Your App (Auto-Deploy)

### After deployment, any changes you push to GitHub will automatically deploy!

**To update:**
```bash
git add .
git commit -m "Updated feature"
git push
```

- Vercel will auto-deploy frontend changes
- Render will auto-deploy backend changes
- **Same URLs, updated code!** 🎉

---

## 📱 Alternative: Deploy Backend to Railway

1. **Go to**: https://railway.app
2. **Login** with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. **Configure**:
   - **Root Directory**: `/waste-segregator-backend`
   - Add all environment variables (same as Render)
6. Click **"Deploy"**
7. Get your URL: `https://your-backend.up.railway.app`

---

## 🔒 Security Tips for Production

1. **Change all secrets** in .env (JWT secrets, passwords)
2. **Update CORS** to only allow your frontend domain
3. **Enable rate limiting** (already configured in your app)
4. **Monitor logs** in Render/Railway dashboard

---

## 💡 Common Issues

### Backend Won't Start
- Check environment variables are set correctly
- Verify MongoDB URI is correct
- Check Render logs: Dashboard → Logs

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- No trailing slash in URLs

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` is set in Vercel
- Redeploy frontend after changing env vars

---

## 📊 Free Tier Limits

**Render**: 
- Free tier sleeps after 15 min of inactivity
- First request may take 30s to wake up
- 750 hours/month free

**Vercel**: 
- 100GB bandwidth/month
- Unlimited projects
- Instant cold starts

**MongoDB Atlas**: 
- 512MB storage
- Perfect for this project

---

## 🎯 Next Steps After Deployment

1. Test all features on live site
2. Set up custom domain (optional)
3. Enable analytics in Vercel
4. Monitor backend performance in Render
5. Set up error tracking (Sentry, etc.)

---

**Need help?** Check deployment logs in Render/Vercel dashboard!
