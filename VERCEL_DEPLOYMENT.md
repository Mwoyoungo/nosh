# Nosh Web App - Vercel Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/Mwoyoungo/nosh.git
- Vercel account (sign up at https://vercel.com)

## Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **GitHub** and authorize Vercel to access your repositories
4. Find and select: `Mwoyoungo/nosh`
5. Click **"Import"**

## Step 2: Configure Project Settings

### Framework Preset
- **Framework:** Vite
- **Root Directory:** `./` (leave as is)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Environment Variables

#### Option A: Import from File (Recommended)
1. In your local project, find the file: `.env.vercel`
2. Copy all contents of `.env.vercel`
3. In Vercel Dashboard, go to: **Settings > Environment Variables**
4. Click **"Add Variable"** or **"Import"**
5. Paste the contents and click **"Import"**

#### Option B: Manual Entry
Add these environment variables in Vercel Dashboard:

```env
VITE_FIREBASE_API_KEY=AIzaSyARRNQjqhF8fCGwjnpyNcjfWgF36Fq_V6I
VITE_FIREBASE_AUTH_DOMAIN=nosh-cb104.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nosh-cb104
VITE_FIREBASE_STORAGE_BUCKET=nosh-cb104.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=997612409371
VITE_FIREBASE_APP_ID=1:997612409371:web:855d3eac019c72eee69ebe
VITE_FIREBASE_MEASUREMENT_ID=G-PQZTV7JJQL
VITE_COMETCHAT_APP_ID=1671225b39e0f0374
VITE_COMETCHAT_REGION=us
VITE_COMETCHAT_AUTH_KEY=54fc2e49851b6730132953dca0a671a370186a98
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBvd_3RwclUj-do2WdckJtGziT5F88StLo
VITE_MAX_VIDEO_DURATION_SECONDS=45
VITE_DEFAULT_RADIUS_METERS=5000
```

**Important:** Set all variables to apply to **Production, Preview, and Development** environments.

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://nosh-xyz.vercel.app`

## Step 4: Configure Custom Domain (Optional)

1. Go to: **Settings > Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

## Step 5: Verify Deployment

Test these features on your deployed site:

### Authentication
- [ ] Sign up with email/password
- [ ] Login with existing account
- [ ] Logout

### Feed
- [ ] Videos load and play
- [ ] Category filtering (RENT, BUY, FOOD, SERVICES)
- [ ] Radius selector works
- [ ] Vertical scrolling with snap
- [ ] Auto-hide bottom nav on scroll

### Explore Map
- [ ] Map loads with Google Maps
- [ ] Drag map to different location
- [ ] Click "Search Here" button
- [ ] Switch to Feed - videos load from browsed location
- [ ] Browse location badge shows in Feed header
- [ ] Click X to return to GPS location

### Messaging
- [ ] Open Messages page
- [ ] Click message button from feed
- [ ] Send a message
- [ ] Messages appear in chat
- [ ] Chat scrolls properly

### Profile
- [ ] View own profile
- [ ] View other user's profile
- [ ] Video grid displays
- [ ] Message button on public profile

## Troubleshooting

### Build Errors

**Error: `Cannot find module '@/...'`**
- Check `vite.config.ts` has correct path alias configuration
- Ensure `tsconfig.json` includes path mappings

**Error: `VITE_* variables are undefined`**
- Verify all environment variables are set in Vercel Dashboard
- Redeploy after adding variables

### Runtime Errors

**Error: Firebase not initialized**
- Check Firebase environment variables are correct
- Verify Firebase project is active in Firebase Console

**Error: CometChat not initialized**
- Check CometChat environment variables
- Verify CometChat app is active in CometChat Dashboard

**Error: Google Maps not loading**
- Check `VITE_GOOGLE_MAPS_API_KEY` is correct
- Verify API key restrictions allow your Vercel domain
- Enable "Maps JavaScript API" in Google Cloud Console

**Error: Location permission denied**
- Browser must have location enabled
- Vercel domain must use HTTPS (automatic)

### Performance Issues

**Slow initial load**
- Check network throttling (should be fast on production build)
- Verify Vercel CDN is serving assets correctly

**Videos not playing**
- Check Firebase Storage CORS configuration
- Verify video URLs are accessible publicly

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git add . && git commit -m "Your message"`
3. Push: `git push origin main`
4. Vercel auto-deploys (takes ~2-3 minutes)

## Environment Management

### Adding New Variables

1. Add to `.env` locally
2. Add to `.env.example` (without values)
3. Add to Vercel Dashboard
4. Commit and push `.env.example` changes
5. Redeploy

### Updating Variables

1. Go to Vercel Dashboard: **Settings > Environment Variables**
2. Find the variable and click "Edit"
3. Update value and save
4. Click **"Redeploy"** to apply changes

## Security Notes

- ✅ `.env` is in `.gitignore` (secrets protected)
- ✅ `.env.vercel` is in `.gitignore` (not pushed to GitHub)
- ✅ Only `.env.example` is committed (no secrets)
- ⚠️ Keep `.env.vercel` file locally for easy re-import
- ⚠️ Never commit actual API keys to GitHub

## Support

For issues:
- **Vercel:** https://vercel.com/support
- **Firebase:** https://firebase.google.com/support
- **CometChat:** https://www.cometchat.com/support
- **Google Maps:** https://cloud.google.com/maps-platform/support

## Success! 🎉

Your Nosh web app is now live on Vercel with:
- Automatic HTTPS
- Global CDN
- Auto-scaling
- Zero-downtime deployments
- Preview deployments for every push

Access your app at: https://your-project.vercel.app
