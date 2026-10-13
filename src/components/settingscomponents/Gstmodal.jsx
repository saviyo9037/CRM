import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { FaEdit } from 'react-icons/fa'
import { activateGstSettings, getsettingsgst } from '../../services/settingservices/gstSettingsRouter'
import { useDispatch } from 'react-redux'
import { togglegsteditModal } from '../../redux/settingsmodalSlice'
import { AnimatePresence } from 'framer-motion'

const Gstmodal = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const fetchingGst = useQuery({
        queryFn:getsettingsgst,
        queryKey:["fetching_gst_data"]
    })

    const updatingActivegst = useMutation({
        mutationFn:activateGstSettings,
        mutationKey:["gst_activate"],
        onSuccess:()=>{
            queryClient.invalidateQueries(["List_settingstatus"])
        }
    })

    const handleActivegst = async (gstDataId,active) => {
        await updatingActivegst.mutateAsync({
            gstDataId,
            active
        })
    }
  return (
    <div className="overflow-x-auto rounded-xl border border-[#262626] bg-[#121212] mt-4">
        <table className="min-w-full text-xs sm:text-sm text-left">
            <thead className="bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black font-bold uppercase tracking-wider text-xs">
                <tr>
                    <th className="px-3 sm:px-6 py-3 font-bold">Product GST</th>
                    <th className="px-3 sm:px-6 py-3 font-bold">GST Amount</th>
                    <th className="px-3 sm:px-6 py-3 font-bold">Edit</th>
                    <th className="px-3 sm:px-6 py-3 font-bold">Active</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
                {fetchingGst?.data?.getGst?.map((gst,index)=>(
                    <tr className="bg-[#181818] hover:bg-[#202020] transition text-gray-200" key={index}>
                        <td className="px-3 sm:px-6 py-3.5 font-medium text-white truncate">{gst.type}</td>
                        <td className="px-3 sm:px-6 py-3.5 text-gray-300 truncate">{gst.gst_amount}</td>
                        <td className="px-3 sm:px-6 py-3.5 truncate">
                            <button
                                className="text-[#FF8A00] hover:text-[#E67A00] text-base sm:text-lg transition"
                                onClick={() => dispatch(togglegsteditModal(gst))}
                            >
                            <FaEdit />
                            </button>
                        </td>
                        <td className="px-3 sm:px-6 py-3.5">
                            <label className="relative inline-flex items-center cursor-pointer w-10 sm:w-11 h-5 sm:h-6">
                                    <input    
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={!!gst?.active}
                                        onChange={(e)=>handleActivegst(gst._id,e.target.checked)}
                                    />
                                    <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#2a2a2a] rounded-full peer-checked:bg-[#FF8A00] transition-colors duration-300"></div>
                                    <div className="absolute left-1 top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                            </label>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}


export default Gstmodal