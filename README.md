Resume & Cover Letter Pro
Table of Contents
Introduction

Features

Architecture

Frontend Stack

Backend Stack

Database Layer

Authentication Flow

Prerequisites

Local Development Setup

1. Clone the Repository

2. Backend Setup

3. Frontend Setup

4. Firebase Console Configuration

Project Structure

API Endpoints

Database Schema

Security Considerations

Future Enhancements

Contributing

License

Introduction
"Resume & Cover Letter Pro" is a full-stack web application designed to help users create, manage, and download professional resumes and cover letters. This application features a React.js frontend for a dynamic user experience, an Express.js backend for robust API handling and business logic, and a MySQL database for persistent storage of user data and documents. Firebase Authentication is integrated for secure user management, while Firebase Firestore is utilized for public, globally accessible templates.

Features
Secure User Authentication:

Email/Password registration and login.

Google OAuth sign-up/sign-in via Firebase.

Email verification for new registrations.

Password reset functionality.

User Profile Management:

Display user initials in the header for personalized experience.

User data (names, email) synced to MySQL database upon Firebase authentication.

Dynamic Document Builders:

Resume Builder: Intuitive forms for creating and editing resumes with sections for contact, summary, experience, education, and skills.

Cover Letter Builder: Forms for crafting custom cover letters, including recipient, company, job title, and free-form body.

Document Management (CRUD):

Dashboard to view, edit, and delete saved resumes and cover letters.

Documents are stored as JSON data in MySQL.

Template Library:

Browse pre-designed resume and cover letter templates (stored in Firestore as public data).

Responsive UI: Built with Tailwind CSS for a mobile-first, adaptive design across devices.

AI Integration (Placeholder): Includes placeholders for future AI-powered content suggestions (e.g., for resume bullet points, letter paragraphs).

Architecture
The application follows a client-server architecture with distinct frontend and backend components.

Frontend Stack
React.js (CRA/Vite): A JavaScript library for building user interfaces.

Tailwind CSS: A utility-first CSS framework for rapid and responsive UI development.

Axios: Promise-based HTTP client for making API requests to the backend.

Firebase Client SDK:

firebase/auth: Handles client-side user registration, login, and session management (Email/Password, Google OAuth).

firebase/firestore: Used specifically for fetching public templates, leveraging its real-time capabilities for static content.

Backend Stack
Node.js: JavaScript runtime environment.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

mysql2/promise: MySQL client for Node.js with Promise-based API for asynchronous database interactions.

firebase-admin SDK: Used for backend Firebase operations, primarily to:

Verify Firebase ID Tokens sent from the frontend, ensuring requests are from authenticated users.

Potentially manage users directly (e.g., deleting users).

cors: Middleware for enabling Cross-Origin Resource Sharing.

dotenv: Module to load environment variables from a .env file.

jsonwebtoken (placeholder): Can be used for custom JWTs if needed, though Firebase ID tokens handle primary authentication.

bcryptjs (placeholder): For password hashing if local user management was implemented, but Firebase handles password security for its users.

Database Layer
The application utilizes a hybrid database approach:

MySQL: The primary relational database for storing sensitive and user-specific data, including:

users: User profiles (synced from Firebase, stores Firebase UID, email, first name, last name).

resumes: User-created resume data (stored as JSON strings).

cover_letters: User-created cover letter data (stored as JSON strings).

Firebase Firestore: A NoSQL cloud database used for:

templates: Publicly accessible templates that all users can browse. This allows for easy content updates for templates without redeploying the backend.

Authentication Flow
Frontend (Client-side):

User registers/logs in via Email/Password or Google OAuth using Firebase Client SDK.

Upon successful authentication, Firebase provides an ID Token (JWT).

Backend (Server-side):

The frontend sends this Firebase ID Token in the Authorization: Bearer <token> header with most API requests.

A Firebase authentication middleware on the Express.js backend verifies this ID Token using the Firebase Admin SDK.

Upon successful verification, the backend extracts the Firebase User ID (UID) and email.

The /api/auth/sync-user endpoint then ensures the user's profile exists or is updated in the MySQL users table, including their names for a richer profile.

Authorization: Subsequent API calls requiring user context are authenticated by verifying the Firebase ID Token.

Prerequisites
Before you begin, ensure you have the following installed on your Xubuntu machine:

Node.js (LTS recommended): Version 18.x or later. Install via nvm for easy management.

npm: Comes with Node.js.

Git: For cloning the repository and version control.

MySQL Server: Version 8.x or later. Ensure it's running.

Firebase Project: A Firebase project configured for Authentication (Email/Password, Google) and Firestore Database.

Firebase Service Account Key: A JSON key file for your Firebase project's Admin SDK (downloaded from Firebase Console).

Local Development Setup
Follow these steps to get the Resume & Cover Letter Pro application running on your local machine.

1. Clone the Repository
git clone git@github.com:SamEvrald/resume-app.git
cd resume-app

2. Backend Setup
Navigate to the backend directory:

cd backend

a. Environment Variables
Create a .env file in the backend directory and add the following configuration. Replace placeholder values with your actual credentials.

# Firebase Admin SDK Service Account Key Path
# IMPORTANT: Replace with the actual relative path to your downloaded Firebase service account JSON file.
# This file contains sensitive credentials and MUST NOT be committed to version control.
FIREBASE_SERVICE_ACCOUNT_PATH='./credentials/resume-app-8ecb2-firebase-adminsdk-fbsvc-7d9c472905.json'

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resume_pro_db

# JWT Secret for any custom tokens if you decide to issue them.
# Firebase ID tokens are verified by Firebase Admin SDK directly, so this is for other custom JWTs.
# Generate a strong, random string, e.g., using `require('crypto').randomBytes(64).toString('hex')` in Node.js console.
JWT_SECRET=your_super_secret_jwt_key_here

# Port for the Express server
PORT=5000

b. Firebase Service Account Key
Download: Go to your Firebase Console -> Project settings -> Service accounts tab. Click "Generate new private key".

Place: Create a directory backend/credentials/ and place the downloaded JSON file inside it.

Update .env: Ensure FIREBASE_SERVICE_ACCOUNT_PATH in your .env file correctly points to this file (e.g., ./credentials/your-downloaded-key.json).

c. MySQL Database Setup
Connect to MySQL: Use your MySQL client (e.g., mysql CLI, MySQL Workbench).

Execute Schema Script:
Navigate to the project root (resume-app/) in your terminal and execute the SQL script:

mysql -u your_mysql_user -p < scripts/init-db.sql

This will create the resume_pro_db database and its tables (users, resumes, cover_letters). Ensure the users table has first_name and last_name columns. If not, run:

USE resume_pro_db;
ALTER TABLE users ADD COLUMN first_name VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN last_name VARCHAR(255) NULL;

d. Install Dependencies & Start Backend Server
npm install # or yarn install
npm run dev # Starts server with nodemon for live reloading

The backend server should now be running on http://localhost:5000.

3. Frontend Setup
Navigate to the frontend directory:

cd ../frontend

a. Environment Variables
Create a .env.local file in the frontend directory. This is standard for Create React App/Vite environment variables. Replace placeholder values with your actual Firebase Client SDK configuration.

REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
REACT_APP_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
REACT_APP_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
REACT_APP_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"

b. Tailwind CSS Setup
Ensure your tailwind.config.js and postcss.config.js are configured correctly in the frontend/ root, and your src/index.css includes the Tailwind directives.

tailwind.config.js:

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

postcss.config.js:

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

src/index.css (or App.css):

@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Inter', sans-serif;
}

c. Install Dependencies & Start Frontend Server
npm install # or yarn install
npm start   # or yarn dev for Vite

The frontend application should now open in your browser, typically at http://localhost:3000.

4. Firebase Console Configuration
Ensure your Firebase project (resume-app-8ecb2) is correctly configured:

Authentication > Sign-in method:

Email/Password: Enable this provider.

Google: Enable this provider and set a "Project support email".

Authentication > Templates:

Email address verification: Ensure this template is enabled. If you use a custom sender email, ensure the domain is verified.

Firestore Database > Rules:

Verify your security rules allow appropriate read/write access:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public templates
    match /artifacts/{appId}/public/data/templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // User-specific documents
    match /artifacts/{appId}/users/{userId}/documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

Project Structure
resume-app/
├── backend/
│   ├── config/             # Database (db.js) and Firebase Admin (firebase.js) configurations
│   ├── controllers/        # Express route handlers (authController, resumeController, letterController)
│   ├── middleware/         # Custom Express middleware (e.g., firebaseAuth.js for token verification)
│   ├── models/             # Database interaction logic (userModel, resumeModel, letterModel)
│   ├── routes/             # API route definitions (authRoutes, resumeRoutes, letterRoutes)
│   ├── .env                # Environment variables (IGNORED by Git)
│   ├── credentials/        # Firebase Service Account JSON key (IGNORED by Git)
│   ├── server.js           # Main Express server entry point
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── public/             # Static assets (index.html, manifest.json)
│   ├── src/
│   │   ├── components/     # Reusable UI components (common.js, etc.)
│   │   ├── pages/          # Application pages (Login, Register, Dashboard, ResumeBuilder, LetterBuilder, Home (Dashboard))
│   │   ├── services/       # API client (api.js), Firebase client SDK (firebase.js) configuration
│   │   ├── App.js          # Main React application component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Main Tailwind CSS input file
│   ├── .env.local          # Frontend environment variables (IGNORED by Git)
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── postcss.config.js   # PostCSS configuration
├── scripts/
│   └── init-db.sql         # SQL script for database schema initialization
└── .gitignore              # Git ignore rules for sensitive files and build artifacts

API Endpoints
The backend exposes the following RESTful API endpoints:

Authentication Routes (/api/auth)

POST /api/auth/sync-user: Syncs Firebase authenticated user data (UID, email, names) with the MySQL database. Requires Firebase ID Token in Authorization header.

POST /api/auth/delete-firebase-user: (Admin/Internal) Deletes a user from Firebase Auth and MySQL.

Resume Routes (/api/resumes)

GET /api/resumes: Retrieves all resumes for the authenticated user.

GET /api/resumes/:id: Retrieves a specific resume by ID for the authenticated user.

POST /api/resumes: Creates a new resume for the authenticated user.

PUT /api/resumes/:id: Updates an existing resume for the authenticated user.

DELETE /api/resumes/:id: Deletes a specific resume by ID for the authenticated user.

Cover Letter Routes (/api/letters)

GET /api/letters: Retrieves all cover letters for the authenticated user.

GET /api/letters/:id: Retrieves a specific cover letter by ID for the authenticated user.

POST /api/letters: Creates a new cover letter for the authenticated user.

PUT /api/letters/:id: Updates an existing cover letter for the authenticated user.

DELETE /api/letters/:id: Deletes a specific cover letter by ID for the authenticated user.

All endpoints requiring user data are protected by the firebaseAuth middleware, which validates the Firebase ID Token.

Database Schema
The MySQL database resume_pro_db contains the following tables:

users table
Field

Type

Null

Key

Default

Extra

Description

id

VARCHAR(128)

NO

PRI

NULL



Firebase User ID (UID)

email

VARCHAR(255)

NO

UNI

NULL



User's email address (unique)

first_name

VARCHAR(255)

YES



NULL



User's first name

last_name

VARCHAR(255)

YES



NULL



User's last name

created_at

TIMESTAMP

YES



CURRENT_TIMESTAMP

DEFAULT_GENERATED

Timestamp of user creation

updated_at

TIMESTAMP

YES



CURRENT_TIMESTAMP

DEFAULT_GENERATED on update CURRENT_TIMESTAMP

Last update timestamp

resumes table
Field

Type

Null

Key

Default

Extra

Description

id

VARCHAR(128)

NO

PRI

NULL



Unique ID for the resume

user_id

VARCHAR(128)

NO

MUL

NULL



Foreign Key to users.id

title

VARCHAR(255)

NO



NULL



Title of the resume

data

JSON

NO



NULL



JSON string of resume content

created_at

TIMESTAMP

YES



CURRENT_TIMESTAMP

DEFAULT_GENERATED

Timestamp of resume creation

updated_at

TIMESTAMP

YES



CURRENT_TIMESTAMP

DEFAULT_GENERATED on update CURRENT_TIMESTAMP

Last update timestamp

cover_letters table
Field

Type

Null

Key

Default

Extra

Description

id

VARCHAR(128)

NO

PRI

NULL



Unique ID for the cover letter

user_id

VARCHAR(128)

NO

MUL

NULL



Foreign Key to users.id

title

VARCHAR(255)

NO



NULL



Title of the cover letter

data

JSON

NO



NULL



JSON string of cover letter content

created_at

TIMESTAMP

YES



CURRENT_TIMESTAMP

DEFAULT_GENERATED

Timestamp of cover letter creation

updated_at

TIMESTAMP

YES



CURRENT_TIMESTAMP

DEFAULT_GENERATED on update CURRENT_TIMESTAMP

Last update timestamp

Security Considerations
Environment Variables: All sensitive information (API keys, database credentials) are stored in .env files and are excluded from Git version control via .gitignore.

Firebase Service Account Key: The Firebase Admin SDK key is highly sensitive. It's stored locally and explicitly ignored by Git. Never expose this file publicly.

Firebase Authentication: Leverages Firebase's robust authentication mechanisms (OAuth, Email/Password security).

Backend Token Verification: All authenticated routes on the backend verify Firebase ID Tokens, ensuring only legitimate users can access and manipulate their data.

Firestore Security Rules: Access to Firestore data (especially user-specific documents) is strictly controlled by security rules to prevent unauthorized access.

Cross-Origin Resource Sharing (CORS): Properly configured in the Express backend to allow requests only from your frontend domain.

Future Enhancements
PDF Export: Implement server-side PDF generation for resumes and cover letters (e.g., using Puppeteer, jsPDF-node).

AI Content Generation: Fully integrate Gemini API or other LLMs for generating and refining resume bullet points, cover letter paragraphs, and even full first drafts.

Template Customization: Allow users to further customize templates (colors, fonts, layouts) within the builder.

Premium Features & Payments: Introduce premium templates or AI features with a payment gateway.

User Profile Page: Dedicated page for users to manage their personal information (name, email).

Document Versioning: Implement a system to track changes and revert to previous versions of documents.

Sharing Functionality: Allow users to generate shareable links for their resumes/cover letters.

Performance Optimization: Further optimize frontend rendering and backend queries for large datasets.

Containerization: Dockerize the frontend and backend for easier deployment.

Testing: Implement unit and integration tests for both frontend and backend.

Contributing
Contributions are welcome! If you have suggestions, bug reports, or want to contribute code, please feel free to open an issue or submit a pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.
