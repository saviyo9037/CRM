import { useFormik } from 'formik'
import React, { useState } from 'react'
import * as Yup from 'yup'
import { AnimatePresence, motion } from 'framer-motion'
import { toggleaddtasksmodal } from '../redux/modalSlice'
import { FaTasks } from 'react-icons/fa'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { liststaffs } from '../services/staffRouter'
import { addtasks } from '../services/tasksRouter'
import Spinner from './Spinner'

function Addtaskmodal() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const userlogged = useSelector((state) => state.auth.user)

  const [showsuccess, setshowsuccess] = useState(false)

  const { data: staffs = [], isLoading: loadingStaffs } = useQuery({
    queryKey: ['List staffs'],
    queryFn: liststaffs,
  })

  const mutation = useMutation({
    mutationFn: addtasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }) // or whatever your task list key is
      setshowsuccess(true)
      setTimeout(() => {
        dispatch(toggleaddtasksmodal())
      }, 1500)
    },
  })

  // For non-admin users → only show staffs that report to them
  const assignableStaffs = userlogged.role === 'Admin'
    ? staffs
    : staffs.filter(staff => staff.assignedTo === userlogged.id)

  // ──────────────────────────────────────────────────────────────
  // FIX: Accept both string dates and timestamps from backend
  // ──────────────────────────────────────────────────────────────
  const deadlineSchema = Yup.date()
    .transform((value, originalValue) => {
      // originalValue can be: "2025-12-31", 1764268200000, or Date object
      if (originalValue === '' || originalValue == null) return null
      const parsed = new Date(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .min(new Date().setHours(0, 0, 0, 0), 'Deadline cannot be in the past')
    .required('Deadline is required')
    .typeError('Please enter a valid date')

  const validationSchema = Yup.object({
    name: Yup.string().required('Task name is required'),
    assignedTo: Yup.string().required('You must assign the task to a staff member'),
    deadline: deadlineSchema,
    description: Yup.string().required('Task description is required'),
  })

  const formik = useFormik({
    initialValues: {
      name: '',
      assignedTo: '',
      deadline: '',
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Send as ISO string (most backends prefer this)
      const payload = {
        ...values,
        deadline: new Date(values.deadline).toISOString(),
      }
      mutation.mutate(payload)
    },
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 overflow-y-auto p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='bg-[#141414] border border-[#282828] text-white w-full max-w-4xl mx-4 my-8 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden'
      >
        {(loadingStaffs || mutation.isPending) && <Spinner />}

        {/* Left decorative panel */}
        <div className='bg-gradient-to-br from-[#FF8A00] to-[#E67A00] text-black p-10 flex flex-col items-center justify-center text-center'>
          <FaTasks className='text-8xl mb-4 text-black drop-shadow-md' />
          <h2 className='text-3xl font-extrabold'>New Task</h2>
          <p className='mt-3 font-medium opacity-90'>Assign clear tasks and keep your team productive.</p>
        </div>

        {/* Form */}
        <div className='p-8 lg:p-12 w-full relative'>
          <button
            onClick={() => dispatch(toggleaddtasksmodal())}
            className='absolute top-4 right-4 text-3xl text-gray-400 hover:text-[#FF8A00] transition'
          >
            &times;
          </button>

          <h3 className='text-2xl font-bold text-white mb-6'>Create Task</h3>

          {mutation.isError && (
            <div className='bg-red-950/40 border border-red-900/50 text-red-400 p-4 rounded-xl mb-6'>
              {mutation.error?.response?.data?.message || 'Something went wrong'}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className='space-y-5'>

            {/* Task Name */}
            <div>
              <label className='block text-sm font-semibold text-gray-300 mb-1'>Task Name</label>
              <input
                type='text'
                placeholder='Enter task name'
                {...formik.getFieldProps('name')}
                className='w-full px-4 py-3 bg-[#181818] border border-[#2E2E2E] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]'
              />
              {formik.touched.name && formik.errors.name && (
                <p className='text-red-400 text-sm mt-1'>{formik.errors.name}</p>
              )}
            </div>

            {/* Assign To */}
            <div>
              <label className='block text-sm font-semibold text-gray-300 mb-1'>Assign To</label>
              <select
                {...formik.getFieldProps('assignedTo')}
                className='w-full px-4 py-3 bg-[#181818] border border-[#2E2E2E] rounded-xl text-white focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]'
              >
                <option value=''>-- Select Staff --</option>
                {assignableStaffs.map(staff => (
                  <option key={staff._id} value={staff._id} className="bg-[#181818] text-white">
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
              {formik.touched.assignedTo && formik.errors.assignedTo && (
                <p className='text-red-400 text-sm mt-1'>{formik.errors.assignedTo}</p>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className='block text-sm font-semibold text-gray-300 mb-1'>
                Deadline <span className='text-[#FF8A00]'>*</span>
              </label>
              <input
                type='date'
                min={today}
                {...formik.getFieldProps('deadline')}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.length <= 10) formik.setFieldValue('deadline', val)
                }}
                className='w-full px-4 py-3 bg-[#181818] border border-[#2E2E2E] rounded-xl text-white focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00]'
              />
              {formik.touched.deadline && formik.errors.deadline && (
                <p className='text-red-400 text-sm mt-1'>{formik.errors.deadline}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-semibold text-gray-300 mb-1'>Description</label>
              <textarea
                placeholder='Task description...'
                rows={3}
                {...formik.getFieldProps('description')}
                className='w-full px-4 py-3 bg-[#181818] border border-[#2E2E2E] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] resize-none'
              />
              {formik.touched.description && formik.errors.description && (
                <p className='text-red-400 text-sm mt-1'>{formik.errors.description}</p>
              )}
            </div>

            <button
              type='submit'
              disabled={mutation.isPending}
              className='w-full bg-gradient-to-r from-[#FF8A00] to-[#E67A00] hover:brightness-110 disabled:opacity-50 text-black font-extrabold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(255,138,0,0.3)]'
            >
              {mutation.isPending ? 'Assigning...' : 'Assign Task'}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showsuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className='bg-green-600 text-white px-12 py-6 rounded-2xl shadow-2xl text-xl font-bold'
            >
              Task Assigned Successfully!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Addtaskmodal