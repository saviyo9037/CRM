import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaExpand, FaCompress, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const ScreenshotViewer = ({ images = [], initialIndex = 0, onClose = () => {} }) => {
  const [index, setIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => setIndex(initialIndex), [initialIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(images.length - 1, i + 1)), [images.length])

  if (!images || images.length === 0) return null

  const current = typeof images[0] === 'string' ? { src: images[index] } : images[index]

  return (
    <AnimatePresence>
      <motion.div
        key="screenshot-viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className={`relative w-full max-w-5xl bg-[#141414] border border-[#262626] text-white rounded-2xl p-5 shadow-2xl ${isFullscreen ? 'h-screen max-w-none' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{current?.title ?? 'Image'}</h3>
              {current?.transactionDate && (
                <p className="text-sm text-gray-400 mt-0.5">{new Date(current.transactionDate).toLocaleString()}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {images.length > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={prev} className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors">
                    <FaChevronLeft />
                  </button>
                  <span className="text-sm font-semibold text-[#FF8A00]">{index + 1}/{images.length}</span>
                  <button onClick={next} className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors">
                    <FaChevronRight />
                  </button>
                </div>
              )}

              {current?.src && (
                <a
                  href={current.src}
                  download
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors"
                >
                  <FaDownload />
                </a>
              )}

              <button
                onClick={() => setIsFullscreen((s) => !s)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>

              <button onClick={onClose} className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#0A0A0A] rounded-xl overflow-hidden border border-[#202020]">
            <div className={`${isFullscreen ? 'w-full h-[80vh]' : 'w-[320px] h-[320px] sm:w-[450px] sm:h-[450px]'} flex items-center justify-center p-2`}> 
              <img
                src={current.src}
                alt={current?.title ?? 'receipt'}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {current?.paidAmount != null && (
            <div className="mt-4 text-right">
              <div className="text-green-400 font-bold text-lg">{current.paidAmount}</div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ScreenshotViewer
