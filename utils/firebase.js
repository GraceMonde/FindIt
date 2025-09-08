const admin = require('firebase-admin');

// Try to initialize with service account if it exists
let serviceAccount;

try {
  serviceAccount = require('../findit-910-firebase-adminsdk-fbsvc-5bf0119a1f.json');
} catch (error) {
  console.error('Service account file not found. Make sure the JSON file is in the correct location.');
  console.error(error);
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'findit-910.appspot.com' // Replace with your actual bucket name
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket, admin };