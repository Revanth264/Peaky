# Firebase Setup Guide for Peakime Store

This guide will help you configure Firebase Admin SDK and Phone Authentication with reCAPTCHA v2.

## 🔥 Firebase Admin SDK Setup

### Step 1: Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ > **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

### Step 2: Extract Credentials

Open the downloaded JSON file and extract these values:

```json
{
  "project_id": "your-project-id",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour\nMulti\nLine\nKey\n-----END PRIVATE KEY-----\n"
}
```

### Step 3: Add to Environment Variables

Create a `.env.local` file in your project root:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMulti\nLine\nKey\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the private key as a single line with `\n` for newlines
- Wrap the entire private key in double quotes
- The code automatically handles converting `\\n` to actual newlines

### Step 4: Verify Setup

Restart your dev server:

```bash
npm run dev
```

Check the console for: `✅ Firebase Admin initialized successfully`

---

## 📱 Phone Authentication Setup

### Step 1: Enable Phone Authentication

1. Go to Firebase Console > **Authentication**
2. Click **Sign-in method** tab
3. Enable **Phone** provider
4. Click **Save**

### Step 2: Configure reCAPTCHA v2 (IMPORTANT)

**DO NOT** manually add site keys or load `api.js` - Firebase handles this automatically!

The reCAPTCHA v2 is configured automatically by Firebase when you enable Phone Authentication.

### Step 3: Add Authorized Domains

1. Go to Firebase Console > **Authentication** > **Settings** tab
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost` (for local development)
   - `127.0.0.1` (for local development)
   - `your-project-id.web.app` (Firebase Hosting)
   - `your-project-id.firebaseapp.com` (Firebase Hosting)
   - Your production domain (e.g., `peakime.com`)

### Step 4: Content Security Policy (CSP)

If you use CSP headers, allow these domains:

```
Content-Security-Policy:
  script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  frame-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  img-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ data:;
  connect-src 'self' https://identitytoolkit.googleapis.com/ https://www.googleapis.com/;
```

For Next.js, add to `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; frame-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; img-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ data:; connect-src 'self' https://identitytoolkit.googleapis.com/ https://www.googleapis.com/;"
          }
        ]
      }
    ]
  }
}
```

---

## 🐛 Debugging Phone Authentication

### Enable Debug Mode

Set this in your `.env.local`:

```bash
NEXT_PUBLIC_DEBUG_RECAPTCHA=true
```

This makes the reCAPTCHA checkbox visible so you can verify it's loading correctly.

### Use Test Phone Numbers

To avoid rate limits during development:

1. Go to Firebase Console > **Authentication** > **Sign-in method** > **Phone**
2. Scroll to **Phone numbers for testing**
3. Add test numbers with their OTP codes:
   - Phone: `+1 555 123 4567`
   - Code: `123456`

### Check Network Calls

Open DevTools > **Network** tab and verify you see:

1. **reCAPTCHA Loading:**
   - `www.google.com/recaptcha/` (script)
   - `www.gstatic.com/recaptcha/` (assets)

2. **OTP Request:**
   - `identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode` (should return `200`)

### Common Errors

#### ❌ "Firebase Admin Auth not initialized"
**Solution:** Check your `.env.local` has all three Admin SDK variables set correctly. Restart your dev server.

#### ❌ "auth/invalid-app-credential"
**Solution:** This means reCAPTCHA token is missing/invalid. Causes:
- reCAPTCHA widget not fully loaded (check Network tab)
- Ad blockers or extensions blocking Google domains
- Missing authorized domains in Firebase Console
- CSP headers blocking reCAPTCHA

**Fix:**
1. Hard refresh (Ctrl/Cmd + Shift + R)
2. Test in Incognito mode with extensions disabled
3. Verify authorized domains include your current domain
4. Check CSP headers allow `google.com/recaptcha` and `gstatic.com/recaptcha`

#### ❌ "auth/too-many-requests"
**Solution:** You've hit Firebase's rate limit. 
- Use test phone numbers during development
- Wait 3 minutes (our UI now shows a countdown)
- Check Firebase Console > **Authentication** > **Usage** for quota limits

#### ❌ "Timeout"
**Solution:** The reCAPTCHA widget didn't load in 30 seconds.
- Check your internet connection
- Verify no firewall/proxy blocking Google domains
- Ensure CSP allows reCAPTCHA domains
- Check browser console for blocked requests

---

## ✅ Quick Self-Test Checklist

- [ ] Firebase Admin SDK initialized (check console for ✅)
- [ ] Phone authentication enabled in Firebase Console
- [ ] Authorized domains include `localhost` and your domains
- [ ] No manual site keys or `api.js` scripts in code
- [ ] CSP headers allow reCAPTCHA domains (if using CSP)
- [ ] Test in Incognito mode (no extensions)
- [ ] Network tab shows reCAPTCHA scripts loading
- [ ] Using test phone numbers for development
- [ ] `/api/auth/create-profile` returns 200 after sign-in

---

## 🚀 Deployment

### Vercel / Netlify / Other Hosts

Add these environment variables in your hosting dashboard:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour\nMulti\nLine\nKey\n-----END PRIVATE KEY-----\n
```

**Note:** Most hosting platforms automatically escape newlines. If OTP works locally but not in production, try pasting the private key exactly as it appears in the JSON file (with actual newlines).

### Add Production Domain

Don't forget to add your production domain to **Authorized domains** in Firebase Console!

---

## 📞 Support

If you're still having issues:

1. Check the browser console for specific error codes
2. Verify all steps in this guide
3. Test with a different browser/device
4. Check Firebase Console > **Authentication** > **Users** to see if sign-ins are being recorded

Good luck! 🎉


