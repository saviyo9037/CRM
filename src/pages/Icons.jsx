import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpLeft, Bell, Settings } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { FaUser, FaUsers } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { liststaffs } from '../services/staffRouter'
import { Link, useNavigate } from 'react-router-dom'
import { clearMetadataUser, setMetadataUser } from '../redux/authSlice'
import { impersonateuser } from '../services/impersonatemiddlewareRouter'
import { jwtDecode } from 'jwt-decode'
import { AnimatePresence, motion } from 'framer-motion'
import { toggleNotificationmodal, toggleStaffdetailmodal } from '../redux/modalSlice'
import Staffdetailsmodal from '../components/Staffdetailsmodal'
import Notificationmodal from '../components/Notificationmodal'
import Spinner from '../components/Spinner'
import { fetchunreadcount, markallread } from '../services/notificationsRouter'

function Icons() {
  const userlogged = useSelector((state) => state.auth.user)
  const role = useSelector((state) => state.auth.role)
  const metadatauser = useSelector((state) => state.auth.metadataUser)
  const isStaffdetailmodal = useSelector((state) => state.modal.staffdetailsModal)
  const isNotificationmodal = useSelector((state) => state.modal.notificationModal)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryclient = useQueryClient()
  const notificationmodalRef = useRef(null)
  const bellButtonRef = useRef(null) // Add ref for the bell button

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks on the bell button to prevent double-toggle
      if (
        isNotificationmodal &&
        notificationmodalRef.current &&
        !notificationmodalRef.current.contains(event.target) &&
        (!bellButtonRef.current || !bellButtonRef.current.contains(event.target))
      ) {
        dispatch(toggleNotificationmodal())
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isNotificationmodal, dispatch])

  const [showdropdown, setshowdropdown] = useState(false)

  const fetchstaffs = useQuery({
    queryKey: ['List Staffs'],
    queryFn: liststaffs
  })

  const { data: unreadCount } = useQuery({
    queryKey: ['Counting unreadnotification'],
    queryFn: fetchunreadcount
  })

  const markingnotificationsRead = useMutation({
    mutationKey: ['Marking all read'],
    mutationFn: markallread,
    onSuccess: () => {
      queryclient.invalidateQueries(['Counting unreadnotification'])
    }
  })

  const impersonatingUser = useMutation({
    mutationKey: ['Impersonating User'],
    mutationFn: impersonateuser,
    onSuccess: () => {
      queryclient.invalidateQueries(['Impersonating User', 'List tasks', 'List leads'])
    }
  })

  const handledropdown = () => {
    setshowdropdown(prev => !prev)
  }

  const handleimpersonate = async (selectedId) => {
    if (!selectedId) {
      return
    }

    const selectedUser = fetchstaffs.data?.find((staff) => staff._id === selectedId)
    if (!selectedUser) {
      return
    }

    dispatch(setMetadataUser(selectedUser))
    const response = await impersonatingUser.mutateAsync({ selectedId })
    const impersonatedUser = response.impersonateAs

    if (impersonatedUser) {
      navigate('/admindashboard')
    }
  }

  const stopimpersonate = () => {
    dispatch(clearMetadataUser())
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = jwtDecode(token)
    }
    queryclient.invalidateQueries(['List tasks', 'List leads'])
    navigate('/admindashboard')
  }

  const handlenotificationclick = async (event) => {
    event.stopPropagation() // Prevent the click from triggering handleClickOutside
    if (isNotificationmodal) {
      // If modal is open, just close it without marking notifications as read
      dispatch(toggleNotificationmodal())
    } else {
      // If modal is closed, mark notifications as read and open it
      await markingnotificationsRead.mutateAsync()
      dispatch(toggleNotificationmodal())
      queryclient.invalidateQueries(['Counting unreadnotification'])
    }
  }

  return (
    <div className='relative flex items-center gap-2 sm:gap-4 text-white text-lg sm:text-xl bg-[#141414] border border-[#262626] rounded-2xl shadow-lg p-2 sm:p-3'>
      <AnimatePresence>
        {!metadatauser && showdropdown && (
          <motion.div
            className='absolute left-[-220px] w-[220px]'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {fetchstaffs.isLoading && <Spinner />}
            <select
              className={`w-full p-3 rounded-xl bg-[#181818] text-sm text-white font-medium border border-[#2E2E2E] focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] hover:bg-[#202020] transition-all duration-200 appearance-none`}
              onChange={(e) => handleimpersonate(e.target.value)}
            >
              <option value="" className='p-3 text-gray-400 font-medium bg-[#181818]'>
                👥 Select staff
              </option>
              {fetchstaffs?.data?.map((staff) => (
                <option
                  key={staff._id}
                  value={staff._id}
                  className='p-3 text-white font-medium bg-[#181818] border-t border-[#262626]'
                >
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>
      {impersonatingUser.isPending && <Spinner />}
      {role === 'Admin' ? (
        <>
          {metadatauser ? (
            <div className="relative group">
              <motion.button
                onClick={stopimpersonate}
                whileHover={{ scale: 1.1, rotate: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-red-500 hover:text-red-400 transition"
                title="Stop impersonating"
              >
                <ArrowUpLeft size={20} strokeWidth={3} />
              </motion.button>
            </div>
          ) : (
            <>
              <button onClick={handledropdown} className="text-gray-300 hover:text-[#FF8A00] transition">
                <FaUsers />
              </button>
              <div className="relative">
                <button
                  ref={bellButtonRef}
                  onClick={handlenotificationclick}
                  className="relative text-gray-300 hover:text-[#FF8A00] transition"
                >
                  <Bell />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FF8A00] text-black text-xs font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_#FF8A00] animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotificationmodal && (
                    <motion.div
                      ref={notificationmodalRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 bg-[#141414] border border-[#2E2E2E] rounded-2xl shadow-2xl z-[999]"
                    >
                      <Notificationmodal />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to='/settings'>
                <button className="text-gray-300 hover:text-[#FF8A00] transition">
                  <Settings />
                </button>
              </Link>
              <button
                className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1C] hover:bg-[#262626] text-[#FF8A00] border border-[#FF8A00]/30 shadow-md transition-all duration-200"
                onClick={() => dispatch(toggleStaffdetailmodal())}
              >
                {userlogged.image ? (
                  <img
                    src={userlogged.image}
                    alt='Pro'
                    className='w-full h-full rounded-full border-2 border-[#FF8A00] object-contain'
                  />
                ) : (
                  <FaUser className="text-lg sm:text-xl" />
                )}
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#1F1F1F] text-white border border-[#333] px-2 py-1 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Profile
                </span>
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="relative">
            <button
              ref={bellButtonRef}
              onClick={handlenotificationclick}
              className="relative text-gray-300 hover:text-[#FF8A00] transition"
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF8A00] text-black text-xs font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_#FF8A00] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {isNotificationmodal && (
                <motion.div
                  ref={notificationmodalRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute mr-10 right-0 mt-2 w-72 bg-[#141414] border border-[#2E2E2E] rounded-2xl shadow-2xl"
                >
                  <Notificationmodal />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1C] hover:bg-[#262626] text-[#FF8A00] border border-[#FF8A00]/30 shadow-md transition-all duration-200"
            onClick={() => dispatch(toggleStaffdetailmodal())}
          >
            {userlogged.image ? (
              <img
                src={userlogged.image}
                alt='Pro'
                className='w-full h-full rounded-full border-2 border-[#FF8A00] object-contain'
              />
            ) : (
              <FaUser className="text-lg sm:text-xl" />
            )}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#1F1F1F] text-white border border-[#333] px-2 py-1 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Profile
            </span>
          </button>
        </>
      )}
      <AnimatePresence>
        {isStaffdetailmodal && (
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
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg">
              <Staffdetailsmodal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Icons