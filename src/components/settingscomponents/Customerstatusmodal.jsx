import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { togglecustomerstatusModal } from '../../redux/settingsmodalSlice'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addcustomersettingstatus } from '../../services/settingservices/customerStatusSettingsRouter'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { AnimatePresence, motion } from 'framer-motion'
import Spinner from '../Spinner'

function Customerstatusmodal() {

    const dispatch = useDispatch()
    const queryclient = useQueryClient()

    const [showsuccess, setshowsuccess] = useState(false)

    const addingcustomerstatus = useMutation({
        mutationKey: ['Adding Customer status'],
        mutationFn: addcustomersettingstatus,
        onSuccess: () => {
            queryclient.invalidateQueries(['List Settingstatus'])
        }
    })

    const customerstatusvalidation = Yup.object({
        title: Yup.string().required("Name is required")
    })

    const addcustomerstatusform = useFormik({
        initialValues: {
            title: ''
        },
        validationSchema: customerstatusvalidation,

        onSubmit: async (values) => {
            await addingcustomerstatus.mutateAsync(values)
            setshowsuccess(true)
            setTimeout(() => {
                dispatch(togglecustomerstatusModal())
                setshowsuccess(false)
            }, 1000);
        }

    })

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-[#141414] border border-[#262626] w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 relative text-white"
            >
                <button
                    onClick={() => dispatch(togglecustomerstatusModal())}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#222222]"
                >
                    &times;
                </button>

                <div className="mb-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
                        Add Customer Status
                    </h3>
                </div>

                {addingcustomerstatus.isPending && (
                    <div className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
                        <Spinner />
                    </div>
                )}
                {addingcustomerstatus.isError && (
                    <p className='text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 text-sm'>
                        {addingcustomerstatus.error?.response?.data?.message}
                    </p>
                )}

                <form onSubmit={addcustomerstatusform.handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label className="text-gray-300 font-medium mb-1.5 text-sm">
                            Status Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={addcustomerstatusform.values.title}
                            {...addcustomerstatusform.getFieldProps('title')}
                            className="bg-[#121212] border border-[#2E2E2E] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm text-white placeholder-gray-500"
                            placeholder="Enter status title"
                        />
                        {addcustomerstatusform.errors.title && addcustomerstatusform.touched.title && (
                            <span className="text-red-400 text-xs mt-1">{addcustomerstatusform.errors.title}</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#FF8A00] hover:bg-[#E67A00] text-black py-2.5 rounded-xl font-bold transition text-sm shadow-lg shadow-[#FF8A00]/20"
                    >
                        Submit
                    </button>
                </form>
            </motion.div>
            <AnimatePresence>
                {showsuccess && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div
                            className="relative z-10 bg-[#141414] border border-[#FF8A00]/50 text-white px-8 py-6 rounded-2xl shadow-2xl text-sm font-bold flex items-center justify-center text-center gap-3"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-base">✓</span>
                            Customer status added successfully!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Customerstatusmodal