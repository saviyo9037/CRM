import Icons from "./Icons";

import PaymentDetails from "../components/payments/PaymentDetails";

import React, { useState } from "react";

import { motion } from "framer-motion";

import { FaBars } from "react-icons/fa";

import Sidebar from "./Sidebar";

import ProductPaymentDetails from "../components/payments/ProductPaymentDetails";

import PaymentAddModel from "../components/payments/PaymentAddModel";

import AllTransactions from "../components/payments/AllTransactions";

import { Paymentprogresschart } from "../components/Paymentprogresschart";

// import Icons from "./Icons";

function Paymentreports() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [activesettings, setactivesettings] = useState("paymentprogress");

  // toggle active

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A]">
        {/* Sidebar */}
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -256 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-64 z-40 bg-[#121212] shadow-2xl"
        >
          <Sidebar />
        </motion.div>

        {/* Main content */}
        <motion.div
          animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col bg-[#0A0A0A]"
        >
          {/* Header */}
          <div className="relative flex justify-between items-start bg-[#0A0A0A]">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-[#262626] bg-[#0A0A0A] flex-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center">
                <button
                  className="mr-3 text-[#FF8A00] hover:text-[#E67A00] transition"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                >
                  <FaBars className="text-xl" />
                </button>
                Payments
              </h3>
            </div>

            <div className="absolute top-4 right-6 z-30">
              <Icons />
            </div>
          </div>

          {/* Body layout */}
          {/* Tabs menu */}
          <div className="flex flex-wrap justify-start gap-2 p-4 sm:p-6 bg-[#121212] border-b border-[#262626] overflow-x-auto">
            {[
              { key: "paymentprogress", label: "Payment Progress" },
              { key: "paymentdetails", label: "Payment Details" },
              { key: "paymentproductdetails", label: "Product Payment" },
              { key: "alltransactions", label: "All Transactions" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setactivesettings(item.key)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                  activesettings === item.key
                    ? "bg-[#FF8A00] text-black shadow-lg shadow-[#FF8A00]/20"
                    : "bg-[#1A1A1A] text-gray-300 hover:bg-[#222222] hover:text-white border border-[#2A2A2A]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
            {activesettings === "paymentprogress" && (
              <motion.div
                className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paymentprogresschart />
              </motion.div>
            )}

            {activesettings === "paymentdetails" && (
              <motion.div
                className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentDetails />
              </motion.div>
            )}

            {activesettings === "paymentproductdetails" && (
              <motion.div
                className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductPaymentDetails />
              </motion.div>
            )}

            {activesettings === "alltransactions" && (
              <motion.div
                className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AllTransactions />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Paymentreports;
