const pool = require('../config/db');

const userModel = {
  // Find a user by their Firebase UID, including first and last names
  findByFirebaseUid: async (firebaseUid) => {
    try {
      const [rows] = await pool.execute('SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?', [firebaseUid]);
      return rows[0]; // Return the first user found, or undefined
    } catch (error) {
      console.error('Error finding user by Firebase UID:', error);
      throw error;
    }
  },

  // Create a new user record in the database with first and last names
  createUser: async (firebaseUid, email, firstName, lastName) => {
    try {
      // Check if user already exists to prevent duplicate entries
      const existingUser = await userModel.findByFirebaseUid(firebaseUid);
      if (existingUser) {
        console.warn(`User with Firebase UID ${firebaseUid} already exists in DB. Will not re-create.`);
        return existingUser; // Return existing user if found
      }

      const [result] = await pool.execute(
        'INSERT INTO users (id, email, first_name, last_name) VALUES (?, ?, ?, ?)',
        [firebaseUid, email, firstName || null, lastName || null] // Use null if names are not provided
      );
      // After successful insertion, fetch the newly created user to return it
      const newUser = await userModel.findByFirebaseUid(firebaseUid);
      return newUser;
    } catch (error) {
      console.error('Error creating user in DB:', error);
      throw error;
    }
  },

  // Update user information (e.g., email or names)
  updateUser: async (firebaseUid, email, firstName, lastName) => {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET email = ?, first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [email, firstName || null, lastName || null, firebaseUid]
      );
      return result.affectedRows > 0; // Return true if updated, false otherwise
    } catch (error) {
      console.error('Error updating user in DB:', error);
      throw error;
    }
  },

  // Delete a user (e.g., when a user deletes their Firebase account)
  deleteUser: async (firebaseUid) => {
    try {
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [firebaseUid]);
      return result.affectedRows > 0; // Return true if deleted, false otherwise
    } catch (error) {
      console.error('Error deleting user from DB:', error);
      throw error;
    }
  }
};

module.exports = userModel;
