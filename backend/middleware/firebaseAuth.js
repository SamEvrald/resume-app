const admin = require('../config/firebase'); // Import Firebase Admin SDK

const firebaseAuth = async (req, res, next) => {
  // Get the ID token from the Authorization header
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send('No token provided. Authorization denied.');
  }

  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Attach the decoded token and user's UID to the request object
    req.user = decodedToken;
    req.uid = decodedToken.uid;
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send('Token expired. Please re-authenticate.');
    } else if (error.code === 'auth/argument-error') {
      return res.status(401).send('Invalid token provided.');
    }
    return res.status(401).send('Unauthorized. Invalid token.');
  }
};

module.exports = firebaseAuth;
