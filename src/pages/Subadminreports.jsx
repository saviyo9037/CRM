import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { FaBars, FaChartBar, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import LeadStatusPieChart from '../components/PieChart';
import { useQuery } from '@tanstack/react-query';
import PolarAreaChart from '../components/PolarAreaChart';
import CustomerStatusPieChart from '../components/CustomerStatusPieChart';
import { listleads } from '../services/leadsRouter';
import { liststaffs } from '../services/staffRouter';
import { listtask } from '../services/tasksRouter';
import { listconvertedcustomers } from '../services/customersRouter';
import Icons from './Icons';
import Spinner from '../components/Spinner';
import { useSelector } from 'react-redux';
import PaymentDonutCHart from '../components/PaymentReportChart/PaymentDonutCHart';
import MonthlyLeadsChart from '../components/BarChart';
import DateRangeDropdown from '../components/DateRangeDropdown';

function Subadminreports() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activereports, setactivereports] = useState('lead');
  const [searchQuery, setSearchQuery] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const user = useSelector((state)=>state.auth.user);

  // Fetch filtered leads in a single query
  const { data: filteredLeadsData, isLoading, isError } = useQuery({
    queryKey: ['Filtered leads', startDate, endDate],
    queryFn: () => listleads({
      noLimit: true,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined
    }),
  });

  // Fetch all-time leads in a single query
  const { data: allTimeLeadsData, isLoading: isLoadingAllTime, isError: isErrorAllTime } = useQuery({
    queryKey: ['All time leads'],
    queryFn: () => listleads({ noLimit: true }),
  });

  const allLeads = filteredLeadsData?.leads || [];
  const allTimeLeads = allTimeLeadsData?.leads || [];
  const isFetchingAll = isLoading;
  const isFetchingAllTime = isLoadingAllTime;

  const { data: Staffsdata, isLoading: loading, isError: errors } = useQuery({
    queryKey: ['List Staffs'],
    queryFn: liststaffs,
  });

  const { data: Taskdata } = useQuery({
    queryKey: ['Task Data'],
    queryFn: listtask,
  });

  const { data: Customerdata } = useQuery({
    queryKey: ['Customer Data'],
    queryFn: listconvertedcustomers,
  });

  const activecustomers = Customerdata?.customers?.filter((customer) => customer?.isActive === true).length || 0;
  const inactivecustomers = Customerdata?.customers?.filter((customer) => customer?.isActive === false).length || 0;

  // Filter leads based on search query (for current month leads table)
  const filteredLeads = allLeads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.mobile?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40">
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -260 }}
          transition={{ duration: 0.3 }}
          className="w-64 h-full fixed top-0 left-0 z-50 bg-[#0A0A0A] border-r border-[#262626]"
        >
          <Sidebar />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#0A0A0A]"
      >

        {/* Header */}
        <div className="relative flex flex-col sm:flex-row justify-between items-start p-4 sm:p-6 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center mb-4 sm:mb-0 gap-3">
            <button
              className="text-[#FF8A00] hover:text-[#E67A00] transition cursor-pointer p-1"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-lg sm:text-xl md:text-2xl" />
            </button>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">
              Reports
            </h3>
          </div>

          {/* Right: Icons */}
          <div className="absolute top-4 sm:top-5 right-4 sm:right-6 z-[80]">
            <Icons />
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
            {/* Left Side: Report Type Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {['lead', 'staff', 'customer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setactivereports(type)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold cursor-pointer text-sm sm:text-base transition-all duration-200 ${
                    activereports === type
                      ? 'bg-[#FF8A00] text-black font-bold shadow-lg shadow-[#FF8A00]/25'
                      : 'bg-[#181818] border border-[#2A2A2A] text-gray-300 hover:text-white hover:border-[#FF8A00]/50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Right Side: Date Range Filter */}
            <div className="z-[70] sm:mr-4 ml-auto">
              <DateRangeDropdown onDateRangeChange={handleDateRangeChange} />
            </div>
          </div>

          {activereports === 'lead' && (
            <div className="flex flex-col gap-6 sm:gap-8 w-full">
              {/* Charts */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition">
                  <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                    <FaChartBar className="text-[#FF8A00] text-lg sm:text-xl" />
                    <h4 className="text-lg sm:text-xl font-semibold text-white">Lead Sources</h4>
                  </div>
                  <MonthlyLeadsChart type="source" leads={allLeads} startDate={startDate} endDate={endDate} />
                </div>

                <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition">
                  <LeadStatusPieChart leads={allLeads} startDate={startDate} endDate={endDate} />
                </div>
              </motion.div>

              {/* Table */}
              <motion.div
                className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#262626]">
                  <h4 className="text-lg sm:text-xl font-bold text-white">
                    Leads
                    {startDate && endDate ? (
                      <span className="text-[#FF8A00] font-medium ml-2">
                        from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic ml-2"> (All Time)</span>
                    )}
                  </h4>

                  <input
                    type="text"
                    placeholder="Search by name, email, mobile or source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-96 px-4 py-3 bg-[#181818] border border-[#2A2A2A] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00] transition text-sm"
                  />
                </div>

                {(isLoading || isFetchingAll) ? (
                  <Spinner />
                ) : isError ? (
                  <p className="text-red-400 text-sm sm:text-base">Error loading leads data.</p>
                ) : filteredLeads.length > 0 ? (
                  <div className="rounded-xl border border-[#262626] overflow-hidden shadow-sm">
                    <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#262626]">
                        <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black sticky top-0 z-10 font-bold">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Created</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Assigned To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626] text-white">
                          {filteredLeads.map((lead, index) => (
                            <tr key={index} className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] transition border-b border-[#262626]">
                              <td className="px-4 py-3 text-sm font-medium text-white">{lead.name || '—'}</td>
                              <td className="px-4 py-3 text-sm truncate max-w-[200px] text-gray-300" title={lead.email || 'No email'}>
                                {lead.email ? lead.email : <span className="text-gray-500 italic">No email</span>}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">{lead.mobile || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  lead.status === 'converted' ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800' :
                                  lead.status === 'open' ? 'bg-yellow-950/70 text-yellow-400 border border-yellow-800' :
                                  lead.status === 'rejected' ? 'bg-red-950/70 text-red-400 border border-red-800' :
                                  lead.status === 'closed' ? 'bg-blue-950/70 text-blue-400 border border-blue-800' :
                                  'bg-neutral-800 text-gray-300 border border-neutral-700'
                                }`}>
                                  {lead.status || 'unknown'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-3 text-sm capitalize text-gray-300">{lead?.source?.title || '—'}</td>
                              <td className="px-4 py-3 text-sm text-[#FF8A00] font-medium">{lead?.assignedTo?.name || 'Unassigned'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm sm:text-base">No leads found for the selected date range.</p>
                )}
              </motion.div>
            </div>
          )}

          {activereports === 'staff' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6 sm:gap-8"
            >
              {/* Staff Bar Chart */}
              <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition">
                <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                  <FaChartBar className="text-[#FF8A00] text-lg sm:text-xl" />
                  <h4 className="text-lg sm:text-xl font-semibold text-white">Staff-wise Lead Performance</h4>
                </div>
                <MonthlyLeadsChart startDate={startDate} endDate={endDate}/>
              </div>

              {/* Staff Table */}
              <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition">
                <h4 className="text-lg sm:text-xl font-semibold text-white mb-4 border-b border-[#262626] pb-3">
                  Staff Performance (All Time)
                </h4>

                {(loading || isFetchingAllTime) ? (
                  <Spinner />
                ) : errors || isErrorAllTime ? (
                  <p className="text-red-400 text-sm sm:text-base">Error loading staff or leads data.</p>
                ) : Staffsdata && Staffsdata.length > 0 ? (
                  <div className="rounded-xl border border-[#262626] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="min-w-full table-auto text-xs sm:text-sm">
                        <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold sticky top-0 z-10">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Name</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Role</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Closed</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Rejected</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Open</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Tasks Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626] text-white">
                          {Staffsdata.map((staff, index) => {
                            const closedCount = allTimeLeads.filter(
                              (lead) =>
                                (lead.status === 'closed' || lead.status === 'converted') &&
                                lead.assignedTo?._id === staff._id
                            ).length || 0;

                            const rejectedCount = allTimeLeads.filter(
                              (lead) => lead.status === 'rejected' && lead.updatedBy?._id === staff._id
                            ).length || 0;

                            const openCount = allTimeLeads.filter(
                              (lead) => lead.status === 'open' && lead.updatedBy?._id === staff._id
                            ).length || 0;

                            const completedTask = Taskdata?.task?.filter(
                              (task) => task.status === 'completed' && task.updatedBy?._id === staff._id
                            ).length || 0;

                            return (
                              <tr
                                key={staff._id || index}
                                className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] transition border-b border-[#262626]"
                              >
                                <td className="px-2 sm:px-4 py-2 sm:py-3 truncate font-medium text-white">{staff.name || 'N/A'}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize text-gray-300">{staff.role || 'N/A'}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-400 font-semibold">{closedCount}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-red-400 font-semibold">{rejectedCount}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-yellow-400 font-semibold">{openCount}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF8A00] font-semibold">{completedTask}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm sm:text-base">No staff members found.</p>
                )}
              </div>
            </motion.div>
          )}

          {activereports === 'customer' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6 sm:gap-8 w-full"
            >
              {/* Charts Section */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition">
                  <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                    <FaChartBar className="text-[#FF8A00] text-lg sm:text-xl" />
                    <h4 className="text-lg sm:text-xl font-semibold text-white">Customer Category Overview</h4>
                  </div>
                  <PaymentDonutCHart startDate={startDate} endDate={endDate}/>
                </div>

                <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition">
                  <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                      📊 Customer Status Distribution
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-[#181818] border border-[#262626] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                      <FaUserPlus className="text-emerald-400 text-xl sm:text-2xl" />
                      <div>Active: <span className="font-bold text-white">{activecustomers}</span></div>
                    </div>
                    <div className="bg-[#181818] border border-[#262626] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                      <FaUserMinus className="text-red-400 text-xl sm:text-2xl" />
                      <div>Inactive: <span className="font-bold text-white">{inactivecustomers}</span></div>
                    </div>
                  </div>
                  <div className="max-w-full mx-auto">
                    <CustomerStatusPieChart startDate={startDate} endDate={endDate} />
                  </div>
                </div>
              </motion.div>

              {/* Customer List Table Section */}
              <motion.div
                className="bg-[#141414] border border-[#262626] p-4 sm:p-6 rounded-2xl shadow-xl transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h4 className="text-lg sm:text-xl font-semibold text-white mb-4 border-b border-[#262626] pb-3">Customer List</h4>

                {isLoading ? (
                  <Spinner />
                ) : isError ? (
                  <p className="text-red-400 text-sm sm:text-base">Error loading customer data.</p>
                ) : Customerdata && Customerdata.customers.length > 0 ? (
                  <div className="rounded-xl border border-[#262626] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full table-auto text-xs sm:text-sm">
                        <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold sticky top-0 z-10">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Name</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Email</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Phone</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Customer Add Date</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Payment Status</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold uppercase tracking-wider text-black">Customer Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626] text-white">
                          {Customerdata.customers.map((customer, index) => (
                            <tr
                              key={index}
                              className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] transition border-b border-[#262626]"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 truncate font-medium text-white">{customer.name || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 truncate text-gray-300">{customer.email || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-300">{customer.mobile || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-300">
                                {customer.createdAt
                                  ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    customer.payment === 'paid'
                                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                                      : customer.payment === 'partially paid'
                                      ? 'bg-yellow-950/70 text-yellow-400 border border-yellow-800'
                                      : 'bg-neutral-800 text-gray-300 border border-neutral-700'
                                  }`}
                                >
                                  {customer.payment || 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    customer.status === 'success'
                                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                                      : customer.status === 'failed'
                                      ? 'bg-red-950/70 text-red-400 border border-red-800'
                                      : 'bg-neutral-800 text-gray-300 border border-neutral-700'
                                  }`}
                                >
                                  {customer.status?.title || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm sm:text-base">No customers found.</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Subadminreports;