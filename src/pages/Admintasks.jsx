import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import {
  FaAddressBook,
  FaBars,
  FaChevronDown,
  FaEdit,
  FaUserCircle,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleaddtasksmodal,
  toggleViewedittaskmodal,
  toggleViewtasksmodal,
} from "../redux/modalSlice";
import Addtaskmodal from "../components/Addtaskmodal";
import Viewtasksmodal from "../components/Viewtasksmodal";
import VieweditTaskmodal from "../components/VieweditTaskmodal";
import { liststaffs } from "../services/staffRouter";
import Icons from "./Icons";
import Spinner from "../components/Spinner";

function Admintasks() {
  const [selectedRole, setselectedRole] = useState("Sub-Admin");
  const [sidebarVisible, setsidebarVisible] = useState(true);
  const isTaskmodal = useSelector((state) => state.modal.addtasksmodal);
  const isViewtaskmodal = useSelector((state) => state.modal.viewtasksModal);
  const isViewedittaskmodal = useSelector(
    (state) => state.modal.viewedittaskModal
  );
  const dispatch = useDispatch();

  const fetchstaffs = useQuery({
    queryKey: ["listagents"],
    queryFn: liststaffs,
  });

  const filteredStaff = fetchstaffs?.data?.filter(
    (staff) => staff.role === selectedRole
  );

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0A] text-white relative">
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-64 fixed left-0 top-0 h-full z-40 bg-[#0A0A0A] border-r border-[#262626]">
        <Sidebar />
      </div>

      {/* Sidebar Drawer for Mobile */}
      <AnimatePresence>
        {sidebarVisible && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setsidebarVisible(false)}
            />

            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-[#262626] shadow-2xl z-50 md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 bg-[#0A0A0A]"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 border-b border-[#262626] pb-4">
          <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <button
              className="mr-3 text-[#FF8A00] hover:text-[#E67A00] transition md:hidden p-2"
              onClick={() => setsidebarVisible(true)}
            >
              <FaBars className="text-2xl" />
            </button>
            Tasks
          </h3>
          <div className="flex justify-end">
            <Icons />
          </div>
        </div>

        {/* Filter + Add Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => setselectedRole(e.target.value)}
              className="w-full sm:w-auto appearance-none outline-none bg-[#181818] border border-[#2A2A2A] text-white px-5 py-2.5 pr-10 rounded-xl shadow-md hover:border-[#FF8A00]/50 font-semibold transition"
            >
              <option className="bg-[#181818] text-white" value="Sub-Admin">
                Subadmin
              </option>
              <option className="bg-[#181818] text-white" value="Agent">
                Agent
              </option>
            </select>
            <div className="pointer-events-none text-[#FF8A00] absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaChevronDown />
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-[#FF8A00]/25 transition flex items-center justify-center gap-2"
            onClick={() => dispatch(toggleaddtasksmodal())}
          >
            <FaAddressBook />
            Add Tasks
          </button>
        </div>

        {/* Staff Cards */}
        {fetchstaffs.isLoading ? (
          <Spinner />
        ) : filteredStaff?.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStaff.map((staff, index) => (
              <motion.div
                key={staff._id}
                className="bg-[#141414] border border-[#262626] rounded-2xl shadow-xl hover:border-[#FF8A00]/50 transition-all duration-300 transform hover:-translate-y-1 p-6 group relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="text-[#FF8A00] mb-4">
                  {staff.profileImage ? (
                    <img
                      src={staff.profileImage}
                      alt="Profile"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#FF8A00] object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-7xl text-[#FF8A00]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base sm:text-lg truncate w-40 mx-auto">
                    {staff.name}
                  </h4>
                  <p className="text-sm text-gray-400 capitalize mb-3">
                    {staff.role}
                  </p>
                </div>
                <div className="flex justify-center gap-3 mt-3 w-full">
                  <button
                    className="text-[#FF8A00] hover:text-[#E67A00] p-2 hover:bg-[#1E1E1E] rounded-xl transition"
                    title="Edit Tasks"
                    onClick={() => dispatch(toggleViewedittaskmodal(staff))}
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button
                    className="border border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00] hover:text-black px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 flex-1"
                    onClick={() => dispatch(toggleViewtasksmodal(staff._id))}
                  >
                    <FaAddressBook />
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center text-lg py-6">
            No staff members available
          </p>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isTaskmodal && (
          <motion.div
            key="addtask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-4xl">
              <Addtaskmodal />
            </div>
          </motion.div>
        )}
        {isViewtaskmodal && (
          <motion.div
            key="viewtask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-4xl">
              <Viewtasksmodal />
            </div>
          </motion.div>
        )}
        {isViewedittaskmodal && (
          <motion.div
            key="edittask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-4xl">
              <VieweditTaskmodal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admintasks;