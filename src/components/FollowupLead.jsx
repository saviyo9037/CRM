import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFollowup } from "../services/followupRouter";
import ScheduleLead from "./ScheduleLead";

const FollowupLead = ({ leadId, onClose }) => {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState(false);

  // ✅ React Query mutation
  const addDescription = useMutation({
    mutationFn: addFollowup,
    mutationKey: ["addFollowup"],
    onSuccess: () => {
      queryClient.invalidateQueries(["List description"]);
      if (onClose) onClose();
    },
    onError: (err) => {
      console.error("Failed to add follow-up:", err);
    },
  });

  // ✅ Validation schema
  const followupValidation = Yup.object({
    description: Yup.string().required("Description is required"),
  });

  // ✅ Formik setup
  const followupForm = useFormik({
    initialValues: {
      description: "",
    },
    validationSchema: followupValidation,
    onSubmit: async (values, { resetForm }) => {
      await addDescription.mutateAsync({
        followupdata: { leadId, description: values.description },
      });
      resetForm();
    },
  });

  return (
    <div className="p-6 bg-[#141414] text-white rounded-xl shadow-2xl border border-[#262626] max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Add Follow-up</h2>
        <button
          className="px-3 py-2 text-black font-semibold rounded-lg bg-[#FF8A00] hover:bg-[#E67A00] transition-colors"
          onClick={() => setSchedule(true)}
        >
          Schedule
        </button>
      </div>

      <form onSubmit={followupForm.handleSubmit} className="space-y-4">
        <div>
          <textarea
            name="description"
            placeholder="Enter follow-up description"
            value={followupForm.values.description}
            onChange={followupForm.handleChange}
            onBlur={followupForm.handleBlur}
            className="w-full bg-[#121212] border border-[#2E2E2E] text-white rounded-lg p-3 resize-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none placeholder-gray-500"
            rows={4}
          ></textarea>
          {followupForm.touched.description &&
            followupForm.errors.description && (
              <p className="text-red-400 text-sm mt-1">
                {followupForm.errors.description}
              </p>
            )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#262626] border border-[#333333] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addDescription.isPending}
            className={`px-4 py-2 text-black font-bold rounded-lg transition-colors ${
              addDescription.isPending
                ? "bg-[#FF8A00]/50 cursor-not-allowed"
                : "bg-[#FF8A00] hover:bg-[#E67A00]"
            }`}
          >
            {addDescription.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* ✅ Schedule Modal */}
      {schedule && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[9999]">
          <div className="bg-[#141414] border border-[#262626] text-white p-6 rounded-xl shadow-2xl relative max-w-lg w-full">
            <button
              onClick={() => setSchedule(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>

            <ScheduleLead
              leadId={leadId}
              onClose={() => setSchedule(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowupLead;
