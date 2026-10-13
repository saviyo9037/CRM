import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import {
  toggleconvertedleadeditModal,
  setSelectedCustomer,
  toggleConvertedcustomerdetailmodal,
} from "../redux/modalSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editcustomerdetails } from "../services/customersRouter";
import { getProducts } from "../services/paymentstatusRouter";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

function Convertedleadeditmodal() {
  const selectedlead = useSelector((state) => state.modal.selectedLead);
  const dispatch = useDispatch();
  const queryclient = useQueryClient();

  // --------------------- PHONE HANDLERS ---------------------
  const handlePhoneChange = (phone) => {
    convertedleadeditForm.setFieldValue("mobile", `+${phone}`);
  };

  const handleAltPhoneChange = (phone) => {
    convertedleadeditForm.setFieldValue("alternativemobile", `+${phone}`);
  };

  // --------------------- GET PRODUCT LIST ---------------------
  const getProduct = useQuery({
    queryKey: ["get products"],
    queryFn: getProducts,
  });

  const getSelectedProduct = getProduct?.data?.getProduct || [];

  // --------------------- MUTATION ---------------------
  const updatingcustomerdetails = useMutation({
    mutationFn: editcustomerdetails,

    onMutate: async (updatedCustomer) => {
      await queryclient.cancelQueries(["List converted customers"]);

      const previousData = queryclient.getQueryData([
        "List converted customers",
      ]);

      // Optimistic update
      queryclient.setQueryData(["List converted customers"], (old) =>
        old?.map((customer) =>
          customer._id === updatedCustomer.customerId
            ? { ...customer, ...updatedCustomer.customerData }
            : customer
        )
      );

      toast.loading("Updating customer details...", { id: "updateCustomer" });

      return { previousData };
    },

    onError: (error, _, context) => {
      toast.error("Failed to update customer. Please try again.", {
        id: "updateCustomer",
      });

      if (context?.previousData) {
        queryclient.setQueryData(
          ["List converted customers"],
          context.previousData
        );
      }
    },

    onSuccess: (data) => {
      toast.success("Customer updated successfully!", {
        id: "updateCustomer",
        duration: 2000,
      });

      // Update Redux modal live
      dispatch(setSelectedCustomer(data.updatedCustomer));

      // Update cache
      queryclient.setQueryData(["List converted customers"], (old) =>
        old?.map((customer) =>
          customer._id === data.updatedCustomer._id
            ? data.updatedCustomer
            : customer
        )
      );

      // Close modal
      dispatch(toggleconvertedleadeditModal(null));
      dispatch(toggleConvertedcustomerdetailmodal(null));
    },

    onSettled: () => {
      queryclient.invalidateQueries(["List converted customers"]);
    },
  });

  // --------------------- VALIDATION ---------------------
  const editcustomervalidation = Yup.object({
    name: Yup.string(),
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^\+\d{7,14}$/, "Enter a valid international phone number"),

    alternativemobile: Yup.string()
      .nullable()
      .matches(/^\+\d{7,14}$/, "Enter a valid phone number")
      .notRequired(),

    email: Yup.string()
      .matches(/.+@.+\..+/, "Invalid email format")
      .required("email is required"),

    product: Yup.string(),
  });

  // --------------------- FORMIK ---------------------
  const convertedleadeditForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedlead?.name || "",
      mobile: selectedlead?.mobile || "",
      alternativemobile: selectedlead?.alternativemobile || "+91",
      email: selectedlead?.email || "",
      product: selectedlead?.product || "",
    },
    validationSchema: editcustomervalidation,

    onSubmit: async (values) => {
      if (!selectedlead?._id) return;

      await updatingcustomerdetails.mutateAsync({
        customerId: selectedlead._id,
        customerData: values,
      });
    },
  });

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="bg-[#141414] border border-[#262626] text-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* LEFT SECTION */}
          <div className="bg-gradient-to-b from-[#FF8A00] to-[#E67A00] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-black">
            <FaUserPlus className="text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4 text-black" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black">
              Edit Customer
            </h2>
            <p className="text-xs sm:text-sm mt-2 text-center text-black/80 font-medium">
              Update details of Sub-admins or Agents as needed.
            </p>
          </div>

          {/* RIGHT SECTION */}
          <div className="relative w-full md:w-2/3 p-4 sm:p-6 md:p-8 bg-[#141414]">
            <button
              onClick={() => dispatch(toggleconvertedleadeditModal(null))}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-white transition"
            >
              &times;
            </button>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">
              Edit Customer Details
            </h3>

            {updatingcustomerdetails.isError && (
              <p className="text-red-400 bg-red-950/40 border border-red-500/40 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
                {updatingcustomerdetails.error?.response?.data?.message}
              </p>
            )}

            {/* ---------------- FORM ---------------- */}
            <form
              onSubmit={convertedleadeditForm.handleSubmit}
              className="space-y-3 sm:space-y-4"
            >
              {/* NAME */}
              <input
                type="text"
                name="name"
                {...convertedleadeditForm.getFieldProps("name")}
                className="bg-[#121212] border border-[#2E2E2E] p-2 sm:p-3 w-full rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00]"
                placeholder="Enter the name"
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                {...convertedleadeditForm.getFieldProps("email")}
                className="bg-[#121212] border border-[#2E2E2E] p-2 sm:p-3 w-full rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00]"
                placeholder="Enter the email"
              />

              {/* PRIMARY MOBILE */}
              <div>
                <label className="text-gray-300 font-medium mb-1 block text-sm">
                  Primary Mobile Number
                </label>

                <PhoneInput
                  country={"in"}
                  value={convertedleadeditForm.values.mobile.replace("+", "")}
                  onChange={handlePhoneChange}
                  enableSearch
                  inputClass="!w-full !pl-17 !py-3 !text-white !bg-[#121212] !border !border-[#2E2E2E] !rounded-lg focus:!ring-2 focus:!ring-[#FF8A00]"
                  buttonClass="!border-[#2E2E2E] !bg-[#181818]"
                  containerClass="!w-full"
                  dropdownClass="!text-white !bg-[#181818] !border-[#2E2E2E]"
                  inputProps={{
                    placeholder: "Enter primary mobile number",
                  }}
                />

                {convertedleadeditForm.touched.mobile &&
                  convertedleadeditForm.errors.mobile && (
                    <p className="text-red-400 text-sm mt-2">
                      {convertedleadeditForm.errors.mobile}
                    </p>
                  )}
              </div>

              {/* ALT MOBILE */}
              <div>
                <label className="text-gray-300 font-medium mb-1 block text-sm">
                  Alternate Mobile Number
                </label>

                <PhoneInput
                  country={"in"}
                  value={convertedleadeditForm.values.alternativemobile.replace(
                    "+",
                    ""
                  )}
                  onChange={handleAltPhoneChange}
                  enableSearch
                  inputClass="!w-full !pl-17 !py-3 !text-white !bg-[#121212] !border !border-[#2E2E2E] !rounded-lg focus:!ring-2 focus:!ring-[#FF8A00]"
                  buttonClass="!border-[#2E2E2E] !bg-[#181818]"
                  containerClass="!w-full"
                  dropdownClass="!text-white !bg-[#181818] !border-[#2E2E2E]"
                  inputProps={{
                    placeholder: "Enter alternate mobile number",
                  }}
                />

                {convertedleadeditForm.touched.alternativemobile &&
                  convertedleadeditForm.errors.alternativemobile && (
                    <p className="text-red-400 text-sm mt-2">
                      {convertedleadeditForm.errors.alternativemobile}
                    </p>
                  )}
              </div>

              {/* PRODUCT */}
              <select
                name="product"
                onChange={convertedleadeditForm.handleChange}
                value={convertedleadeditForm.values.product}
                className="bg-[#121212] border border-[#2E2E2E] p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] text-white"
              >
                {getProduct.isLoading ? (
                  <option disabled className="bg-[#181818] text-gray-400">Loading products...</option>
                ) : (
                  <>
                    <option value="" className="bg-[#181818] text-gray-400">-- Select Product --</option>
                    {getSelectedProduct.map((product) => (
                      <option key={product._id} value={product._id} className="bg-[#181818] text-white">
                        {product.title}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={updatingcustomerdetails.isPending}
                className={`w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base shadow-lg ${
                  updatingcustomerdetails.isPending
                    ? "bg-[#FF8A00]/50 text-black cursor-not-allowed"
                    : "bg-[#FF8A00] hover:bg-[#E67A00] text-black"
                }`}
              >
                {updatingcustomerdetails.isPending ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Convertedleadeditmodal;
