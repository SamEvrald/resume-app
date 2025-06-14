// frontend/src/pages/ResumeBuilder.js
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import api from '../services/api'; // Import our Axios instance for backend calls
import { InputField, TextAreaField, Button } from '../components/common'; // Assuming common UI components

const ResumeBuilder = () => {
    const { userId, showMessage, selectedDocId, setSelectedDocId, setCurrentPage } = useContext(AppContext);
    const [resumeData, setResumeData] = useState({
        name: '',
        contact: '',
        summary: '',
        experience: [{ title: '', company: '', years: '', description: '' }],
        education: [{ degree: '', university: '', years: '' }],
        skills: '',
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
                const response = await api.get(`/resumes/${selectedDocId}`);
                const data = response.data.data; // The actual resume content is in the 'data' field of the response
                setResumeData(data);
                showMessage("Resume loaded for editing.", "info");
            } catch (error) {
                console.error("Error loading resume from backend:", error);
                showMessage("Failed to load resume. It might not exist or you don't have access.", "error");
                setSelectedDocId(null); // Clear selected ID if not found or error
            } finally {
                setLoadingDoc(false);
            }
        };

        if (selectedDocId) {
            loadDocument();
        } else {
            // Reset to default if creating a new document
            setResumeData({
                name: '',
                contact: '',
                summary: '',
                experience: [{ title: '', company: '', years: '', description: '' }],
                education: [{ degree: '', university: '', years: '' }],
                skills: '',
            });
            setLoadingDoc(false);
        }
    }, [selectedDocId, userId, showMessage, setSelectedDocId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e, index, field, arrayName) => {
        const { value } = e.target;
        setResumeData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addField = (arrayName) => {
        if (arrayName === 'experience') {
            setResumeData(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', years: '', description: '' }] }));
        } else if (arrayName === 'education') {
            setResumeData(prev => ({ ...prev, education: [...prev.education, { degree: '', university: '', years: '' }] }));
        }
    };

    const removeField = (index, arrayName) => {
        setResumeData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const handleSaveResume = async () => {
        if (!userId) {
            showMessage("Please log in to save documents.", "error");
            return;
        }

        try {
            // A simple title for the document (can be made more dynamic)
            const docTitle = resumeData.name ? `${resumeData.name}'s Resume` : 'Untitled Resume';

            if (selectedDocId) {
                // Update existing document via backend API (PUT request)
                await api.put(`/resumes/${selectedDocId}`, {
                    title: docTitle,
                    data: resumeData,
                });
                showMessage("Resume updated successfully!", "success");
            } else {
                // Create new document via backend API (POST request)
                const response = await api.post('/resumes', {
                    title: docTitle,
                    data: resumeData,
                });
                showMessage("Resume saved successfully!", "success");
                setSelectedDocId(response.data.id); // Set the new ID for potential further edits
            }
            setCurrentPage('dashboard'); // Go back to dashboard after saving
        } catch (error) {
            console.error("Error saving resume to backend:", error);
            showMessage(`Failed to save resume: ${error.response?.data?.message || error.message}`, "error");
        }
    };

    // Placeholder for AI assistant feature (still client-side for now)
    const handleAISuggestion = async () => {
        showMessage("AI Assistant feature under development.", "info");
        // Example AI call (using gemini-2.0-flash as specified)
        try {
            let chatHistory = [];
            const prompt = `Generate 3 strong, concise bullet points for a resume experience section based on the following role description: "${resumeData.experience[0]?.description}". Focus on achievements and quantifiable results.`;
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // Canvas will automatically provide this
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
                showMessage(`AI Suggestion: ${text}`, "info");
                // In a real app, you'd parse this and let the user add it to their resume
            } else {
                showMessage("AI could not generate suggestions. Please try again.", "error");
            }
        } catch (error) {
            console.error("AI suggestion error:", error);
            showMessage("Error connecting to AI. Please try again.", "error");
        }
    };


    const handleExportPdf = () => {
        showMessage("PDF export feature coming soon! (Backend integration with Puppeteer/jsPDF is needed)", "info");
        // In a real application, you would make an API call to your backend
        // (e.g., api.post('/generate-pdf/resume', { resumeData }))
        // and the backend (using Puppeteer or jsPDF-node) would generate and return the PDF.
    };

    if (loadingDoc) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-700 dark:text-gray-300">Loading resume data...</p>
            </div>
        );
    }

    return (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">{selectedDocId ? 'Edit Resume' : 'New Resume'}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resume Input Form */}
                <div className="space-y-6">
                    <InputField label="Full Name" name="name" value={resumeData.name} onChange={handleChange} />
                    <InputField label="Contact Info (Email, Phone, LinkedIn)" name="contact" value={resumeData.contact} onChange={handleChange} />
                    <TextAreaField label="Professional Summary" name="summary" value={resumeData.summary} onChange={handleChange} placeholder="A concise summary of your experience and career goals." />

                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">Experience</h3>
                    {resumeData.experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 p-4 rounded-md space-y-3">
                            <InputField label="Job Title" name="title" value={exp.title} onChange={(e) => handleArrayChange(e, index, 'title', 'experience')} />
                            <InputField label="Company" name="company" value={exp.company} onChange={(e) => handleArrayChange(e, index, 'company', 'experience')} />
                            <InputField label="Years (e.g., 2020-2023)" name="years" value={exp.years} onChange={(e) => handleArrayChange(e, index, 'years', 'experience')} />
                            <TextAreaField label="Responsibilities & Achievements (use bullet points)" name="description" value={exp.description} onChange={(e) => handleArrayChange(e, index, 'description', 'experience')} />
                            <div className="flex space-x-2">
                                <Button label="AI Suggestion" onClick={() => handleAISuggestion()} className="bg-purple-500 text-white hover:bg-purple-600 text-sm py-1 px-3" />
                                {resumeData.experience.length > 1 && (
                                    <Button label="Remove" onClick={() => removeField(index, 'experience')} className="bg-red-400 text-white hover:bg-red-500 text-sm py-1 px-3" />
                                )}
                            </div>
                        </div>
                    ))}
                    <Button label="+ Add Experience" onClick={() => addField('experience')} primary className="w-full" />

                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">Education</h3>
                    {resumeData.education.map((edu, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 p-4 rounded-md space-y-3">
                            <InputField label="Degree/Program" name="degree" value={edu.degree} onChange={(e) => handleArrayChange(e, index, 'degree', 'education')} />
                            <InputField label="University/Institution" name="university" value={edu.university} onChange={(e) => handleArrayChange(e, index, 'university', 'education')} />
                            <InputField label="Years (e.g., 2016-2020)" name="years" value={edu.years} onChange={(e) => handleArrayChange(e, index, 'years', 'education')} />
                            {resumeData.education.length > 1 && (
                                <Button label="Remove" onClick={() => removeField(index, 'education')} className="bg-red-400 text-white hover:bg-red-500 text-sm py-1 px-3" />
                            )}
                        </div>
                    ))}
                    <Button label="+ Add Education" onClick={() => addField('education')} primary className="w-full" />

                    <InputField label="Skills (comma-separated)" name="skills" value={resumeData.skills} onChange={handleChange} placeholder="e.g., JavaScript, React, MySQL, Project Management" />
                </div>

                {/* Resume Live Preview */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner overflow-auto h-full max-h-[80vh] sticky top-4">
                    <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">Live Preview</h3>
                    <div className="resume-preview p-5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 shadow-md">
                        <h4 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{resumeData.name || 'Your Name'}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{resumeData.contact || 'Contact Info'}</p>

                        <h5 className="text-lg font-semibold border-b-2 border-blue-500 pb-1 mb-2">Summary</h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{resumeData.summary || 'A brief professional summary.'}</p>

                        <h5 className="text-lg font-semibold border-b-2 border-blue-500 pb-1 mb-2">Experience</h5>
                        {resumeData.experience.map((exp, index) => (
                            <div key={index} className="mb-3">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-200">{exp.title || 'Job Title'} at {exp.company || 'Company'} <span className="float-right text-sm">{exp.years || 'Years'}</span></h6>
                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm">
                                    {(exp.description || 'Key responsibilities and achievements.').split('\n').map((item, i) => item.trim() && <li key={i}>{item.trim()}</li>)}
                                </ul>
                            </div>
                        ))}

                        <h5 className="text-lg font-semibold border-b-2 border-blue-500 pb-1 mb-2">Education</h5>
                        {resumeData.education.map((edu, index) => (
                            <div key={index} className="mb-3">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-200">{edu.degree || 'Degree'} from {edu.university || 'University'} <span className="float-right text-sm">{edu.years || 'Years'}</span></h6>
                            </div>
                        ))}

                        <h5 className="text-lg font-semibold border-b-2 border-blue-500 pb-1 mb-2">Skills</h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{resumeData.skills || 'Your skills here.'}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
                <Button label={selectedDocId ? "Update Resume" : "Save Resume"} onClick={handleSaveResume} primary />
                <Button label="Export to PDF" onClick={handleExportPdf} />
                <Button label="Cancel" onClick={() => { setSelectedDocId(null); setCurrentPage('dashboard'); }} className="bg-gray-400 text-white hover:bg-gray-500" />
            </div>
        </section>
    );
};

export default ResumeBuilder;
