// backend/controllers/coverLetterController.js
const coverLetterModel = require('../models/coverLetterModel');

const coverLetterController = {
  /**
   * Creates a new cover letter for the authenticated user.
   * Expects title and data in the request body.
   */
  createCoverLetter: async (req, res) => {
    const { title, data } = req.body;
    const userId = req.uid;

    if (!title || !data) {
      return res.status(400).json({ message: 'Title and data are required to create a cover letter.' });
    }

    try {
      const newCoverLetter = await coverLetterModel.createCoverLetter(userId, title, data);
      return res.status(201).json(newCoverLetter);
    } catch (error) {
      console.error('Error in createCoverLetter controller:', error);
      return res.status(500).json({ message: 'Failed to create cover letter.', error: error.message });
    }
  },

  /**
   * Gets a specific cover letter by its ID for the authenticated user.
   */
  getCoverLetter: async (req, res) => {
    const { id } = req.params; // Cover Letter ID from URL parameters
    const userId = req.uid; // User ID from authenticated token

    try {
      const coverLetter = await coverLetterModel.getCoverLetterById(id, userId);
      if (!coverLetter) {
        return res.status(404).json({ message: 'Cover letter not found or you do not have access.' });
      }
      return res.status(200).json(coverLetter);
    } catch (error) {
      console.error('Error in getCoverLetter controller:', error);
      return res.status(500).json({ message: 'Failed to retrieve cover letter.', error: error.message });
    }
  },

  /**
   * Gets all cover letters for the authenticated user.
   */
  getAllCoverLetters: async (req, res) => {
    const userId = req.uid; // User ID from authenticated token

    try {
      const coverLetters = await coverLetterModel.getAllCoverLettersByUserId(userId);
      return res.status(200).json(coverLetters);
    } catch (error) {
      console.error('Error in getAllCoverLetters controller:', error);
      return res.status(500).json({ message: 'Failed to retrieve cover letters.', error: error.message });
    }
  },

  /**
   * Updates an existing cover letter for the authenticated user.
   * Expects title and data in the request body.
   */
  updateCoverLetter: async (req, res) => {
    const { id } = req.params; // Cover Letter ID from URL parameters
    const { title, data } = req.body;
    const userId = req.uid; // User ID from authenticated token

    if (!title || !data) {
      return res.status(400).json({ message: 'Title and data are required to update a cover letter.' });
    }

    try {
      const success = await coverLetterModel.updateCoverLetter(id, userId, title, data);
      if (!success) {
        return res.status(404).json({ message: 'Cover letter not found or you do not have access to update.' });
      }
      return res.status(200).json({ message: 'Cover letter updated successfully.' });
    } catch (error) {
      console.error('Error in updateCoverLetter controller:', error);
      return res.status(500).json({ message: 'Failed to update cover letter.', error: error.message });
    }
  },

  /**
   * Deletes a cover letter for the authenticated user.
   */
  deleteCoverLetter: async (req, res) => {
    const { id } = req.params; // Cover Letter ID from URL parameters
    const userId = req.uid; // User ID from authenticated token

    try {
      const success = await coverLetterModel.deleteCoverLetter(id, userId);
      if (!success) {
        return res.status(404).json({ message: 'Cover letter not found or you do not have access to delete.' });
      }
      return res.status(200).json({ message: 'Cover letter deleted successfully.' });
    } catch (error) {
      console.error('Error in deleteCoverLetter controller:', error);
      return res.status(500).json({ message: 'Failed to delete cover letter.', error: error.message });
    }
  }
};

module.exports = coverLetterController;
