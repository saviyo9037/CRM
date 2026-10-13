import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPayment,
  getTransactions,
  deletePayment,
  getCustomerPayments,
} from "../../services/paymentstatusRouter";
import { uploadToCloudinary } from "../../utils/cloudinaryHelper";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import EditPaymentModal from "./EditPaymentModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ScreenshotViewer from "../ScreenshotViewer";

// Currency formatter for INR (memoized outside the component)
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const PaymentAddModel = ({ customerId, productId }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [editPayment, setEditPayment] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const userId = useSelector((state) => state.auth.user?.id);
  const queryClient = useQueryClient();

  // 🔹 Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", customerId],
    queryFn: () => getTransactions(customerId),
    enabled: !!customerId,
  });

  // 🔹 Fetch payment summary
  const {
    data: Payments,
    isLoading: paymentLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payments", customerId],
    queryFn: () => getCustomerPayments({ customerId }),
    enabled: !!customerId,
  });

  const paymentInfo = Payments?.data ?? Payments ?? null;
  if (isError) console.error("Error loading customer payments:", error);

  // 🔹 Invalidate queries together
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries(["transactions", customerId]);
    queryClient.invalidateQueries(["payments", customerId]);
  }, [queryClient, customerId]);

  // 🔹 Compute next payment suggestion
  const nextPaymentDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [date]);

  // 🔹 Add Payment Mutation
  const { mutate: addPaymentFn } = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      toast.success("✅ Payment added successfully!");
      invalidateQueries();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong!");
    },
  });

  // 🔹 Delete Payment Mutation
  const { mutate: deletePaymentFn } = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success("🗑 Payment deleted!");
      invalidateQueries();
    },
    onError: () => {
      toast.error("⚠ Failed to delete payment.");
    },
  });

  // 🔹 Form helpers
  const resetForm = () => {
    setAmount("");
    setDate("");
    setPaymentMode("");
    setReceiptFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setReceiptFile(file);
      setLocalPreview((prev) => {
        if (prev)
          try {
            URL.revokeObjectURL(prev);
          } catch (e) {}
        return URL.createObjectURL(file);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (localPreview)
        try {
          URL.revokeObjectURL(localPreview);
        } catch (e) {}
    };
  }, [localPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !date || !paymentMode)
      return toast.error("⚠ Please fill all fields.");

    try {
      setIsUploading(true);
      let receiptUrl = null;

      // Upload receipt if provided
      if (receiptFile) {
        receiptUrl = await uploadToCloudinary(receiptFile);
      }

      const payload = {
        productId,
        customerId,
        paidAmount: Number(amount),
        transactionDate: new Date(date).toISOString(),
        paymentMode,
        transactionRecordBy: userId,
        receiptUrl,
      };

      addPaymentFn(payload);
    } catch (error) {
      toast.error("Failed to upload receipt. Please try again.");
      console.log(error);
      
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("🗑 Confirm delete?")) deletePaymentFn(id);
  };

  // Extract safe payment values
  const totalAmount = paymentInfo?.allPayment?.totalAmount ?? 0;
  const totalPaid = paymentInfo?.allPayment?.totalPaid ?? 0;
  const balance = totalAmount - totalPaid;

  return (
    <div className="m-2 sm:m-4 bg-[#141414] p-5 rounded-2xl shadow-lg border border-[#262626] text-white">
      <h1 className="text-xl font-bold text-[#FF8A00] mb-4">💰 Add Payment</h1>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₹)"
          className="p-3 bg-[#121212] border border-[#2E2E2E] text-white rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none placeholder-gray-500"
          min="1"
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-3 bg-[#121212] border border-[#2E2E2E] text-white rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none"
          required
        />

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="p-3 bg-[#121212] border border-[#2E2E2E] text-white rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none"
          required
        >
          <option value="">Select Payment Mode</option>
          <option value="upi">UPI</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>

        {paymentMode && (
          <div className="col-span-2">
            <div className="bg-[#181818] p-4 rounded-xl border border-[#262626]">
              {paymentMode === "cash" ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    📝 For cash payments, please upload:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-400 ml-2">
                    <li>Written receipt or acknowledgment</li>
                    <li>Cash counting photo (optional)</li>
                    <li>Any supporting documents</li>
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-300">
                  📱 Please upload a screenshot of the{" "}
                  {paymentMode.replace("_", " ")} payment
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-3 p-2 w-full bg-[#121212] border border-[#2E2E2E] rounded-lg text-sm text-gray-300"
              />
              {receiptFile && (
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-sm text-green-400">
                    ✓ {receiptFile.name} selected
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalPreview(
                        (prev) => prev ?? URL.createObjectURL(receiptFile)
                      )
                    }
                    className="text-sm text-[#FF8A00] hover:underline"
                  >
                    👁 Preview
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {nextPaymentDate && (
          <div className="bg-[#FF8A00]/10 border-l-4 border-[#FF8A00] p-3 rounded-lg mt-1 md:col-span-2 text-gray-300">
            📅 Suggested Next Payment:{" "}
            <span className="font-bold text-[#FF8A00]">
              {nextPaymentDate.toLocaleDateString()}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="col-span-2 py-3 bg-[#FF8A00] hover:bg-[#E67A00] text-black rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </>
          ) : (
            "Add Payment"
          )}
        </button>
      </form>

      {/* Payment Summary */}
      {paymentLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-[#FF8A00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : paymentInfo ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414] shadow-sm">
          <table className="min-w-full divide-y divide-[#262626]">
            <thead className="bg-[#1E1E1E]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                  Total Paid
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#141414] divide-y divide-[#262626]">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {paymentInfo?.allPayment?.product?.title ?? "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-300">
                  {formatCurrency(totalAmount)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-400 font-bold">
                  {formatCurrency(totalPaid)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-[#FF8A00] font-bold">
                  {formatCurrency(balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 mt-4">No payment details available.</p>
      )}

      {/* Transactions Table */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-3">
          💳 Payment Transactions
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-[#FF8A00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions?.transactions?.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#262626]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#1E1E1E] text-[#FF8A00]">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Mode</th>
                  <th className="p-3">Screenshot</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {transactions.transactions.map((item, i) => (
                  <tr key={item._id} className="hover:bg-[#181818] transition-colors">
                    <td className="p-3 text-gray-400">{i + 1}</td>
                    <td className="p-3 text-gray-300">
                      {new Date(item.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-green-400">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="p-3 capitalize text-gray-300">{item.paymentMode}</td>
                    <td className="p-3">
                      {item.receiptUrl ? (
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setPreviewImage(item)}
                            className={`
          relative group rounded-lg overflow-hidden 
          shadow-md border bg-[#181818] transition 
          hover:shadow-lg hover:scale-105
          ${
            item.paymentMode === "cash"
              ? "border-yellow-500/50"
              : item.paymentMode === "upi"
              ? "border-green-500/50"
              : item.paymentMode === "card"
              ? "border-blue-500/50"
              : "border-purple-500/50"
          }
        `}
                          >
                            <img
                              src={item.receiptUrl}
                              alt="Payment receipt"
                              className="w-10 h-10 object-cover rounded-md"
                            />

                            {/* Hover Overlay */}
                            <div
                              className="
          absolute inset-0 bg-black/60 opacity-0 
          group-hover:opacity-100 transition flex 
          items-center justify-center
        "
                            >
                              <span className="text-white text-xs font-semibold">
                                👁 View
                              </span>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            item.paymentMode === "cash"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-500/10 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {item.paymentMode === "cash"
                            ? "📄 No receipt"
                            : "🖼 No screenshot"}
                        </span>
                      )}
                    </td>

                    <td className="p-3 flex gap-3">
                      <button
                        className="text-[#FF8A00] hover:text-[#E67A00]"
                        onClick={() => setEditPayment(item)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No transactions found.</p>
        )}
      </div>

      {/* Edit Modal with Animation */}
      <AnimatePresence>
        {editPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EditPaymentModal
              editPayment={editPayment}
              onClose={() => setEditPayment(null)}
              onUpdated={invalidateQueries}
            />
          </motion.div>
        )}

        {/* Screenshot Viewer for transaction or local file previews */}
        {previewImage && (
          <ScreenshotViewer
            images={[
              {
                src: previewImage.receiptUrl,
                title: "Payment Receipt",
                transactionDate: previewImage.transactionDate,
                paidAmount: formatCurrency(previewImage.paidAmount),
                paymentMode: previewImage.paymentMode,
              },
            ]}
            initialIndex={0}
            onClose={() => setPreviewImage(null)}
          />
        )}

        {localPreview && (
          <ScreenshotViewer
            images={[
              {
                src: localPreview,
                title: receiptFile?.name ?? "Receipt Preview",
              },
            ]}
            initialIndex={0}
            onClose={() => {
              try {
                URL.revokeObjectURL(localPreview);
              } catch (e) {}
              setLocalPreview(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentAddModel;