// backend/models/resumeModel.js
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const resumeModel = {
  /**
   * Creates a new resume entry in the database.
   * @param {string} userId - The Firebase UID of the user owning the resume.
   * @param {string} title - The title of the resume.
   * @param {object} data - The JSON data of the resume content.
   * @returns {Promise<object>} The newly created resume object.
   */
  createResume: async (userId, title, data) => {
    try {
      const id = uuidv4(); // Generate a unique ID for the resume
      const jsonData = JSON.stringify(data); // Store data as JSON string
      const [result] = await pool.execute(
        'INSERT INTO resumes (id, user_id, title, data) VALUES (?, ?, ?, ?)',
        [id, userId, title, jsonData]
      );
      // Return the newly created resume object
      return { id, user_id: userId, title, data, created_at: new Date(), updated_at: new Date() };
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },

  /**
   * Retrieves a single resume by its ID and user ID.
   * Ensures a user can only access their own resumes.
   * @param {string} resumeId - The ID of the resume.
   * @param {string} userId - The Firebase UID of the user.
   * @returns {Promise<object|null>} The resume object if found, otherwise null.
   */
  getResumeById: async (resumeId, userId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, user_id, title, data, created_at, updated_at FROM resumes WHERE id = ? AND user_id = ?',
        [resumeId, userId]
      );
      if (rows.length > 0) {
        // Parse the JSON string data back to an object
        return { ...rows[0], data: JSON.parse(rows[0].data) };
      }
      return null;
    } catch (error) {
      console.error('Error getting resume by ID:', error);
      throw error;
    }
  },

  /**
   * Retrieves all resumes for a specific user.
   * @param {string} userId - The Firebase UID of the user.
   * @returns {Promise<Array<object>>} An array of resume objects.
   */
  getAllResumesByUserId: async (userId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, user_id, title, data, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      // Parse JSON data for all resumes
      return rows.map(row => ({ ...row, data: JSON.parse(row.data) }));
    } catch (error) {
      console.error('Error getting all resumes by user ID:', error);
      throw error;
    }
  },

  /**
   * Updates an existing resume entry.
   * @param {string} resumeId - The ID of the resume to update.
   * @param {string} userId - The Firebase UID of the user owning the resume.
   * @param {string} title - The new title of the resume.
   * @param {object} data - The new JSON data of the resume content.
   * @returns {Promise<boolean>} True if updated, false otherwise.
   */
  updateResume: async (resumeId, userId, title, data) => {
    try {
      const jsonData = JSON.stringify(data);
      const [result] = await pool.execute(
        'UPDATE resumes SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [title, jsonData, resumeId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  },

  /**
   * Deletes a resume entry.
   * Ensures a user can only delete their own resumes.
   * @param {string} resumeId - The ID of the resume to delete.
   * @param {string} userId - The Firebase UID of the user owning the resume.
   * @returns {Promise<boolean>} True if deleted, false otherwise.
   */
  deleteResume: async (resumeId, userId) => {
    try {
      const [result] = await pool.execute(
        'DELETE FROM resumes WHERE id = ? AND user_id = ?',
        [resumeId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }
};

module.exports = resumeModel;
