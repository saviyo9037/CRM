import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadbulkleads } from '../services/leadsRouter';
import { useDispatch } from 'react-redux';
import { toggleUploadcsvmodal } from '../redux/modalSlice';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { API_URL } from '../utils/urls';

function Uploadcsvmodal() {
    const [csvFile, setCsvFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showsuccess, setshowsuccess] = useState(false);
    const [uploadedLeads, setUploadedLeads] = useState([]);
    const dispatch = useDispatch();
    const queryclient = useQueryClient();

    const uploadingcsv = useMutation({
        mutationKey: ['Uploading CSV'],
        mutationFn: uploadbulkleads,
        onSuccess: (data) => {
            queryclient.invalidateQueries(['List leads']);
            setCsvFile(null);
            setUploadedLeads(data?.data || []);
        },
        onError: (error) => {
            setErrorMessage(error?.response?.data?.message || "Upload failed. Please try again.");
        }
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
            setErrorMessage('');
        } else {
            setErrorMessage('Please upload a valid CSV file.');
            setCsvFile(null);
        }
    };

    const handleSubmit = async () => {
        if (!csvFile) {
            setErrorMessage('Please select a CSV file before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('csvfile', csvFile);
        await uploadingcsv.mutateAsync(formData);
        setshowsuccess(true);
        setTimeout(() => {
            setshowsuccess(false)
            dispatch(toggleUploadcsvmodal());
        }, 5000);
    };

    const handleDownload = () => {
        if (uploadedLeads.length === 0) {
            return;
        }

        const headers = Object.keys(uploadedLeads[0]);
        const csvContent = [
            headers.join(','),
            ...uploadedLeads.map(lead => 
                headers.map(header => 
                    `"${lead[header] || ''}"`
                ).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'uploaded_leads.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#141414] border border-[#262626] w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 text-white">
                <div className="flex justify-between items-center pb-3 border-b border-[#262626]">
                    <h2 className="text-xl font-bold text-white">Upload CSV Leads</h2>
                    <a
                        href={`${API_URL}/leads/csv-template`}
                        download
                        className="text-xs font-semibold bg-[#222222] hover:bg-[#2e2e2e] text-[#FF8A00] border border-[#FF8A00]/40 px-3 py-1.5 rounded-lg transition"
                    >
                        Download Template
                    </a>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Upload Box */}
                <label
                    htmlFor="csv-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[#FF8A00]/50 hover:border-[#FF8A00] bg-[#181818] hover:bg-[#1d1d1d] p-7 rounded-xl cursor-pointer transition group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-[#FF8A00] mb-2 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1M4 12l1.293-1.293a1 1 0 011.414 0L12 16l5.293-5.293a1 1 0 011.414 0L20 12m-8 4V4" />
                    </svg>
                    <p className="text-[#FF8A00] font-medium text-sm">Click to browse .csv file</p>
                    <p className="text-gray-500 text-xs mt-1">Maximum file size: 10MB</p>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>

                {/* File name */}
                {csvFile && (
                    <div className="bg-[#1a1a1a] border border-[#333333] px-3 py-2 rounded-lg text-center text-sm text-gray-300">
                        Selected File: <span className="font-semibold text-[#FF8A00]">{csvFile.name}</span>
                    </div>
                )}

                {/* Spinner */}
                {uploadingcsv.isPending && (
                    <div className="flex justify-center">
                        <Spinner />
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between gap-3 pt-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#FF8A00]/20 disabled:opacity-50"
                        disabled={uploadingcsv.isPending}
                    >
                        Submit
                    </button>
                    <button
                        onClick={() => dispatch(toggleUploadcsvmodal())}
                        className="flex-1 bg-[#222222] hover:bg-[#2a2a2a] text-white border border-[#333333] px-4 py-2.5 rounded-xl transition font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Success Popup */}
            <AnimatePresence>
                {showsuccess && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div
                            className="relative z-10 bg-[#141414] border border-[#FF8A00]/50 text-white px-8 py-6 rounded-2xl shadow-2xl font-semibold w-full max-w-sm flex flex-col items-center justify-center text-center space-y-4"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl">
                                ✓
                            </div>
                            <p className="text-white text-base">Leads added successfully!</p>
                            <button
                                onClick={handleDownload}
                                className="bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold px-4 py-2 rounded-xl transition text-sm shadow-md"
                            >
                                Download Uploaded Leads
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Uploadcsvmodal;