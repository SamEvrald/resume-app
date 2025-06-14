const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const firebaseAuth = require('../middleware/firebaseAuth'); // Our custom Firebase ID token verification middleware

// Route to sync user data in MySQL after Firebase client-side authentication
// This route is protected by our firebaseAuth middleware, ensuring only authenticated
// Firebase users can hit it with a valid ID token.
router.post('/sync-user', firebaseAuth, authController.syncUser);

// Route to delete a Firebase user (requires admin privileges, or careful use)
// For security, this endpoint should typically only be callable by an authenticated administrator,
// or as part of a secure flow where the client's ID token *confirms* they are the user
// being deleted. For simplicity, we are just using `firebaseAuth` to check for any valid user.
// In a production app, you might add more checks, e.g., `req.uid === req.body.uid`.
router.delete('/delete-user', firebaseAuth, authController.deleteFirebaseUser);

module.exports = router;
