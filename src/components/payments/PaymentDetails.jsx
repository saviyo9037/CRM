import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getallpaymentstatus,
  getTransactions,
} from "../../services/paymentstatusRouter";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimes,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const PaymentDetails = ({ startDate, endDate }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["allPaymentStatus", startDate, endDate],
    queryFn: () => getallpaymentstatus({ startDate, endDate }),
  });

  const payments = data?.data ?? [];
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingTransactions(true);

    try {
      const res = await getTransactions(customer._id, { startDate, endDate });
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setTransactions([]);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-60 bg-[#141414] border border-[#262626] rounded-2xl">
        <div className="animate-pulse flex flex-col items-center">
          <FaRupeeSign className="text-4xl text-[#FF8A00] mb-3" />
          <p className="text-lg font-medium text-gray-400">
            Loading Payments...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-60 bg-red-950/20 rounded-2xl border border-red-800/40">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-red-400">
            Error Loading Payments
          </p>
          <p className="text-sm text-gray-500 mt-1">Please try again later.</p>
        </div>
      </div>
    );

  return (
    <div className="bg-[#141414] shadow-xl rounded-2xl p-6 mt-8 border border-[#262626]">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
        Customer Payment Overview
      </h1>

      <div className="overflow-x-auto rounded-xl border border-[#262626]">
        <table className="min-w-full divide-y divide-[#262626]">
          <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider flex items-center">
                <FaUser className="mr-2" /> Customer Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                <FaCalendarAlt className="inline mr-2" /> Joining Date
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-black uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-black uppercase tracking-wider">
                Total Paid
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-black uppercase tracking-wider">
                Due Amount
              </th>
              <th className="px-6 py-3.5 text-center text-xs font-bold text-black uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {payments.length > 0 ? (
              payments.map((payment) => {
                const customer = payment.customer || {};
                const dueAmount =
                  (payment.totalAmount || 0) - (payment.totalPaid || 0);

                let statusLabel, statusColor, StatusIcon;
                if ((payment.totalPaid || 0) >= (payment.totalAmount || 0)) {
                  statusLabel = "Paid";
                  statusColor = "bg-green-500/10 border border-green-500/30 text-green-400";
                  StatusIcon = <FaCheckCircle />;
                } else {
                  statusLabel = "Pending";
                  statusColor = "bg-red-500/10 border border-red-500/30 text-red-400";
                  StatusIcon = <FaExclamationCircle />;
                }

                return (
                  <tr
                    key={payment._id}
                    className="bg-[#141414] even:bg-[#181818] hover:bg-[#202020] transition-colors duration-150"
                  >
                    <td
                      className="px-6 py-4 text-sm font-semibold text-[#FF8A00] cursor-pointer hover:underline"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      {customer.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-200 text-right font-medium">
                      {formatCurrency(payment.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-400 font-bold text-right">
                      {formatCurrency(payment.totalPaid)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-right ${
                        dueAmount > 0 ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      {formatCurrency(dueAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                      >
                        <span className="mr-1.5">{StatusIcon}</span>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 bg-[#141414]">
                  <FaExclamationCircle className="text-3xl text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No payment data available.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Transaction Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative text-white">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#FF8A00] transition"
              onClick={closeModal}
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
              Transactions for {selectedCustomer.name}
            </h2>

            {loadingTransactions ? (
              <p className="text-gray-400 py-4 text-center">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#262626]">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {transactions.map((tx, index) => (
                      <tr key={tx._id} className="bg-[#141414] hover:bg-[#1E1E1E]">
                        <td className="p-3 text-gray-400">{index + 1}</td>
                        <td className="p-3 text-gray-300">
                          {new Date(tx.transactionDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="p-3 font-bold text-green-400">
                          {formatCurrency(tx.paidAmount)}
                        </td>
                        <td className="p-3 capitalize flex items-center gap-2 text-gray-300">
                          {tx.paymentMode === "cash" ? (
                            <FaMoneyBillWave className="text-green-400" />
                          ) : (
                            <FaCreditCard className="text-[#FF8A00]" />
                          )}
                          {tx.paymentMode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">
                No transactions found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
