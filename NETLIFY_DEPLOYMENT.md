# CodeShareit - Netlify Deployment Guide

This site is now configured for deployment on Netlify. Follow these steps to deploy:

## Deployment Steps

### 1. Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Select this repository

### 2. Configure Build Settings
Netlify should auto-detect these settings:
- **Base directory**: (leave empty)
- **Build command**: (leave empty - static site)
- **Publish directory**: `.` (root directory)

### 3. Set Environment Variables (Optional but Recommended)
For better security, move your Supabase credentials to environment variables:

1. Go to your site dashboard → Site settings → Environment variables
2. Add these variables:
   - `SUPABASE_URL`: `https://teivymfqoldtsuelrjfe.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXZ5bWZxb2xkdHN1ZWxyamZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzM1ODQsImV4cCI6MjA3NTcwOTU4NH0.OVyIOXnctDIIhhNXXt-GIonw-ch2V3H1lgkHGC5USVk`

3. Update `config.js` to use environment variables:
```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://teivymfqoldtsuelrjfe.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-fallback-key';
```

## Features Configured for Netlify

✅ **SPA Routing Support** - All routes redirect to `index.html` for client-side routing
✅ **Admin Panel Support** - Admin routes properly configured
✅ **Security Headers** - XSS protection, frame options, content type protection
✅ **Static Asset Caching** - CSS files cached for better performance
✅ **404 Handling** - Custom 404 page for offline site status

## Site Structure

```
/                    # Main site (index.html)
/admin/             # Admin panel
/404.html           # Offline page
_redirects          # SPA routing rules
_headers           # Security and caching headers
netlify.toml       # Netlify configuration
.gitignore         # Deployment exclusions
```

## Troubleshooting

### Admin Panel Not Loading
- Ensure admin credentials are set up in your Supabase database
- Check browser console for any CORS or authentication errors

### Code Sharing Not Working
- Verify Supabase credentials are correct
- Check that the `code_snippets` and `admin_settings` tables exist in your Supabase project

### Site Shows 404 Page
- The site redirects to 404.html when `site_offline` is true in admin settings
- Check your admin panel to toggle site status

## Post-Deployment Checklist

- [ ] Site loads correctly at your Netlify URL
- [ ] Code sharing functionality works
- [ ] Admin panel is accessible at `/admin/`
- [ ] All routes work properly (SPA routing)
- [ ] Security headers are applied
- [ ] Static assets are cached properly

## Support

If you encounter issues:
1. Check the Netlify function logs in your dashboard
2. Verify environment variables are set correctly
3. Ensure your Supabase project is active and accessible
4. Check browser developer tools for console errors
