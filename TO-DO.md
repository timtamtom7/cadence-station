# Cadence Station — Human To-Do

Things you need to do to ship this app.

---

## Firebase Setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Realtime Database** in your Firebase project
3. **Set database rules** (for development):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   For production, add proper authentication.
4. **Fill in Firebase config** in `src/firebase/config.js`:
   - `apiKey`
   - `authDomain`
   - `databaseURL`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## Ambient Sound Files

The current audio uses public freesound.org URLs. For production, replace these in `src/hooks/useAudio.js` with self-hosted MP3s (royalty-free sources like freesound.org or similar):

- Brown Noise
- White Noise
- Café ambiance
- Rain
- Forest
- Ocean waves

Option: upload to Firebase Storage or any CDN.

---

## Logo

Create a custom logo for "Cadence Station." The app currently uses an inline SVG placeholder. Replace with your designed wordmark or icon.

---

## Domain Setup (Optional)

If you want a custom domain:
1. Deploy to Vercel, Netlify, or Cloudflare Pages
2. Add custom domain (e.g. `cadencestation.com` or `station.cadence.app`)
3. Update Firebase authorized domains for authentication (when added)

---

## PWA / App Store (Phase 3)

- Add `manifest.json` for PWA installability
- Add service worker for offline support
- Consider Apple App Store / Google Play if wrapping as native app

---

## Production Authentication (Future)

The current version has no auth — all data is local. For multi-device sync:
1. Add Firebase Authentication (email, Google, or anonymous)
2. Move session storage from localStorage to Firestore/Realtime DB under user IDs
3. Update database rules to require auth

---

## Review Before Launch

- [ ] Verify Firebase Realtime Database is enabled and accessible
- [ ] Test the pairing flow with two browser windows
- [ ] Confirm ambient sounds play correctly on mobile
- [ ] Check dark/light mode on both backgrounds
- [ ] Review session history persistence across page refreshes
- [ ] Test "partner ended early" flow
- [ ] Verify streak calculation (timezone edge cases)
