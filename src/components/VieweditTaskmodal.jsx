import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { toggleedittaskmodal, toggleViewedittaskmodal } from '../redux/modalSlice'
import { useDispatch, useSelector } from 'react-redux'
import { FaChartBar } from 'react-icons/fa'
import Edittaskmodal from './Edittaskmodal'
import { AnimatePresence, motion } from 'framer-motion'
import { listtask } from '../services/tasksRouter'
import Spinner from './Spinner'

function VieweditTaskmodal() {
    const dispatch = useDispatch()
    const selectedstaff = useSelector((state) => state.modal.selectedStaffsId)
    const isEdittaskmodal = useSelector((state) => state.modal.edittaskmodal)

    const listtasks = useQuery({
        queryKey: ['List tasks'],
        queryFn: listtask
    })

    const filteredtasks = listtasks?.data?.task?.filter((task) => task.assignedTo === selectedstaff?._id)

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-md overflow-y-auto p-4">
            <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-4xl md:max-w-6xl text-center relative max-h-[90vh] overflow-hidden my-4 sm:my-8 text-white">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#222222]"
                    onClick={() => dispatch(toggleViewedittaskmodal(null))}
                >
                    ×
                </button>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 tracking-tight flex justify-center items-center gap-2.5">
                    <FaChartBar className="text-[#FF8A00] text-xl sm:text-2xl" />
                    Assigned Tasks
                </h3>

                <div className="overflow-x-auto max-h-[65vh] rounded-xl border border-[#262626] shadow-inner custom-scrollbar bg-[#121212]">
                    {listtasks.isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Spinner />
                        </div>
                    ) : filteredtasks?.length > 0 ? (
                        <table className="w-full text-xs sm:text-sm text-left text-gray-200 border-separate border-spacing-y-2 px-3 min-w-[600px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold uppercase tracking-wider text-xs shadow-md">
                                    <th className="px-4 py-3 text-center w-12 sm:w-16 rounded-l-lg">#</th>
                                    <th className="px-4 py-3 text-left w-1/4 sm:w-1/5">Name</th>
                                    <th className="px-4 py-3 text-left w-1/4 sm:w-1/5">Deadline</th>
                                    <th className="px-4 py-3 text-left">Task Description</th>
                                    <th className="px-4 py-3 text-center w-20 sm:w-24 rounded-r-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredtasks?.map((task, index) => (
                                    <tr
                                        key={task._id}
                                        className="bg-[#181818] hover:bg-[#202020] transition border border-[#262626] shadow-sm rounded-lg"
                                    >
                                        <td className="px-4 py-3.5 font-bold text-white text-center rounded-l-lg">{index + 1}</td>
                                        <td className="px-4 py-3.5 font-medium text-white">{task.name}</td>
                                        <td className="px-4 py-3.5 text-gray-300">
                                            {task.deadline
                                                ? new Date(task.deadline).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                                : "N/A"}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300">{task.description || "N/A"}</td>
                                        <td className="px-4 py-3.5 text-center rounded-r-lg">
                                            <button
                                                className="bg-[#FF8A00]/15 text-[#FF8A00] hover:bg-[#FF8A00] hover:text-black border border-[#FF8A00]/30 font-semibold px-3 py-1 rounded-lg transition text-xs"
                                                onClick={() => dispatch(toggleedittaskmodal(task))}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-400 text-sm sm:text-base py-12">No tasks to edit for this staff</p>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {isEdittaskmodal && (
                    <motion.div
                        key="tasks"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-black backdrop-blur-sm"
                        />
                        <div className="relative z-10 w-full max-w-[95%] sm:max-w-4xl">
                            <Edittaskmodal />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default VieweditTaskmodal