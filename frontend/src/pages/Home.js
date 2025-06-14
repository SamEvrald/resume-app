// frontend/src/pages/Home.js (Dashboard)
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import api from '../services/api'; // Import our Axios instance for backend calls
import { Button } from '../components/common'; // Assuming common UI components

const Dashboard = () => {
    const { userId, showMessage, setCurrentPage, setSelectedDocId } = useContext(AppContext);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user documents from backend
    useEffect(() => {
        const fetchDocuments = async () => {
            if (!userId) {
                setLoading(false);
                setDocuments([]); // Clear documents if user logs out
                return;
            }

            setLoading(true);
            try {
                // Fetch resumes
                const resumesResponse = await api.get('/resumes');
                const resumes = resumesResponse.data.map(doc => ({
                    ...doc,
                    type: 'resume',
                    // Convert MySQL timestamps to JS Date objects for consistency
                    createdAt: new Date(doc.created_at),
                    updatedAt: new Date(doc.updated_at),
                    // Backend already parses 'data' JSON string, so no need for client-side parse
                }));

                // Fetch cover letters
                const lettersResponse = await api.get('/letters');
                const coverLetters = lettersResponse.data.map(doc => ({
                    ...doc,
                    type: 'cover_letter',
                    // Convert MySQL timestamps to JS Date objects for consistency
                    createdAt: new Date(doc.created_at),
                    updatedAt: new Date(doc.updated_at),
                    // Backend already parses 'data' JSON string, so no need for client-side parse
                }));

                const allDocuments = [...resumes, ...coverLetters];
                // Sort by updatedAt descending
                allDocuments.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
                setDocuments(allDocuments);

            } catch (error) {
                console.error("Error fetching documents from backend:", error);
                showMessage("Failed to load your documents. Please try logging in again.", "error");
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [userId, showMessage]); // Re-run when userId changes

    // Handle editing a document
    const handleEdit = (docId, docType) => {
        setSelectedDocId(docId);
        if (docType === 'resume') {
            setCurrentPage('resumeBuilder');
        } else if (docType === 'cover_letter') {
            setCurrentPage('coverLetterBuilder');
        }
    };

    // Handle deleting a document
    const handleDelete = async (docId, docType) => {
        if (!userId) {
            showMessage("You must be logged in to delete documents.", "error");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this document?"); // This will be replaced by a custom modal in a real app
        if (!confirmDelete) return;

        try {
            if (docType === 'resume') {
                await api.delete(`/resumes/${docId}`);
            } else if (docType === 'cover_letter') {
                await api.delete(`/letters/${docId}`);
            }
            showMessage("Document deleted successfully!", "info");
            // Documents will automatically re-fetch due to useEffect dependency on userId and the backend update
        } catch (error) {
            console.error("Error deleting document from backend:", error);
            showMessage("Failed to delete document. Please try again.", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-700 dark:text-gray-300">Loading your saved documents...</p>
            </div>
        );
    }

    return (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">Your Documents</h2>
            {documents.length === 0 ? (
                <p className="text-center text-lg text-gray-600 dark:text-gray-300">
                    You haven't created any documents yet. Start by creating a <a href="#" onClick={() => setCurrentPage('resumeBuilder')} className="text-blue-500 hover:underline">Resume</a> or a <a href="#" onClick={() => setCurrentPage('coverLetterBuilder')} className="text-blue-500 hover:underline">Cover Letter</a>!
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{doc.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize mb-2">Type: {doc.type.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Last Updated: {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div className="flex space-x-3 mt-4">
                                <Button label="Edit" onClick={() => handleEdit(doc.id, doc.type)} primary />
                                <Button label="Delete" onClick={() => handleDelete(doc.id, doc.type)} className="bg-red-500 text-white hover:bg-red-600" />
                                <Button label="Download PDF" onClick={() => showMessage("PDF download feature coming soon! (Backend integration needed)", "info")} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Dashboard;
