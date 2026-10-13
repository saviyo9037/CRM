import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutaction } from "../redux/authSlice";
import {
  FaAddressBook,
  FaBook,
  FaChartBar,
  FaClock,
  FaDollarSign,
  FaEnvelope,
  FaRupeeSign,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTasks,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { acessPermission } from "../services/settingservices/permissionAccessRouter";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const metadata = useSelector((state) => state.auth.metadataUser);
  const effectiveRole = metadata?.role || role;

  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const logoutpage = () => {
    dispatch(logoutaction());
    navigate("/");
  };

  const { data: permissionData } = useQuery({
    queryKey: ["permissionToAccess"],
    queryFn: acessPermission,
  });

  const hideLeadDetails = permissionData?.getPermission?.find(
    (perm) => perm.title === "Hide lead details form agent"
  );
  const displayLeadDetails = permissionData?.getPermission?.find(
    (perm) => perm.title === "Display all leads for every staff member"
  );
  const displayCustomerDetails = permissionData?.getPermission?.find(
    (perm) => perm.title === "Display all customers for every staff member"
  );

  const menuItems = {
    Admin: [
      { to: "/admindashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/agents", icon: <FaUserFriends />, label: "Staffs" },
      { to: "/leads", icon: <FaAddressBook />, label: "Leads" },
      { to: "/followups", icon: <FaBook />, label: "Followups" },
      { to: "/customers", icon: <FaUsers />, label: "Customers" },
      { to: "/tasks", icon: <FaTasks />, label: "Tasks" },
      { to: "/payments", icon: <FaRupeeSign />, label: "Payments" },
      { to: "/paymentReports", icon: <FaDollarSign />, label: "Payment Reports" },
      { to: "/subadminreports", icon: <FaChartBar />, label: "Reports" },
    ],
    "Sub-Admin": [
      { to: "/admindashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/staffs", icon: <FaUserFriends />, label: "Staffs" },
      { to: "/leads", icon: <FaAddressBook />, label: "Leads" },
      { to: "/followups", icon: <FaBook />, label: "Followups" },
      { to: "/customers", icon: <FaUserFriends />, label: "Customers" },
      { to: "/subadmintasks", icon: <FaTasks />, label: "Tasks" },
      { to: "/payments", icon: <FaDollarSign />, label: "Payments" },
      { to: "/subadminreports", icon: <FaChartBar />, label: "Reports" },
    ],
    Agent: [
      { to: "/subadminhome", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/leads", icon: <FaEnvelope />, label: "Lead List" },
      { to: "/followups", icon: <FaClock />, label: "Followups" },
      { to: "/customers", icon: <FaUserFriends />, label: "Customers" },
      { to: "/agenttasks", icon: <FaTasks />, label: "Tasks" },
      { to: "/payments", icon: <FaDollarSign />, label: "Payments" },
    ],
  };

  const currentMenu = menuItems[effectiveRole] || [];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold rounded-lg shadow-lg hover:brightness-110 transition"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col justify-between text-white transition-all duration-300 shadow-2xl z-50
          ${isOpen ? "w-64" : "w-20"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[#0A0A0A] border-r border-[#1F1F1F]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1F1F1F]">
          <div
            className={`flex items-center gap-2 font-bold text-xl tracking-wider transition-opacity duration-200 ${
              !isOpen ? "opacity-0 hidden" : "opacity-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00] shadow-[0_0_10px_#FF8A00]"></span>
            <span className="bg-gradient-to-r from-[#FF8A00] to-[#FFA333] bg-clip-text text-transparent font-extrabold tracking-widest">
              CRM
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#181818] border border-[#262626] text-[#FF8A00] font-medium tracking-normal">
              PRO
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:block text-gray-400 hover:text-[#FF8A00] transition"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu */}
        <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {currentMenu.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ease-out 
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold shadow-[0_0_20px_rgba(255,138,0,0.35)]"
                      : "text-gray-300 hover:bg-[#181818] hover:text-[#FF8A00]"
                  }`
                }
              >
                <div className="text-lg">{item.icon}</div>
                <span
                  className={`text-sm tracking-wide whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0 hidden"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User / Logout */}
        <div className="border-t border-[#1F1F1F] p-3">
          <button
            onClick={logoutpage}
            className="flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-all font-medium"
          >
            <FaSignOutAlt className="text-lg" />
            <span
              className={`transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
