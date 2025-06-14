// backend/config/firebase.js
const admin = require('firebase-admin');
const path = require('path');
// Load .env from backend root. Adjust path if your .env is elsewhere relative to this file.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Ensure the FIREBASE_SERVICE_ACCOUNT_PATH environment variable is set
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error("FIREBASE_SERVICE_ACCOUNT_PATH is not set in backend/.env");
  console.error("Please download your Firebase service account key JSON and set the path in .env.");
  process.exit(1); // Exit if critical config is missing
}

// Convert relative path to absolute path and require the JSON file
let serviceAccount;
try {
  serviceAccount = require(path.resolve(serviceAccountPath));
} catch (error) {
  console.error(`Error loading Firebase service account key from path: ${serviceAccountPath}`, error);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase Admin SDK initialized successfully.');

module.exports = admin;
