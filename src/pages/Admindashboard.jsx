import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import AreaChart from "../components/Areachart";
import MonthlyLeadsChart from "../components/BarChart";
import LeadSourceProgressChart from "../components/LeadSourceChart";
import LeadStatusPieChart from "../components/PieChart";
import Spinner from "../components/Spinner";
import Icons from "./Icons";
import { motion } from "framer-motion";
import { FaBars, FaChartBar, FaPhoneAlt, FaTasks, FaUser } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { listleads } from "../services/leadsRouter";
import DateRangeDropdown from "../components/DateRangeDropdown";
import { listtask } from "../services/tasksRouter";

function Admindashboard() {
  const queryClient = useQueryClient();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const userlogged = useSelector((state) => state.auth.user);
  const metadata = useSelector((state) => state.auth.metadataUser);
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);

  // Fetch Leads
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsError,
  } = useQuery({
    queryKey: ["List leads", userlogged.role, startDateFilter, endDateFilter],
    queryFn: () =>
      listleads({
        noLimit: userlogged.role === "Admin",
        startDate: startDateFilter ? startDateFilter.toISOString() : undefined,
        endDate: endDateFilter ? endDateFilter.toISOString() : undefined,
      }),
    retry: 3,
  });

  // Fetch Tasks
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["List tasks"],
    queryFn: listtask,
    retry: 3,
  });

  if (leadsError || tasksError) {
    console.error("Query error:", leadsError || tasksError);
    return (
      <div className="p-4 text-red-600">
        Error loading data. Please try again.
      </div>
    );
  }

  // ==============================
  // Derived Values
  // ==============================
  const totalFollowups = useMemo(
    () =>
      leads?.leads?.length
        ? leads.leads.filter((lead) => lead.status === "open")
        : [],
    [leads]
  );

  const closedLeads = useMemo(
    () =>
      leads?.leads?.length
        ? leads.leads.filter(
            (lead) =>
              ["closed", "converted", "rejected"].includes(lead.status) &&
              (lead.updatedBy?._id === userlogged?.id ||
                lead.updatedBy === userlogged?.id)
          )
        : [],
    [leads, userlogged]
  );

  const completedTask = useMemo(
    () =>
      tasks?.task?.length
        ? tasks.task.filter((task) => task.status === "completed")
        : [],
    [tasks]
  );

  const assignedTask = useMemo(
    () =>
      tasks?.task?.length
        ? tasks.task.filter((task) => task.assignedTo === userlogged?.id)
        : [],
    [tasks, userlogged]
  );

  const completedAssignedtask = useMemo(
    () =>
      tasks?.task?.length
        ? tasks.task.filter(
            (task) =>
              task.status === "completed" &&
              task.assignedTo === userlogged?.id &&
              task.updatedBy === userlogged?.id
          )
        : [],
    [tasks, userlogged]
  );

  const isDataLoading = leadsLoading || tasksLoading;

  // ==============================
  // Render
  // ==============================
  return (
    <div className="flex h-screen w-screen bg-[#0A0A0A] overflow-x-hidden text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40">
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -260 }}
          transition={{ duration: 0.3 }}
          className="w-64 h-full fixed top-0 left-0 z-50"
        >
          <Sidebar />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col h-screen bg-[#0A0A0A]"
      >
        {isDataLoading && <Spinner />}

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 bg-[#0A0A0A] border-b border-[#1F1F1F]">
          <div className="flex items-center">
            <button
              className="mr-3 sm:mr-4 text-[#FF8A00] hover:text-[#FFA333] transition"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-lg sm:text-xl lg:text-2xl" />
            </button>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Dashboard
            </h3>
          </div>
          <Icons />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Lead Summary */}
            <motion.div
              className="bg-[#141414] border border-[#242424] p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-[0_0_25px_rgba(255,138,0,0.15)] transition duration-300 hover:-translate-y-1 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#FF8A00]/15 border border-[#FF8A00]/30 p-2.5 rounded-xl">
                  <FaChartBar className="text-[#FF8A00] text-base sm:text-xl" />
                </div>
                <h4 className="text-sm sm:text-md font-medium text-gray-400">
                  Lead
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-3 sm:mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                  {closedLeads.length}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-gray-400">
                  Closed
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total{" "}
                <span className="text-[#FF8A00] font-semibold">
                  {leads?.leads?.length || 0}
                </span>{" "}
                Leads
              </p>
            </motion.div>

            {/* FollowUp Summary */}
            <motion.div
              className="bg-[#141414] border border-[#242424] p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-[0_0_25px_rgba(255,138,0,0.15)] transition duration-300 hover:-translate-y-1 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#FF8A00]/15 border border-[#FF8A00]/30 p-2.5 rounded-xl">
                  <FaUser className="text-[#FF8A00] text-base sm:text-xl" />
                </div>
                <h4 className="text-sm sm:text-md font-medium text-gray-400">
                  FollowUps
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-3 sm:mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                  {totalFollowups.length}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-gray-400">
                  Open
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active follow-ups in queue
              </p>
            </motion.div>

            {/* Tasks Summary */}
            <motion.div
              className="bg-[#141414] border border-[#242424] p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-[0_0_25px_rgba(255,138,0,0.15)] transition duration-300 hover:-translate-y-1 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#FF8A00]/15 border border-[#FF8A00]/30 p-2.5 rounded-xl">
                  <FaTasks className="text-[#FF8A00] text-base sm:text-xl" />
                </div>
                <h4 className="text-sm sm:text-md font-medium text-gray-400">
                  Tasks
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-3 sm:mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                  {completedTask.length}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-gray-400">
                  Completed
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total{" "}
                <span className="text-[#FF8A00] font-semibold">
                  {tasks?.task?.length || 0}
                </span>{" "}
                Tasks
              </p>
            </motion.div>

            {/* Calls Summary (Placeholder) */}
            <motion.div
              className="bg-[#141414] border border-[#242424] p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-[0_0_25px_rgba(255,138,0,0.15)] transition duration-300 hover:-translate-y-1 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#FF8A00]/15 border border-[#FF8A00]/30 p-2.5 rounded-xl">
                  <FaPhoneAlt className="text-[#FF8A00] text-base sm:text-xl" />
                </div>
                <h4 className="text-sm sm:text-md font-medium text-gray-400">
                  Calls
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-3 sm:mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                  0
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-gray-400">
                  Closed
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Call log activity
              </p>
            </motion.div>
          </div>

          {/* Charts Wrapper with Date Range on Top */}
          <div className="bg-[#141414] border border-[#242424] rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
            {/* Top bar inside charts section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-[#222]">
              <h4 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF8A00]"></span>
                Leads & Tasks Overview
              </h4>
              <DateRangeDropdown
                onDateRangeChange={(start, end) => {
                  setStartDateFilter(start);
                  setEndDateFilter(end);
                }}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
              {/* Weekly Leads */}
              <motion.div
                className="bg-[#101010] border border-[#222] p-4 sm:p-6 rounded-2xl shadow-md hover:border-[#FF8A00]/30 transition overflow-hidden min-h-[220px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-[#FF8A00]">📈</span> Weekly Leads
                </h4>
                <AreaChart
                  leads={leads?.leads}
                  startDate={startDateFilter}
                  endDate={endDateFilter}
                />
              </motion.div>

              {/* Monthly Leads */}
              <motion.div
                className="bg-[#101010] border border-[#222] p-4 sm:p-6 rounded-2xl shadow-md hover:border-[#FF8A00]/30 transition overflow-hidden min-h-[220px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-[#FF8A00]">📅</span> Monthly Leads
                </h4>
                <MonthlyLeadsChart
                  type="monthly"
                  leads={leads?.leads}
                  startDate={startDateFilter}
                  endDate={endDateFilter}
                />
              </motion.div>

              {/* Lead Source Chart */}
              <motion.div
                className="bg-[#101010] border border-[#222] p-4 sm:p-6 rounded-2xl shadow-md hover:border-[#FF8A00]/30 transition overflow-hidden min-h-[220px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-[#FF8A00]">🎯</span> Lead Source Chart
                </h4>
                <LeadSourceProgressChart
                  leads={leads?.leads}
                  startDate={startDateFilter}
                  endDate={endDateFilter}
                />
              </motion.div>

              {/* Lead Status Chart */}
              <motion.div
                className="bg-[#101010] border border-[#222] p-4 sm:p-6 rounded-2xl shadow-md hover:border-[#FF8A00]/30 transition overflow-hidden min-h-[220px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-[#FF8A00]">📊</span> Lead Status Chart
                </h4>
                <LeadStatusPieChart
                  leads={leads?.leads}
                  isLoading={leadsLoading}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Admindashboard;
