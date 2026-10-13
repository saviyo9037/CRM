import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Assignleadsmodal from '../components/Assignleadsmodal'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { FaBars, FaUserCircle } from 'react-icons/fa'
import { toggleAssignleadsmodal } from '../redux/modalSlice'
import { listagents } from '../services/staffRouter'
import Icons from './Icons'
import Spinner from '../components/Spinner'

function Subadminstafflist() {
    const dispatch = useDispatch()
    const isAssignleadsmodal = useSelector((state) => state.modal.assignleadsModal)
    const userlogged = useSelector((state) => state.auth.user)
    const [sidebarVisible, setsidebarVisible] = useState(true)
    const metadata = useSelector((state) => state.auth.metadataUser)

    const fetchstaffs = useQuery({
        queryKey: ["listagents"],
        queryFn: listagents
    })

    const userId = metadata ? metadata._id : userlogged.id

    const filteredStaffs = fetchstaffs?.data?.filter((staff) => staff.assignedTo === userId)

    return (
        <div className="flex h-screen w-screen bg-[#0A0A0A] text-white overflow-x-hidden">
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
                className="flex-1 h-screen overflow-hidden bg-[#0A0A0A]"
            >
                {fetchstaffs.isLoading &&
                    <Spinner />
                }
                <div className="flex flex-col h-full">
                    <div className="p-4 sm:p-8 pb-4 mb-5 relative border-b border-[#262626]">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                            <button
                                className='mr-4 text-[#FF8A00] hover:text-[#E67A00] p-2 rounded-lg hover:bg-[#181818] transition'
                                onClick={() => setsidebarVisible(!sidebarVisible)}
                            >
                                <FaBars className="text-lg sm:text-xl" />
                            </button>
                            Staff Management
                        </h3>
                        <div className='absolute top-4 sm:top-8 right-4 sm:right-8 z-50'>
                            <Icons />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8">
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {fetchstaffs.isLoading ? (
                                <p className="text-center text-[#FF8A00] font-medium col-span-full text-sm sm:text-base">Loading staff...</p>
                            ) : filteredStaffs?.length > 0 ? (
                                filteredStaffs?.map((staff, index) => (
                                    <motion.div
                                        key={staff._id}
                                        className="bg-[#141414] rounded-2xl shadow-xl p-5 sm:p-6 border border-[#262626] hover:border-[#FF8A00]/50 transition duration-300 transform hover:-translate-y-1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center space-x-4 mt-2">
                                            <div className="text-[#FF8A00] text-[80px] sm:text-[100px]">
                                                <FaUserCircle />
                                            </div>
                                            <div>
                                                <h4 className="text-lg sm:text-xl font-bold text-white">{staff.name}</h4>
                                                <p className="text-gray-400 mt-1 text-sm sm:text-base capitalize">{staff.role}</p>
                                            </div>
                                        </div>
                                        {!metadata && (
                                            <div className="mt-6 flex flex-col gap-2">
                                                <button
                                                    onClick={() => dispatch(toggleAssignleadsmodal(staff._id))}
                                                    className="w-full border border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00] hover:text-black font-semibold px-4 py-2.5 rounded-xl transition text-sm sm:text-base"
                                                >
                                                    Assign Leads
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 col-span-full text-base sm:text-lg">No staff members assigned to you</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isAssignleadsmodal && (
                    <motion.div
                        key="assign-leads"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <div className="relative z-10 w-full max-w-4xl mx-4 my-8 sm:my-0">
                            <Assignleadsmodal />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Subadminstafflist