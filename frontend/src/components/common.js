// frontend/src/components/common.js

import React from 'react';

export const Button = ({ onClick, label, primary = false, className = '', disabled = false, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md
            ${primary ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-800 hover:bg-gray-100'}
            ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
    >
        {label}
    </button>
);

export const InputField = ({ label, name, value, onChange, type = 'text', placeholder = '', className = '', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${className}`}
            required={required}
        />
    </div>
);

export const TextAreaField = ({ label, name, value, onChange, rows = 3, placeholder = '', className = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${className}`}
        ></textarea>
    </div>
);

export const MessageBox = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    const textColor = 'text-white';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`relative ${bgColor} ${textColor} p-6 rounded-lg shadow-xl max-w-sm w-full animate-fade-in-up`}>
                <p className="text-lg font-semibold mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white hover:text-gray-200 text-2xl font-bold"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};
