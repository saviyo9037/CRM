import React from 'react';

const LeadDetailModal = ({ leads, onClose }) => {
  if (!leads || leads.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#141414] border border-[#282828] text-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#242424]">
          <h2 className="text-xl font-bold text-[#FF8A00] flex items-center gap-2">
            <span>📋</span> Lead Details
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-[#FF8A00] text-2xl transition"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4">
          <table className="min-w-full divide-y divide-[#262626] rounded-xl overflow-hidden border border-[#262626]">
            <thead className="bg-[#181818]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#FF8A00] uppercase tracking-wider">Lead Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#FF8A00] uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="bg-[#121212] divide-y divide-[#222222]">
              {leads.map(lead => (
                <tr key={lead._id} className="hover:bg-[#1A1A1A] transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.source?.title || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;