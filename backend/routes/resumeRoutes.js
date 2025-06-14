// backend/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const firebaseAuth = require('../middleware/firebaseAuth'); // Ensure user is authenticated

// All resume routes will be protected by the firebaseAuth middleware

// Create a new resume
router.post('/', firebaseAuth, resumeController.createResume);

// Get all resumes for the authenticated user
router.get('/', firebaseAuth, resumeController.getAllResumes);

// Get a specific resume by ID
router.get('/:id', firebaseAuth, resumeController.getResume);

// Update a specific resume by ID
router.put('/:id', firebaseAuth, resumeController.updateResume);

// Delete a specific resume by ID
router.delete('/:id', firebaseAuth, resumeController.deleteResume);

module.exports = router;
