const userModel = require('../models/userModel');
const admin = require('../config/firebase'); // Firebase Admin SDK for user management

const authController = {
  // This endpoint is hit AFTER a user successfully logs in or registers via Firebase client-side.
  // It's used to create/sync the user record in your MySQL database.
  syncUser: async (req, res) => {
    const { uid, email, email_verified } = req.user; // Firebase token info
    const { firstName, lastName } = req.body; // Names from frontend registration

    if (!uid || !email) {
        return res.status(400).json({ message: 'Missing user ID or email in token.' });
    }

    try {
        let user = await userModel.findByFirebaseUid(uid);

        if (!user) {
            // If user doesn't exist in MySQL, create them with names
            user = await userModel.createUser(uid, email, firstName, lastName);
            return res.status(201).json({ message: 'User synced (created) successfully.', user });
        } else if (user.email !== email || user.first_name !== firstName || user.last_name !== lastName) {
            // If email or names changed, update in MySQL
            await userModel.updateUser(uid, email, firstName, lastName);
            return res.status(200).json({ message: 'User synced (updated) successfully.', user: { ...user, email, first_name: firstName, last_name: lastName } });
        } else {
            // User already exists and is up-to-date
            return res.status(200).json({ message: 'User already synced.', user });
        }
    } catch (error) {
        console.error('Error syncing user:', error);
        return res.status(500).json({ message: 'Failed to sync user.', error: error.message });
    }
},

  // This endpoint could be used for advanced scenarios like custom claims
  // or user deletion from Firebase Admin SDK (not just signOut)
  deleteFirebaseUser: async (req, res) => {
    const { uid } = req.body; // Expect UID from request body

    if (!uid) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
      await admin.auth().deleteUser(uid);
      await userModel.deleteUser(uid); // Also delete from your MySQL database
      return res.status(200).json({ message: `User ${uid} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting Firebase user:', error);
      return res.status(500).json({ message: 'Failed to delete user.', error: error.message });
    }
  }
};

module.exports = authController;
