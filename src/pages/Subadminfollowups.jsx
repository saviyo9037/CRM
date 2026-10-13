import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Customerdetailmodal from "../components/Customerdetailmodal";
import {
  deletemultipleleads,
  listopencustomers,
  updateleadstatus,
  updatepriority,
} from "../services/leadsRouter";
import Icons from "./Icons";
import { liststaffs } from "../services/staffRouter";
import Spinner from "../components/Spinner";
import { Trash2 } from "lucide-react";
import { toggleCustomerdetailmodal } from "../redux/modalSlice";

function Subadminfollowups() {
  const queryclient = useQueryClient();
  const dispatch = useDispatch();
  const iscustomerdetailmodal = useSelector(
    (state) => state.modal.customerdetailModal
  );
  const role = useSelector((state) => state.auth.role);
  const metadata = useSelector((state) => state.auth.metadataUser);

  const statusColors = {
    new: "bg-blue-950/60 text-blue-400 border border-blue-800/60 font-semibold",
    open: "bg-yellow-950/60 text-yellow-400 border border-yellow-800/60 font-semibold",
    converted: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold",
    walkin: "bg-purple-950/60 text-purple-400 border border-purple-800/60 font-semibold",
    paused: "bg-orange-950/60 text-orange-400 border border-orange-800/60 font-semibold",
    rejected: "bg-red-950/60 text-red-400 border border-red-800/60 font-semibold",
    unavailable: "bg-neutral-800 text-gray-400 border border-neutral-700 font-semibold",
    closed: "bg-neutral-800 text-gray-300 border border-neutral-700 font-semibold",
  };

  const [sidebarVisible, setsidebarVisible] = useState(true);
  const [statussuccessmodal, setstatussuccessmodal] = useState(false);
  const [showsearch, setshowsearch] = useState(false);
  const [priorityfilter, setpriorityfilter] = useState("Priority");
  const [assignedfilter, setassignedfilter] = useState("AssignedTo");
  const [leadvaluefilter, setleadvaluefilter] = useState("Sort By");
  const [datefilter, setdatefilter] = useState("Date");

  // Custom date input value (dd-mm-yyyy as string)
  const [customDateInput, setCustomDateInput] = useState("");
  const [dateRangeStartInput, setDateRangeStartInput] = useState("");
  const [dateRangeEndInput, setDateRangeEndInput] = useState("");

  // Actual Date objects for API
  const [selectdatefilter, setselectdatefilter] = useState(null);
  const [daterangefilter, setdaterangefilter] = useState({
    start: null,
    end: null,
  });

  const [searchText, setsearchText] = useState("");
  const [currentpage, setcurrentpage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const leadsperpage = 10;

  // Auto-format dd-mm-yyyy
  const formatDateInput = (value) => {
    const digits = value.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length >= 3) formatted += "-" + digits.slice(2, 4);
    if (digits.length >= 5) formatted += "-" + digits.slice(4, 8);
    return formatted.slice(0, 10);
  };

  // Validate and convert dd-mm-yyyy to Date
  const parseDateString = (str) => {
    if (!str || str.length !== 10) return null;
    const [dd, mm, yyyy] = str.split("-").map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    return date.getDate() === dd && date.getMonth() === mm - 1 && date.getFullYear() === yyyy
      ? date
      : null;
  };

  const { data: fetchopencustomers, isLoading } = useQuery({
    queryKey: [
      "Opencustomers",
      currentpage,
      priorityfilter,
      assignedfilter,
      searchText,
      datefilter,
      selectdatefilter,
      daterangefilter,
      leadvaluefilter,
    ],
    queryFn: () =>
      listopencustomers({
        page: currentpage,
        limit: leadsperpage,
        priority: priorityfilter !== "Priority" ? priorityfilter : undefined,
        assignedTo:
          assignedfilter !== "AssignedTo" ? assignedfilter : undefined,
        searchText,
        date: datefilter !== "Date" ? datefilter : undefined,
        startDate:
          datefilter === "custom" && selectdatefilter
            ? selectdatefilter.toISOString()
            : datefilter === "range" && daterangefilter.start
            ? daterangefilter.start.toISOString()
            : undefined,
        endDate:
          datefilter === "range" && daterangefilter.end
            ? daterangefilter.end.toISOString()
            : undefined,
        sortBy: leadvaluefilter !== "Sort By" ? leadvaluefilter : undefined,
      }),
    keepPreviousData: true,
  });

  const fetchstaffs = useQuery({
    queryKey: ["List staffs"],
    queryFn: liststaffs,
  });

  const updatingpriority = useMutation({
    mutationKey: ["Updatepriority"],
    mutationFn: updatepriority,
    onSuccess: () => {
      queryclient.invalidateQueries(["Opencustomers"]);
    },
  });

  const updatingleadstatus = useMutation({
    mutationKey: ["Updateleadstatus"],
    mutationFn: updateleadstatus,
    onSuccess: () => {
      queryclient.invalidateQueries(["Opencustomers"]);
    },
  });

  const deleteLeadsMutation = useMutation({
    mutationKey: ["Delete leads"],
    mutationFn: deletemultipleleads,
    onSuccess: () => {
      queryclient.invalidateQueries(["Opencustomers"]);
      setSelectedLeads([]);
      setstatussuccessmodal(true);
      setTimeout(() => setstatussuccessmodal(false), 2000);
    },
    onError: (error) => {
      alert("Failed to delete leads: " + (error.response?.data?.message || error.message));
    },
  });

  const handleleadchange = async (leadId, status) => {
    await updatingleadstatus.mutateAsync({ leadId, status });
    setstatussuccessmodal(true);
    setTimeout(() => setstatussuccessmodal(false), 2000);
  };

  const handlepriority = async (customerId, priority) => {
    await updatingpriority.mutateAsync({ customerId, priority });
    setstatussuccessmodal(true);
    setTimeout(() => setstatussuccessmodal(false), 2000);
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length > 0) setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await deleteLeadsMutation.mutateAsync({ leadIds: selectedLeads });
    setShowDeleteConfirm(false);
  };

  const totalLeads = fetchopencustomers?.totalLeads || 0;
  const totalPages = fetchopencustomers?.totalPages || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setcurrentpage(page);
      setSelectedLeads([]);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex overflow-x-hidden bg-[#0A0A0A]">
      {/* Sidebar */}
      <motion.div
        animate={{ x: sidebarVisible ? 0 : -260 }}
        transition={{ duration: 0.3 }}
        className="w-64 h-full fixed top-0 left-0 z-50 bg-[#0A0A0A] border-r border-[#262626]"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 h-screen overflow-y-auto bg-[#0A0A0A]"
      >
        {fetchstaffs.isLoading && <Spinner />}
        {updatingleadstatus.isPending && <Spinner />}
        {updatingpriority.isPending && <Spinner />}
        {deleteLeadsMutation.isPending && <Spinner />}

        <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-[#0A0A0A] sticky top-0 z-30 border-b border-[#262626]">
            <div className="flex items-center mb-4 sm:mb-0">
              <button
                className="mr-2 sm:mr-4 text-[#FF8A00] hover:text-[#E67A00] transition p-2 rounded-lg hover:bg-[#181818]"
                onClick={() => setsidebarVisible(!sidebarVisible)}
              >
                <FaBars className="text-lg sm:text-xl md:text-2xl" />
              </button>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Follow-ups
              </h3>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Icons />
            </div>
          </div>

          <div className="flex justify-between items-center p-4 flex-wrap gap-3 bg-[#0A0A0A]">
            {/* Left side: Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={priorityfilter}
                onChange={(e) => setpriorityfilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white shadow-sm focus:outline-none focus:border-[#FF8A00] text-sm font-medium transition hover:border-[#FF8A00]/50"
              >
                <option value="Priority" className="bg-[#181818]">Priority</option>
                <option value="hot" className="bg-[#181818]">Hot</option>
                <option value="warm" className="bg-[#181818]">Warm</option>
                <option value="cold" className="bg-[#181818]">Cold</option>
                <option value="Not Assigned" className="bg-[#181818]">Not Assigned</option>
              </select>

              {role === "Admin" && (
                <select
                  value={assignedfilter}
                  onChange={(e) => setassignedfilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white shadow-sm focus:outline-none focus:border-[#FF8A00] text-sm font-medium transition hover:border-[#FF8A00]/50"
                >
                  <option value="AssignedTo" className="bg-[#181818]">Assigned To</option>
                  {fetchstaffs?.data?.map((staff) => (
                    <option key={staff._id} value={staff._id} className="bg-[#181818]">
                      {staff.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={leadvaluefilter}
                onChange={(e) => setleadvaluefilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white shadow-sm focus:outline-none focus:border-[#FF8A00] text-sm font-medium transition hover:border-[#FF8A00]/50"
              >
                <option value="Sort By" className="bg-[#181818]">Lead Value</option>
                <option value="ascleadvalue" className="bg-[#181818]">Lead Value ↑</option>
                <option value="descleadvalue" className="bg-[#181818]">Lead Value ↓</option>
              </select>

              <select
                value={datefilter}
                onChange={(e) => {
                  setdatefilter(e.target.value);
                  setCustomDateInput("");
                  setDateRangeStartInput("");
                  setDateRangeEndInput("");
                  setselectdatefilter(null);
                  setdaterangefilter({ start: null, end: null });
                }}
                className="min-w-[140px] px-4 py-2 rounded-xl border border-[#2A2A2A] text-white bg-[#181818] shadow-sm focus:border-[#FF8A00] outline-none text-sm font-medium transition hover:border-[#FF8A00]/50"
              >
                <option value="Date" className="bg-[#181818]">Date</option>
                <option value="today" className="bg-[#181818]">Today</option>
                <option value="yesterday" className="bg-[#181818]">Yesterday</option>
                <option value="custom" className="bg-[#181818]">Search from date</option>
                <option value="range" className="bg-[#181818]">Search from range of date</option>
              </select>

              {/* Custom Single Date */}
              {datefilter === "custom" && (
                <input
                  type="text"
                  value={customDateInput}
                  placeholder="dd-mm-yyyy"
                  maxLength="10"
                  onChange={(e) => {
                    const formatted = formatDateInput(e.target.value);
                    setCustomDateInput(formatted);
                    setselectdatefilter(parseDateString(formatted));
                  }}
                  className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white focus:border-[#FF8A00] outline-none w-40 text-sm"
                />
              )}

              {/* Date Range */}
              {datefilter === "range" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dateRangeStartInput}
                    placeholder="Start: dd-mm-yyyy"
                    maxLength="10"
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setDateRangeStartInput(formatted);
                      const date = parseDateString(formatted);
                      setdaterangefilter((prev) => ({ ...prev, start: date }));
                    }}
                    className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white focus:border-[#FF8A00] outline-none text-sm w-40"
                  />
                  <input
                    type="text"
                    value={dateRangeEndInput}
                    placeholder="End: dd-mm-yyyy"
                    maxLength="10"
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setDateRangeEndInput(formatted);
                      const date = parseDateString(formatted);
                      setdaterangefilter((prev) => ({ ...prev, end: date }));
                    }}
                    className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white focus:border-[#FF8A00] outline-none text-sm w-40"
                  />
                </div>
              )}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showsearch && (
                  <motion.input
                    key="search-input"
                    type="text"
                    value={searchText}
                    onChange={(e) => setsearchText(e.target.value)}
                    className="px-4 py-2 border border-[#2A2A2A] rounded-xl shadow-sm text-white bg-[#181818] focus:border-[#FF8A00] outline-none text-sm w-56 placeholder-gray-400"
                    placeholder="Search..."
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                  />
                )}
              </AnimatePresence>
              <button
                className="bg-[#FF8A00] text-black font-bold p-2.5 rounded-xl hover:bg-[#E67A00] transition shadow-md"
                onClick={() => setshowsearch(!showsearch)}
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Table & Pagination */}
          <div className="flex-grow p-4 sm:p-2 bg-[#0A0A0A]">
            <div className="flex justify-end mb-3">
              {selectedLeads.length > 0 && role !== "Agent" && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-red-700 shadow-md text-sm"
                >
                  <Trash2 size={18} />
                  Delete Selected ({selectedLeads.length})
                </motion.button>
              )}
            </div>

            {isLoading ? (
              <Spinner />
            ) : fetchopencustomers?.leads?.length > 0 ? (
              <>
                <div className="overflow-x-auto bg-[#141414] p-4 rounded-2xl shadow-xl border border-[#262626]">
                  <div className="max-h-[75vh] overflow-y-auto">
                    <table className="w-full table-auto text-xs sm:text-sm min-w-[800px]">
                      <thead className="sticky top-0 bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black uppercase font-bold text-xs sm:text-sm z-10">
                        <tr>
                          <th className="py-3 px-4 text-left">
                            {role !== "Agent" && (
                              <input
                                type="checkbox"
                                checked={
                                  selectedLeads.length === fetchopencustomers.leads.length &&
                                  fetchopencustomers.leads.length > 0
                                }
                                onChange={(e) =>
                                  setSelectedLeads(
                                    e.target.checked
                                      ? fetchopencustomers.leads.map((l) => l._id)
                                      : []
                                  )
                                }
                                className="h-4 w-4 rounded accent-black border-[#2A2A2A] focus:ring-[#FF8A00]"
                              />
                            )}
                          </th>
                          <th className="py-3 px-4">Sl No</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Phone</th>
                          <th className="py-3 px-4">Created By</th>
                          <th className="py-3 px-4">Assigned To</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchopencustomers.leads.map((lead, index) => (
                          <motion.tr
                            key={lead._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] text-white border-b border-[#262626] transition"
                          >
                            <td className="py-4 px-4">
                              {role !== "Agent" && (
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.includes(lead._id)}
                                  onChange={() => handleSelectLead(lead._id)}
                                  className="h-4 w-4 rounded accent-[#FF8A00]"
                                />
                              )}
                            </td>
                            <td className="py-4 px-4 text-gray-300">
                              {(currentpage - 1) * leadsperpage + index + 1}
                            </td>
                            <td className="py-4 px-4">
                              <button
                                className="text-[#FF8A00] font-semibold hover:underline"
                                onClick={() => dispatch(toggleCustomerdetailmodal(lead))}
                              >
                                {lead.name}
                              </button>
                            </td>
                            <td className="py-4 px-4 text-gray-200">{lead.mobile}</td>
                            <td className="py-4 px-4 text-gray-300">{lead.createdBy?.name}</td>
                            <td className="py-4 px-4 text-gray-300">{lead.assignedTo?.name || "N/A"}</td>
                            <td className="py-4 px-4 text-gray-300">{lead.location || "N/A"}</td>
                            <td className="py-4 px-4">
                              <select
                                className="border border-[#2A2A2A] p-2 rounded-xl bg-[#181818] text-white text-xs w-full hover:border-[#FF8A00]/50 focus:border-[#FF8A00] outline-none"
                                value={lead.status === "new" ? "Not Assigned" : (lead.priority || "Not Assigned")}
                                disabled={!!metadata || lead.status === "new"}
                                onChange={(e) => handlepriority(lead._id, e.target.value)}
                              >
                                <option value="hot" className="bg-[#181818]">Hot</option>
                                <option value="warm" className="bg-[#181818]">Warm</option>
                                <option value="cold" className="bg-[#181818]">Cold</option>
                                <option value="Not Assigned" className="bg-[#181818]">Not Assigned</option>
                              </select>
                            </td>
                            <td className="py-4 px-4">
                              <select
                                className={`border border-[#2A2A2A] p-2 rounded-xl text-xs w-full bg-[#181818] hover:border-[#FF8A00]/50 focus:border-[#FF8A00] outline-none ${statusColors[lead.status]}`}
                                value={lead.status}
                                disabled={!!metadata}
                                onChange={(e) => handleleadchange(lead._id, e.target.value)}
                              >
                                <option value="new" className="bg-[#181818]">New</option>
                                <option value="open" className="bg-[#181818]">Open</option>
                                <option value="converted" className="bg-[#181818]">Converted</option>
                                <option value="closed" className="bg-[#181818]">Closed</option>
                                <option value="walkin" className="bg-[#181818]">Walk In</option>
                                <option value="paused" className="bg-[#181818]">Paused</option>
                                <option value="rejected" className="bg-[#181818]">Rejected</option>
                                <option value="unavailable" className="bg-[#181818]">Unavailable</option>
                              </select>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-6 flex-wrap p-3 bg-[#141414] border border-[#262626] rounded-2xl shadow-xl">
                  <button
                    onClick={() => handlePageChange(currentpage - 1)}
                    disabled={currentpage === 1}
                    className="px-4 py-2 bg-[#181818] border border-[#2A2A2A] text-gray-200 hover:text-white hover:border-[#FF8A00] rounded-xl font-semibold transition disabled:bg-[#181818] disabled:text-gray-600 disabled:border-[#262626] disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded-xl font-bold transition ${
                        currentpage === i + 1
                          ? "bg-[#FF8A00] text-black shadow-md shadow-[#FF8A00]/25 scale-105"
                          : "bg-[#181818] border border-[#2A2A2A] text-gray-300 hover:text-white hover:border-[#FF8A00]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentpage + 1)}
                    disabled={currentpage === totalPages}
                    className="px-4 py-2 bg-[#181818] border border-[#2A2A2A] text-gray-200 hover:text-white hover:border-[#FF8A00] rounded-xl font-semibold transition disabled:bg-[#181818] disabled:text-gray-600 disabled:border-[#262626] disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 py-10 text-lg">
                {totalLeads > 0
                  ? `No leads on page ${currentpage}`
                  : "No Follow-ups Available"}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {statussuccessmodal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="relative z-10 bg-[#141414] border border-emerald-500/50 text-emerald-400 px-8 py-6 rounded-2xl shadow-2xl font-semibold text-base text-center"
            >
              {deleteLeadsMutation.isSuccess ? "Leads deleted successfully!" : "Updated successfully!"}
            </motion.div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-[#141414] border border-[#262626] p-8 rounded-2xl shadow-2xl text-center max-w-sm text-white"
            >
              <h3 className="text-xl font-bold mb-6 text-white">
                Delete {selectedLeads.length} lead(s)?
              </h3>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-[#242424] hover:bg-[#303030] text-gray-200 px-6 py-2.5 rounded-xl transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {iscustomerdetailmodal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-4xl">
              <Customerdetailmodal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Subadminfollowups;