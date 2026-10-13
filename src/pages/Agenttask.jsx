import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';
import { listtask, updatetaskstatus } from '../services/tasksRouter';
import Icons from './Icons';
import { useSelector } from 'react-redux';
import Spinner from '../components/Spinner';

function Agenttask() {
  const queryclient = useQueryClient();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [statussuccessmodal, setstatussuccessmodal] = useState(false);
  const metadata = useSelector((state) => state.auth.metadataUser);

    const fetchtasks = useQuery({
        queryKey: ['List Tasks'],
        queryFn: listtask
    });

  const edittaskstatus = useMutation({
    mutationKey: ["Editing Tasks status"],
    mutationFn: updatetaskstatus,
    onSuccess: () => {
      queryclient.invalidateQueries(["Editing Tasks status"]);
    },
  });

  const handletaskchange = async (taskId, status) => {
    await edittaskstatus.mutateAsync({ taskId, status });
    setstatussuccessmodal(true);
    setTimeout(() => {
      setstatussuccessmodal(false);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen w-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <div className="fixed inset-y-0 left-0 z-40">
        <motion.div
          animate={{ x: sidebarVisible ? 0 : -260 }}
          transition={{ duration: 0.3 }}
          className="w-64 h-full fixed top-0 left-0 z-50 bg-[#0A0A0A] border-r border-[#262626]"
        >
          <Sidebar />
        </motion.div>
      </div>

      <motion.div
        animate={{ marginLeft: sidebarVisible ? 256 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#0A0A0A]"
      >
        {edittaskstatus.isPending && <Spinner />}
        <div className="flex flex-col sm:flex-row justify-between mb-6 sm:mb-10 border-b border-[#262626] pb-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0 flex items-center">
            <button
              className="mr-4 text-[#FF8A00] hover:text-[#E67A00] transition p-2 rounded-lg hover:bg-[#181818]"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <FaBars className="text-lg sm:text-xl" />
            </button>
            Task
          </h3>
          <div className="flex justify-end">
            <Icons />
          </div>
        </div>

                {fetchtasks.isLoading ? (
                    <Spinner />
                ) : fetchtasks?.data?.task?.length > 0 ? (
                    <div className="overflow-x-auto bg-[#141414] rounded-2xl shadow-xl border border-[#262626]">
                        <table className="min-w-full table-auto text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black">
                                    <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase">#</th>
                                    <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase">Name</th>
                                    <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase">Dead Line</th>
                                    <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase">Task Description</th>
                                    <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchtasks?.data?.task?.map((task, index) => (
                                    <motion.tr
                                        key={task._id}
                                        className="border-t border-[#262626] hover:bg-[#1C1C1C] transition text-white"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-300">{index + 1}</td>
                                        <td className="px-4 sm:px-6 py-4 font-semibold text-white text-xs sm:text-sm">{task.name}</td>
                                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-300">
                                            {task.deadline
                                                ? new Date(task.deadline).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-gray-300 capitalize text-xs sm:text-sm">{task.description}</td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <select
                                                 className="px-3 sm:px-4 py-1.5 border border-[#2A2A2A] rounded-xl text-xs sm:text-sm bg-[#181818] text-white outline-none focus:border-[#FF8A00] transition"
                                                value={task.status}
                                                disabled = {!!metadata}
                                                onChange={(e) => handletaskchange(task._id, e.target.value)}
                                            >
                                                <option value="pending" className="bg-[#181818] text-yellow-400">Pending</option>
                                                <option value="completed" className="bg-[#181818] text-emerald-400">Completed</option>
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-6 text-base sm:text-lg">No tasks assigned to you yet.</p>
                )}
            </motion.div>
            <AnimatePresence>
                {statussuccessmodal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="relative z-10 bg-[#141414] border border-emerald-500/50 text-emerald-400 px-8 py-6 rounded-2xl shadow-2xl text-base font-semibold w-[90%] sm:w-[400px] flex items-center justify-center text-center"
                        >
                            Status updated successfully!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Agenttask;
