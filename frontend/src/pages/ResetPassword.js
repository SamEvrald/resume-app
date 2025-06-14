// frontend/src/pages/ResetPassword.js
import React, { useState, useContext } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase'; // Corrected import path
import { AppContext } from '../App'; // Assuming AppContext is exported from App.js
import { InputField, Button } from '../components/common'; // Assuming common components

const ResetPasswordForm = ({ setCurrentAuthPage }) => {
    const { showMessage } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            showMessage('Password reset email sent! Check your inbox.', 'success');
            setCurrentAuthPage('login'); // Go back to login after sending email
        } catch (error) {
            console.error('Password reset error:', error);
            showMessage(`Password reset failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">Reset Password</h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                />
                <Button label={loading ? 'Sending...' : 'Send Reset Email'} type="submit" primary className="w-full" disabled={loading} />
            </form>
            <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
                <p><a href="#" onClick={() => setCurrentAuthPage('login')} className="text-blue-500 hover:underline">Back to Login</a></p>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
