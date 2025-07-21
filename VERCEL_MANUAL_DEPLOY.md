# 🚀 Manual Vercel Deployment (Dashboard Method)

## The Problem
Vercel is having trouble finding the `vercel-build` script due to the monorepo structure. Let's fix this with manual dashboard configuration.

## ✅ Solution: Manual Dashboard Setup

### Step 1: Push Your Code
```bash
git add .
git commit -m "Ready for manual Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" next to your repository
3. **DO NOT click Deploy yet!**

### Step 3: Manual Build Configuration
In the "Configure Project" section, set these **EXACT** values:

**Framework Preset:** `Other`

**Root Directory:** `./` (leave as default)

**Build Settings:**
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/build`
- **Install Command:** `npm install`

**Environment Variables:** (Optional)
- Add any environment variables if needed

### Step 4: Deploy
Now click "Deploy" and wait!

## 🔧 Alternative: CLI Method

If dashboard method fails, try CLI:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy with Manual Config**
   ```bash
   vercel --build-env VERCEL_BUILD_COMMAND="cd client && npm install && npm run build"
   ```

## 🎯 Expected Result

After deployment:
- Frontend: Your Vercel URL serves the React app
- API: `your-app.vercel.app/api/*` serves the backend functions
- Demo mode should work immediately
- Figma integration needs access token

## 🛠️ If Still Failing

Try this simpler approach:

1. **Create separate client deployment:**
   - Deploy only the `client` folder as a separate Vercel project
   - Use standard React build settings

2. **Deploy API separately:**
   - Create a new project for just the `api` folder
   - Set build command to `echo "No build needed"`

3. **Update CORS:**
   - Point the client to the API URL

## 📊 Test After Deployment

1. Visit your deployed URL
2. Click "Load Demo Data" 
3. Download a spreadsheet
4. Upload it back
5. Verify the workflow works

---

**The key is using the manual dashboard configuration with the exact build command shown above!**