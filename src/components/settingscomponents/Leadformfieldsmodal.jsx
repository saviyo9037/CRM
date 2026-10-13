import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { addleadsettingsformfields } from "../../services/settingservices/leadFormFieldsSettingsRouter";
import { toggleleadformModal } from "../../redux/settingsmodalSlice";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "../Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function Leadformfieldsmodal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionInput, setOptionInput] = useState("");

  const addingLeadFormField = useMutation({
    mutationKey: ["Adding Lead Form"],
    mutationFn: addleadsettingsformfields,
    onSuccess: () => {
      queryClient.invalidateQueries(["List Form Fields"]);
      setOptions([]); // Clear options only on successful submission
      setOptionInput("");
    },
  });

  const leadFormFieldValidation = Yup.object({
    name: Yup.string().required("Field name is required"),
    type: Yup.string().required("Field type is required"),
    options: Yup.array().when("type", {
      is: (val) => val === "choice" || val === "checkbox",
      then: (schema) =>
        schema
          .of(Yup.string())
          .min(1, "At least one option is required for dropdown")
          .required("Options are required for dropdown"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const addLeadFormField = useFormik({
    initialValues: {
      name: "",
      type: "",
      options: [],
      requiredProductType: false,
    },
    validationSchema: leadFormFieldValidation,
    onSubmit: async (values) => {
      try {
        await addingLeadFormField.mutateAsync(values);
        setShowSuccess(true);
        setTimeout(() => {
          dispatch(toggleleadformModal());
          setShowSuccess(false);
          addLeadFormField.resetForm(); // Reset form after submission
        }, 1000);
      } catch (error) {
        console.error("Submission error:", error);
      }
    },
  });

  const handleAddOption = () => {
    if (optionInput.trim()) {
      const newOptions = [...options, optionInput.trim()];
      setOptions(newOptions);
      addLeadFormField.setFieldValue("options", newOptions);
      setOptionInput("");
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    addLeadFormField.setFieldValue("options", newOptions);
  };

  const handleTypeChange = (e) => {
    addLeadFormField.handleChange(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-[#141414] border border-[#262626] w-full max-w-lg sm:max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 relative text-white"
      >
        <button
          onClick={() => dispatch(toggleleadformModal())}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#222222]"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
          Create Field Type
        </h2>

        {addingLeadFormField.isPending && (
          <div className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
            <Spinner />
          </div>
        )}
        {addingLeadFormField.isError && (
          <div className="mb-4 sm:mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {addingLeadFormField.error?.response?.data?.message}
          </div>
        )}

        <form
          onSubmit={addLeadFormField.handleSubmit}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5"
              >
                Field Name
              </label>
              <input
                type="text"
                name="name"
                {...addLeadFormField.getFieldProps("name")}
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl focus:ring-2 focus:ring-[#FF8A00] outline-none text-white text-sm placeholder-gray-500"
                placeholder="Enter field name"
              />
              {addLeadFormField.touched.name &&
                addLeadFormField.errors.name && (
                  <p className="text-red-400 text-xs mt-1">
                    {addLeadFormField.errors.name}
                  </p>
                )}
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5"
              >
                Field Type
              </label>
              <select
                name="type"
                {...addLeadFormField.getFieldProps("type")}
                onChange={handleTypeChange}
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl focus:ring-2 focus:ring-[#FF8A00] outline-none text-white text-sm"
              >
                <option value="" disabled className="bg-[#181818] text-gray-400">
                  Select field type
                </option>
                <option value="text" className="bg-[#181818] text-white">Character</option>
                <option value="number" className="bg-[#181818] text-white">Number</option>
                <option value="email" className="bg-[#181818] text-white">Email</option>
                <option value="textarea" className="bg-[#181818] text-white">Textarea</option>
                <option value="file" className="bg-[#181818] text-white">File</option>
                <option value="image" className="bg-[#181818] text-white">Image</option>
                <option value="date" className="bg-[#181818] text-white">Date</option>
                <option value="choice" className="bg-[#181818] text-white">Dropdown</option>
                <option value="checkbox" className="bg-[#181818] text-white">Checkbox</option>
              </select>
              {addLeadFormField.touched.type &&
                addLeadFormField.errors.type && (
                  <p className="text-red-400 text-xs mt-1">
                    {addLeadFormField.errors.type}
                  </p>
                )}
            </div>
          </div>

          {(addLeadFormField.values.type === "choice" ||
            addLeadFormField.values.type === "checkbox") && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                {addLeadFormField.values.type === "choice" 
                  ? "Dropdown Options"
                  : "Checkbox Options"}
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddOption())
                  }
                  className="w-full px-3.5 py-2 bg-[#121212] border border-[#2E2E2E] rounded-xl focus:ring-2 focus:ring-[#FF8A00] outline-none text-white text-sm placeholder-gray-500"
                  placeholder="Enter option"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold px-4 py-2 rounded-xl text-sm transition"
                  disabled={!optionInput.trim()}
                >
                  Add
                </button>
              </div>

              {options.length > 0 && (
                <ul className="mt-2 max-h-[110px] overflow-y-auto rounded-xl border border-[#262626] bg-[#121212] custom-scrollbar">
                  {options.map((option, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm px-3.5 py-2 bg-[#181818] border-b border-[#262626] last:border-b-0 text-white"
                    >
                      <span>{option}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Remove option"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {addLeadFormField.touched.options &&
                addLeadFormField.errors.options && (
                  <p className="text-red-400 text-xs mt-1">
                    {addLeadFormField.errors.options}
                  </p>
                )}
            </div>
          )}

          <div className="text-xs text-gray-400 bg-[#181818] border border-[#262626] p-3 rounded-xl">
            <span className="font-semibold text-[#FF8A00]">Note:</span> For phone numbers, please
            select the "Character" type.
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF8A00] hover:bg-[#E67A00] text-black py-2.5 rounded-xl font-bold transition shadow-lg shadow-[#FF8A00]/20 disabled:opacity-50 text-sm"
          >
            Create Field
          </button>
        </form>
      </motion.div>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 bg-[#141414] border border-[#FF8A00]/50 text-white px-8 py-6 rounded-2xl shadow-2xl text-sm font-bold flex items-center justify-center text-center gap-3"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-base">✓</span>
              Lead form field added successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Leadformfieldsmodal;
