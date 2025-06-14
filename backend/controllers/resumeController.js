// backend/controllers/resumeController.js
const resumeModel = require('../models/resumeModel');

const resumeController = {
  /**
   * Creates a new resume for the authenticated user.
   * Expects title and data in the request body.
   */
  createResume: async (req, res) => {
    // req.uid is populated by the firebaseAuth middleware
    const { title, data } = req.body;
    const userId = req.uid;

    if (!title || !data) {
      return res.status(400).json({ message: 'Title and data are required to create a resume.' });
    }

    try {
      const newResume = await resumeModel.createResume(userId, title, data);
      return res.status(201).json(newResume);
    } catch (error) {
      console.error('Error in createResume controller:', error);
      return res.status(500).json({ message: 'Failed to create resume.', error: error.message });
    }
  },

  /**
   * Gets a specific resume by its ID for the authenticated user.
   */
  getResume: async (req, res) => {
    const { id } = req.params; // Resume ID from URL parameters
    const userId = req.uid; // User ID from authenticated token

    try {
      const resume = await resumeModel.getResumeById(id, userId);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found or you do not have access.' });
      }
      return res.status(200).json(resume);
    } catch (error) {
      console.error('Error in getResume controller:', error);
      return res.status(500).json({ message: 'Failed to retrieve resume.', error: error.message });
    }
  },

  /**
   * Gets all resumes for the authenticated user.
   */
  getAllResumes: async (req, res) => {
    const userId = req.uid; // User ID from authenticated token

    try {
      const resumes = await resumeModel.getAllResumesByUserId(userId);
      return res.status(200).json(resumes);
    } catch (error) {
      console.error('Error in getAllResumes controller:', error);
      return res.status(500).json({ message: 'Failed to retrieve resumes.', error: error.message });
    }
  },

  /**
   * Updates an existing resume for the authenticated user.
   * Expects title and data in the request body.
   */
  updateResume: async (req, res) => {
    const { id } = req.params; // Resume ID from URL parameters
    const { title, data } = req.body;
    const userId = req.uid; // User ID from authenticated token

    if (!title || !data) {
      return res.status(400).json({ message: 'Title and data are required to update a resume.' });
    }

    try {
      const success = await resumeModel.updateResume(id, userId, title, data);
      if (!success) {
        return res.status(404).json({ message: 'Resume not found or you do not have access to update.' });
      }
      return res.status(200).json({ message: 'Resume updated successfully.' });
    } catch (error) {
      console.error('Error in updateResume controller:', error);
      return res.status(500).json({ message: 'Failed to update resume.', error: error.message });
    }
  },

  /**
   * Deletes a resume for the authenticated user.
   */
  deleteResume: async (req, res) => {
    const { id } = req.params; // Resume ID from URL parameters
    const userId = req.uid; // User ID from authenticated token

    try {
      const success = await resumeModel.deleteResume(id, userId);
      if (!success) {
        return res.status(404).json({ message: 'Resume not found or you do not have access to delete.' });
      }
      return res.status(200).json({ message: 'Resume deleted successfully.' });
    } catch (error) {
      console.error('Error in deleteResume controller:', error);
      return res.status(500).json({ message: 'Failed to delete resume.', error: error.message });
    }
  }
};

module.exports = resumeController;
