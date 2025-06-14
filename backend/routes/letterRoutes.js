// backend/routes/letterRoutes.js
const express = require('express');
const router = express.Router();
const coverLetterController = require('../controllers/coverLetterController');
const firebaseAuth = require('../middleware/firebaseAuth'); // Ensure user is authenticated

// All cover letter routes will be protected by the firebaseAuth middleware

// Create a new cover letter
router.post('/', firebaseAuth, coverLetterController.createCoverLetter);

// Get all cover letters for the authenticated user
router.get('/', firebaseAuth, coverLetterController.getAllCoverLetters);

// Get a specific cover letter by ID
router.get('/:id', firebaseAuth, coverLetterController.getCoverLetter);

// Update a specific cover letter by ID
router.put('/:id', firebaseAuth, coverLetterController.updateCoverLetter);

// Delete a specific cover letter by ID
router.delete('/:id', firebaseAuth, coverLetterController.deleteCoverLetter);

module.exports = router;
