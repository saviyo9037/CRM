import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import * as Yup from 'yup'
import { logindata } from '../services/authRouter'
import { useDispatch, useSelector } from 'react-redux'
import { loginaction } from '../redux/authSlice'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { FaChartLine, FaTasks, FaUserTie } from 'react-icons/fa'
import Spinner from '../components/Spinner'
import { togglepasswordModal } from '../redux/passwordmodalSlice'
import Passwordmodal from '../components/passwordcomponents/Passwordmodal'
import Registeradminmodal from '../components/Admincomponents/Registeradminmodal'
import { toggleregisteradminModal } from '../redux/createadminmodalSlice'
import { countadmin } from '../services/registeradminRouter'

function Auth() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isPasswordmodal = useSelector((state) => state.passwordmodal.passwordModal)
    const isRegisteradminmodal = useSelector((state) => state.createadminmodal.registeradminModal)

    const [showPassword, setshowPassword] = useState(false)

    const { data: countingadmin } = useQuery({
        queryKey: ['Counting admin'],
        queryFn: countadmin
    })

    const modulelogin = useMutation({
        mutationKey: ["Login"],
        mutationFn: logindata,
        onSuccess: (loginuserdata) => {
            const decodedData = jwtDecode(loginuserdata.token)

            dispatch(loginaction(loginuserdata))

            if (decodedData.role === "Admin") {
                navigate("/admindashboard");
            } else if (decodedData.role === "Sub-Admin") {
                navigate("/subadminhome");
            } else if (decodedData.role === "Agent") {
                navigate("/subadminhome")
            } else {
                navigate("/userhome");
            }
        }
    })

    const loginvalidation = Yup.object({
        email: Yup.string().required("Email is required"),
        password: Yup.string().required("Password is required")
    })

    const loginForm = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: loginvalidation,
        onSubmit: async (values) => {
            await modulelogin.mutateAsync(values)
        }
    })

    return (
        <div className="flex min-h-screen bg-[#0A0A0A] relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF8A00]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF8A00]/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#121212] border-r border-[#1F1F1F] shadow-2xl relative z-10"
            >
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00] shadow-[0_0_10px_#FF8A00]" />
                        <span className="text-xs font-semibold tracking-wider text-[#FF8A00] uppercase">Enterprise Portal</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight">Sign In</h2>
                    <p className="text-[#A1A1AA] mb-6 sm:mb-8 text-sm sm:text-base">Login with your credentials</p>

                    {modulelogin.isPending &&
                        <Spinner />
                    }

                    {modulelogin.isError && (
                        <p className="text-red-400 bg-red-950/40 border border-red-800/50 p-3 rounded-lg text-center mb-4 text-sm sm:text-base">
                            {modulelogin.error?.response?.data?.message || 'Login failed. Please try again.'}
                        </p>
                    )}

                    <form onSubmit={loginForm.handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase mb-1.5">Email Address</label>
                            <input
                                type="email"
                                className="w-full p-3 bg-[#181818] border border-[#2A2A2A] rounded-lg text-white placeholder-[#71717A] focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none text-sm sm:text-base transition"
                                name="email"
                                value={loginForm.values.email}
                                {...loginForm.getFieldProps('email')}
                                placeholder="name@company.com"
                            />
                            {loginForm.touched.email && loginForm.errors.email && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{loginForm.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full p-3 pr-10 bg-[#181818] border border-[#2A2A2A] rounded-lg text-white placeholder-[#71717A] focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] focus:outline-none text-sm sm:text-base transition"
                                    name="password"
                                    value={loginForm.values.password}
                                    {...loginForm.getFieldProps('password')}
                                    placeholder="Enter your password"
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center cursor-pointer text-[#71717A] hover:text-[#FF8A00] transition"
                                    onClick={() => setshowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                            {loginForm.touched.password && loginForm.errors.password && (
                                <p className="text-red-400 text-xs sm:text-sm">{loginForm.errors.password}</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => dispatch(togglepasswordModal())}
                                className="text-xs sm:text-sm text-[#FF8A00] hover:text-[#FFA033] hover:underline focus:outline-none mt-1 transition"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#FF8A00] hover:bg-[#E67A00] text-black py-3 rounded-lg font-bold cursor-pointer shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all duration-300 text-sm sm:text-base tracking-wide"
                        >
                            Sign In
                        </button>
                    </form>
                    {countingadmin?.count === 0 &&
                        <button
                            onClick={() => dispatch(toggleregisteradminModal())}
                            className="w-full mt-4 bg-transparent border border-[#FF8A00] hover:bg-[#FF8A00]/10 text-[#FF8A00] py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 text-sm sm:text-base"
                        >
                            Register as Admin
                        </button>
                    }
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                className="hidden lg:flex w-1/2 items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-white max-w-md text-left"
                >
                    <div className="inline-block px-3 py-1 bg-[#FF8A00]/15 text-[#FF8A00] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#FF8A00]/30">
                        Next-Gen CRM
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight">
                        Powering Your <span className="text-[#FF8A00]">Growth</span> & Velocity
                    </h1>
                    <p className="text-[#A1A1AA] text-base mb-8">
                        Streamlined customer relationship workflows with intelligent lead routing and performance tracking.
                    </p>
                    <ul className="space-y-4 text-base font-medium">
                        <li className="flex items-center gap-3.5 p-3 rounded-xl bg-[#141414] border border-[#222222]">
                            <div className="p-2 rounded-lg bg-[#FF8A00]/15 text-[#FF8A00]">
                                <FaUserTie className='text-lg' />
                            </div>
                            <span className="text-white">Intelligent Lead Routing</span>
                        </li>
                        <li className="flex items-center gap-3.5 p-3 rounded-xl bg-[#141414] border border-[#222222]">
                            <div className="p-2 rounded-lg bg-[#FF8A00]/15 text-[#FF8A00]">
                                <FaTasks className='text-lg' />
                            </div>
                            <span className="text-white">Seamless Task & Pipeline Management</span>
                        </li>
                        <li className="flex items-center gap-3.5 p-3 rounded-xl bg-[#141414] border border-[#222222]">
                            <div className="p-2 rounded-lg bg-[#FF8A00]/15 text-[#FF8A00]">
                                <FaChartLine className='text-lg' />
                            </div>
                            <span className="text-white">Real-Time Performance Analytics</span>
                        </li>
                    </ul>
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isPasswordmodal && (
                    <motion.div
                        key="staff"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute inset-0 bg-black"
                        />
                        <div className="relative z-10 w-full max-w-md sm:max-w-lg">
                            <Passwordmodal />
                        </div>
                    </motion.div>
                )}
                {isRegisteradminmodal && (
                    <motion.div
                        key="staff"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute inset-0 bg-black"
                        />
                        <div className="relative z-10 w-full max-w-md sm:max-w-lg">
                            <Registeradminmodal />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Auth