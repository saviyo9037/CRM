// import { useMutation } from '@tanstack/react-query';
// import React, { useEffect, useState } from 'react';
// import { forgotpassword, resetpassword } from '../../services/passwordRouter';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import Spinner from '../Spinner';
// import { useDispatch } from 'react-redux';
// import { togglepasswordModal } from '../../redux/passwordmodalSlice';
// import { X } from 'lucide-react';
// import { AnimatePresence, motion } from 'framer-motion'

// function Passwordmodal() {
//     const dispatch = useDispatch();
//     const [step, setStep] = useState('forgot'); // 'forgot' or 'reset'
//     const [timerId, setTimerId] = useState(null);
//     const [showsuccess, setshowsuccess] = useState(false)

//     // Formik validation schemas
//     const forgotSchema = Yup.object({
//         email: Yup.string()
//             .required("Email is required")
//             .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, "Invalid email format")
//     });

//     const resetSchema = Yup.object({
//         email: Yup.string().required("Email is required").matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, "Invalid email format"),
//         pin: Yup.string().required("Please enter the OTP"),
//         newpassword: Yup.string()
//             .required("Enter password")
//             .min(6, "Must be 6+ characters")
//             .matches(/[A-Z]/, "Must contain uppercase")
//             .matches(/\d/, "Must contain number")
//             .matches(/[@$!%*?&]/, "Must contain special char"),
//         confirmnewpassword: Yup.string().oneOf([Yup.ref('newpassword')], "Passwords must match").required()
//     });

//     const forgotPassword = useMutation({
//         mutationFn: forgotpassword,
//         onSuccess: (data) => {
//             formik.setFieldValue('email', formik.values.email);
//             setStep('reset');
//             const timeout = setTimeout(() => {
//                 setStep('forgot');
//             }, data.expiresIn * 1000);
//             setTimerId(timeout);
//         }
//     });

//     const resetPassword = useMutation({
//         mutationFn: resetpassword,
//         onSuccess: () => {
//             clearTimeout(timerId);
//             setStep('forgot');
//             formik.resetForm();
//         }
//     });

//     const formik = useFormik({
//         initialValues: {
//             email: '',
//             pin: '',
//             newpassword: '',
//             confirmnewpassword: ''
//         },
//         validationSchema: step === 'forgot' ? forgotSchema : resetSchema,
//         onSubmit: async (values) => {
//             if (step === 'forgot') {
//                 await forgotPassword.mutateAsync({ email: values.email });
//             } else {
//                 await resetPassword.mutateAsync({
//                     email: values.email,
//                     pin: values.pin,
//                     newpassword: values.newpassword
//                 });
//                 setshowsuccess(true)
//                 setTimeout(() => {
//                     setshowsuccess(false)
//                     dispatch(togglepasswordModal())
//                 }, 2000);
//             }
//         }
//     });

//     useEffect(() => {
//         return () => clearTimeout(timerId); // Cleanup on unmount
//     }, [timerId]);

//     return (
//         <div className="relative p-6 max-w-md mx-auto bg-white rounded-xl shadow-xl space-y-4">
//             <button onClick={() => dispatch(togglepasswordModal())} className="absolute top-3 right-3">
//                 <X size={20} />
//             </button>

//             <h2 className="text-xl font-semibold text-center text-[#1E6DB0]">
//                 {step === 'forgot' ? 'Forgot Password' : 'Reset Password'}
//             </h2>

//             {(forgotPassword.isPending || resetPassword.isPending) && <Spinner />}

//             {(forgotPassword.isError || resetPassword.isError) && (
//                 <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm text-center">
//                     {forgotPassword.error?.response?.data?.message ||
//                         resetPassword.error?.response?.data?.message ||
//                         "Something went wrong."}
//                 </p>
//             )}

//             <form onSubmit={formik.handleSubmit} className="space-y-4">
//                 <div>
//                     <label className="text-sm font-medium">Email</label>
//                     <input
//                         type="email"
//                         {...formik.getFieldProps('email')}
//                         className="w-full px-3 py-2 border rounded"
//                         placeholder="Enter your email"
//                     />
//                     {formik.touched.email && formik.errors.email && (
//                         <p className="text-red-500 text-xs">{formik.errors.email}</p>
//                     )}
//                 </div>

//                 {step === 'reset' && (
//                     <>
//                         <div>
//                             <label className="text-sm font-medium">OTP</label>
//                             <input
//                                 type="text"
//                                 {...formik.getFieldProps('pin')}
//                                 className="w-full px-3 py-2 border rounded"
//                                 placeholder="Enter PIN"
//                             />
//                             {formik.touched.pin && formik.errors.pin && (
//                                 <p className="text-red-500 text-xs">{formik.errors.pin}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium">New Password</label>
//                             <input
//                                 type="password"
//                                 {...formik.getFieldProps('newpassword')}
//                                 className="w-full px-3 py-2 border rounded"
//                                 placeholder="New Password"
//                             />
//                             {formik.touched.newpassword && formik.errors.newpassword && (
//                                 <p className="text-red-500 text-xs">{formik.errors.newpassword}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium">Confirm Password</label>
//                             <input
//                                 type="password"
//                                 {...formik.getFieldProps('confirmnewpassword')}
//                                 className="w-full px-3 py-2 border rounded"
//                                 placeholder="Confirm Password"
//                             />
//                             {formik.touched.confirmnewpassword && formik.errors.confirmnewpassword && (
//                                 <p className="text-red-500 text-xs">{formik.errors.confirmnewpassword}</p>
//                             )}
//                         </div>
//                     </>
//                 )}

//                 <button type="submit" className="w-full bg-[#00B5A6] text-white py-2 rounded hover:bg-[#1E6DB0]">
//                     {step === 'forgot' ? 'Send OTP' : 'Reset Password'}
//                 </button>
//             </form>

//             {step === 'reset' && (
//                 <p className="text-sm text-center text-gray-500 mt-2">
//                     OTP will expire in 10 minutes. Return to{' '}
//                     <button
//                         type="button"
//                         onClick={() => {
//                             setStep('forgot');
//                             clearTimeout(timerId);
//                         }}
//                         className="text-[#1E6DB0] underline"
//                     >
//                         forgot password
//                     </button>
//                 </p>
//             )}
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
//                             ✅ Password reset successfull!
//                         </motion.div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }

// export default Passwordmodal;
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { forgotpassword, resetpassword } from '../../services/passwordRouter';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Spinner from '../Spinner';
import { useDispatch } from 'react-redux';
import { togglepasswordModal } from '../../redux/passwordmodalSlice';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'

function Passwordmodal() {
    const dispatch = useDispatch();
    const [step, setStep] = useState('forgot'); // 'forgot' or 'reset'
    const [timerId, setTimerId] = useState(null);
    const [showsuccess, setshowsuccess] = useState(false)

    // Formik validation schemas
    const forgotSchema = Yup.object({
        email: Yup.string()
        .required("Email is required")
        .matches(/.+@.+\..+/, "Invalid email format")    });

    const resetSchema = Yup.object({
        email: Yup.string().required("Email is required").matches(/.+@.+\..+/, "Invalid email format"),
        pin: Yup.string().required("Please enter the OTP"),
        newpassword: Yup.string()
            .required("Enter password")
            .min(6, "Must be 6+ characters")
            .matches(/[A-Z]/, "Must contain uppercase")
            .matches(/\d/, "Must contain number")
            .matches(/[@$!%*?&]/, "Must contain special char"),
        confirmnewpassword: Yup.string().oneOf([Yup.ref('newpassword')], "Passwords must match").required()
    });

    const forgotPassword = useMutation({
        mutationFn: forgotpassword,
        onSuccess: (data) => {
            formik.setFieldValue('email', formik.values.email);
            setStep('reset');
            const timeout = setTimeout(() => {
                setStep('forgot');
            }, data.expiresIn * 1000);
            setTimerId(timeout);
        }
    });

    const resetPassword = useMutation({
        mutationFn: resetpassword,
        onSuccess: () => {
            clearTimeout(timerId);
            setStep('forgot');
            formik.resetForm();
        }
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            pin: '',
            newpassword: '',
            confirmnewpassword: ''
        },
        validationSchema: step === 'forgot' ? forgotSchema : resetSchema,
        onSubmit: async (values) => {
            if (step === 'forgot') {
                await forgotPassword.mutateAsync({ email: values.email });
            } else {
                await resetPassword.mutateAsync({
                    email: values.email,
                    pin: values.pin,
                    newpassword: values.newpassword
                });
                setshowsuccess(true)
                setTimeout(() => {
                    setshowsuccess(false)
                    dispatch(togglepasswordModal())
                }, 2000);
            }
        }
    });

    useEffect(() => {
        return () => clearTimeout(timerId); // Cleanup on unmount
    }, [timerId]);

    return (
        <div className="relative p-6 sm:p-8 max-w-md mx-auto bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl space-y-5 text-white">
            <button
                onClick={() => dispatch(togglepasswordModal())}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#222222]"
            >
                <X size={18} />
            </button>

            <div className="text-center">
                <div className="inline-block p-2 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/20 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00] inline-block"></span>
                </div>
                <h2 className="text-xl font-bold text-white">
                    {step === 'forgot' ? 'Forgot Password' : 'Reset Password'}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    {step === 'forgot' ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}
                </p>
            </div>

            {(forgotPassword.isPending || resetPassword.isPending) && (
                <div className="py-4 flex justify-center">
                    <Spinner />
                </div>
            )}

            {(forgotPassword.isError || resetPassword.isError) && (
                <p className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-center">
                    {forgotPassword.error?.response?.data?.message ||
                        resetPassword.error?.response?.data?.message ||
                        "Something went wrong."}
                </p>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Email</label>
                    <input
                        type="email"
                        {...formik.getFieldProps('email')}
                        className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm"
                        placeholder="Enter your email"
                    />
                    {formik.touched.email && formik.errors.email && (
                        <p className="text-red-400 text-xs mt-1">{formik.errors.email}</p>
                    )}
                </div>

                {step === 'reset' && (
                    <>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 block mb-1">OTP</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('pin')}
                                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm"
                                placeholder="Enter OTP code"
                            />
                            {formik.touched.pin && formik.errors.pin && (
                                <p className="text-red-400 text-xs mt-1">{formik.errors.pin}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 block mb-1">New Password</label>
                            <input
                                type="password"
                                {...formik.getFieldProps('newpassword')}
                                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm"
                                placeholder="Enter new password"
                            />
                            {formik.touched.newpassword && formik.errors.newpassword && (
                                <p className="text-red-400 text-xs mt-1">{formik.errors.newpassword}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 block mb-1">Confirm Password</label>
                            <input
                                type="password"
                                {...formik.getFieldProps('confirmnewpassword')}
                                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm"
                                placeholder="Confirm new password"
                            />
                            {formik.touched.confirmnewpassword && formik.errors.confirmnewpassword && (
                                <p className="text-red-400 text-xs mt-1">{formik.errors.confirmnewpassword}</p>
                            )}
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    className="w-full bg-[#FF8A00] hover:bg-[#E67A00] text-black font-bold py-2.5 rounded-xl transition text-sm shadow-lg shadow-[#FF8A00]/20"
                >
                    {step === 'forgot' ? 'Send OTP' : 'Reset Password'}
                </button>
            </form>

            {step === 'reset' && (
                <p className="text-xs text-center text-gray-400 mt-2">
                    OTP will expire in 10 minutes.{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setStep('forgot');
                            clearTimeout(timerId);
                        }}
                        className="text-[#FF8A00] hover:underline font-semibold"
                    >
                        Resend OTP
                    </button>
                </p>
            )}
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
                            Password reset successful!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Passwordmodal;
