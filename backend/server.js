// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Load .env from backend root

// Initialize Firebase Admin SDK (ensure this runs on server start)
require('./config/firebase');
// Test MySQL connection (ensure this runs on server start)
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes - adjust for specific origins in production
app.use(express.json()); // Body parser for JSON requests

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Resume App Backend API is running!');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const letterRoutes = require('./routes/letterRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/letters', letterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
