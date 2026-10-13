import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FaBars, FaSearch, FaUserPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleaddcustomermodal,
  toggleConvertedcustomerdetailmodal,
} from "../redux/modalSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Addcustomermodal from "../components/Addcustomermodal";
import { AnimatePresence, motion } from "framer-motion";
import {
  listconvertedcustomers,
  updateactivecustomers,
  updatecustomerstatus,
  deletemultiplecustomer,
} from "../services/customersRouter";
import Icons from "./Icons";
import { listcustomersettingstatus } from "../services/settingservices/customerStatusSettingsRouter";
import Spinner from "../components/Spinner";
import { Trash2 } from "lucide-react";
import ConvertedCustomerdetailModal from "../components/ConvertedCustomerdetailModal";

function Subadmincustomer() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();
  const isaddCustomermodal = useSelector(
    (state) => state.modal.addcustomermodal
  );
  const isCustomerdetailmodal = useSelector(
    (state) => state.modal.convertedcustomerdetailModal
  );
  const role = useSelector((state) => state.auth.role);
  const metadata = useSelector((state) => state.auth.metadataUser);
  const [sidebarVisible, setsidebarVisible] = useState(true);
  const [statussuccessmodal, setstatussuccessmodal] = useState(false);
  const [showsearch, setshowsearch] = useState(false);
  const [searchText, setsearchText] = useState("");
  const [paymentfilter, setpaymentfilter] = useState("Payment Status");
  const [activefilter, setActivefilter] = useState("All");
  const [datefilter, setdatefilter] = useState("Date");
  const [selectdatefilter, setselectdatefilter] = useState(null);
  const [daterangefilter, setdaterangefilter] = useState({
    start: null,
    end: null,
  });
  const [currentpage, setcurrentpage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const leadsperpage = 10;

  const { data: fetchconvertedcustomers, isLoading } = useQuery({
    queryKey: [
      "List converted customers",
      paymentfilter,
      activefilter,
      currentpage,
      searchText,
      datefilter,
      selectdatefilter,
      daterangefilter,
      role,
      metadata?._id,
    ],
    queryFn: () =>
      listconvertedcustomers({
        page: currentpage,
        limit: leadsperpage,
        paymentStatus:
          paymentfilter !== "Payment Status" ? paymentfilter : undefined,
        activestatus: activefilter !== "All" ? activefilter : undefined,
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
        assignedTo: undefined,
        // savio ............................................................
        //  role === "Agent" && metadata ? metadata._id :
      }),
    keepPreviousData: true,
  });
  const fetchcustomerstatus = useQuery({
    queryKey: ["List Settingstatus"],
    queryFn: listcustomersettingstatus,
    
  });
  

  const updatingcustomerstatus = useMutation({
    mutationKey: ["Update Customerstatus"],
    mutationFn: updatecustomerstatus,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });


  

  const updatingactivecustomers = useMutation({
    mutationKey: ["Update active customers"],
    mutationFn: updateactivecustomers,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });

  const deleteCustomersMutation = useMutation({
    mutationKey: ["Delete customers"],
    mutationFn: deletemultiplecustomer,
    onSuccess: () => {
      queryclient.invalidateQueries(["List converted customers"]);
      setSelectedCustomers([]);
      setstatussuccessmodal(true);
      setTimeout(() => {
        setstatussuccessmodal(false);
      }, 2000);
    },
    onError: (error) => {
      console.error("Delete customers error:", error);
      alert(
        "Failed to delete customers: " +
          (error.response?.data?.message || error.message)
      );
    },
  });

  const handlecustomerstatus = async (customerId, status) => {
    const statusToSend = status === "" ? null : status;
    await updatingcustomerstatus.mutateAsync({
      customerId,
      status: statusToSend,
    });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };

  const handleactivestatus = async (customerId, isActive) => {
    await updatingactivecustomers.mutateAsync({ customerId, isActive });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };
 
  

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedCustomers.length > 0) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await deleteCustomersMutation.mutateAsync({
      customerIds: selectedCustomers,
    });
    setShowDeleteConfirm(false);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
  };

  const totalLeads = fetchconvertedcustomers?.totalLeads || 0;
  const totalPages = fetchconvertedcustomers?.totalPages || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setcurrentpage(page);
      setSelectedCustomers([]);
    }
  };

  const filteredcustomerstatus =
    fetchcustomerstatus?.data?.getCustomerstatus?.filter(
      (customerstatus) => customerstatus.active
    );
    

  // Simplified payment status function to use Customer.payment
  const getPaymentStatus = (customer) => {
    return customer.payment || "Pending"; // Use backend-computed payment status
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
        {fetchcustomerstatus.isLoading && <Spinner />}
        {updatingactivecustomers.isPending && <Spinner />}
        {updatingcustomerstatus.isPending && <Spinner />}
        {deleteCustomersMutation.isPending && <Spinner />}
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
                Customers
              </h3>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Icons />
            </div>
            {role  && !metadata && (
              <button
                className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold p-3 sm:p-4 md:p-5 rounded-full shadow-lg shadow-[#FF8A00]/25 transform hover:-translate-y-2 transition-all duration-300 z-40 flex items-center justify-center gap-2"
                onClick={() => dispatch(toggleaddcustomermodal())}
              >
                <FaUserPlus className="text-base sm:text-lg md:text-xl text-black" />
                <span className="text-xs sm:text-sm md:text-base font-bold text-black">
                  Add Customer
                </span>
              </button>
            )}
          </div>

          <div className="flex justify-between items-center p-4 flex-wrap gap-3 bg-[#0A0A0A]">
            {/* Left side: Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={paymentfilter}
                onChange={(e) => setpaymentfilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white shadow-sm focus:outline-none focus:border-[#FF8A00] text-sm sm:text-base transition hover:border-[#FF8A00]/50 font-medium"
              >
                <option value="Payment Status" className="bg-[#181818]">Payment Status</option>
                <option value="pending" className="bg-[#181818]">Pending</option>
                <option value="partially paid" className="bg-[#181818]">Partially Paid</option>
                <option value="paid" className="bg-[#181818]">Paid</option>
              </select>
              <select
                value={activefilter}
                onChange={(e) => setActivefilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white shadow-sm focus:outline-none focus:border-[#FF8A00] text-sm sm:text-base transition hover:border-[#FF8A00]/50 font-medium"
              >
                <option value="All" className="bg-[#181818]">All</option>
                <option value="Active" className="bg-[#181818]">Active</option>
                <option value="Inactive" className="bg-[#181818]">Inactive</option>
              </select>
              <select
                value={datefilter}
                onChange={(e) => setdatefilter(e.target.value)}
                className="min-w-[140px] px-4 py-2 rounded-xl border border-[#2A2A2A] text-white bg-[#181818] shadow-sm focus:outline-none focus:border-[#FF8A00] transition hover:border-[#FF8A00]/50 font-medium"
              >
                <option value="Date" className="bg-[#181818]">Date</option>
                <option value="today" className="bg-[#181818]">Today</option>
                <option value="yesterday" className="bg-[#181818]">Yesterday</option>
                <option value="custom" className="bg-[#181818]">Search from date</option>
                <option value="range" className="bg-[#181818]">Search from range of date</option>
              </select>
              {datefilter === "custom" && (
                <input
                  type="date"
                  onChange={(e) =>
                    setselectdatefilter(new Date(e.target.value))
                  }
                  className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white focus:border-[#FF8A00] outline-none"
                />
              )}
              {datefilter === "range" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    onChange={(e) =>
                      setdaterangefilter({
                        ...daterangefilter,
                        start: new Date(e.target.value),
                      })
                    }
                    className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white focus:border-[#FF8A00] outline-none"
                  />
                  <input
                    type="date"
                    onChange={(e) =>
                      setdaterangefilter({
                        ...daterangefilter,
                        end: new Date(e.target.value),
                      })
                    }
                    className="px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#181818] text-white focus:border-[#FF8A00] outline-none"
                  />
                </div>
              )}
            </div>

            {/* Right side: Search */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showsearch && (
                  <motion.input
                    key="search-input"
                    type="text"
                    value={searchText}
                    onChange={(e) => setsearchText(e.target.value)}
                    className="px-4 py-2 border border-[#2A2A2A] rounded-xl shadow-sm text-white bg-[#181818] focus:border-[#FF8A00] outline-none text-sm sm:text-base w-40 sm:w-56 placeholder-gray-400"
                    placeholder="Search..."
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.3 }}
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

          {/* Table Content */}
          <div className="flex-grow p-4 sm:p-2 bg-[#0A0A0A]">
            <div className="flex justify-end mb-3 gap-2">
              {selectedCustomers.length > 0 &&
                role !== "Agent" &&
                !metadata && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition shadow-md text-sm"
                  >
                    <Trash2 size={18} />
                    Delete Selected
                  </motion.button>
                )}
            </div>
            {isLoading ? (
              <Spinner />
            ) : fetchconvertedcustomers?.customers?.length > 0 ? (
              <>
                <div className="overflow-x-auto w-full bg-[#141414] p-3 sm:p-4 rounded-2xl shadow-xl border border-[#262626]">
                  <div className="max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
                    <table className="w-full table-auto border-collapse text-xs sm:text-sm min-w-[800px]">
                      <thead className="sticky top-0 bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black text-xs sm:text-sm uppercase font-bold z-10">
                        <tr>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            {role !== "Agent" && !metadata && (
                              <input
                                type="checkbox"
                                checked={
                                  selectedCustomers.length ===
                                    fetchconvertedcustomers?.customers
                                      ?.length &&
                                  fetchconvertedcustomers?.customers?.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCustomers(
                                      fetchconvertedcustomers.customers.map(
                                        (customer) => customer._id
                                      )
                                    );
                                  } else {
                                    setSelectedCustomers([]);
                                  }
                                }}
                                className="h-4 w-4 accent-black rounded border-[#2A2A2A] focus:ring-[#FF8A00]"
                              />
                            )}
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Sl No
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Name
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Date
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Payment
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Status
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">
                            Active
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchconvertedcustomers?.customers?.map(
                          (customer, index) => (
                            <motion.tr
                              key={customer._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.4,
                                delay: index * 0.05,
                              }}
                              className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] text-xs sm:text-sm text-white border-b border-[#262626] transition"
                            >
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                {role !== "Agent" && !metadata && (
                                  <input
                                    type="checkbox"
                                    checked={selectedCustomers.includes(
                                      customer._id
                                    )}
                                    onChange={() =>
                                      handleSelectCustomer(customer._id)
                                    }
                                    className="h-4 w-4 accent-[#FF8A00] rounded border-[#2A2A2A]"
                                  />
                                )}
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4 text-gray-300">
                                {(currentpage - 1) * leadsperpage + index + 1}
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                <button
                                  className="text-[#FF8A00] font-semibold hover:underline"
                                  onClick={() =>
                                    dispatch(
                                      toggleConvertedcustomerdetailmodal(
                                        customer
                                      )
                                    )
                                  }
                                >
                                  {customer.name}
                                </button>
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4 text-gray-300">
                                {customer.createdAt
                                  ? new Intl.DateTimeFormat("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }).format(new Date(customer.createdAt))
                                  : "N/A"}
                              </td>

                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                    getPaymentStatus(customer) === "paid"
                                      ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800"
                                      : getPaymentStatus(customer) ===
                                        "partially paid"
                                      ? "bg-yellow-950/70 text-yellow-400 border border-yellow-800"
                                      : "bg-red-950/70 text-red-400 border border-red-800"
                                  }`}
                                >
                                  {customer.payment || "Pending"}
                                </span>
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                <select
                                  className="border border-[#2A2A2A] p-1.5 sm:p-2 rounded-xl bg-[#181818] text-white hover:border-[#FF8A00]/50 focus:border-[#FF8A00] transition text-xs sm:text-sm w-full outline-none"
                                  value={customer.status?._id || ""}
                                  disabled={!!metadata}
                                  onChange={(e) =>
                                    handlecustomerstatus(
                                      customer._id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="" label="Select" className="bg-[#181818]" />
                                  {filteredcustomerstatus?.map(
                                    (customerstatus) => (
                                      <option
                                        key={customerstatus._id}
                                        value={customerstatus._id}
                                        className="bg-[#181818]"
                                      >
                                        {customerstatus.title}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>
                              <td className="py-2 sm:py-4 px-2 sm:px-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    disabled={!!metadata}
                                    checked={!!customer?.isActive}
                                    onChange={(e) =>
                                      handleactivestatus(
                                        customer._id,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <div className="w-8 h-4 bg-[#262626] border border-[#3A3A3A] rounded-full peer-checked:bg-[#FF8A00] transition-colors duration-200 ease-in-out"></div>
                                  <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out transform peer-checked:translate-x-4"></div>
                                </label>
                              </td>
                            </motion.tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-3 bg-[#141414] border border-[#262626] rounded-2xl shadow-xl">
                  {/* ⬅️ Prev Button */}
                  <button
                    disabled={currentpage === 1}
                    onClick={() => handlePageChange(currentpage - 1)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      currentpage === 1
                        ? "bg-[#181818] text-gray-600 border border-[#262626] cursor-not-allowed"
                        : "bg-[#181818] border border-[#2A2A2A] text-gray-200 hover:text-white hover:border-[#FF8A00]"
                    }`}
                  >
                    ← Prev
                  </button>

                  {/* 🔢 Smart Pagination */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentpage - 2 && page <= currentpage + 2)
                    )
                    .map((page, index, arr) => {
                      const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-500 select-none">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 text-sm font-bold rounded-xl transition-all duration-200 ${
                              currentpage === page
                                ? "bg-[#FF8A00] text-black shadow-md shadow-[#FF8A00]/25 scale-105"
                                : "bg-[#181818] border border-[#2A2A2A] text-gray-300 hover:text-white hover:border-[#FF8A00]"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  {/* ➡️ Next Button */}
                  <button
                    disabled={currentpage === totalPages}
                    onClick={() => handlePageChange(currentpage + 1)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      currentpage === totalPages
                        ? "bg-[#181818] text-gray-600 border border-[#262626] cursor-not-allowed"
                        : "bg-[#181818] border border-[#2A2A2A] text-gray-200 hover:text-white hover:border-[#FF8A00]"
                    }`}
                  >
                    Next →
                  </button>

                  {/* 🔍 Jump to Page Input */}
                  <div className="flex items-center gap-2 ml-3">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      placeholder="Page"
                      className="w-16 px-2 py-1.5 border border-[#2A2A2A] bg-[#181818] text-white rounded-xl text-sm text-center focus:border-[#FF8A00] outline-none transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const page = Number(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page);
                          } else {
                            alert(`Enter a number between 1 and ${totalPages}`);
                          }
                        }
                      }}
                    />
                    <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                      Page <strong className="text-white">{currentpage}</strong> of {totalPages}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center text-sm sm:text-lg py-4 sm:py-6">
                {totalLeads > 0
                  ? `No customers available on page ${currentpage}. Try adjusting filters or navigating to another page.`
                  : "No Customers Available"}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isaddCustomermodal && (
          <motion.div
            key="add-customer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Addcustomermodal />
            </div>
          </motion.div>
        )}
        {statussuccessmodal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
          >
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10 bg-[#141414] border border-emerald-500/50 text-emerald-400 px-8 py-6 rounded-2xl shadow-2xl text-base font-semibold w-full max-w-sm flex items-center justify-center text-center"
            >
              {deleteCustomersMutation.isSuccess
                ? "Customers deleted successfully!"
                : "Status updated successfully!"}
            </motion.div>
          </motion.div>
        )}
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-[#141414] border border-[#262626] rounded-2xl p-6 md:p-8 shadow-2xl text-center w-full max-w-sm text-white"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-6 text-white">
                Are you sure you want to delete {selectedCustomers.length}{" "}
                customer(s)?
              </h3>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={closeDeleteConfirm}
                  className="bg-[#242424] hover:bg-[#303030] text-gray-200 px-6 py-2.5 rounded-xl transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isCustomerdetailmodal && (
          <motion.div
            key="customer-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <ConvertedCustomerdetailModal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Subadmincustomer;
