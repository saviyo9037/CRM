// import React from "react";
// import { Chart as ChartJS, defaults } from "chart.js/auto";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { Line } from "react-chartjs-2";
// import { useQuery } from "@tanstack/react-query";
// import { getpaymentDetailsed } from "../../services/paymentstatusRouter";

// ChartJS.register(ChartDataLabels);
// defaults.responsive = true;
// defaults.maintainAspectRatio = false;

// // ✅ Format currency into K, L, Cr
// const formatCurrency = (value) => {
//   if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
//   if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
//   if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
//   return value.toFixed(0);
// };

// export default function MonthlyPaymentChart({ startDate, endDate }) {
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["paymentDetails", startDate, endDate],
//     queryFn: () => getpaymentDetailsed({ startDate, endDate }),
//   });

//   if (isLoading)
//     return (
//       <div className="flex justify-center items-center h-full text-gray-500">
//         Loading chart...
//       </div>
//     );
//   if (isError)
//     return (
//       <div className="flex justify-center items-center h-full text-red-500">
//         Error loading chart data
//       </div>
//     );

//   const payments = data?.allPayment || [];

//   // ✅ Filter payments by date range
//   const filteredPayments = payments.filter((item) => {
//     if (!item.createdAt) return false;
//     const paymentDate = new Date(item.createdAt);
//     if (startDate && endDate) {
//       return paymentDate >= startDate && paymentDate <= endDate;
//     }
//     return true;
//   });

//   // ✅ Months (Jan–Dec)
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//   ];

//   // ✅ Monthly totals
//   const monthlyPaidTotals = Array(12).fill(0);
//   const monthlyTotalAmounts = Array(12).fill(0);

//   filteredPayments.forEach((item) => {
//     const monthIndex = new Date(item.createdAt).getMonth();
//     monthlyPaidTotals[monthIndex] += item.totalPaid || 0;
//     monthlyTotalAmounts[monthIndex] += item.totalAmount || 0;
//   });

//   // ✅ Chart Data (Dual Axis)
//   const chartData = {
//     labels: months,
//     datasets: [
//       {
//         label: "Total Paid (₹)",
//         data: monthlyPaidTotals,
//         borderColor: "#2563eb",
//         backgroundColor: "rgba(37, 99, 235, 0.15)",
//         tension: 0.4,
//         borderWidth: 3,
//         yAxisID: "y1",
//         pointBackgroundColor: "#2563eb",
//         pointRadius: 5,
//         pointHoverRadius: 7,
//       },
//       {
//         label: "Total Amount (₹)",
//         data: monthlyTotalAmounts,
//         borderColor: "#f59e0b",
//         backgroundColor: "rgba(245, 158, 11, 0.15)",
//         tension: 0.4,
//         borderWidth: 3,
//         yAxisID: "y2",
//         pointBackgroundColor: "#f59e0b",
//         pointRadius: 5,
//         pointHoverRadius: 7,
//       },
//     ],
//   };

//   // ✅ Chart Options
//   const chartOptions = {
//     layout: {
//       padding: { top: 20, right: 20, bottom: 20, left: 10 },
//     },
//     plugins: {
//       title: {
//         display: true,
//         text: "Monthly Payment Overview (₹ in Lakhs)",
//         font: { size: 20, weight: "bold" },
//         color: "#1e293b",
//         padding: { top: 10, bottom: 25 },
//       },
//       legend: {
//         position: "bottom",
//         labels: {
//           color: "#374151",
//           boxWidth: 20,
//           font: { size: 13, family: "'Inter', sans-serif" },
//           padding: 15,
//         },
//       },
//       datalabels: {
//         color: "#111",
//         anchor: "end",
//         align: "top",
//         font: { size: 11, weight: "bold" },
//         formatter: (value) => (value ? `₹${formatCurrency(value)}` : ""),
//       },
//       tooltip: {
//         mode: "index",
//         intersect: false,
//         callbacks: {
//           label: (context) => {
//             const datasetLabel = context.dataset.label || "";
//             const value = context.raw;
//             return `${datasetLabel}: ₹${formatCurrency(value)}`;
//           },
//         },
//       },
//     },
//     interaction: { mode: "index", intersect: false },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: "Month",
//           color: "#374151",
//           font: { size: 14, weight: "bold" },
//         },
//         ticks: {
//           color: "#4b5563",
//           font: { size: 12 },
//         },
//         grid: { display: false },
//       },
//       y1: {
//         position: "left",
//         title: {
//           display: true,
//           text: "Total Paid (₹ in L)",
//           color: "#2563eb",
//           font: { size: 14, weight: "bold" },
//         },
//         ticks: {
//           color: "#2563eb",
//           callback: (value) => `₹${formatCurrency(value)}`,
//         },
//         grid: { color: "#e2e8f0" },
//         beginAtZero: true,
//       },
//       y2: {
//         position: "right",
//         title: {
//           display: true,
//           text: "Total Amount (₹ in L)",
//           color: "#f59e0b",
//           font: { size: 14, weight: "bold" },
//         },
//         ticks: {
//           color: "#f59e0b",
//           callback: (value) => `₹${formatCurrency(value)}`,
//         },
//         grid: { drawOnChartArea: false },
//         beginAtZero: true,
//       },
//     },
//   };

//   // ✅ Full-View Model Layout
//   return (
//     <div className="w-full h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
//       <div className="flex-1 p-3 sm:p-4 lg:p-5 h-full">
//         <Line data={chartData} options={chartOptions} />
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { getpaymentDetailsed } from "../../services/paymentstatusRouter";

ChartJS.register(ChartDataLabels);
defaults.responsive = true;
defaults.maintainAspectRatio = false;

// ✅ Format currency into K, L, Cr
const formatCurrency = (value) => {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
  return value.toFixed(0);
};

export default function MonthlyPaymentChart({ startDate, endDate }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["paymentDetails", startDate, endDate],
    queryFn: () => getpaymentDetailsed({ startDate, endDate }),
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[300px] text-gray-500 font-medium">
        Loading chart...
      </div>
    );
  if (isError)
    return (
      <div className="flex justify-center items-center h-[300px] text-red-500 font-medium">
        Error loading chart data
      </div>
    );

  const payments = data?.allPayment || [];

  const filteredPayments = payments.filter((item) => {
    if (!item.createdAt) return false;
    const paymentDate = new Date(item.createdAt);
    if (startDate && endDate) {
      return paymentDate >= startDate && paymentDate <= endDate;
    }
    return true;
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyPaidTotals = Array(12).fill(0);
  const monthlyTotalAmounts = Array(12).fill(0);

  filteredPayments.forEach((item) => {
    const monthIndex = new Date(item.createdAt).getMonth();
    monthlyPaidTotals[monthIndex] += item.totalPaid || 0;
    monthlyTotalAmounts[monthIndex] += item.totalAmount || 0;
  });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Total Paid (₹)",
        data: monthlyPaidTotals,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        yAxisID: "y1",
        pointBackgroundColor: "#2563eb",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "Total Amount (₹)",
        data: monthlyTotalAmounts,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        tension: 0.4,
        borderWidth: 3,
        yAxisID: "y2",
        pointBackgroundColor: "#f59e0b",
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    layout: { padding: { top: 20, right: 20, bottom: 20, left: 10 } },
    plugins: {
      title: {
        display: true,
        text: "Monthly Payment Overview",
        font: { size: 18, weight: "bold", family: "'Inter', sans-serif" },
        color: "#1e293b",
        padding: { top: 10, bottom: 20 },
      },
      legend: {
        position: "bottom",
        labels: {
          color: "#334155",
          boxWidth: 20,
          font: { size: 13, family: "'Inter', sans-serif" },
          padding: 15,
        },
      },
      datalabels: {
        color: "#FFFFFF",
        anchor: "end",
        align: "top",
        font: { size: 10, weight: "bold" },
        formatter: (value) => (value ? `₹${formatCurrency(value)}` : ""),
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#1E1E1E",
        borderColor: "#FF8A00",
        borderWidth: 1,
        titleColor: "#FF8A00",
        bodyColor: "#FFFFFF",
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || "";
            const value = context.raw;
            return `${datasetLabel}: ₹${formatCurrency(value)}`;
          },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "#9CA3AF",
          font: { size: 14, weight: "bold" },
        },
        ticks: { color: "#9CA3AF", font: { size: 12 } },
        grid: { display: false },
      },
      y1: {
        position: "left",
        title: {
          display: true,
          text: "Total Paid (₹)",
          color: "#FF8A00",
          font: { size: 13, weight: "bold" },
        },
        ticks: {
          color: "#FF8A00",
          callback: (value) => `₹${formatCurrency(value)}`,
        },
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        beginAtZero: true,
      },
      y2: {
        position: "right",
        title: {
          display: true,
          text: "Total Amount (₹)",
          color: "#f59e0b",
          font: { size: 13, weight: "bold" },
        },
        ticks: {
          color: "#f59e0b",
          callback: (value) => `₹${formatCurrency(value)}`,
        },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-[#141414] rounded-3xl border border-[#262626] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#262626] flex justify-between items-center bg-[#181818]">
        <h4 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
          Monthly Payment Insights
        </h4>
        <span className="text-xs sm:text-sm text-gray-400">
          {startDate && endDate
            ? `${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}`
            : "All Time"}
        </span>
      </div>

      {/* Chart Section (height fixed and adaptive) */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
        <div className="relative w-full h-[300px] sm:h-[350px] md:h-[380px] lg:h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#181818] text-gray-400 text-xs sm:text-sm py-2 text-center border-t border-[#262626]">
        Updated in real-time from payment records
      </div>
    </div>
  );
}
