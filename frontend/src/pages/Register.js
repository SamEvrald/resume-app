// frontend/src/pages/Register.js
import React, { useState, useContext } from 'react';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider, // For Google Sign-in
    signInWithPopup // For Google Sign-in
} from 'firebase/auth';
import { auth } from '../services/firebase'; // Firebase auth instance
import { AppContext } from '../App'; // AppContext for global state and showMessage
import api from '../services/api'; // Axios instance for backend calls
import { InputField, Button } from '../components/common'; // Reusable UI components

const RegisterForm = ({ setCurrentAuthPage }) => {
    const { showMessage, setCurrentPage } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    // Password validation function
    const validatePassword = (pass) => {
        if (pass.length < 6) {
            return "Password must be at least 6 characters long.";
        }
        return null;
    };

    // Handler for Email/Password registration
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const passwordError = validatePassword(password);
        if (passwordError) {
            showMessage(passwordError, 'error');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            setLoading(false);
            return;
        }

        try {
            // 1. Create user with Email and Password in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Update Firebase user profile with display name
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName) {
                await updateProfile(firebaseUser, { displayName: fullName });
            }

            // 3. Send email verification
            await sendEmailVerification(firebaseUser);

            // 4. Get ID token and sync user data (including names) with your backend
            const idToken = await firebaseUser.getIdToken();
            await api.post('/auth/sync-user', {
                email: firebaseUser.email,
                firstName: firstName,
                lastName: lastName
            }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            showMessage('Registration successful! Please check your email to verify your account before logging in.', 'success');
            setCurrentAuthPage('login'); // Redirect to login page
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(`Registration failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handler for Google Sign-in
    const handleGoogleRegister = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Extract first and last name from Google profile if available
            // Google's displayName usually provides full name. We can try to split it.
            const googleFullName = firebaseUser.displayName || '';
            const googleFirstName = googleFullName.split(' ')[0] || '';
            const googleLastName = googleFullName.split(' ').slice(1).join(' ') || '';

            // Get ID token and sync user data with your backend
            const idToken = await firebaseUser.getIdToken();
            await api.post('/auth/sync-user', {
                email: firebaseUser.email,
                firstName: googleFirstName,
                lastName: googleLastName
            }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            showMessage('Signed in with Google successfully!', 'success');
            setCurrentPage('dashboard'); // Redirect to dashboard
        } catch (error) {
            console.error('Google registration/login error:', error);
            showMessage(`Google registration/login failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                />
                <InputField
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                />
                <InputField
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                />
                <InputField
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                />
                <InputField
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    required
                />
                <Button label={loading ? 'Registering...' : 'Register'} type="submit" primary className="w-full" disabled={loading} />
            </form>
            <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
                <p>Already have an account? <a href="#" onClick={() => setCurrentAuthPage('login')} className="text-blue-500 hover:underline">Login here</a></p>
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <Button
                    onClick={handleGoogleRegister}
                    label={loading ? 'Signing up with Google...' : 'Sign up with Google'}
                    className="w-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center space-x-2"
                    disabled={loading}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.24 10.29v3.52h6.81a8.429 8.429 0 00-.28-1.87 8.527 8.527 0 00-1.25-1.99l.06-.06z" fill="#4285F4"/>
                        <path d="M12.24 13.81v-3.52H5.43c-.15.4-.24.83-.24 1.28s.09.88.24 1.28z" fill="#34A853"/>
                        <path d="M12.24 13.81l3.32 2.58 1.1-.96a8.52 8.52 0 00-.2-1.29l-4.22-1.33z" fill="#FBBC05"/>
                        <path d="M12.24 10.29L8.92 7.71 7.82 8.67a8.52 8.52 0 00.2 1.29z" fill="#EA4335"/>
                        <path d="M21.75 12c0-.7-.06-1.37-.16-2.03h-9.35v3.52h5.58c-.22 1.13-.89 2.09-1.9 2.76v2.28h2.93c1.72-1.6 2.72-3.95 2.72-6.53z" fill="#4285F4"/>
                    </svg>
                    <span>{loading ? 'Signing up with Google...' : 'Sign up with Google'}</span>
                </Button>
            </div>
        </div>
    );
};

export default RegisterForm;
