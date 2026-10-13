import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  delete_all,
  delete_notification,
  fetchnotifications,
} from '../services/notificationsRouter';
import { useDispatch } from 'react-redux';
import {
  toggleFullnotificationmodal,
  toggleNotificationmodal,
} from '../redux/modalSlice';
import { FaTrash, FaBell } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { parseISO, isToday, isYesterday, format } from 'date-fns';

// Utility to assign background colors
const getNotificationColor = (title) => {
  switch (title) {
    case 'Follow-up Warning':
      return 'bg-yellow-600';
    case 'Follow-up Missed':
      return 'bg-red-600';
    case 'Lead Created':
      return 'bg-blue-600';
    case 'Lead Status Updated':
      return 'bg-green-600';
    case 'Next Follow-up Set':
      return 'bg-gray-600';
    case 'Team Assigned':
      return 'bg-indigo-600';
    case 'Team Unassigned':
      return 'bg-pink-600';
    case 'Lead Assigned':
      return 'bg-orange-600';
    default:
      return 'bg-gray-800';
  }
};

// Utility to group notifications
const groupNotificationsByDate = (notifications) => {
  const groups = {};

  notifications
    .slice() // avoid mutating original
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest first
    .forEach((notification) => {
      const date = parseISO(notification.createdAt);
      let label;

      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else {
        label = format(date, 'MMMM d, yyyy');
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(notification);
    });

  return groups;
};

function Fullnotificationmodal() {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();

  const [showconfirm, setshowconfirm] = useState(false);
  const [statussucceess, setstatussuccess] = useState(false);

  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['List notifications'],
    queryFn: fetchnotifications,
  });

  const deletingnotification = useMutation({
    mutationKey: ['Delete notification'],
    mutationFn: delete_notification,
    onSuccess: () => {
      queryclient.invalidateQueries(['List notifications']);
    },
  });

  const deletingall = useMutation({
    mutationKey: ['Delete all notifications'],
    mutationFn: delete_all,
    onSuccess: () => {
      queryclient.invalidateQueries(['List notifications']);
    },
  });

  const handledelete = async (id) => {
    await deletingnotification.mutateAsync(id);
  };

  const handleconfirm = () => {
    setshowconfirm(true);
  };

  const closeconfirm = () => {
    setshowconfirm(false);
  };

  const handlealldelete = async () => {
    await deletingall.mutateAsync();
    setstatussuccess(true);
    setshowconfirm(false);
    setTimeout(() => {
      setstatussuccess(false);
      dispatch(toggleFullnotificationmodal());
      dispatch(toggleNotificationmodal());
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000] p-4 sm:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-black opacity-80"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="bg-[#141414] border border-[#262626] text-white w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-[2010]"
      >
        <div className="bg-gradient-to-b from-[#FF8A00] to-[#E67A00] w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 text-black">
          <FaBell className="text-5xl sm:text-6xl md:text-[80px] mb-3 sm:mb-4 text-black" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black">All Notifications</h2>
          <p className="text-xs sm:text-sm mt-2 text-center text-black/80 font-medium">View and manage all your notifications.</p>
        </div>
        <div className="relative w-full md:w-2/3 p-4 sm:p-6 md:p-8 bg-[#141414]">
          <button
            onClick={() => dispatch(toggleFullnotificationmodal())}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl text-gray-400 hover:text-white transition"
          >
            ×
          </button>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">All Notifications</h3>

          {isError && (
            <p className="text-red-400 bg-red-950/40 border border-red-500/40 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
              Failed to load notifications.
            </p>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleconfirm}
                className="w-full sm:w-auto bg-[#FF8A00] hover:bg-[#E67A00] text-black py-2 sm:py-2.5 px-4 rounded-lg font-bold transition text-sm sm:text-base shadow-sm"
              >
                Clear All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
              {isLoading ? (
                <div className="text-center py-8 text-sm sm:text-base text-gray-400 animate-pulse">Loading...</div>
              ) : notifications && notifications.length > 0 ? (
                (() => {
                  const grouped = groupNotificationsByDate(notifications);

                  return Object.entries(grouped).map(([groupName, group]) =>
                    group.length > 0 ? (
                      <div key={groupName} className="space-y-2 mb-4">
                        <h4 className="text-sm sm:text-base font-bold text-gray-400 mb-2">{groupName}</h4>
                        {group.map((notification) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-stretch border border-[#262626] rounded-lg bg-[#181818] hover:bg-[#202020] transition-all duration-200 shadow-sm overflow-hidden"
                          >
                            <div className={`w-3 ${getNotificationColor(notification.title)}`} />
                            <div className="flex-1 p-3 sm:p-4 flex justify-between items-center">
                              <div>
                                <p className="text-sm sm:text-base font-semibold text-white">{notification.title}</p>
                                <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                                <p className="text-xs text-[#FF8A00] mt-1 font-medium">
                                  {format(parseISO(notification.createdAt), 'hh:mm a')}
                                </p>
                              </div>
                              <button
                                onClick={() => handledelete(notification._id)}
                                className="text-gray-400 hover:text-red-400 text-sm transition-colors duration-150 p-2 rounded-full hover:bg-[#262626]"
                                aria-label={`Delete notification: ${notification.title}`}
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : null
                  );
                })()
              ) : (
                <div className="text-center py-8 text-sm sm:text-base text-gray-400">No notifications available</div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showconfirm && (
            <motion.div
              className="fixed inset-0 z-[2020] flex items-center justify-center p-4 sm:p-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="bg-[#141414] border border-[#262626] text-white w-full max-w-md sm:max-w-lg mx-auto rounded-2xl shadow-2xl flex flex-col p-4 sm:p-6 md:p-8 relative z-[2030]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Are you sure?</h3>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handlealldelete}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 px-6 rounded-lg font-bold transition text-sm sm:text-base"
                  >
                    Yes
                  </button>
                  <button
                    onClick={closeconfirm}
                    className="bg-[#262626] hover:bg-[#333333] text-white py-2 sm:py-3 px-6 rounded-lg font-bold transition text-sm sm:text-base"
                  >
                    No
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {statussucceess && (
            <motion.div
              className="fixed inset-0 z-[2020] flex items-center justify-center p-4 sm:p-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="relative z-[2030] bg-[#181818] border border-[#FF8A00] text-[#FF8A00] px-6 sm:px-10 py-4 sm:py-6 rounded-2xl shadow-2xl text-sm sm:text-base font-bold w-full max-w-xs sm:max-w-sm h-[100px] sm:h-[120px] flex items-center justify-center text-center"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                ✅ All notifications deleted successfully!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Fullnotificationmodal;