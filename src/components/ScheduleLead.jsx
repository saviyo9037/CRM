import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRemainder } from "../services/remainderRouter";


const ScheduleLead = ({ leadId, onClose }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    date: "",
    notes: "",
  });

  // --- useMutation for creating a remainder ---
  const addRemainderMutation = useMutation({
    mutationFn: (remainderData) => addRemainder(remainderData),
    onSuccess: (data) => {
      alert("Remainder scheduled successfully!");
      

      // Invalidate reminder list queries so UI updates automatically
      queryClient.invalidateQueries(["remainders"]);

      setFormData({ date: "", notes: "" });
      onClose();
    },
    onError: (error) => {
      console.error("Error adding remainder:", error);
      alert("Failed to schedule remainder. Try again.");
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date || !formData.notes) {
      alert("Please fill all fields");
      return;
    }

    // Validate year range (4 digits max, reasonable range)
    const selectedDate = new Date(formData.date);
    const year = selectedDate.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear + 10) {
      alert("Year must be between 1900 and " + (currentYear + 10));
      return;
    }

    // Validate date is not in the past
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Reminder date cannot be in the past");
      return;
    }

    const remainderData = {
      date: formData.date,
      description: formData.notes,
      leadId: leadId, // optional, if backend supports it
    };

    addRemainderMutation.mutate(remainderData);
  };

  return (
    <div className="text-white">
      <h1 className="text-xl font-bold text-white mb-4">
        Schedule Reminder
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-300 font-medium text-sm">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-[#121212] border border-[#2E2E2E] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-gray-300 font-medium text-sm">Notes</label>
          <input
            type="text"
            name="notes"
            placeholder="Enter reminder text"
            value={formData.notes}
            onChange={handleChange}
            className="bg-[#121212] border border-[#2E2E2E] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none placeholder-gray-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={addRemainderMutation.isPending}
            className="px-4 py-2 border border-[#333333] rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addRemainderMutation.isPending}
            className={`px-4 py-2 text-black font-bold rounded-lg transition-colors ${
              addRemainderMutation.isPending
                ? "bg-[#FF8A00]/50 cursor-not-allowed"
                : "bg-[#FF8A00] hover:bg-[#E67A00]"
            }`}
          >
            {addRemainderMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleLead;
