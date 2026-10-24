'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Info } from 'lucide-react'
import type { Addon } from '@/types'
import { useTranslation } from '@/lib/useTranslation'

interface AddonsShowcaseProps {
  addons: Addon[]
}

const ADDON_EMOJIS: Record<string, string> = {
  'إضافة بيكون': '🥓',
  'Bacon Add-on': '🥓',
  'إضافة موتزاريلا': '🧀',
  'Mozzarella Add-on': '🧀',
  'إضافة مشروم': '🍄',
  'Mushroom Add-on': '🍄',
  'إضافة تركي': '🍗',
  'Turkey Add-on': '🍗',
  'إضافة بيبروني': '🍕',
  'Pepperoni Add-on': '🍕',
  'شريحة جبن': '🧀',
  'Cheese Slice': '🧀',
  'باكيت فرايز': '🍟',
  'Fries Packet': '🍟',
  'كاب صوص': '🥫',
  'Sauce Cup': '🥫',
  'مياه معدنية': '💧',
  'Mineral Water': '💧',
  'مياه غازية': '🥤',
  'Sparkling Water': '🥤',
  'كرمليز أوبيون': '🧅',
  'Caramelized Onion': '🧅',
  'إضافة هاليبنو': '🌶️',
  'Jalapeño Add-on': '🌶️',
}

export function AddonsShowcase({ addons }: AddonsShowcaseProps) {
  const { t, isArabic } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Informative Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 sm:p-6 flex items-start gap-4 shadow-sm"
      >
        <div className="w-10 h-10 rounded-2xl bg-ninja-yellow/20 flex items-center justify-center shrink-0 text-ninja-dark">
          <Sparkles size={22} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-ninja-dark leading-tight">
            {t.addonsShowcaseTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            {t.addonsShowcaseSubtitle}
          </p>
        </div>
      </motion.div>

      {/* Grid of Addons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {addons.map((addon) => {
          const emoji =
            ADDON_EMOJIS[addon.name_ar] ||
            ADDON_EMOJIS[addon.name_en] ||
            '✨'
          const name = isArabic ? addon.name_ar : (addon.name_en || addon.name_ar)
          const secondaryName = isArabic ? addon.name_en : addon.name_ar

          const isAvailable = addon.is_available !== false
          return (
            <motion.div
              key={addon.id}
              whileHover={{ y: isAvailable ? -2 : 0 }}
              className={`bg-white rounded-2xl p-4 border shadow-card flex flex-col justify-between transition-all ${
                isAvailable
                  ? 'border-gray-150'
                  : 'border-red-200 bg-red-50/20 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-2">
                  <span className="text-3xl select-none">{emoji}</span>
                  {!isAvailable && (
                    <span className="text-[10px] text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">
                      {isArabic ? 'غير متوفر' : 'Out of stock'}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-sm text-ninja-dark leading-snug">
                  {name}
                </h4>
                {secondaryName && (
                  <span className="text-[11px] text-gray-400 block font-medium mt-0.5">
                    {secondaryName}
                  </span>
                )}
              </div>
              <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold">{t.priceLabel}</span>
                <span className="text-sm font-black text-ninja-red">
                  +{addon.price} {t.currency}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
