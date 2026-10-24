'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Check, X } from 'lucide-react'

export interface ChangeDiff {
  field: string
  oldVal: string
  newVal: string
}

interface DiffConfirmModalProps {
  isOpen: boolean
  title: string
  description?: string
  changes: ChangeDiff[]
  isSubmitting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DiffConfirmModal({
  isOpen,
  title,
  description,
  changes,
  isSubmitting,
  onConfirm,
  onCancel,
}: DiffConfirmModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-150"
        >
          {/* Header */}
          <div className="bg-amber-500/10 border-b border-amber-200/50 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-ninja-dark leading-tight">{title}</h3>
              {description && (
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          {/* Diff Changes Table */}
          <div className="p-5 max-h-80 overflow-y-auto scrollbar-ninja space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              ملخص التغييرات المطلوب تأكيدها ({changes.length}):
            </p>

            <div className="space-y-2">
              {changes.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-2xl p-3 border border-gray-200 text-xs space-y-1.5"
                >
                  <span className="font-extrabold text-gray-700 block text-xs">
                    📌 {c.field}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-red-50 text-red-700 p-2 rounded-xl border border-red-200 break-words">
                      <span className="font-bold block text-[10px] text-red-400 mb-0.5">القيمة السابقة:</span>
                      <span>{c.oldVal || '(فارغ)'}</span>
                    </div>
                    <div className="bg-green-50 text-green-700 p-2 rounded-xl border border-green-200 break-words">
                      <span className="font-bold block text-[10px] text-green-400 mb-0.5">القيمة الجديدة:</span>
                      <span>{c.newVal || '(فارغ)'}</span>
                    </div>
                  </div>
                </div>
              ))}
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
              إلغاء التعديل
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-ninja-red hover:bg-ninja-red/90 text-white shadow-ninja transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>تأكيد وحفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
