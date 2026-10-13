import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { toggleaddcustomermodal } from "../redux/modalSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import { addcustomer } from "../services/customersRouter";
import Spinner from "./Spinner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

function Addcustomermodal() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();
  const [showsuccess, setshowsuccess] = useState(false);

  // Main phone handler
  const handlePhoneChange = (phone) => {
    addcustomerForm.setFieldValue("mobile", `+${phone}`);
  };

  // Alternative phone handler
  const handleAltPhoneChange = (phone) => {
    addcustomerForm.setFieldValue("alternativemobile", `+${phone}`);
  };

  const addingcustomer = useMutation({
    mutationKey: ["Adding customer"],
    mutationFn: addcustomer,
    onSuccess: () => {
      queryclient.invalidateQueries(["customers"]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to add customer. Try again."
      );
    },
  });

  // VALIDATION FIXED
  const customerformvalidation = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),

    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^\+\d{7,14}$/, "Enter a valid international phone number"),

    alternativemobile: Yup.string()
      .nullable()
      .matches(/^\+\d{7,14}$/, "Enter a valid phone number")
      .notRequired(),

    email: Yup.string().email("Invalid email format").nullable(),
  });

  const addcustomerForm = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      alternativemobile: "",
      email: "",
    },
    validationSchema: customerformvalidation,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await addingcustomer.mutateAsync(values);

        setshowsuccess(true);
        setTimeout(() => {
          dispatch(toggleaddcustomermodal());
          setshowsuccess(false);
        }, 1200);
      } catch (err) {
        console.log(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="bg-[#141414] border border-[#282828] text-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* LEFT SIDE */}
        <div className="bg-gradient-to-b from-[#FF8A00] to-[#E67A00] w-full md:w-1/3 flex flex-col items-center justify-center p-6 text-black text-center">
          <FaUserPlus className="text-6xl mb-4 text-black drop-shadow-md" />
          <h2 className="text-2xl font-extrabold">Add Customer</h2>
          <p className="text-sm mt-2 font-medium opacity-90 text-center">
            Register new customers to manage leads and interactions.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative w-full md:w-2/3 p-6 md:p-8">
          <button
            onClick={() => dispatch(toggleaddcustomermodal())}
            className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-[#FF8A00] transition"
          >
            &times;
          </button>

          <h3 className="text-xl font-bold text-white mb-4">
            Enter Customer Details
          </h3>

          {addingcustomer.isPending && (
            <div className="flex justify-center mb-4">
              <Spinner />
            </div>
          )}

          <form onSubmit={addcustomerForm.handleSubmit} className="space-y-4">
            {/* NAME */}
            <div>
              <label className="text-gray-300 font-medium mb-1 block text-sm">
                Customer Name
              </label>

              <input
                type="text"
                {...addcustomerForm.getFieldProps("name")}
                className="border border-[#2E2E2E] bg-[#181818] text-white p-3 w-full rounded-xl focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] placeholder-gray-500 placeholder:text-sm outline-none"
                placeholder="Enter full name"
              />

              {addcustomerForm.touched.name && addcustomerForm.errors.name && (
                <p className="text-red-400 text-sm mt-1">
                  {addcustomerForm.errors.name}
                </p>
              )}
            </div>

            {/* PRIMARY MOBILE */}
            <div>
              <label className="text-gray-300 font-medium mb-1 block text-sm">
                Primary Mobile Number
              </label>

              <PhoneInput
                country={"in"}
                value={addcustomerForm.values.mobile.replace("+", "")}
                onChange={handlePhoneChange}
                enableSearch
                inputClass="!w-full !pl-17 !py-3 !bg-[#181818] !text-white !border !border-[#2E2E2E] !rounded-xl !placeholder-gray-500 !placeholder:text-sm"
                buttonClass="!border-[#2E2E2E] !bg-[#1E1E1E]"
                containerClass="!w-full"
                inputProps={{
                  placeholder: "Enter primary mobile number",
                }}
              />

              {addcustomerForm.touched.mobile &&
                addcustomerForm.errors.mobile && (
                  <p className="text-red-400 text-sm mt-2">
                    {addcustomerForm.errors.mobile}
                  </p>
                )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-gray-300 font-medium mb-1 block text-sm">
                Email Address
              </label>

              <input
                type="email"
                {...addcustomerForm.getFieldProps("email")}
                className="border border-[#2E2E2E] bg-[#181818] text-white p-3 w-full rounded-xl focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] placeholder-gray-500 placeholder:text-sm outline-none"
                placeholder="Enter your email"
              />

              {addcustomerForm.touched.email &&
                addcustomerForm.errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {addcustomerForm.errors.email}
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
                value={addcustomerForm.values.alternativemobile.replace(
                  "+",
                  ""
                )}
                onChange={handleAltPhoneChange}
                enableSearch
                inputClass="!w-full !pl-17 !py-3 !bg-[#181818] !text-white !border !border-[#2E2E2E] !rounded-xl !placeholder-gray-500 !placeholder:text-sm"
                buttonClass="!border-[#2E2E2E] !bg-[#1E1E1E]"
                containerClass="!w-full"
                inputProps={{
                  placeholder: "Enter alternate mobile number",
                }}
              />

              {addcustomerForm.touched.alternativemobile &&
                addcustomerForm.errors.alternativemobile && (
                  <p className="text-red-400 text-sm mt-2">
                    {addcustomerForm.errors.alternativemobile}
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={addingcustomer.isPending}
              className="w-full bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black py-3.5 rounded-xl font-extrabold transition shadow-[0_0_15px_rgba(255,138,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Customer
            </button>
          </form>
        </div>
      </motion.div>

      {/* SUCCESS */}
      <AnimatePresence>
        {showsuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black opacity-30" />

            <motion.div
              className="relative z-10 bg-green-200 text-green-800 px-8 py-6 rounded-xl shadow-xl text-center font-semibold"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              ✅ Customer added successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Addcustomermodal;
