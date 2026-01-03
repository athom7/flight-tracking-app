# Deployment Guide

## Netlify Deployment

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual Deployment Steps

1. **Connect Your Repository**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select this repository

2. **Build Settings** (Auto-configured via `netlify.toml`)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are already configured in `netlify.toml`

3. **Environment Variables** (Optional)
   - No environment variables required for basic deployment
   - API keys are entered by users in the app settings

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live in ~1 minute

### Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Continuous Deployment

Once connected, Netlify will automatically:
- Deploy when you push to your main branch
- Create deploy previews for pull requests
- Provide unique URLs for each deployment

### Build Configuration

The `netlify.toml` file includes:
- ✅ Build command and publish directory
- ✅ SPA redirect rules (for client-side routing)
- ✅ Security headers (X-Frame-Options, XSS-Protection, etc.)
- ✅ Cache headers for optimal performance

### Troubleshooting

**Build fails?**
- Ensure `package.json` dependencies are correct
- Check build logs in Netlify dashboard

**404 on refresh?**
- The redirect rule in `netlify.toml` handles this

**Slow loading?**
- Static assets are cached for 1 year (configured in headers)

### Features Enabled

- ✅ HTTPS (automatic)
- ✅ CDN (global distribution)
- ✅ Continuous deployment from Git
- ✅ Deploy previews for PRs
- ✅ Atomic deployments (zero downtime)
- ✅ Instant rollbacks
