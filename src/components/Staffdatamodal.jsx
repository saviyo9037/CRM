import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toggleStaffdatamodal } from "../redux/modalSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEnvelope,
  faPhone,
  faTasks,
  faClipboardList,
  faCheckCircle,
  faHourglassHalf,
  faChartLine,
  faUserTie,
  faUserCog,
} from "@fortawesome/free-solid-svg-icons";
import Spinner from "./Spinner";
import { useQuery } from "@tanstack/react-query";
import { listleads } from "../services/leadsRouter";
import { listtask } from "../services/tasksRouter";
import { liststaffs } from "../services/staffRouter";

const StatCard = ({ icon, label, value, colorClass }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-[#121212] p-5 rounded-xl shadow-md flex flex-col items-center text-center space-y-3 border border-[#262626] transition-all duration-200"
  >
    <div className="p-3.5 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/20">
      <FontAwesomeIcon icon={icon} className="text-[#FF8A00] text-xl" />
    </div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

function Staffdatamodal() {
  const dispatch = useDispatch();

  const isOpen = useSelector((state) => state.modal.Staffdatamodal);
  const selectedStaffId = useSelector((state) => state.modal.selectedStaffId);

  const { data: staffData, isLoading: isStaffLoading } = useQuery({
    queryKey: ["staffDetails", selectedStaffId],
    queryFn: () =>
      liststaffs().then((data) => data.find((s) => s._id === selectedStaffId)),
    enabled: isOpen && !!selectedStaffId,
  });

  // Fetch leads (this backend already returns ALL relevant leads for Admin/SubAdmin/Agent)
  const { data: leadsData, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["staffLeads", selectedStaffId],
    queryFn: () => listleads({ noLimit: true }),
    enabled: isOpen && !!selectedStaffId,
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["allTasks"],
    queryFn: listtask,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const allLeads = leadsData?.leads || [];

  // Leads where this user is assigned
  const staffLeads = allLeads.filter(
    (l) =>
      l.assignedTo?._id === selectedStaffId ||
      l.createdBy?._id === selectedStaffId
  );

  const staffTasks =
    tasksData?.task?.filter((t) => t.assignedTo === selectedStaffId) || [];

  const totalLeads = staffLeads.length;
  const openLeads = staffLeads.filter((l) => l.status === "open").length;
  const convertedLeads = staffLeads.filter(
    (l) => l.status === "converted"
  ).length;
  const rejectedLeads = staffLeads.filter(
    (l) => l.status === "rejected"
  ).length;

  const totalTasks = staffTasks.length;
  const pendingTasks = staffTasks.filter((t) => t.status === "pending").length;
  const completedTasks = staffTasks.filter(
    (t) => t.status === "completed"
  ).length;

  // ==========================
  // 🔥 SUB-ADMIN METRICS
  // ==========================

  const leadsCreatedByMe = allLeads.filter(
    (l) => l.createdBy?._id === selectedStaffId
  );

  const leadsAssignedToMe = allLeads.filter(
    (l) => l.assignedTo?._id === selectedStaffId
  );

  const teamLeadsCreated = allLeads.filter((l) =>
    staffData?.assignedAgents?.some((a) => a._id === l.createdBy?._id)
  );

  const teamLeadsAssigned = allLeads.filter((l) =>
    staffData?.assignedAgents?.some((a) => a._id === l.assignedTo?._id)
  );

  const totalLeadsUnderMe =
    leadsCreatedByMe.length +
    leadsAssignedToMe.length +
    teamLeadsCreated.length +
    teamLeadsAssigned.length;

  // ==========================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]"
          onClick={() => dispatch(toggleStaffdatamodal())}
        >
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="bg-[#141414] border border-[#262626] text-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {(isStaffLoading || isLeadsLoading || isTasksLoading) && (
              <div className="absolute inset-0 bg-[#141414]/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <Spinner />
              </div>
            )}

            <button
              onClick={() => dispatch(toggleStaffdatamodal())}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#222222]"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* HEADER */}
            <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-[#262626]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A00] to-[#E67A00] flex items-center justify-center text-black text-2xl font-bold shadow-lg shadow-[#FF8A00]/20">
                <FontAwesomeIcon
                  icon={staffData?.role === "Agent" ? faUserTie : faUserCog}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {staffData?.name}
                </h2>
                <p className="text-[#FF8A00] font-medium text-sm">{staffData?.role}</p>
              </div>
            </div>

            {!staffData ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-lg">No staff selected.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#181818] p-5 rounded-xl border border-[#262626]">
                  <p className="text-gray-300 text-sm flex items-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="mr-3 text-[#FF8A00]"
                    />
                    <strong className="text-white mr-1.5">Email:</strong> {staffData.email}
                  </p>
                  <p className="text-gray-300 text-sm flex items-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-3 text-[#FF8A00]"
                    />
                    <strong className="text-white mr-1.5">Mobile:</strong> {staffData.mobile}
                  </p>
                  {staffData.role === "Agent" && (
                    <p className="text-gray-300 text-sm flex items-center">
                      <FontAwesomeIcon
                        icon={faUserTie}
                        className="mr-3 text-[#FF8A00]"
                      />
                      <strong className="text-white mr-1.5">Sub-Admin:</strong>{" "}
                      {staffData?.assignedTo?.name || "N/A"}
                    </p>
                  )}
                </div>

                {/* SUB-ADMIN LEAD OVERVIEW */}
                {staffData.role === "Sub-Admin" && (
                  <div className="bg-[#181818] p-6 rounded-xl border border-[#262626] space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF8A00]"></span>
                      Sub-Admin Lead Overview
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <StatCard
                        icon={faClipboardList}
                        label="Leads Created By Me"
                        value={leadsCreatedByMe.length}
                        colorClass="text-[#FF8A00]"
                      />

                      <StatCard
                        icon={faUserCog}
                        label="Leads Assigned To Me"
                        value={leadsAssignedToMe.length}
                        colorClass="text-[#FF8A00]"
                      />

                      <StatCard
                        icon={faUserTie}
                        label="Team Leads Created By Agents"
                        value={teamLeadsCreated.length}
                        colorClass="text-[#FF8A00]"
                      />

                      <StatCard
                        icon={faTasks}
                        label="Team Leads Assigned To Agents"
                        value={teamLeadsAssigned.length}
                        colorClass="text-[#FF8A00]"
                      />

                      <StatCard
                        icon={faChartLine}
                        label="Total Leads Under Me"
                        value={totalLeadsUnderMe}
                        colorClass="text-[#FF8A00]"
                      />

                      <StatCard
                        icon={faUserTie}
                        label="Agents Count"
                        value={staffData.assignedAgents?.length || 0}
                        colorClass="text-[#FF8A00]"
                      />
                    </div>
                  </div>
                )}

                {/* ASSIGNED AGENTS */}
                {staffData.role === "Sub-Admin" &&
                  staffData.assignedAgents?.length > 0 && (
                    <div className="bg-[#181818] p-6 rounded-xl border border-[#262626]">
                      <h5 className="text-base font-bold text-white mb-3">
                        Assigned Agents ({staffData.assignedAgents.length})
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {staffData.assignedAgents.map((a) => (
                          <span
                            key={a._id}
                            className="bg-[#222222] border border-[#333333] text-gray-200 text-xs px-3 py-1.5 rounded-lg"
                          >
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* LEADS OVERVIEW */}
                <div className="bg-[#181818] p-6 rounded-xl border border-[#262626]">
                  <h4 className="text-lg font-bold text-white mb-5 flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2.5 text-[#FF8A00]" />{" "}
                    Leads Overview
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                      icon={faClipboardList}
                      label="Total Leads"
                      value={totalLeads}
                      colorClass="text-[#FF8A00]"
                    />
                    <StatCard
                      icon={faHourglassHalf}
                      label="Open Leads"
                      value={openLeads}
                      colorClass="text-[#FF8A00]"
                    />
                    <StatCard
                      icon={faCheckCircle}
                      label="Converted"
                      value={convertedLeads}
                      colorClass="text-[#FF8A00]"
                    />
                    <StatCard
                      icon={faTimes}
                      label="Rejected"
                      value={rejectedLeads}
                      colorClass="text-[#FF8A00]"
                    />
                  </div>

                  {staffLeads.length > 0 && (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {staffLeads.map((lead) => (
                        <div
                          key={lead._id}
                          className="bg-[#121212] p-3.5 rounded-xl border border-[#262626] flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {lead.name}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {lead.email} | {lead.mobile}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              lead.status === "converted"
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                : lead.status === "rejected"
                                ? "bg-red-500/15 border border-red-500/30 text-red-400"
                                : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TASKS OVERVIEW */}
                <div className="bg-[#181818] p-6 rounded-xl border border-[#262626]">
                  <h4 className="text-lg font-bold text-white mb-5 flex items-center">
                    <FontAwesomeIcon icon={faTasks} className="mr-2.5 text-[#FF8A00]" /> Tasks
                    Overview
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <StatCard
                      icon={faTasks}
                      label="Total Tasks"
                      value={totalTasks}
                      colorClass="text-[#FF8A00]"
                    />
                    <StatCard
                      icon={faHourglassHalf}
                      label="Pending Tasks"
                      value={pendingTasks}
                      colorClass="text-[#FF8A00]"
                    />
                    <StatCard
                      icon={faCheckCircle}
                      label="Completed"
                      value={completedTasks}
                      colorClass="text-[#FF8A00]"
                    />
                  </div>

                  {staffTasks.length > 0 && (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {staffTasks.map((task) => (
                        <div
                          key={task._id}
                          className="bg-[#121212] p-3.5 rounded-xl border border-[#262626] flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {task.title}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              Updated:{" "}
                              {new Date(task.updatedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              task.status === "completed"
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                : "bg-[#FF8A00]/15 border border-[#FF8A00]/30 text-[#FF8A00]"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Staffdatamodal;
