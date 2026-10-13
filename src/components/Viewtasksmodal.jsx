import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toggleViewtasksmodal } from '../redux/modalSlice'
import { useDispatch, useSelector } from 'react-redux'
import { listtask, deletetask } from '../services/tasksRouter'
import Spinner from './Spinner'
import { FaTrash } from 'react-icons/fa'

function Viewtasksmodal() {
    const dispatch = useDispatch()
    const selectedstaffId = useSelector((state) => state.modal.selectedStaffsId)
    const queryclient = useQueryClient()

    const listtasks = useQuery({
        queryKey: ['List tasks'],
        queryFn: listtask
    })

    const deletetaskmutation = useMutation({
        mutationKey: ['Delete task'],
        mutationFn: deletetask,
        onSuccess: () => {
            queryclient.invalidateQueries(['List tasks'])
        }
    })

    const filteredtasks = listtasks?.data?.task?.filter((task) => task.assignedTo === selectedstaffId)

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-md overflow-y-auto p-4">
            <div className="bg-[#141414] border border-[#262626] p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-4xl md:max-w-6xl text-center relative max-h-[90vh] overflow-hidden my-4 sm:my-8 text-white">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#222222]"
                    onClick={() => dispatch(toggleViewtasksmodal(null))}
                >
                    &times;
                </button>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 tracking-tight flex justify-center items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
                    Assigned Tasks
                </h3>

                <div className="overflow-x-auto max-h-[65vh] rounded-xl border border-[#262626] bg-[#121212] custom-scrollbar">
                    {listtasks.isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Spinner />
                        </div>
                    ) : filteredtasks?.length > 0 ? (
                        <table className="w-full text-xs sm:text-sm text-left text-gray-300 min-w-[600px]">
                            <thead className="text-xs text-black font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF8A00] to-[#E67A00] sticky top-0 z-10 shadow">
                                <tr>
                                    <th className="px-4 py-3.5">#</th>
                                    <th className="px-4 py-3.5">Name</th>
                                    <th className="px-4 py-3.5">Deadline</th>
                                    <th className="px-4 py-3.5">Task Description</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#262626]">
                                {filteredtasks?.map((task, index) => (
                                    <tr key={task._id} className="bg-[#181818] hover:bg-[#202020] transition">
                                        <td className="px-4 py-3.5 font-bold text-white">{index + 1}</td>
                                        <td className="px-4 py-3.5 font-medium text-white">{task.name}</td>
                                        <td className="px-4 py-3.5 text-gray-400">
                                            {task.deadline
                                                ? new Date(task.deadline).toLocaleDateString('en-US', {
                                                      year: 'numeric',
                                                      month: 'short',
                                                      day: 'numeric',
                                                  })
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300">{task.description || "N/A"}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize inline-block ${
                                                task.status === "completed"
                                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                    : "bg-[#FF8A00]/15 border border-[#FF8A00]/30 text-[#FF8A00]"
                                            }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                onClick={() => deletetaskmutation.mutate(task._id)}
                                                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
                                                title="Delete Task"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-400 text-sm sm:text-base py-12">No tasks assigned to this staff</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Viewtasksmodal