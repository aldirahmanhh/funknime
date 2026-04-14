# Fix: Vercel 404 NOT_FOUND on Page Refresh

## 🐛 Problem

When deployed to Vercel, refreshing the page or opening a direct link (e.g., `/watch/episode-1`) returns a 404 error:

```
404: NOT_FOUND
Code: `NOT_FOUND`
ID: `sin1::wmmct-1776153081684-89c7944feb38`
```

## 🔍 Root Cause

This is a common issue with Single Page Applications (SPAs) like React:

1. **Client-side routing**: React Router handles routing in the browser
2. **Server-side routing**: Vercel tries to find a physical file for the URL
3. **Mismatch**: When you refresh `/watch/episode-1`, Vercel looks for a file at that path
4. **Result**: No file exists → 404 error

## ✅ Solution

Configure Vercel to redirect all requests to `index.html`, allowing React Router to handle routing.

### 1. vercel.json (Primary Solution)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**What it does**:
- Rewrites all routes to `/index.html`
- Adds cache headers for assets (1 year)
- Adds security headers

### 2. public/_redirects (Fallback)

```
/*    /index.html   200
```

**What it does**:
- Netlify-style redirects (Vercel also supports this)
- Fallback if vercel.json doesn't work

### 3. vite.config.js (Development)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
})
```

**What it does**:
- Enables history fallback in dev server
- Enables history fallback in preview mode

## 📝 How It Works

### Before (Broken)
```
User visits: /watch/episode-1
↓
Vercel looks for: /watch/episode-1.html
↓
File not found
↓
404 Error
```

### After (Fixed)
```
User visits: /watch/episode-1
↓
Vercel rewrites to: /index.html
↓
React app loads
↓
React Router handles /watch/episode-1
↓
Correct page renders ✅
```

## 🧪 Testing

### Test Cases

1. **Direct URL Access**
   - Visit: `https://funknime.vercel.app/watch/episode-1`
   - Expected: Episode page loads correctly

2. **Page Refresh**
   - Navigate to any page
   - Press F5 or refresh button
   - Expected: Page reloads correctly (no 404)

3. **Browser Back/Forward**
   - Navigate between pages
   - Use browser back/forward buttons
   - Expected: Navigation works smoothly

4. **Deep Links**
   - Share a link: `https://funknime.vercel.app/anime/naruto`
   - Open in new tab
   - Expected: Anime detail page loads

5. **Assets Loading**
   - Check CSS/JS files load
   - Check images load
   - Expected: All assets load with proper caching

## 🔒 Security Headers

Added security headers to protect against common attacks:

### X-Content-Type-Options: nosniff
- Prevents MIME type sniffing
- Protects against XSS attacks

### X-Frame-Options: DENY
- Prevents clickjacking attacks
- Blocks embedding in iframes

### X-XSS-Protection: 1; mode=block
- Enables browser XSS filter
- Blocks page if XSS detected

### Cache-Control for Assets
- 1 year cache for static assets
- Immutable flag for better performance

## 📊 Performance Impact

### Before
- ❌ 404 errors on refresh
- ❌ Poor user experience
- ❌ Broken deep links

### After
- ✅ All routes work correctly
- ✅ Assets cached for 1 year
- ✅ Security headers added
- ✅ Better SEO (no 404s)

## 🚀 Deployment

### Automatic Deployment
1. Push changes to GitHub
2. Vercel auto-deploys
3. Changes take effect immediately

### Manual Deployment
```bash
# Build locally
npm run build

# Deploy to Vercel
vercel --prod
```

## 🔍 Debugging

If issues persist:

### 1. Check Vercel Logs
```bash
vercel logs
```

### 2. Check Build Output
```bash
npm run build
# Check dist/ folder
```

### 3. Test Locally
```bash
npm run preview
# Visit http://localhost:4173
```

### 4. Verify vercel.json
- Must be in project root
- Must be valid JSON
- Check for syntax errors

## 📱 Mobile Testing

Test on mobile browsers:

### Android Chrome
1. Open app
2. Navigate to episode
3. Switch to another app
4. Return to browser
5. Expected: Page still loaded (no 404)

### iOS Safari
1. Open app
2. Navigate to episode
3. Close tab
4. Reopen from history
5. Expected: Page loads correctly

## 🎯 Common Issues

### Issue 1: Still Getting 404
**Solution**: Clear Vercel cache
```bash
vercel --prod --force
```

### Issue 2: Assets Not Loading
**Solution**: Check asset paths are relative
```javascript
// ✅ Good
<img src="/logo.png" />

// ❌ Bad
<img src="logo.png" />
```

### Issue 3: Routing Not Working
**Solution**: Ensure BrowserRouter is used
```javascript
// ✅ Good
<BrowserRouter>
  <App />
</BrowserRouter>

// ❌ Bad (for Vercel)
<HashRouter>
  <App />
</HashRouter>
```

## 📚 Additional Resources

- [Vercel SPA Routing](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deployment)
- [Vite Static Deploy](https://vitejs.dev/guide/static-deploy.html)

## ✅ Checklist

- [x] Add vercel.json with rewrites
- [x] Add public/_redirects fallback
- [x] Update vite.config.js
- [x] Add security headers
- [x] Add cache headers for assets
- [x] Test build locally
- [x] Deploy to Vercel
- [x] Test all routes
- [x] Test page refresh
- [x] Test deep links
- [x] Test mobile browsers

## 🎉 Result

**Before**:
- ❌ 404 on refresh
- ❌ Broken deep links
- ❌ Poor UX

**After**:
- ✅ All routes work
- ✅ Refresh works correctly
- ✅ Deep links work
- ✅ Better security
- ✅ Better performance
- ✅ Better UX

Problem solved! 🚀
