import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleStaffdetailmodal } from '../redux/modalSlice'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changepassword, profile_image } from '../services/staffRouter'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { setImage } from '../redux/authSlice'
import Spinner from './Spinner'
import { AnimatePresence, motion } from 'framer-motion'

function Staffdetailsmodal() {
    const dispatch = useDispatch()
    const queryclient = useQueryClient()
    const userlogged = useSelector((state) => state.auth.user)
    const role = useSelector((state) => state.auth.role)
    const [section, setsection] = useState('details')

    const [showsuccess, setshowsuccess] = useState(false)
    const [imagesuccess, setimagesuccess] = useState(false)

    const changingpassword = useMutation({
        mutationKey: ['Change Password'],
        mutationFn: changepassword
    })

    const uploadingImage = useMutation({
        mutationKey: ['Upload Profile'],
        mutationFn: profile_image,
        onSuccess: (profileImage) => {
            dispatch(setImage(profileImage)),
                queryclient.invalidateQueries(['listagents'])
        }
    })

    const profileimagevalidation = Yup.object({
        profileimage: Yup.mixed().required('Profile image is required')
    })

    const profileimageForm = useFormik({
        initialValues: {
            profileimage: null
        },
        validationSchema: profileimagevalidation,

        onSubmit: async (values) => {
            const formData = new FormData()
            formData.append('profileimage', values.profileimage)
            await uploadingImage.mutateAsync(formData)
            setimagesuccess(true)
            setTimeout(() => {
                dispatch(toggleStaffdetailmodal(null))
                setimagesuccess(false)
            }, 1000);
        }
    })

    const changepasswordvalidation = Yup.object({
        oldpassword: Yup.string().required('This field is required'),
        newpassword: Yup.string().required('This field is required').min(6, "New password must be at least 6 characters").matches(/[A-Z]/, "Password must contain at least one uppercase letter").matches(/\d/, "Password must contain at least one number").matches(/[@$!%*?&]/, "Password must contain at least one special character"),
        confirmnewpassword: Yup.string().required('This field is required').oneOf([Yup.ref('newpassword')], "Passwords do not match")
    })

    const changepasswordForm = useFormik({
        initialValues: {
            oldpassword: '',
            newpassword: '',
            confirmnewpassword: ''
        },
        validationSchema: changepasswordvalidation,
        onSubmit: async (values) => {
            await changingpassword.mutateAsync({ id: userlogged.id, formdata: values })
            setshowsuccess(true)
            setTimeout(() => {
                dispatch(toggleStaffdetailmodal(null))
                setshowsuccess(false)
            }, 1000);
        }
    })

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-[#141414] border border-[#282828] text-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 relative transform transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#242424] pb-4 mb-6">
                    <h2 className="text-2xl font-extrabold text-[#FF8A00] tracking-wide">
                        {role !== 'Admin' ? 'Staff Profile' : 'Admin Profile'}
                    </h2>
                    <button
                        onClick={() => dispatch(toggleStaffdetailmodal(null))}
                        className="text-gray-400 hover:text-[#FF8A00] text-2xl font-bold transition duration-300"
                    >
                        &times;
                    </button>
                </div>
                <div className="flex gap-4 mb-8">
                    <button
                        className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${section === 'details'
                            ? 'bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black shadow-[0_0_15px_rgba(255,138,0,0.3)]'
                            : 'bg-[#181818] text-gray-400 hover:text-white border border-[#242424]'
                            }`}
                        onClick={() => setsection('details')}
                    >
                        Profile
                    </button>
                    <button
                        className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${section === 'changepassword'
                            ? 'bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black shadow-[0_0_15px_rgba(255,138,0,0.3)]'
                            : 'bg-[#181818] text-gray-400 hover:text-white border border-[#242424]'
                            }`}
                        onClick={() => setsection('changepassword')}
                    >
                        Password
                    </button>
                </div>

                {/* Section Content */}
                {section === 'details' ? (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 rounded-full border-2 border-[#FF8A00] overflow-hidden flex items-center justify-center bg-[#1A1A1A] shadow-[0_0_15px_rgba(255,138,0,0.2)]">
                                <img
                                    src={userlogged?.image}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {uploadingImage.isLoading && (
                            <Spinner />
                        )}
                        {uploadingImage.isError && (
                            <p className="text-red-400 bg-red-950/30 border border-red-900/40 p-4 rounded-xl text-sm font-medium shadow-sm">
                                Error: {uploadingImage.error?.message}
                            </p>
                        )}
                        {uploadingImage.isSuccess && (
                            <p className="text-[#FF8A00] bg-[#FF8A00]/10 border border-[#FF8A00]/30 p-4 rounded-xl text-sm font-medium shadow-sm">
                                Profile picture uploaded successfully!
                            </p>
                        )}
                        <form onSubmit={profileimageForm.handleSubmit} className="flex items-center gap-4">
                            <input
                                type="file"
                                name="profileimage"
                                accept='image/*'
                                onChange={(e) => {
                                    profileimageForm.setFieldValue('profileimage', e.currentTarget.files[0]);
                                }}
                                className="w-48 px-3 py-2 border border-[#2E2E2E] rounded-xl bg-[#181818] text-gray-300 text-sm file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-[#FF8A00] file:text-black hover:file:bg-[#E67A00] transition"
                            />
                            <button
                                type="submit"
                                className="bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold px-5 py-2 rounded-xl text-sm transition shadow-[0_0_10px_rgba(255,138,0,0.25)]"
                            >
                                Upload
                            </button>
                        </form>
                        <div className="flex justify-between items-center bg-[#181818] border border-[#242424] p-4 rounded-xl shadow-sm">
                            <span className="font-medium text-gray-400">Name:</span>
                            <span className="text-white font-semibold">{userlogged.name}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#181818] border border-[#242424] p-4 rounded-xl shadow-sm">
                            <span className="font-medium text-gray-400">Email:</span>
                            <span className="text-white font-semibold">{userlogged.email}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#181818] border border-[#242424] p-4 rounded-xl shadow-sm">
                            <span className="font-medium text-gray-400">Role:</span>
                            <span className="text-[#FF8A00] font-semibold capitalize">{userlogged.role}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#181818] border border-[#242424] p-4 rounded-xl shadow-sm">
                            <span className="font-medium text-gray-400">Mobile:</span>
                            <span className="text-white font-semibold">{userlogged.mobile}</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {changingpassword.isLoading && (
                            <Spinner />
                        )}
                        {changingpassword.isError && (
                            <p className="text-red-400 bg-red-950/30 border border-red-900/40 p-4 rounded-xl text-sm font-medium shadow-sm">
                                {changingpassword.error?.response?.data?.message}
                            </p>
                        )}
                        <form onSubmit={changepasswordForm.handleSubmit} className="space-y-5">
                            <div>
                                <input
                                    type="password"
                                    name="oldpassword"
                                    placeholder="Current Password"
                                    value={changepasswordForm.values.oldpassword}
                                    {...changepasswordForm.getFieldProps('oldpassword')}
                                    className="w-full px-5 py-3 border border-[#2E2E2E] rounded-xl focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] transition bg-[#181818] text-white placeholder-gray-500"
                                />
                                {changepasswordForm.touched.oldpassword && changepasswordForm.errors.oldpassword && (
                                    <p className="text-red-400 text-xs mt-2">{changepasswordForm.errors.oldpassword}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="newpassword"
                                    placeholder="New Password"
                                    value={changepasswordForm.values.newpassword}
                                    {...changepasswordForm.getFieldProps('newpassword')}
                                    className="w-full px-5 py-3 border border-[#2E2E2E] rounded-xl focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] transition bg-[#181818] text-white placeholder-gray-500"
                                />
                                {changepasswordForm.touched.newpassword && changepasswordForm.errors.newpassword && (
                                    <p className="text-red-400 text-xs mt-2">{changepasswordForm.errors.newpassword}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="confirmnewpassword"
                                    placeholder="Confirm New Password"
                                    value={changepasswordForm.values.confirmnewpassword}
                                    {...changepasswordForm.getFieldProps('confirmnewpassword')}
                                    className="w-full px-5 py-3 border border-[#2E2E2E] rounded-xl focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] transition bg-[#181818] text-white placeholder-gray-500"
                                />
                                {changepasswordForm.touched.confirmnewpassword && changepasswordForm.errors.confirmnewpassword && (
                                    <p className="text-red-400 text-xs mt-2">{changepasswordForm.errors.confirmnewpassword}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black py-3 rounded-xl font-bold hover:brightness-110 transition duration-300 shadow-[0_0_15px_rgba(255,138,0,0.3)]"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>

                )}
            </div>
            <AnimatePresence>
                {showsuccess && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="absolute inset-0 bg-black opacity-30" />
                        <motion.div
                            className="relative z-10 bg-green-200 text-green-800 px-6 sm:px-10 py-4 sm:py-6 rounded-xl shadow-xl text-sm sm:text-base font-semibold w-full max-w-xs sm:max-w-sm h-[100px] sm:h-[120px] flex items-center justify-center text-center"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            ✅ Password changed successfully!
                        </motion.div>
                    </motion.div>
                )}
                {imagesuccess && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="absolute inset-0 bg-black opacity-30" />
                        <motion.div
                            className="relative z-10 bg-green-200 text-green-800 px-6 sm:px-10 py-4 sm:py-6 rounded-xl shadow-xl text-sm sm:text-base font-semibold w-full max-w-xs sm:max-w-sm h-[100px] sm:h-[120px] flex items-center justify-center text-center"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            ✅ Profile picture changed successfully!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Staffdetailsmodal