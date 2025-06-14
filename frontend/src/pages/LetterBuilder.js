// frontend/src/pages/LetterBuilder.js
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import api from '../services/api'; // Import our Axios instance for backend calls
import { InputField, TextAreaField, Button } from '../components/common'; // Assuming common UI components

const CoverLetterBuilder = () => {
    const { userId, showMessage, selectedDocId, setSelectedDocId, setCurrentPage } = useContext(AppContext);
    const [letterData, setLetterData] = useState({
        recipientName: '',
        companyName: '',
        jobTitle: '',
        yourName: '',
        yourContact: '',
        date: new Date().toISOString().substring(0, 10), // ISO-MM-DD
        body: '',
    });
    const [loadingDoc, setLoadingDoc] = useState(!!selectedDocId); // Loading state for existing doc

    // Load existing document from backend if selectedDocId is set
    useEffect(() => {
        const loadDocument = async () => {
            if (!userId || !selectedDocId) {
                setLoadingDoc(false);
                return;
            }

            try {
                const response = await api.get(`/letters/${selectedDocId}`);
                const data = response.data.data; // The actual letter content is in the 'data' field of the response
                setLetterData(data);
                showMessage("Cover Letter loaded for editing.", "info");
            } catch (error) {
                console.error("Error loading cover letter from backend:", error);
                showMessage("Failed to load cover letter. It might not exist or you don't have access.", "error");
                setSelectedDocId(null); // Clear selected ID if not found or error
            } finally {
                setLoadingDoc(false);
            }
        };

        if (selectedDocId) {
            loadDocument();
        } else {
            setLetterData({
                recipientName: '',
                companyName: '',
                jobTitle: '',
                yourName: '',
                yourContact: '',
                date: new Date().toISOString().substring(0, 10),
                body: '',
            });
            setLoadingDoc(false);
        }
    }, [selectedDocId, userId, showMessage, setSelectedDocId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLetterData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLetter = async () => {
        if (!userId) {
            showMessage("Please log in to save documents.", "error");
            return;
        }

        try {
            // A simple title for the document
            const docTitle = letterData.jobTitle ? `Cover Letter for ${letterData.jobTitle}` : 'Untitled Cover Letter';

            if (selectedDocId) {
                // Update existing document via backend API (PUT request)
                await api.put(`/letters/${selectedDocId}`, {
                    title: docTitle,
                    data: letterData,
                });
                showMessage("Cover Letter updated successfully!", "success");
            } else {
                // Create new document via backend API (POST request)
                const response = await api.post('/letters', {
                    title: docTitle,
                    data: letterData,
                });
                showMessage("Cover Letter saved successfully!", "success");
                setSelectedDocId(response.data.id); // Set the new ID for potential further edits
            }
            setCurrentPage('dashboard'); // Go back to dashboard after saving
        } catch (error) {
            console.error("Error saving cover letter to backend:", error);
            showMessage(`Failed to save cover letter: ${error.response?.data?.message || error.message}`, "error");
        }
    };

    // Placeholder for AI generator feature (still client-side for now)
    const handleAIGenerate = async () => {
        showMessage("AI Cover Letter Generator feature under development.", "info");
        // Example AI call (using gemini-2.0-flash as specified)
        try {
            let chatHistory = [];
            const prompt = `Write a professional cover letter body for the position of "${letterData.jobTitle}" at "${letterData.companyName}". Mention the recipient is "${letterData.recipientName}". Emphasize strong communication skills and problem-solving abilities.`;
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setLetterData(prev => ({ ...prev, body: text }));
                showMessage("AI generated letter body!", "info");
            } else {
                showMessage("AI could not generate letter. Please try again.", "error");
            }
        } catch (error) {
            console.error("AI generation error:", error);
            showMessage("Error connecting to AI. Please try again.", "error");
        }
    };

    const handleExportPdf = () => {
        showMessage("PDF export feature coming soon! (Backend integration with Puppeteer/jsPDF is needed)", "info");
        // In a real application, you would make an API call to your backend
        // (e.g., api.post('/generate-pdf/letter', { letterData }))
        // and the backend (using Puppeteer or jsPDF-node) would generate and return the PDF.
    };

    if (loadingDoc) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-700 dark:text-gray-300">Loading cover letter data...</p>
            </div>
        );
    }

    return (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">{selectedDocId ? 'Edit Cover Letter' : 'New Cover Letter'}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cover Letter Input Form */}
                <div className="space-y-6">
                    <InputField label="Recipient Name" name="recipientName" value={letterData.recipientName} onChange={handleChange} />
                    <InputField label="Company Name" name="companyName" value={letterData.companyName} onChange={handleChange} />
                    <InputField label="Job Title Applying For" name="jobTitle" value={letterData.jobTitle} onChange={handleChange} />
                    <InputField label="Your Name" name="yourName" value={letterData.yourName} onChange={handleChange} />
                    <InputField label="Your Contact Info (Email, Phone)" name="yourContact" value={letterData.yourContact} onChange={handleChange} />
                    <InputField label="Date" name="date" type="date" value={letterData.date} onChange={handleChange} />
                    <TextAreaField label="Letter Body" name="body" value={letterData.body} onChange={handleChange} rows="10" placeholder="Start writing your cover letter here..." />
                    <Button label="Generate with AI" onClick={handleAIGenerate} className="bg-green-500 text-white hover:bg-green-600 w-full" />
                </div>

                {/* Cover Letter Live Preview */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner overflow-auto h-full max-h-[80vh] sticky top-4">
                    <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">Live Preview</h3>
                    <div className="letter-preview p-5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 shadow-md whitespace-pre-wrap">
                        <p className="text-right text-sm mb-4">{letterData.date || 'YYYY-MM-DD'}</p>
                        <p className="mb-1">{letterData.yourName || 'Your Name'}</p>
                        <p className="mb-4">{letterData.yourContact || 'Your Contact Info'}</p>

                        <p className="mb-1">{letterData.recipientName || 'Recipient Name'}</p>
                        <p className="mb-1">{letterData.companyName || 'Company Name'}</p>
                        <p className="mb-4">{letterData.jobTitle || 'Job Title'}</p>

                        <p className="mb-4">Dear {letterData.recipientName || 'Hiring Manager'},</p>

                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                            {letterData.body || 'This is where your compelling cover letter body will appear. Explain your interest in the role, highlight your relevant skills and experiences, and articulate why you are a strong candidate for the position. Conclude with a call to action and a polite closing.'}
                        </p>

                        <p className="mt-8">Sincerely,</p>
                        <p className="mt-1">{letterData.yourName || 'Your Name'}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
                <Button label={selectedDocId ? "Update Letter" : "Save Letter"} onClick={handleSaveLetter} primary />
                <Button label="Export to PDF" onClick={handleExportPdf} />
                <Button label="Cancel" onClick={() => { setSelectedDocId(null); setCurrentPage('dashboard'); }} className="bg-gray-400 text-white hover:bg-gray-500" />
            </div>
        </section>
    );
};

export default CoverLetterBuilder;
