'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertCircle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  warningMessage?: string
  details: { label: string; value: React.ReactNode }[]
  isSubmitting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({
  isOpen,
  title,
  warningMessage,
  details,
  isSubmitting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200"
        >
          {/* Header */}
          <div className="bg-red-50 border-b border-red-100 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-950 leading-tight">{title}</h3>
              <p className="text-xs text-red-700/80 mt-0.5">
                {warningMessage || 'هذا الإجراء نهائي ولا يمكن التراجع عنه بعد الحذف.'}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="p-5 max-h-80 overflow-y-auto scrollbar-ninja space-y-3">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
              {details.map((d, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2 border-b border-gray-150 pb-2 last:border-0 last:pb-0">
                  <span className="font-bold text-gray-500 shrink-0">{d.label}:</span>
                  <span className="font-extrabold text-ninja-dark text-left leading-relaxed">{d.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-150">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>سيتم إرسال إشعار فوري بحذف هذا السجل إلى قناة المطبخ على ديسكورد.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              تراجع
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري الحذف...</span>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>تأكيد الحذف نهائياً</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
