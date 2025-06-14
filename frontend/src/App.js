// frontend/src/App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './services/firebase'; // Firebase client SDK
import { onAuthStateChanged, signOut } from 'firebase/auth';
import api from './services/api'; // Our Axios instance for backend calls
import { collection, onSnapshot, addDoc, getDocs } from 'firebase/firestore'; // For TemplatesPage using Firestore

// Import UI Components from common
import { InputField, TextAreaField, Button, MessageBox } from './components/common';

// Import Page Components
import LoginForm from './pages/Login';
import RegisterForm from './pages/Register';
import ResetPasswordForm from './pages/ResetPassword';
import Dashboard from './pages/Home'; // Dashboard (Home)
import ResumeBuilder from './pages/ResumeBuilder';
import CoverLetterBuilder from './pages/LetterBuilder'; // Cover Letter Builder

// Define context for global application state
export const AppContext = createContext(null); // Export AppContext for use in other components

// Main App Component
const App = () => {
    const [user, setUser] = useState(null); // Firebase User object
    const [userId, setUserId] = useState(null); // Firebase UID (string)
    const [loadingAuth, setLoadingAuth] = useState(true); // To indicate if auth state is resolving
    const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'resumeBuilder', 'coverLetterBuilder', 'templates'
    const [currentAuthPage, setCurrentAuthPage] = useState('login'); // 'login', 'register', 'reset-password'
    const [selectedDocId, setSelectedDocId] = useState(null); // For editing existing documents

    // State for message box
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    // Show a message to the user
    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
    };

    // Close the message box
    const closeMessage = () => {
        setMessage('');
    };

    // Listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in with Firebase.
                // We need to ensure displayName is up-to-date, especially after registration.
                try {
                    await firebaseUser.reload(); // Reload user data to get the latest displayName
                } catch (reloadError) {
                    console.warn("Error reloading Firebase user profile (might be offline or disconnected):", reloadError);
                    // Continue with the available firebaseUser object if reload fails
                }
                const reloadedUser = auth.currentUser; // Get the reloaded user object (might be same as firebaseUser if reload didn't change much)


                // Now, get their ID token and sync with our backend.
                try {
                    const idToken = await reloadedUser.getIdToken(); // Use reloadedUser
                    // Send ID token to your backend to sync user data in MySQL
                    const response = await api.post('/auth/sync-user', {
                        email: reloadedUser.email,
                        // Pass names from Firebase's displayName or default to empty if not available
                        firstName: reloadedUser.displayName ? reloadedUser.displayName.split(' ')[0] : '',
                        lastName: reloadedUser.displayName ? reloadedUser.displayName.split(' ').slice(1).join(' ') : ''
                    }, {
                        headers: { Authorization: `Bearer ${idToken}` }
                    });
                    console.log('User synced with backend:', response.data);

                    setUser(reloadedUser); // Set the reloaded user
                    setUserId(reloadedUser.uid);
                    showMessage(`Logged in as ${reloadedUser.email}!`, 'success');
                    setCurrentPage('dashboard'); // Redirect to dashboard on successful login/sync
                } catch (error) {
                    console.error('Error syncing user with backend:', error);
                    showMessage(`Failed to sync user with backend: ${error.message}`, 'error');
                    // If sync fails, consider logging out the user or restricting access
                    await signOut(auth);
                    setUser(null);
                    setUserId(null);
                    setCurrentPage('auth'); // Show auth forms on sync failure
                }
            } else {
                // User is signed out or no user is logged in
                setUser(null);
                setUserId(null);
                // Redirect to login form if not authenticated
                setCurrentPage('auth'); // A special page to render auth forms
            }
            setLoadingAuth(false);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []); // Empty dependency array means this runs once on mount/unmount

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // onAuthStateChanged listener will handle updating user state and redirecting
            showMessage('Logged out successfully.', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            showMessage(`Logout failed: ${error.message}`, 'error');
        }
    };

    // Conditional rendering based on authentication loading state
    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-xl text-gray-700 dark:text-gray-300">Loading application...</div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ user, userId, db, auth, showMessage, selectedDocId, setSelectedDocId, setCurrentPage }}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter flex flex-col">
                <Header setCurrentPage={setCurrentPage} onLogout={handleLogout} />
                <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
                    {/* Render Auth forms if not logged in OR if 'auth' page is explicitly set */}
                    {!userId || currentPage === 'auth' ? (
                        <div className="flex flex-grow items-center justify-center">
                            {currentAuthPage === 'login' && <LoginForm setCurrentAuthPage={setCurrentAuthPage} />}
                            {currentAuthPage === 'register' && <RegisterForm setCurrentAuthPage={setCurrentAuthPage} />}
                            {currentAuthPage === 'reset-password' && <ResetPasswordForm setCurrentAuthPage={setCurrentAuthPage} />}
                        </div>
                    ) : (
                        // Render main app content if logged in
                        <>
                            {currentPage === 'dashboard' && <Dashboard />}
                            {currentPage === 'resumeBuilder' && <ResumeBuilder />}
                            {currentPage === 'coverLetterBuilder' && <CoverLetterBuilder />}
                            {currentPage === 'templates' && <TemplatesPage />}
                        </>
                    )}
                </main>
                <MessageBox message={message} type={messageType} onClose={closeMessage} />
            </div>
        </AppContext.Provider>
    );
};

// Header Component
const Header = ({ setCurrentPage, onLogout }) => {
    const { user, userId, showMessage } = useContext(AppContext);

    // Function to get initials from display name or email
    const getInitials = (user) => {
        if (!user) return '';

        // Prioritize displayName from Firebase profile
        if (user.displayName) {
            const parts = user.displayName.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            } else if (parts.length === 1 && parts[0].length > 0) {
                return parts[0][0].toUpperCase();
            }
        }

        // Fallback to email if displayName is not available or empty
        if (user.email) {
            return user.email[0].toUpperCase(); // Just the first letter of email
        }

        return '';
    };

    const userInitials = getInitials(user);

    return (
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg rounded-b-xl">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-white tracking-wider">
                    Resume & Cover Letter Pro
                </h1>
                <nav className="flex flex-wrap justify-center md:justify-end space-x-2 md:space-x-4">
                    {userId && <Button onClick={() => setCurrentPage('dashboard')} label="Dashboard" />}
                    {userId && <Button onClick={() => setCurrentPage('resumeBuilder')} label="New Resume" />}
                    {userId && <Button onClick={() => setCurrentPage('coverLetterBuilder')} label="New Letter" />}
                    {userId && <Button onClick={() => setCurrentPage('templates')} label="Templates" />}
                    {userId ? (
                        <>
                            {/* Profile Icon with Initials for logged-in users */}
                            <button
                                onClick={() => showMessage(`Logged in as: ${user.email} (UID: ${userId})`, 'info')}
                                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold text-lg uppercase"
                                aria-label="User Profile"
                                title={user.displayName || user.email}
                            >
                                {userInitials || '?'}
                            </button>
                            <Button onClick={onLogout} label="Logout" className="bg-red-500 text-white hover:bg-red-600" />
                        </>
                    ) : (
                        <Button onClick={() => setCurrentPage('auth')} label="Login/Register" primary />
                    )}
                </nav>
            </div>
        </header>
    );
};


// TemplatesPage component (remains client-side for now, as templates are public data in Firestore)
const TemplatesPage = () => {
    // Note: Templates are still fetched from Firestore's public collection
    // This is because templates are generally static and public for all users.
    // If templates needed to be customizable per user or managed by backend,
    // they would be moved to MySQL and accessed via backend API.
    const { db, showMessage, auth } = useContext(AppContext); // Destructure showMessage and auth here
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        // Ensure auth is defined to access app.options.appId for the path
        if (!auth || !auth.app || !auth.app.options || !auth.app.options.appId) {
            console.error("Firebase Auth or App ID not available for templates.");
            setLoading(false);
            return;
        }

        const templateCollectionRef = collection(db, `artifacts/${auth.app.options.appId}/public/data/templates`);
        const unsubscribe = onSnapshot(templateCollectionRef, (snapshot) => {
            const templatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTemplates(templatesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching templates:", error);
            showMessage("Failed to load templates.", "error"); // This line is within the onSnapshot callback
            setLoading(false);
        });

        // Define addInitialTemplates directly within this useEffect's scope
        const addInitialTemplates = async () => {
            // Check if collection is empty before adding defaults
            const existingDocs = await getDocs(templateCollectionRef); // templateCollectionRef is in scope
            if (existingDocs.empty) {
                const initialTemplates = [
                    {
                        name: "Classic Professional Resume",
                        type: "resume",
                        description: "A clean, traditional layout suitable for most industries. Includes sections for contact, summary, experience, education, and skills.",
                        isPremium: false,
                        imageUrl: "https://placehold.co/300x400/99e699/000000?text=Basic+Resume",
                        content: JSON.stringify({
                            structure: ["contact", "summary", "experience", "education", "skills"],
                            layout: "two-column",
                            fonts: "serif"
                        })
                    },
                    {
                        name: "Modern ATS-Friendly Resume",
                        type: "resume",
                        description: "Optimized for Applicant Tracking Systems, with a contemporary design and clear headings.",
                        isPremium: true,
                        imageUrl: "https://placehold.co/300x400/66b3ff/000000?text=Premium+Resume",
                        content: JSON.stringify({
                            structure: ["contact", "summary", "skills", "experience", "education"],
                            layout: "single-column",
                            fonts: "sans-serif"
                        })
                    },
                    {
                        name: "Simple Cover Letter",
                        type: "cover_letter",
                        description: "A straightforward cover letter format, ideal for direct applications.",
                        isPremium: false,
                        imageUrl: "https://placehold.co/300x400/ffcc99/000000?text=Basic+Letter",
                        content: JSON.stringify({
                            sections: ["date", "your_info", "recipient_info", "salutation", "body", "closing"],
                            tone: "formal"
                        })
                    },
                    {
                        name: "Dynamic Cover Letter",
                        type: "cover_letter",
                        description: "A more engaging cover letter structure, designed to capture recruiter attention.",
                        isPremium: true,
                        imageUrl: "https://placehold.co/300x400/ff99cc/000000?text=Premium+Letter",
                        content: JSON.stringify({
                            sections: ["date", "your_info", "recipient_info", "salutation", "body_intro_hook", "body_skills_match", "body_call_to_action", "closing"],
                            tone: "persuasive"
                        })
                    }
                ];

                for (const template of initialTemplates) {
                    await addDoc(templateCollectionRef, { ...template, createdAt: new Date() });
                }
                showMessage("Initial templates seeded to Firestore.", "info");
            }
        };

        // Delay seeding until auth is ready and db is available
        const timeoutId = setTimeout(() => {
            if (db) {
                addInitialTemplates(); // Call the locally defined function
            }
        }, 1000);

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [db, showMessage, auth]); // All dependencies are correctly listed for the useEffect


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg">Loading templates...</p>
            </div>
        );
    }

    return (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">Available Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                        <div>
                            <img src={template.imageUrl || `https://placehold.co/300x400/cccccc/000000?text=${template.type.toUpperCase()}`} alt={template.name} className="w-full h-48 object-cover rounded-md mb-4 border border-gray-200 dark:border-gray-600" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{template.description}</p>
                        </div>
                        <div className="mt-4 flex flex-col space-y-2">
                            {template.isPremium ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                    Premium
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    Free
                                </span>
                            )}
                            <Button label="Use Template" onClick={() => showMessage(`Using "${template.name}" (feature under development). You would be redirected to builder.`, "info")} primary />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// Default export of the App component
export default App;
