'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Plus, Check, X, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react'
import type { Addon, AddonOption } from '@/types'
import { useTranslation } from '@/lib/useTranslation'
import { useCartStore } from '@/store/cartStore'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { DEFAULT_SAUCE_OPTIONS, DEFAULT_DRINK_OPTIONS, isSandwichTopping } from '@/lib/constants/menuData'

interface AddonsShowcaseProps {
  addons: Addon[]
  isLoggedIn?: boolean
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
  'Soft Drinks': '🥤',
  'كرمليز أوبيون': '🧅',
  'Caramelized Onion': '🧅',
  'إضافة هاليبنو': '🌶️',
  'Jalapeño Add-on': '🌶️',
}

export function AddonsShowcase({ addons, isLoggedIn }: AddonsShowcaseProps) {
  const router = useRouter()
  const { t, isArabic } = useTranslation()
  const addItem = useCartStore((state) => state.addItem)

  // Only display standalone items (sides, drinks, sauce cups).
  // Sandwich toppings are strictly customized inside the sandwich card!
  const standaloneAddons = addons.filter((addon) => !isSandwichTopping(addon))

  // Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Flavor selection modal state
  const [activeAddonWithOptions, setActiveAddonWithOptions] = useState<Addon | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  // Helper to get options for an addon (with fallback to default sauce/drink options if empty)
  const getAddonOptions = (addon: Addon): AddonOption[] => {
    if (addon.options && addon.options.length > 0) {
      return addon.options
    }
    const lowerEn = (addon.name_en || '').toLowerCase()
    const nameAr = addon.name_ar || ''

    if (addon.id === 'addon-8' || lowerEn.includes('sauce') || nameAr.includes('صوص')) {
      return DEFAULT_SAUCE_OPTIONS
    }
    if (addon.id === 'addon-10' || lowerEn.includes('drink') || lowerEn.includes('sparkling') || nameAr.includes('غازية')) {
      return DEFAULT_DRINK_OPTIONS
    }
    return []
  }

  // Handle direct add for items without options
  const handleDirectAdd = (addon: Addon) => {
    if (!isLoggedIn) {
      setShowAuthModal(true)
      return
    }

    addItem({
      menuItemId: addon.id,
      name_ar: addon.name_ar,
      name_en: addon.name_en,
      size: 'single',
      unitPrice: addon.price,
      addons: [],
    })

    setJustAddedId(addon.id)
    setTimeout(() => setJustAddedId(null), 1500)
  }

  // Handle opening flavor modal for items with options
  const handleOpenOptionModal = (addon: Addon) => {
    if (!isLoggedIn) {
      setShowAuthModal(true)
      return
    }

    const opts = getAddonOptions(addon)
    // Find first available option as default selection
    const firstAvailable = opts.find((o) => o.is_available !== false)
    setSelectedOptionId(firstAvailable ? firstAvailable.id : null)
    setActiveAddonWithOptions(addon)
  }

  // Handle confirming flavor and adding to cart
  const handleConfirmOptionAdd = () => {
    if (!activeAddonWithOptions) return
    if (!isLoggedIn) {
      setShowAuthModal(true)
      return
    }

    const opts = getAddonOptions(activeAddonWithOptions)
    const chosenOpt = opts.find((o) => o.id === selectedOptionId)

    if (!chosenOpt || chosenOpt.is_available === false) {
      alert(isArabic ? 'يرجى اختيار نكهة متوفرة للطلب' : 'Please select an available flavor')
      return
    }

    const fullNameAr = `${activeAddonWithOptions.name_ar} (${chosenOpt.name_ar})`
    const fullNameEn = `${activeAddonWithOptions.name_en} (${chosenOpt.name_en})`

    addItem({
      menuItemId: activeAddonWithOptions.id,
      name_ar: fullNameAr,
      name_en: fullNameEn,
      size: 'single',
      unitPrice: activeAddonWithOptions.price,
      addons: [],
    })

    const addedAddonId = activeAddonWithOptions.id
    setActiveAddonWithOptions(null)
    setSelectedOptionId(null)

    setJustAddedId(addedAddonId)
    setTimeout(() => setJustAddedId(null), 1500)
  }

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

      {/* Grid of Standalone Items (Sides, Drinks, Sauces ONLY - No Sandwich Toppings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {standaloneAddons.map((addon) => {
          const emoji =
            ADDON_EMOJIS[addon.name_ar] ||
            ADDON_EMOJIS[addon.name_en] ||
            '✨'
          const name = isArabic ? addon.name_ar : (addon.name_en || addon.name_ar)
          const secondaryName = isArabic ? addon.name_en : addon.name_ar
          const isAvailable = addon.is_available !== false

          const optionsList = getAddonOptions(addon)
          const hasOptions = optionsList.length > 0
          const isAdded = justAddedId === addon.id

          return (
            <motion.div
              key={addon.id}
              whileHover={{ y: isAvailable ? -2 : 0 }}
              className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-card flex flex-col justify-between transition-all ${
                isAvailable
                  ? 'border-gray-150 hover:shadow-ninja-lg'
                  : 'border-red-200 bg-red-50/20 opacity-70'
              }`}
            >
              <div>
                {/* Top Row: Emoji & Status Badge */}
                <div className="flex items-start justify-between gap-1 mb-2.5">
                  <span className="text-4xl select-none filter drop-shadow-xs">{emoji}</span>
                  {!isAvailable ? (
                    <span className="text-[10px] text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">
                      {isArabic ? 'غير متوفر' : 'Out of stock'}
                    </span>
                  ) : hasOptions ? (
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      {isArabic ? 'متعدد النكهات' : 'Multiple Flavors'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      {isArabic ? 'طلب مباشر' : 'Direct Order'}
                    </span>
                  )}
                </div>

                {/* Names */}
                <h4 className="font-black text-base text-ninja-dark leading-snug">
                  {name}
                </h4>
                {secondaryName && (
                  <span className="text-xs text-gray-400 block font-medium mt-0.5">
                    {secondaryName}
                  </span>
                )}


                {hasOptions && isAvailable && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-2 leading-relaxed">
                    {isArabic
                      ? `متاح بـ ${optionsList.filter((o) => o.is_available !== false).length} نكهات/أنواع مختلفة`
                      : `Available in ${optionsList.filter((o) => o.is_available !== false).length} flavors`}
                  </p>
                )}
              </div>

              {/* Bottom: Price + Action Button */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold">{t.priceLabel}</span>
                  <span className="text-lg font-black text-ninja-red">
                    {addon.price} {t.currency}
                  </span>
                </div>

                {/* Order Button */}
                {!isAvailable ? (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    {isArabic ? 'غير متوفر حالياً' : 'Currently Unavailable'}
                  </button>
                ) : hasOptions ? (
                  <button
                    type="button"
                    onClick={() => handleOpenOptionModal(addon)}
                    className="btn-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-ninja cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{isArabic ? 'اختر النكهة وأضف للسلة' : 'Choose Flavor & Add'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDirectAdd(addon)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-ninja-red hover:bg-ninja-red/90 text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} strokeWidth={3} />
                        <span>{t.addedToCart}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>{t.addToCart}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Flavor / Variant Selection Modal ─────────────────────────────────── */}
      {activeAddonWithOptions && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveAddonWithOptions(null)
            setSelectedOptionId(null)
          }}
          title={
            isArabic
              ? `${activeAddonWithOptions.name_ar} — اختر النوع المفضّل`
              : `${activeAddonWithOptions.name_en} — Choose Your Flavor`
          }
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl select-none">
                  {ADDON_EMOJIS[activeAddonWithOptions.name_ar] || '🥫'}
                </span>
                <div>
                  <h4 className="text-sm font-black text-ninja-dark leading-tight">
                    {isArabic ? activeAddonWithOptions.name_ar : activeAddonWithOptions.name_en}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    {t.selectFlavorNotice}
                  </p>
                </div>
              </div>
              <span className="text-base font-black text-ninja-red shrink-0">
                {activeAddonWithOptions.price} {t.currency}
              </span>
            </div>

            {/* Options Selection List */}
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-ninja pe-1">
              {getAddonOptions(activeAddonWithOptions).map((option) => {
                const isAvail = option.is_available !== false
                const isSelected = selectedOptionId === option.id
                const optName = isArabic ? option.name_ar : option.name_en
                const optSecondary = isArabic ? option.name_en : option.name_ar

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => {
                      if (isAvail) setSelectedOptionId(option.id)
                    }}
                    className={`w-full p-3 rounded-2xl border text-start flex items-center justify-between transition-all ${
                      !isAvail
                        ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed select-none'
                        : isSelected
                        ? 'border-ninja-red bg-red-50/50 shadow-sm cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          !isAvail
                            ? 'border-gray-300 bg-gray-200'
                            : isSelected
                            ? 'border-ninja-red bg-ninja-red text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-ninja-dark leading-snug">
                          {optName}
                        </div>
                        {optSecondary && (
                          <div className="text-[11px] text-gray-400 font-medium">
                            {optSecondary}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAvail && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100/90 px-2 py-0.5 rounded-full">
                        {isArabic ? 'غير متوفر' : 'Unavailable'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-150 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveAddonWithOptions(null)
                  setSelectedOptionId(null)
                }}
              >
                {t.close}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedOptionId}
                onClick={handleConfirmOptionAdd}
                className="flex items-center gap-1.5"
              >
                <ShoppingBag size={15} />
                <span>{t.addToCartWithOption}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Auth Required Modal ──────────────────────────────────────────────── */}
      {showAuthModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAuthModal(false)}
          title={isArabic ? 'تسجيل الدخول مطلوب' : 'Login Required'}
        >
          <div className="text-center py-4 space-y-4">
            <p className="text-gray-600 text-sm">
              {isArabic
                ? 'يرجى تسجيل الدخول أو إنشاء حساب جديد لتتمكن من إضافة الأصناف إلى السلة ومتابعة الطلب.'
                : 'Please login or create an account to add items to your cart and place orders.'}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthModal(false)}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/login')}
              >
                {isArabic ? 'تسجيل الدخول الآن 🚀' : 'Login Now 🚀'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
