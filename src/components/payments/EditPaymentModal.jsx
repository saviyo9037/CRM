import React, { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { updatePayment } from "../../services/paymentstatusRouter";

const EditPaymentModal = ({ editPayment, onClose, onUpdated }) => {
  const [amount, setAmount] = useState(editPayment.paidAmount);
  const [date, setDate] = useState(
    editPayment.transactionDate?.split("T")[0] || ""
  );
  const [paymentMode, setPaymentMode] = useState(editPayment.paymentMode);
  const nextPaymentDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [date]);

  const { mutate: updatePaymentFn, isPending } = useMutation({
    mutationFn: updatePayment,
    onSuccess: () => {
      alert("✅ Payment updated successfully!");
      onUpdated();
      onClose();
    },
    onError: (err) => console.error("❌ Update Error:", err),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      newData: {
        paidAmount: Number(amount),
        transactionDate: new Date(date).toISOString(),
        paymentMode,
        nextPaymentDate: nextPaymentDate?.toISOString(),
      },
    };
    updatePaymentFn({ transactId: editPayment._id, ...payload });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="bg-[#141414] border border-[#262626] text-white rounded-2xl shadow-2xl p-6 w-[400px] relative">
        <h2 className="text-lg font-bold text-[#FF8A00] mb-4">
          ✏️ Edit Transaction
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="p-2.5 bg-[#121212] border border-[#2E2E2E] text-white rounded-lg focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none placeholder-gray-500"
            min="1"
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2.5 bg-[#121212] border border-[#2E2E2E] text-white rounded-lg focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none"
            required
          />

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="p-2.5 bg-[#121212] border border-[#2E2E2E] text-white rounded-lg focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none"
          required
        >
          <option value="">Select Payment Mode</option>
          <option value="upi">UPI</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>

          {nextPaymentDate && (
            <p className="text-sm text-gray-400">
              Next Payment Date:{" "}
              <span className="font-semibold text-[#FF8A00]">
                {nextPaymentDate.toLocaleDateString()}
              </span>
            </p>
          )}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#262626] text-gray-300 hover:text-white rounded-lg hover:bg-[#333333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold rounded-lg transition-colors"
            >
              {isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentModal;
