import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleAssignleadsmodal } from '../redux/modalSlice'
import { motion } from 'framer-motion'
import { assignleads, listleads } from '../services/leadsRouter'
import Spinner from './Spinner'

function Assignleadsmodal() {
  const dispatch = useDispatch()
  const queryclient = useQueryClient()
  const staffId = useSelector((state) => state.modal.selectedStaffId)
  const [filterleads, setfilterleads] = useState('All')
  const [datefilter, setdatefilter] = useState('Date')
  const [selectdatefilter, setselectdatefilter] = useState(null)
  const [daterangefilter, setdaterangefilter] = useState({ start: null, end: null })
  const [searchText, setsearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const leadsPerPage = 10

  const { data: fetchleads, isLoading } = useQuery({
    queryKey: [
      'Fetch Leads',
      currentPage,
      filterleads,
      searchText,
      datefilter,
      selectdatefilter,
      daterangefilter,
    ],
    queryFn: () =>
      listleads({
        page: currentPage,
        limit: leadsPerPage,
        filterleads: filterleads !== 'All' ? filterleads : undefined,
        searchText,
        date: datefilter !== 'Date' ? datefilter : undefined,
        startDate:
          datefilter === 'custom' && selectdatefilter
            ? selectdatefilter.toISOString()
            : datefilter === 'range' && daterangefilter.start
            ? daterangefilter.start.toISOString()
            : undefined,
        endDate:
          datefilter === 'range' && daterangefilter.end
            ? daterangefilter.end.toISOString()
            : undefined,
      }),
    keepPreviousData: true,
  })

  const assigningleads = useMutation({
    mutationKey: ['AssignLeads'],
    mutationFn: assignleads,
    onSuccess: () => {
      queryclient.invalidateQueries(['Fetch Leads'])
    },
  })

  const handleassignleads = async (leadId, checked) => {
    await assigningleads.mutateAsync({
      leadId,
      staffId: staffId,
      isAssigning: checked ? true : false,
    })
  }

  const totalLeads = fetchleads?.totalLeads || 0
  const totalPages = fetchleads?.totalPages || 1

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4 sm:p-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="bg-[#141414] border border-[#282828] text-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-3xl md:max-w-6xl text-center relative max-h-[90vh] overflow-hidden"
      >
        {assigningleads.isPending && <Spinner />}

        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-6 text-2xl md:text-3xl font-bold text-gray-400 hover:text-[#FF8A00] transition"
          onClick={() => dispatch(toggleAssignleadsmodal(null))}
        >
          &times;
        </button>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight flex items-center justify-center gap-2">
          <span className="text-[#FF8A00]">👥</span> Assign Leads
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-end mb-4">
          <div>
            <input
              key="search-input"
              type="text"
              value={searchText}
              onChange={(e) => setsearchText(e.target.value)}
              className="px-4 py-2 sm:px-5 sm:py-2 text-sm rounded-xl border border-[#2E2E2E] bg-[#181818] shadow-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none transition w-full sm:w-auto"
              placeholder="Search..."
            />
          </div>

          <div>
            <select
              value={datefilter}
              onChange={(e) => setdatefilter(e.target.value)}
              className="min-w-[140px] px-4 py-2 sm:px-5 sm:py-2 text-sm rounded-xl border border-[#2E2E2E] bg-[#181818] shadow-sm text-white focus:ring-1 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none transition sm:w-auto"
            >
              <option value="Date" className="bg-[#181818]">Date</option>
              <option value="today" className="bg-[#181818]">Today</option>
              <option value="yesterday" className="bg-[#181818]">Yesterday</option>
              <option value="custom" className="bg-[#181818]">Search from date</option>
              <option value="range" className="bg-[#181818]">Search from range of date</option>
            </select>
          </div>

          {datefilter === 'custom' && (
            <div>
              <input
                type="date"
                onChange={(e) => setselectdatefilter(new Date(e.target.value))}
                className="px-3 py-2 text-sm rounded-xl border border-[#2E2E2E] bg-[#181818] text-white focus:ring-1 focus:ring-[#FF8A00] outline-none"
              />
            </div>
          )}

          {datefilter === 'range' && (
            <div className="flex gap-2">
              <input
                type="date"
                onChange={(e) =>
                  setdaterangefilter({ ...daterangefilter, start: new Date(e.target.value) })
                }
                className="px-3 py-2 text-sm rounded-xl border border-[#2E2E2E] bg-[#181818] text-white focus:ring-1 focus:ring-[#FF8A00] outline-none"
              />
              <input
                type="date"
                onChange={(e) =>
                  setdaterangefilter({ ...daterangefilter, end: new Date(e.target.value) })
                }
                className="px-3 py-2 text-sm rounded-xl border border-[#2E2E2E] bg-[#181818] text-white focus:ring-1 focus:ring-[#FF8A00] outline-none"
              />
            </div>
          )}

          <div>
            <select
              className="px-4 py-2 sm:px-5 sm:py-2 text-sm rounded-xl border border-[#2E2E2E] bg-[#181818] shadow-sm text-white focus:ring-1 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none transition w-full sm:w-auto"
              value={filterleads}
              onChange={(e) => setfilterleads(e.target.value)}
            >
              <option className="bg-[#181818]">All</option>
              <option value="Assigned" className="bg-[#181818]">Assigned</option>
              <option value="Unassigned" className="bg-[#181818]">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[60vh] sm:max-h-[65vh] rounded-xl border border-[#262626]">
          {isLoading ? (
            <Spinner />
          ) : fetchleads?.leads?.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left text-white min-w-[600px]">
                  <thead className="text-xs uppercase bg-gradient-to-r from-[#FF8A00] to-[#E67A00] text-black sticky top-0 z-10 shadow font-bold">
                    <tr>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-black">#</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-black">Name</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-black">Phone</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-black">Interest</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-black">Location</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-center text-black">
                        Assign
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#222222]">
                    {fetchleads?.leads?.map((lead, index) => (
                      <tr key={lead._id} className={`${index % 2 === 0 ? 'bg-[#121212]' : 'bg-[#161616]'} hover:bg-[#1E1E1E] transition`}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-[#FF8A00] text-xs sm:text-sm">
                          {(currentPage - 1) * leadsPerPage + (index + 1)}
                        </td>

                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-white">
                          {lead.name}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-300">
                          {lead.mobile}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-300">{lead.interestedproduct || "N/A"}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-400">
                          {lead.location || 'N/A'}
                        </td>

                        <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={lead.assignedTo?._id === staffId}
                              disabled={
                                lead.assignedTo && lead.assignedTo?._id !== staffId
                              }
                              onChange={(e) =>
                                handleassignleads(lead._id, e.target.checked)
                              }
                            />
                            <div
                              className={`w-9 sm:w-11 h-5 sm:h-6 rounded-full transition-colors duration-300 
                                ${
                                  lead.assignedTo &&
                                  lead.assignedTo?._id !== staffId
                                    ? 'bg-gray-300'
                                    : 'peer-checked:bg-green-500 bg-red-500'
                                } 
                                relative after:absolute after:top-[1px] sm:after:top-[2px] after:left-[1px] sm:after:left-[2px] after:bg-white after:border 
                                after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all 
                                peer-checked:after:translate-x-full`}
                            ></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 p-3 sm:p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow'
                    }`}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                    )
                    .map((page, index, arr) => {
                      const showEllipsis = index > 0 && page - arr[index - 1] > 1

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-400 select-none">…</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      )
                    })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow'
                    }`}
                  >
                    Next →
                  </button>

                  <div className="flex items-center gap-2 ml-4">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      placeholder="Page #"
                      className="w-16 sm:w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const page = Number(e.target.value)
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          } else {
                            alert(`Enter a number between 1 and ${totalPages}`)
                          }
                        }
                      }}
                    />
                    <span className="text-xs sm:text-sm text-gray-500">
                      Page <strong>{currentPage}</strong> of {totalPages}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center text-sm sm:text-lg py-4 sm:py-6">
              {totalLeads > 0
                ? `No leads available on page ${currentPage}. Try adjusting filters or navigating to another page.`
                : 'No Leads Available'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Assignleadsmodal
