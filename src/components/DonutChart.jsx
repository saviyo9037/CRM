// import React, { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import moment from "moment";
// import { listleads } from "../services/leadsRouter";
// import Spinner from "./Spinner";
// import LeadDetailModal from "./LeadDetailModal";

// const LeadStatusDonutChart = ({
//   leads: externalLeads,
//   isLoading: externalIsLoading = false,
//   startDate,
//   endDate,
//   title = "Lead Status Overview",
// }) => {
//   const user = useSelector((state) => state.auth.user);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState(null);

//   // ───── FETCH LEADS ONLY IF NO externalLeads PROVIDED ─────
//   const {
//     data: fetchedLeads,
//     isLoading: isFetching,
//     isError: fetchError,
//     error: fetchErrorObj,
//   } = useQuery({
//     queryKey: ["List leads", startDate, endDate],
//     queryFn: () =>
//       listleads({
//         startDate: moment(startDate).startOf("day").toISOString(),
//         endDate: moment(endDate).endOf("day").toISOString(),
//         noLimit: true,
//       }),
//     enabled: !!user && !!startDate && !!endDate && !externalLeads,
//     keepPreviousData: true, // ← keeps old data during refetch
//     staleTime: 1000 * 30,   // 30 sec
//   });

//   // ───── UNIFY DATA SOURCES ─────
//   const leads = externalLeads ?? fetchedLeads?.leads ?? [];
//   const isLoading = externalIsLoading || isFetching;
//   const isError = fetchError;
//   const error = fetchErrorObj;

//   // ───── FILTER BY USER ROLE ─────
//   const filteredLeads = useMemo(() => {
//     if (!leads.length) return [];

//     if (user?.role === "Admin" || user?.role === "Sub-Admin") {
//       return leads;
//     }

//     const uid = user?.id;
//     if (!uid) return [];

//     return leads.filter((lead) => {
//       const ids = [
//         typeof lead.createdBy === "object" ? lead.createdBy?._id : lead.createdBy,
//         typeof lead.updatedBy === "object" ? lead.updatedBy?._id : lead.updatedBy,
//         typeof lead.assignedTo === "object" ? lead.assignedTo?._id : lead.assignedTo,
//       ].filter(Boolean);

//       return ids.includes(uid);
//     });
//   }, [leads, user]);

//   // ───── COUNT STATUSES ─────
//   const statusCounts = useMemo(() => {
//     const counts = {
//       new: 0,
//       open: 0,
//       converted: 0,
//       walkin: 0,
//       paused: 0,
//       rejected: 0,
//       unavailable: 0,
//       other: 0, // Add 'other' category
//     };

//     filteredLeads.forEach((lead) => {
//       const status = (lead.status ?? "").trim().toLowerCase();
//       if (counts.hasOwnProperty(status)) {
//         counts[status]++;
//       } else {
//         counts.other++; // Increment 'other' for unknown statuses
//       }
//     });

//     return counts;
//   }, [filteredLeads]);

//   const activeStatuses = Object.keys(statusCounts).filter((s) => statusCounts[s] > 0);
//   const totalLeads = activeStatuses.reduce((sum, s) => sum + statusCounts[s], 0);
//   const hasData = totalLeads > 0;

//   // ───── CLICK HANDLER ─────
//   const handleBarClick = (status) => {
//     setSelectedStatus(status);
//     setIsModalOpen(true);
//   };

//   // ───── ERROR STATE ─────
//   if (isError) {
//     return (
//       <div className="p-4 sm:p-6 bg-white shadow rounded-xl text-center text-red-600">
//         Error: {error?.message || "Failed to load leads."}
//       </div>
//     );
//   }

//   // ───── LOADING STATE (only on initial load) ─────
//   if (isLoading && !externalLeads && !fetchedLeads) {
//     return (
//       <div className="p-6 bg-white shadow rounded-xl flex items-center justify-center h-64">
//         <Spinner />
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6 bg-white shadow rounded-xl w-full max-w-xl mx-auto">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
//         <div className="text-sm font-semibold text-gray-600">
//           Total Leads: <span className="text-indigo-600">{totalLeads}</span>
//         </div>
//       </div>

//       {/* Progress Bars */}
//       <div className="space-y-3">
//         {hasData ? (
//           activeStatuses.map((status) => {
//             const count = statusCounts[status];
//             const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0;

//             return (
//               <div
//                 key={status}
//                 className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
//                 onClick={() => handleBarClick(status)}
//               >
//                 <div
//                   className="w-3 h-3 rounded-full flex-shrink-0"
//                   style={{
//                     backgroundColor: {
//                       new: "#3B82F6",
//                       open: "#EAB308",
//                       converted: "#10B981",
//                       walkin: "#A855F7",
//                       paused: "#F97316",
//                       rejected: "#EF4444",
//                       unavailable: "#6B7280",
//                       other: "#9CA3AF", // Gray color for other
//                     }[status],
//                   }}
//                 />

//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
//                     <span className="capitalize">{status}</span>
//                     <span>
//                       {count} ({percentage}%)
//                     </span>
//                   </div>

//                   <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
//                     <div
//                       className="h-full transition-all duration-300"
//                       style={{
//                         width: `${percentage}%`,
//                         backgroundColor: {
//                           new: "#3B82F6",
//                           open: "#EAB308",
//                           converted: "#10B981",
//                           walkin: "#A855F7",
//                           paused: "#F97316",
//                           rejected: "#EF4444",
//                           unavailable: "#6B9280",
//                           other: "#9CA3AF", // Gray color for other
//                         }[status],
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="text-center text-gray-400 text-sm py-8">
//             No leads for the selected period.
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       {hasData && (
//         <div className="mt-5 pt-3 border-t border-gray-200 text-center">
//           <p className="text-xs text-gray-500">
//             Total: <strong>{totalLeads}</strong> lead{totalLeads !== 1 ? "s" : ""}
//           </p>
//         </div>
//       )}

//       {/* Modal */}
//       {isModalOpen && (
//         <LeadDetailModal
//           leads={filteredLeads.filter(
//             (lead) => (lead.status ?? "").trim().toLowerCase() === selectedStatus
//           )}
//           onClose={() => {
//             setIsModalOpen(false);
//             setSelectedStatus(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default LeadStatusDonutChart;

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import moment from "moment";
import { listleads } from "../services/leadsRouter";
import Spinner from "./Spinner";
import LeadDetailModal from "./LeadDetailModal";

const LeadStatusDonutChart = ({
  leads: externalLeads,
  isLoading: externalIsLoading = false,
  startDate,
  endDate,
  title = "Lead Status Overview",
}) => {
  const user = useSelector((state) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const { data: fetchedLeads, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ["List leads", startDate, endDate],
    queryFn: () =>
      listleads({
        startDate: moment(startDate).startOf("day").toISOString(),
        endDate: moment(endDate).endOf("day").toISOString(),
        noLimit: true,
      }),
    enabled: !!user && !!startDate && !!endDate && !externalLeads,
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

  const leads = externalLeads ?? fetchedLeads?.leads ?? [];
  const isLoading = externalIsLoading || isFetching;

  // 🧩 Role-based filtering
  const filteredLeads = useMemo(() => {
    if (!leads.length) return [];

    if (["Admin", "Sub-Admin"].includes(user?.role)) return leads;

    const uid = user?.id;
    if (!uid) return [];

    return leads.filter((lead) => {
      const ids = [
        lead.createdBy?._id || lead.createdBy,
        lead.updatedBy?._id || lead.updatedBy,
        lead.assignedTo?._id || lead.assignedTo,
      ].filter(Boolean);
      return ids.includes(uid);
    });
  }, [leads, user]);

  // 🧮 Status calculation
  const statusCounts = useMemo(() => {
    const counts = {
      new: 0,
      open: 0,
      converted: 0,
      walkin: 0,
      paused: 0,
      rejected: 0,
      unavailable: 0,
      other: 0,
    };
    filteredLeads.forEach((lead) => {
      const status = (lead.status ?? "").trim().toLowerCase();
      if (counts[status] !== undefined) counts[status]++;
      else counts.other++;
    });
    return counts;
  }, [filteredLeads]);

  const activeStatuses = Object.keys(statusCounts).filter((s) => statusCounts[s] > 0);
  const totalLeads = activeStatuses.reduce((sum, s) => sum + statusCounts[s], 0);

  const colors = {
    new: "#3B82F6",
    open: "#EAB308",
    converted: "#10B981",
    walkin: "#8B5CF6",
    paused: "#F97316",
    rejected: "#EF4444",
    unavailable: "#6B7280",
    other: "#9CA3AF",
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  if (isError) {
    return (
      <div className="p-6 text-center bg-red-950/30 text-red-400 rounded-xl border border-red-800/40">
        Error: {error?.message || "Failed to load leads."}
      </div>
    );
  }

  if (isLoading && !externalLeads)
    return (
      <div className="flex items-center justify-center h-[320px] bg-[#141414] rounded-2xl border border-[#262626]">
        <Spinner />
      </div>
    );

  return (
    <div className="bg-[#141414] border border-[#262626] shadow-xl rounded-3xl p-6 sm:p-8 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
          {title}
        </h2>
        <div className="bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00] px-3.5 py-1.5 text-sm rounded-full font-bold">
          Total: {totalLeads}
        </div>
      </div>

      {/* Progress Bars */}
      {totalLeads > 0 ? (
        <div className="space-y-4">
          {activeStatuses.map((status) => {
            const count = statusCounts[status];
            const percent = ((count / totalLeads) * 100).toFixed(1);
            const color = colors[status];

            return (
              <div
                key={status}
                onClick={() => handleStatusClick(status)}
                className="group cursor-pointer p-2.5 rounded-xl hover:bg-[#1E1E1E] border border-transparent hover:border-[#2E2E2E] transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="flex items-center gap-2 text-white font-medium capitalize">
                    <span
                      className="w-3 h-3 rounded-full inline-block shadow-sm"
                      style={{ backgroundColor: color }}
                    ></span>
                    {status}
                  </span>
                  <span className="text-gray-400 text-sm font-semibold">
                    {count} <span className="text-gray-500">({percent}%)</span>
                  </span>
                </div>

                <div className="w-full bg-[#202020] rounded-full h-3 overflow-hidden border border-[#2A2A2A]">
                  <div
                    className="h-3 rounded-full transition-all duration-500 group-hover:scale-[1.02]"
                    style={{
                      width: `${percent}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-8">
          No leads available for the selected period.
        </p>
      )}

      {/* Footer */}
      {totalLeads > 0 && (
        <div className="mt-6 pt-3 border-t border-[#262626] text-center text-xs text-gray-500">
          Updated {moment().format("MMM D, YYYY • hh:mm A")}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <LeadDetailModal
          leads={filteredLeads.filter(
            (lead) => (lead.status ?? "").trim().toLowerCase() === selectedStatus
          )}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStatus(null);
          }}
        />
      )}
    </div>
  );
};

export default LeadStatusDonutChart;
