// frontend/src/pages/Login.js
import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import GoogleAuthProvider and signInWithPopup
import { auth } from '../services/firebase';
import { AppContext } from '../App';
import { InputField, Button } from '../components/common';
import api from '../services/api'; // Import api for backend sync

const LoginForm = ({ setCurrentAuthPage }) => {
    const { showMessage, setCurrentPage } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Optional: You can check for email verification here if you want to restrict login
            // if (!firebaseUser.emailVerified) {
            //     showMessage('Please verify your email address before logging in.', 'error');
            //     setLoading(false);
            //     // You might offer to resend verification email here
            //     return;
            // }

            // Get ID token and sync user data with your backend
            const idToken = await firebaseUser.getIdToken();
            await api.post('/auth/sync-user', {
                email: firebaseUser.email,
                // For login, we don't necessarily send firstName/lastName here,
                // as they should already be in the backend from registration.
                // The backend's syncUser logic will handle updates if data changes in Firebase.
            }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            showMessage('Logged in successfully!', 'success');
            setCurrentPage('dashboard'); // Redirect to dashboard on successful login
        } catch (error) {
            console.error('Login error:', error);
            showMessage(`Login failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Extract first and last name from Google profile if available
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

            showMessage('Logged in with Google successfully!', 'success');
            setCurrentPage('dashboard');
        } catch (error) {
            console.error('Google login error:', error);
            showMessage(`Google login failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
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
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                />
                <Button label={loading ? 'Logging In...' : 'Login'} type="submit" primary className="w-full" disabled={loading} />
            </form>
            <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
                <p>Don't have an account? <a href="#" onClick={() => setCurrentAuthPage('register')} className="text-blue-500 hover:underline">Register here</a></p>
                <p className="mt-2">Forgot password? <a href="#" onClick={() => setCurrentAuthPage('reset-password')} className="text-blue-500 hover:underline">Reset it</a></p>
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <Button
                    onClick={handleGoogleLogin}
                    label={loading ? 'Signing in with Google...' : 'Sign in with Google'}
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
                    <span>{loading ? 'Signing in with Google...' : 'Sign in with Google'}</span>
                </Button>
            </div>
        </div>
    );
};

export default LoginForm;
