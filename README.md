// =============================================================================
// .gitignore
// =============================================================================
node_modules/
.env
.env.local
.env.production
.vercel
*.log
.DS_Store
.vscode/
dist/
build/

// =============================================================================
// README.md
// =============================================================================
# YouTube Downloader

Full-stack YouTube downloader with modern UI and backend API.

## Features

- ✅ Analyze YouTube videos
- ✅ Download videos in multiple qualities
- ✅ Download audio-only files
- ✅ Progress tracking
- ✅ Error handling
- ✅ Responsive design

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Vercel Serverless Functions
- **Library**: ytdl-core
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd youtube-downloader
npm install
```

### 2. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` to test locally.

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## File Structure

```
youtube-downloader/
├── api/
│   ├── analyze.js          # Video analysis endpoint
│   ├── download-video.js   # Video download endpoint
│   └── download-audio.js   # Audio download endpoint
├── public/
│   └── index.html          # Frontend
├── package.json
├── vercel.json
└── README.md
```

## API Endpoints

### POST /api/analyze
Analyze YouTube video and get available qualities.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "videoInfo": {
    "title": "Video Title",
    "channel": "Channel Name",
    "duration": "5:32",
    "views": "1,234,567",
    "thumbnail": "https://...",
    "uploadDate": "2024-01-01"
  },
  "availableQualities": {
    "video": [...],
    "audio": [...]
  }
}
```

### POST /api/download-video
Download video file.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "quality": "720p"
}
```

**Response:** Binary file stream

### POST /api/download-audio
Download audio file.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "quality": "192kbps"
}
```

**Response:** Binary file stream

## Environment Variables

Optional environment variables for production:

```bash
# Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600000

# Analytics
ANALYTICS_KEY=your_analytics_key
```

## Limitations

- Vercel free tier has 10-second timeout for serverless functions
- Memory limit of 1GB on free tier
- Some videos may be blocked due to regional restrictions
- Respect YouTube's Terms of Service

## Legal Notice

This tool is for educational purposes only. Users are responsible for complying with YouTube's Terms of Service and applicable copyright laws.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

// =============================================================================
// .env.example
// =============================================================================
# Copy this file to .env.local and fill in your values

# Rate limiting (optional)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600000

# Analytics (optional)
ANALYTICS_KEY=your_analytics_key

# Environment
NODE_ENV=production

// =============================================================================
// package.json (Complete version)
// =============================================================================
{
  "name": "youtube-downloader",
  "version": "1.0.0",
  "description": "Full-stack YouTube downloader with modern UI",
  "main": "index.js",
  "scripts": {
    "dev": "vercel dev",
    "build": "echo 'No build step required for static site'",
    "start": "echo 'This is a serverless application'",
    "deploy": "vercel --prod",
    "test": "echo 'No tests specified'"
  },
  "dependencies": {
    "ytdl-core": "^4.11.5",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "vercel": "^32.0.0"
  },
  "keywords": [
    "youtube",
    "downloader",
    "vercel",
    "serverless",
    "nodejs",
    "ytdl"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/youtube-downloader"
  },
  "bugs": {
    "url": "https://github.com/yourusername/youtube-downloader/issues"
  },
  "homepage": "https://github.com/yourusername/youtube-downloader#readme"
}

// =============================================================================
// vercel.json (Enhanced version)
// =============================================================================
{
  "version": 2,
  "name": "youtube-downloader",
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "functions": {
    "api/analyze.js": {
      "maxDuration": 30,
      "memory": 1024
    },
    "api/download-video.js": {
      "maxDuration": 300,
      "memory": 1024
    },
    "api/download-audio.js": {
      "maxDuration": 300,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ]
}

// =============================================================================
// DEPLOYMENT INSTRUCTIONS
// =============================================================================

/*
STEP-BY-STEP DEPLOYMENT:

1. SETUP PROJECT
   mkdir youtube-downloader
   cd youtube-downloader
   npm init -y

2. CREATE FOLDER STRUCTURE
   mkdir api public
   
3. COPY FILES
   - Copy all API files to /api/
   - Copy index.html to /public/
   - Copy package.json, vercel.json, etc. to root

4. INSTALL DEPENDENCIES
   npm install ytdl-core cors

5. INSTALL VERCEL CLI
   npm install -g vercel

6. LOGIN TO VERCEL
   vercel login

7. DEPLOY
   vercel --prod

8. TESTING
   - Test all endpoints
   - Check error handling
   - Verify file downloads

IMPORTANT NOTES:
- Vercel free tier has limitations
- Consider upgrading for production use
- Monitor usage and performance
- Implement rate limiting for public deployment
- Add proper error logging
- Consider using CDN for large files

TROUBLESHOOTING:
- Check Vercel function logs
- Verify API endpoints are working
- Test CORS configuration
- Check file permissions
- Monitor memory usage
*/
