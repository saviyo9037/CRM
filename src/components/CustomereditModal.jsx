import React, { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import * as Yup from "yup";
import { updatecustomerdetails } from "../services/leadsRouter";
import {
  toggleCustomerdetailmodal,
  toggleCustomereditmodal,
} from "../redux/modalSlice";
import { listleadsourcesettings } from "../services/settingservices/leadSourceSettingsRouter";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { extractCountryAndNumber } from "../utils/phoneUtils";
import {
  faCheckCircle,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faDollarSign,
  faTimes,
  faIndianRupeeSign,
} from "@fortawesome/free-solid-svg-icons";
import PersonalDetails from "./PersonalDetails";
import { countryCodes } from "../utils/countryCodes";
import { Variable } from "lucide-react";

const InputField = ({
  icon,
  label,
  name,
  type = "text",
  placeholder,
  error,
  value,
  onChange,
  onBlur,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
      <FontAwesomeIcon icon={icon} className="text-[#FF8A00] w-4 h-4" />
      {label}
    </label>
    <div className="relative">
      <FontAwesomeIcon
        icon={icon}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
      />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00]
          ${
            error
              ? "border-red-500/50 bg-red-950/20 text-red-300"
              : "border-[#2E2E2E] hover:border-[#404040] bg-[#121212] text-white placeholder-gray-500"
          }
        `}
      />
    </div>
    {error && (
      <p className="text-red-400 text-xs flex items-center gap-1">
        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({
  icon,
  label,
  name,
  options,
  value,
  onChange,
  onBlur,
  error,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
      <FontAwesomeIcon icon={icon} className="text-[#FF8A00] w-4 h-4" />
      {label}
    </label>
    <div className="relative">
      <FontAwesomeIcon
        icon={icon}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
      />
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00]
          ${
            error
              ? "border-red-500/50 bg-red-950/20 text-red-300"
              : "border-[#2E2E2E] hover:border-[#404040] bg-[#121212] text-white"
          }
          appearance-none
        `}
      >
        <option value="" className="bg-[#181818] text-gray-400">{`Select ${label}`}</option>
        {options?.map((option, idx) => (
          <option key={idx} value={option.code || option.title} className="bg-[#181818] text-white">
            {option.flag && option.name
              ? `${option.flag} ${option.code} - ${option.name}`
              : option.title}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

function CustomereditModal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const selectedLead = useSelector((state) => state.modal.selectedLead);
  const [updatesuccessmodal, setupdatesuccessmodal] = useState(false);

  // Fetch lead sources
  const fetchleadsource = useQuery({
    queryKey: ["List leadsource"],
    queryFn: listleadsourcesettings,
  });

  const updatingcustomers = useMutation({
    mutationKey: ["Update customers"],
    mutationFn: updatecustomerdetails,

    onMutate: async ({ customerId, customerData }) => {
      await queryClient.cancelQueries(["Listleads"]);

      const previousLeads = queryClient.getQueryData(["Listleads"]);

      queryClient.setQueryData(["Listleads"], (old) => {
        if (!old  || !old.data) return old;

        return {
          ...old,
          data: old.data.map((lead) =>
            lead.id === customerId ? { ...lead, ...customerData } : lead
          ),
        };
      });

      return { previousLeads };
    },

    onError: (error, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(["Listleads"], context.previousLeads);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["Listleads"]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["Listleads"]);
      setupdatesuccessmodal(true);
      setTimeout(() => {
        setupdatesuccessmodal(false);
        dispatch(toggleCustomereditmodal());
        dispatch(toggleCustomerdetailmodal());
      }, 1000);
    },
  });

  // Form validation
  const customerEditformvalidation = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
      .min(3, "Name must be at least 3 characters"),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    mobile: Yup.string()
      .required("Mobile is required")
      .matches(
        /^\+?[0-9\s]+$/,
        "Mobile number can contain digits, spaces, and optional '+'"
      )
      .min(7, "Mobile number must be at least 7 digits")
      .max(15, "Mobile number must be at most 15 digits"),
    countrycode: Yup.string().required("Country code is required"),
    source: Yup.string(),
    location: Yup.string(),
    interestedproduct: Yup.string(),
    leadvalue: Yup.number(),
  });

  // Formik form
  const { countrycode, mobile } = extractCountryAndNumber(selectedLead?.mobile);

  const customereditForm = useFormik({
    initialValues: {
      name: selectedLead?.name || "",
      email: selectedLead?.email || "",
      mobile: mobile || "",
      countrycode: countrycode || "+91",
      source: selectedLead?.source?.title || "",
      location: selectedLead?.location || "",
      interestedproduct: selectedLead?.interestedproduct || "",
      leadvalue: selectedLead?.leadvalue || "",
    },
    validationSchema: customerEditformvalidation,
    onSubmit: async (values) => {
      let mobile = values.mobile.replace(/\s+/g, "");

      // Remove existing country code from mobile number if present
      if (mobile.startsWith(values.countrycode)) {
        mobile = mobile.substring(values.countrycode.length);
      }

      // Combine country code and mobile number
      const fullMobile = `${values.countrycode}${mobile}`;

      const payload = { ...values, mobile: fullMobile };

      try {
        await updatingcustomers.mutateAsync({
          customerId: selectedLead._id,
          customerData: payload,
        });
      } catch (error) {
        console.error("Error updating customer:", error);
      }
    },
  });

  const filteredsource = fetchleadsource?.data?.getLeadsource?.filter(
    (source) => source.active
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-[#141414] border border-[#262626] text-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black rounded-xl flex items-center justify-center font-bold">
              <FontAwesomeIcon icon={faUser} className="text-black w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Edit Lead Details
              </h2>
              <p className="text-sm text-gray-400">
                Update customer information
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(toggleCustomereditmodal())}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#262626] rounded-lg transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {updatingcustomers.isError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/40 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              {updatingcustomers.error?.response?.data?.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {updatesuccessmodal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              className="absolute top-4 right-4 bg-[#FF8A00] text-black px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 font-bold"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
              <span>Updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={customereditForm.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <InputField
                icon={faUser}
                label="Full Name"
                name="name"
                placeholder="Enter full name"
                error={
                  customereditForm.touched.name && customereditForm.errors.name
                }
                {...customereditForm.getFieldProps("name")}
              />

              <InputField
                icon={faEnvelope}
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter email address"
                error={
                  customereditForm.touched.email &&
                  customereditForm.errors.email
                }
                {...customereditForm.getFieldProps("email")}
              />

              <InputField
                icon={faPhone}
                label="Mobile Number"
                name="mobile"
                placeholder="Enter your mobile number"
                error={
                  customereditForm.touched.mobile &&
                  customereditForm.errors.mobile
                }
                {...customereditForm.getFieldProps("mobile")}
              />

              <SelectField
                icon={faPhone}
                label="Country Code"
                name="countrycode"
                options={countryCodes}
                error={
                  customereditForm.touched.countrycode &&
                  customereditForm.errors.countrycode
                }
                {...customereditForm.getFieldProps("countrycode")}
              />

              <SelectField
                icon={faMapMarkerAlt}
                label="Lead Source"
                name="source"
                options={filteredsource}
                error={
                  customereditForm.touched.source &&
                  customereditForm.errors.source
                }
                {...customereditForm.getFieldProps("source")}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InputField
                icon={faMapMarkerAlt}
                label="Location"
                name="location"
                placeholder="Enter location"
                error={
                  customereditForm.touched.location &&
                  customereditForm.errors.location
                }
                {...customereditForm.getFieldProps("location")}
              />

              <InputField
                icon={faIndianRupeeSign}
                label="Lead Value"
                name="leadvalue"
                type="number"
                placeholder="Enter lead value"
                error={
                  customereditForm.touched.leadvalue &&
                  customereditForm.errors.leadvalue
                }
                {...customereditForm.getFieldProps("leadvalue")}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updatingcustomers.isPending}
              className="w-full bg-[#FF8A00] hover:bg-[#E67A00] text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
              {updatingcustomers.isPending ? "Updating..." : "Update Lead"}
            </motion.button>
          </motion.div>
        </form>

        {/* Personal Details Component */}
        <div className="mt-8 pt-6 border-t border-[#262626]">
          <PersonalDetails />
        </div>
      </motion.div>
    </div>
  );
}

export default CustomereditModal;
