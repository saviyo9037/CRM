import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  getProductPaymentDetails,
  getProducts,
} from "../../services/paymentstatusRouter";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const AllTransactions = () => {
  const role = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.user?.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["productPayments", role, userId],
    queryFn: () => getProductPaymentDetails({ 
      agentId: role === 'Agent' ? userId : undefined 
    }),
  });

  const allTransactions = data?.getProductPayment || [];

  const { data: productData } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  
  const products = productData?.getProduct || [];

  const [filters, setFilters] = useState({
    customer: "",
    status: "",
    paymentMode: "",
    product: "",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    if (filters.customer) {
      filtered = filtered.filter((t) =>
        t.payment?.customer?.name
          ?.toLowerCase()
          .includes(filters.customer.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((t) => {
        if (!t.payment) return false;
        const { totalPaid, totalAmount, dueDate } = t.payment;
        const now = new Date();
        const due = totalAmount - totalPaid;

        let status = "Unpaid";
        if (totalPaid === totalAmount) status = "Paid";
        else if (totalPaid > 0 && totalPaid < totalAmount) status = "Partially Paid";
        else if (totalPaid === 0) status = "Unpaid";
        if (dueDate && new Date(dueDate) < now && due > 0) status = "Overdue";

        return status === filters.status;
      });
    }

    if (filters.paymentMode) {
      filtered = filtered.filter(
        (t) => t.paymentMode?.toLowerCase() === filters.paymentMode.toLowerCase()
      );
    }

    if (filters.product) {
      filtered = filtered.filter(
        (t) => t.payment?.product?._id === filters.product
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (t) => new Date(t.transactionDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (t) => new Date(t.transactionDate) <= new Date(filters.endDate)
      );
    }

    return filtered;
  }, [allTransactions, filters]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-60">
        <p>Loading transactions...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-60 text-red-600">
        <p>Error loading transactions</p>
      </div>
    );

  return (
    <div className="bg-[#141414] shadow-xl rounded-2xl p-6 mt-8 border border-[#262626]">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
        Transactions Management
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Customer name"
          className="border border-[#2A2A2A] bg-[#181818] text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#FF8A00] outline-none placeholder-gray-500"
          value={filters.customer}
          onChange={(e) =>
            setFilters({ ...filters, customer: e.target.value })
          }
        />
        <select
          className="border border-[#2A2A2A] bg-[#181818] text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#FF8A00] outline-none"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <select
          className="border border-[#2A2A2A] bg-[#181818] text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#FF8A00] outline-none"
          value={filters.paymentMode}
          onChange={(e) =>
            setFilters({ ...filters, paymentMode: e.target.value })
          }
        >
          <option value="">All Payment Modes</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
        <select
          className="border border-[#2A2A2A] bg-[#181818] text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#FF8A00] outline-none"
          value={filters.product}
          onChange={(e) => setFilters({ ...filters, product: e.target.value })}
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id} className="bg-[#141414] text-white">
              {p.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border border-[#2A2A2A] bg-[#181818] text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#FF8A00] outline-none"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <input
          type="date"
          className="border border-[#2A2A2A] bg-[#181818] text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#FF8A00] outline-none"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {/* Pagination Info */}
      {filteredTransactions.length > 0 && (
        <div className="mb-4 text-xs font-semibold text-gray-400">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-xl border border-[#262626]">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider flex items-center">
                <FaUser className="mr-2" /> Customer
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider flex items-center">
                <FaCalendarAlt className="mr-2" /> Date
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-black uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                Recorded By
              </th>
              <th className="px-6 py-3.5 text-center text-xs font-bold text-black uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {filteredTransactions.length > 0 ? (
              paginatedTransactions.map((txn) => {
                if (!txn.payment) {
                  return (
                    <tr
                      key={txn._id}
                      className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        N/A
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        N/A
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(txn.transactionDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400 font-bold text-right">
                        {formatCurrency(txn.paidAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {txn.paymentMode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {txn.transactionRecordBy?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                          <span className="mr-1.5"><FaTimesCircle /></span>
                          Unknown
                        </span>
                      </td>
                    </tr>
                  );
                }
                const { totalPaid, totalAmount, dueDate } = txn.payment;
                const due = totalAmount - totalPaid;
                const now = new Date();

                let status = "Unpaid";
                let statusColor = "bg-red-500/10 border border-red-500/30 text-red-400";
                let StatusIcon = <FaTimesCircle />;

                if (totalPaid === totalAmount) {
                  status = "Paid";
                  statusColor = "bg-green-500/10 border border-green-500/30 text-green-400";
                  StatusIcon = <FaCheckCircle />;
                } else if (totalPaid > 0 && totalPaid < totalAmount) {
                  status = "Partially Paid";
                  statusColor = "bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00]";
                  StatusIcon = <FaHourglassHalf />;
                } else if (totalPaid === 0) {
                  status = "Unpaid";
                  statusColor = "bg-red-500/10 border border-red-500/30 text-red-400";
                  StatusIcon = <FaTimesCircle />;
                }
                if (dueDate && new Date(dueDate) < now && due > 0) {
                  status = "Overdue";
                  statusColor = "bg-orange-500/10 border border-orange-500/30 text-orange-400";
                  StatusIcon = <FaExclamationCircle />;
                }

                return (
                  <tr
                    key={txn._id}
                    className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {txn.payment.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {txn.payment.product?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(txn.transactionDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-400 font-bold text-right">
                      {formatCurrency(txn.paidAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {txn.paymentMode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {txn.transactionRecordBy?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                      >
                        <span className="mr-1.5">{StatusIcon}</span>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400 bg-[#141414]">
                  <FaExclamationCircle className="text-3xl text-gray-500 mx-auto mb-2" />
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#181818] border border-[#2A2A2A] text-gray-300 rounded-xl disabled:opacity-40 hover:bg-[#222222] transition text-sm font-medium"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition ${currentPage === page ? 'bg-[#FF8A00] text-black shadow-md shadow-[#FF8A00]/20' : 'bg-[#181818] border border-[#2A2A2A] text-gray-300 hover:bg-[#222222]'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#181818] border border-[#2A2A2A] text-gray-300 rounded-xl disabled:opacity-40 hover:bg-[#222222] transition text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllTransactions;
