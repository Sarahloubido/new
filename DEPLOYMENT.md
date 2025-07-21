# 🚀 Deploying to Vercel

This guide will help you deploy the Prototype Text Review Tool to Vercel.

## 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Git repository with your code
3. [Vercel CLI](https://vercel.com/cli) (optional but recommended)

## 🛠️ Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your git repository
   - Vercel will automatically detect the project settings

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`

4. **Set Environment Variables** (Optional)
   - Add any environment variables in the Vercel dashboard
   - Example: `NODE_ENV=production`

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**
   - Vercel will ask about project settings
   - Use the defaults or customize as needed

## ⚙️ Configuration Details

The project includes the following Vercel configuration files:

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ]
}
```

### Build Scripts
- `npm run vercel-build`: Builds the client for production
- The server runs as a serverless function

## 🌐 After Deployment

1. **Update CORS settings**
   - Edit `server/index.js`
   - Replace `'https://your-vercel-app.vercel.app'` with your actual Vercel URL

2. **Test the deployment**
   - Visit your Vercel URL
   - Try the demo data functionality
   - Test Figma integration with a real access token

3. **Set up custom domain** (Optional)
   - In Vercel dashboard, go to your project
   - Navigate to "Domains" tab
   - Add your custom domain

## 🔧 Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Routes Not Working
- Ensure routes start with `/api/`
- Check server function logs in Vercel dashboard
- Verify environment variables are set

### Frontend Not Loading
- Check if build output directory is correct (`client/build`)
- Verify static files are being served correctly
- Check browser console for errors

### File Upload Issues
- Vercel has a 50MB request limit
- For larger files, consider using external storage (AWS S3, etc.)

## 📊 Environment Variables

Set these in your Vercel dashboard if needed:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `FIGMA_API_URL` | Figma API endpoint | `https://api.figma.com/v1` |

## 🚨 Important Notes

1. **Serverless Functions**: The server runs as serverless functions with execution time limits
2. **File Storage**: Uploads are temporary in serverless environments
3. **Environment**: Update CORS settings with your actual Vercel URL
4. **Monitoring**: Use Vercel's analytics and function logs for monitoring

## 🎉 Success!

Once deployed, your app will be available at:
- `https://your-project-name.vercel.app`
- Custom domain (if configured)

The app includes:
- ✅ Figma text extraction
- ✅ Spreadsheet generation (CSV/Excel)
- ✅ File upload and processing
- ✅ Demo mode for testing
- ✅ Modern responsive UI

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Figma API Documentation](https://www.figma.com/developers/api)