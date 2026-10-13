import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { listconvertedcustomers } from '../services/customersRouter';
import Spinner from './Spinner';

// Register chart elements
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

function PolarAreaChart() {
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['Getting Customers'],
    queryFn: listconvertedcustomers,
  });

  // Count payment statuses
  const statusCount = {
    pending: 0,
    'partially paid': 0,
    paid: 0,
  };

  // Ensure customers.customers is an array before iterating
  const customerList = Array.isArray(customers?.customers) ? customers.customers : [];

  customerList.forEach((customer) => {
    const payment = typeof customer.payment === 'string' ? customer.payment.toLowerCase() : null;
    if (payment && statusCount.hasOwnProperty(payment)) {
      statusCount[payment]++;
    }
  });

  const data = {
    labels: ['Pending', 'Partially Paid', 'Paid'],
    datasets: [
      {
        label: 'Payment Status',
        data: [statusCount['pending'], statusCount['partially paid'], statusCount['paid']],
        backgroundColor: ['#facc15', '#60a5fa', '#22c55e'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#FFFFFF',
          font: { size: 12, family: "'Inter', sans-serif" },
        },
      },
      tooltip: {
        backgroundColor: '#1E1E1E',
        borderColor: '#FF8A00',
        borderWidth: 1,
        titleColor: '#FF8A00',
        bodyColor: '#FFFFFF',
        titleFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        ticks: {
          stepSize: 1,
          color: '#9CA3AF',
          backdropColor: 'transparent',
          font: { size: 12, family: "'Inter', sans-serif" },
        },
      },
    },
  };

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-400 text-sm">Error loading chart.</p>;
  if (customerList.length === 0) return <p className="text-gray-500 text-sm">No customer data available.</p>;

  return (
    <div className="p-4 bg-[#141414] border border-[#262626] shadow-xl rounded-2xl max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
        Customer Payment Status
      </h2>
      <div className="h-[300px]">
        <PolarArea data={data} options={options} />
      </div>
    </div>
  );
}

export default PolarAreaChart;