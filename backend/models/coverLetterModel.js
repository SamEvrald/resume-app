// backend/models/coverLetterModel.js
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const coverLetterModel = {
  /**
   * Creates a new cover letter entry in the database.
   * @param {string} userId - The Firebase UID of the user owning the cover letter.
   * @param {string} title - The title of the cover letter.
   * @param {object} data - The JSON data of the cover letter content.
   * @returns {Promise<object>} The newly created cover letter object.
   */
  createCoverLetter: async (userId, title, data) => {
    try {
      const id = uuidv4(); // Generate a unique ID for the cover letter
      const jsonData = JSON.stringify(data); // Store data as JSON string
      const [result] = await pool.execute(
        'INSERT INTO cover_letters (id, user_id, title, data) VALUES (?, ?, ?, ?)',
        [id, userId, title, jsonData]
      );
      // Return the newly created cover letter object
      return { id, user_id: userId, title, data, created_at: new Date(), updated_at: new Date() };
    } catch (error) {
      console.error('Error creating cover letter:', error);
      throw error;
    }
  },

  /**
   * Retrieves a single cover letter by its ID and user ID.
   * Ensures a user can only access their own cover letters.
   * @param {string} letterId - The ID of the cover letter.
   * @param {string} userId - The Firebase UID of the user.
   * @returns {Promise<object|null>} The cover letter object if found, otherwise null.
   */
  getCoverLetterById: async (letterId, userId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, user_id, title, data, created_at, updated_at FROM cover_letters WHERE id = ? AND user_id = ?',
        [letterId, userId]
      );
      if (rows.length > 0) {
        // Parse the JSON string data back to an object
        return { ...rows[0], data: JSON.parse(rows[0].data) };
      }
      return null;
    } catch (error) {
      console.error('Error getting cover letter by ID:', error);
      throw error;
    }
  },

  /**
   * Retrieves all cover letters for a specific user.
   * @param {string} userId - The Firebase UID of the user.
   * @returns {Promise<Array<object>>} An array of cover letter objects.
   */
  getAllCoverLettersByUserId: async (userId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, user_id, title, data, created_at, updated_at FROM cover_letters WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      // Parse JSON data for all cover letters
      return rows.map(row => ({ ...row, data: JSON.parse(row.data) }));
    } catch (error) {
      console.error('Error getting all cover letters by user ID:', error);
      throw error;
    }
  },

  /**
   * Updates an existing cover letter entry.
   * @param {string} letterId - The ID of the cover letter to update.
   * @param {string} userId - The Firebase UID of the user owning the cover letter.
   * @param {string} title - The new title of the cover letter.
   * @param {object} data - The new JSON data of the cover letter content.
   * @returns {Promise<boolean>} True if updated, false otherwise.
   */
  updateCoverLetter: async (letterId, userId, title, data) => {
    try {
      const jsonData = JSON.stringify(data);
      const [result] = await pool.execute(
        'UPDATE cover_letters SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [title, jsonData, letterId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating cover letter:', error);
      throw error;
    }
  },

  /**
   * Deletes a cover letter entry.
   * Ensures a user can only delete their own cover letters.
   * @param {string} letterId - The ID of the cover letter to delete.
   * @param {string} userId - The Firebase UID of the user owning the cover letter.
   * @returns {Promise<boolean>} True if deleted, false otherwise.
   */
  deleteCoverLetter: async (letterId, userId) => {
    try {
      const [result] = await pool.execute(
        'DELETE FROM cover_letters WHERE id = ? AND user_id = ?',
        [letterId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      throw error;
    }
  }
};

module.exports = coverLetterModel;
