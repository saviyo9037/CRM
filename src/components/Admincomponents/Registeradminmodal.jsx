// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import React, { useState } from 'react'
// import { useDispatch } from 'react-redux'
// import * as Yup from 'yup'
// import { useFormik } from 'formik'
// import { AnimatePresence, motion } from 'framer-motion'
// import { FaUserPlus } from 'react-icons/fa'
// import { createadmin } from '../../services/registeradminRouter'
// import { toggleregisteradminModal } from '../../redux/createadminmodalSlice'
// import Spinner from '../Spinner'
// import PhoneInput from 'react-phone-input-2'
// import 'react-phone-input-2/lib/style.css'

// function Registeradminmodal() {

//     const dispatch = useDispatch()
//     const queryclient = useQueryClient()

//     const [showsuccess, setshowsuccess] = useState(false)

//     const admin = useMutation({
//         mutationKey: ["create admin"],
//         mutationFn: createadmin,
//         onSuccess: ()=>{
//             queryclient.invalidateQueries(['create admin'])
//         }
//     })

//     const adminvalidation = Yup.object({
//         name: Yup.string().required("Name is required"),
//         email: Yup.string().required("Email is required").matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, "Invalid email format"),
//         mobile: Yup.string().required("Mobile is required"),
//         password: Yup.string().required("Password is required").min(6, "New password must be at least 6 characters").matches(/[A-Z]/, "Password must contain at least one uppercase letter").matches(/\d/, "Password must contain at least one number").matches(/[@$!%*?&]/, "Password must contain at least one special character")
//     })

//     const createadminForm = useFormik({
//         initialValues: {
//             name: '',
//             email: '',
//             mobile: '',
//             password: ''
//         },
//         validationSchema: adminvalidation,
//         onSubmit: async (values) => {
//             await admin.mutateAsync(values)
//             setshowsuccess(true)
//             setTimeout(() => {
//                 dispatch(toggleregisteradminModal())
//                 setshowsuccess(false)
//             }, 1000);
//         }
//     })

//     return (
//         <div className='fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0'>
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.4 }}
//                 className='bg-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden'
//             >
//                 {admin.isPending &&
//                     <Spinner/>
//                 }
//                 <div className="bg-gradient-to-b from-[#00B5A6] to-[#1E6DB0] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
//                     <FaUserPlus className='text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4' />
//                     <h2 className='text-lg sm:text-xl md:text-2xl font-bold'>Register as Admin</h2>
//                     <p className='text-xs sm:text-sm mt-2 text-center'>Register as Admin to control the website and to add staffs.</p>
//                 </div>
//                 <div className='relative w-full md:w-2/3 p-4 sm:p-6 md:p-8'>
//                     <button
//                         onClick={() => dispatch(toggleregisteradminModal())}
//                         className='absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-red-500 transition'
//                     >
//                         &times;
//                     </button>
//                     <h3 className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4'>Enter Your Details</h3>

//                     {admin.isError && (
//                         <p className='text-red-600 bg-red-100 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base'>{admin.error?.response?.data?.message}</p>
//                     )}

//                     <form onSubmit={createadminForm.handleSubmit} className='space-y-3 sm:space-y-4'>
//                         <div>
//                             <input
//                                 type='text'
//                                 name='name'
//                                 value={createadminForm.values.name}
//                                 {...createadminForm.getFieldProps('name')}
//                                 className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
//                                 placeholder='Enter the name'
//                             />
//                             <span className='text-red-500 text-xs block mt-1'>* required</span>
//                             {createadminForm.touched.name && createadminForm.errors.name && (
//                                 <p className='text-red-500 text-xs sm:text-sm mt-1'>{createadminForm.errors.name}</p>
//                             )}
//                         </div>

//                         <div>
//                             <input
//                                 type='email'
//                                 name='email'
//                                 value={createadminForm.values.email}
//                                 {...createadminForm.getFieldProps('email')}
//                                 className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
//                                 placeholder='Enter the email'
//                             />
//                             <span className='text-red-500 text-xs block mt-1'>* required</span>
//                             {createadminForm.touched.email && createadminForm.errors.email && (
//                                 <p className='text-red-500 text-xs sm:text-sm mt-1'>{createadminForm.errors.email}</p>
//                             )}
//                         </div>

//                         <div>
//                             <PhoneInput
//                                 country={"us"}
//                                 value={createadminForm.values.mobile}
//                                 onChange={(phone) => createadminForm.setFieldValue("mobile", phone)}
//                                 inputClass="!w-full !p-3 !text-gray-800 !border !border-gray-300 !rounded-lg"
//                                 buttonClass="!border-gray-300"
//                             />
//                             <span className='text-red-500 text-xs block mt-1'>* required</span>
//                             {createadminForm.touched.mobile && createadminForm.errors.mobile && (
//                                 <p className='text-red-500 text-xs sm:text-sm mt-1'>{createadminForm.errors.mobile}</p>
//                             )}
//                         </div>

//                         <div>
//                             <input
//                                 type='password'
//                                 name='password'
//                                 value={createadminForm.values.password}
//                                 {...createadminForm.getFieldProps('password')}
//                                 className='border border-gray-300 p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base'
//                                 placeholder='Enter the password'
//                             />
//                             <span className='text-red-500 text-xs block mt-1'>* required</span>
//                             {createadminForm.touched.password && createadminForm.errors.password && (
//                                 <p className='text-red-500 text-xs sm:text-sm mt-1'>{createadminForm.errors.password}</p>
//                             )}
//                         </div>

//                         <button
//                             type='submit'
//                             className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base'
//                         >
//                             Register
//                         </button>
//                     </form>
//                 </div>
//             </motion.div>
//             <AnimatePresence>
//                 {showsuccess && (
//                     <motion.div
//                         className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                     >
//                         <motion.div className="absolute inset-0 bg-black opacity-30" />
//                         <motion.div
//                             className="relative z-10 bg-green-200 text-green-800 px-6 sm:px-10 py-4 sm:py-6 rounded-xl shadow-xl text-sm sm:text-base font-semibold w-full max-w-xs sm:max-w-sm h-[100px] sm:h-[120px] flex items-center justify-center text-center"
//                             initial={{ scale: 0.5 }}
//                             animate={{ scale: 1 }}
//                             exit={{ scale: 0.5 }}
//                             transition={{ type: 'spring', stiffness: 300, damping: 20 }}
//                         >
//                             ✅ Admin registered successfully!
//                         </motion.div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     )
// }

// export default Registeradminmodal


import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { AnimatePresence, motion } from 'framer-motion'
import { FaUserPlus } from 'react-icons/fa'
import { createadmin } from '../../services/registeradminRouter'
import { toggleregisteradminModal } from '../../redux/createadminmodalSlice'
import Spinner from '../Spinner'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function Registeradminmodal() {

    const dispatch = useDispatch()
    const queryclient = useQueryClient()

    const [showsuccess, setshowsuccess] = useState(false)

    const admin = useMutation({
        mutationKey: ["create admin"],
        mutationFn: createadmin,
        onSuccess: ()=>{
            queryclient.invalidateQueries(['create admin'])
        }
    })

    const adminvalidation = Yup.object({
        name: Yup.string().required("Name is required"),
        email: Yup.string().required("Email is required").matches(/.+@.+\..+/, "Invalid email format"),
        mobile: Yup.string().required("Mobile is required"),
        password: Yup.string().required("Password is required").min(6, "New password must be at least 6 characters").matches(/[A-Z]/, "Password must contain at least one uppercase letter").matches(/\d/, "Password must contain at least one number").matches(/[@$!%*?&]/, "Password must contain at least one special character")
    })

    const createadminForm = useFormik({
        initialValues: {
            name: '',
            email: '',
            mobile: '',
            password: ''
        },
        validationSchema: adminvalidation,
        onSubmit: async (values) => {
            await admin.mutateAsync(values)
            setshowsuccess(true)
            setTimeout(() => {
                dispatch(toggleregisteradminModal())
                setshowsuccess(false)
            }, 1000);
        }
    })

    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/80 backdrop-blur-md'>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className='bg-[#141414] border border-[#262626] w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden'
            >
                {admin.isPending && (
                    <div className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <Spinner/>
                    </div>
                )}
                <div className="bg-gradient-to-b from-[#FF8A00] to-[#E67A00] w-full md:w-1/3 flex flex-col items-center justify-center p-6 text-black">
                    <FaUserPlus className='text-5xl sm:text-6xl md:text-[70px] mb-3 text-black' />
                    <h2 className='text-xl sm:text-2xl font-black text-black text-center'>Register Admin</h2>
                    <p className='text-xs mt-2 text-center text-black/80 font-medium'>Register as Admin to control the workspace and manage staff.</p>
                </div>
                <div className='relative w-full md:w-2/3 p-6 sm:p-8 text-white'>
                    <button
                        onClick={() => dispatch(toggleregisteradminModal())}
                        className='absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#222222]'
                    >
                        &times;
                    </button>
                    <h3 className='text-xl sm:text-2xl font-bold text-white mb-4'>Enter Details</h3>

                    {admin.isError && (
                        <p className='text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 text-sm'>{admin.error?.response?.data?.message}</p>
                    )}

                    <form onSubmit={createadminForm.handleSubmit} className='space-y-4'>
                        <div>
                            <input
                                type='text'
                                name='name'
                                value={createadminForm.values.name}
                                {...createadminForm.getFieldProps('name')}
                                className='bg-[#121212] border border-[#2E2E2E] text-white p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm placeholder-gray-500'
                                placeholder='Enter full name'
                            />
                            {createadminForm.touched.name && createadminForm.errors.name && (
                                <p className='text-red-400 text-xs mt-1'>{createadminForm.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <input
                                type='email'
                                name='email'
                                value={createadminForm.values.email}
                                {...createadminForm.getFieldProps('email')}
                                className='bg-[#121212] border border-[#2E2E2E] text-white p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm placeholder-gray-500'
                                placeholder='Enter email address'
                            />
                            {createadminForm.touched.email && createadminForm.errors.email && (
                                <p className='text-red-400 text-xs mt-1'>{createadminForm.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <PhoneInput
                                country={"us"}
                                value={createadminForm.values.mobile}
                                onChange={(phone) => createadminForm.setFieldValue("mobile", phone)}
                                inputClass="!w-full !p-3 !bg-[#121212] !text-white !border !border-[#2E2E2E] !rounded-xl"
                                buttonClass="!bg-[#181818] !border-[#2E2E2E]"
                                dropdownClass="!bg-[#181818] !text-white !border-[#2E2E2E]"
                            />
                            {createadminForm.touched.mobile && createadminForm.errors.mobile && (
                                <p className='text-red-400 text-xs mt-1'>{createadminForm.errors.mobile}</p>
                            )}
                        </div>

                        <div>
                            <input
                                type='password'
                                name='password'
                                value={createadminForm.values.password}
                                {...createadminForm.getFieldProps('password')}
                                className='bg-[#121212] border border-[#2E2E2E] text-white p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm placeholder-gray-500'
                                placeholder='Enter password'
                            />
                            {createadminForm.touched.password && createadminForm.errors.password && (
                                <p className='text-red-400 text-xs mt-1'>{createadminForm.errors.password}</p>
                            )}
                        </div>

                        <button
                            type='submit'
                            className='w-full bg-[#FF8A00] hover:bg-[#E67A00] text-black py-3 rounded-xl font-bold transition text-sm shadow-lg shadow-[#FF8A00]/20'
                        >
                            Register Admin
                        </button>
                    </form>
                </div>
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
                            className="relative z-10 bg-[#141414] border border-[#FF8A00]/50 text-white px-8 py-6 rounded-2xl shadow-2xl text-base font-bold flex items-center justify-center text-center gap-3"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg">✓</span>
                            Admin registered successfully!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Registeradminmodal