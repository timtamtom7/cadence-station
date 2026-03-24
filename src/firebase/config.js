// Firebase configuration
// TODO: Tommaso needs to fill in these values from the Firebase Console
// https://console.firebase.google.com/

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY' && firebaseConfig.apiKey.length > 0;
}

// NOTE: Enable Realtime Database in Firebase Console
// Rules should be:
// {
//   "rules": {
//     ".read": true,
//     ".write": true
//   }
// }
// For production, add proper authentication and rules.
