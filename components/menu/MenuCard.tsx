'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Plus, Sparkles } from 'lucide-react';
import { MenuItem, Addon, ItemSize, SIZE_LABELS } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { cn } from '../ui/cn';
import { Button } from '../ui/Button';
import { useTranslation } from '@/lib/useTranslation';
import { getLocalizedDescription } from '@/lib/menuTranslations';
import { isSandwichTopping } from '@/lib/constants/menuData';

interface MenuCardProps {
  item: MenuItem;
  addons: Addon[];
  isLoggedIn?: boolean;
}

export function MenuCard({ item, addons, isLoggedIn }: MenuCardProps) {
  const router = useRouter();
  const { t, isArabic } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<ItemSize>('single');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [showAddons, setShowAddons] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const sizes: { size: ItemSize; price: number }[] = [
    { size: 'single' as ItemSize, price: item.price_single },
    { size: 'double' as ItemSize, price: item.price_double ?? null },
    { size: 'triple' as ItemSize, price: item.price_triple ?? null },
  ].filter((s): s is { size: ItemSize; price: number } => s.price !== null && s.price > 0);

  // If selected size is not in available sizes, default to first available
  const effectiveSize = sizes.some(s => s.size === selectedSize)
    ? selectedSize
    : (sizes[0]?.size ?? 'single');

  // Only show toppings (exclude standalone sides & drinks like soft drinks, fries packet, sauce cup, water)
  const toppings = addons.filter(isSandwichTopping);

  const currentPrice = sizes.find(s => s.size === effectiveSize)?.price || item.price_single;
  const addonsTotal = toppings
    .filter(a => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const totalPrice = currentPrice + addonsTotal;

  const toggleAddon = (id: string) => {
    const newSet = new Set(selectedAddons);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAddons(newSet);
  };

  const handleAdd = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    const chosenAddons = toppings
      .filter(a => selectedAddons.has(a.id))
      .map(a => ({ id: a.id, name_ar: a.name_ar, price: a.price }));

    addItem({
      menuItemId: item.id,
      name_ar: item.name_ar,
      name_en: item.name_en,
      size: effectiveSize,
      unitPrice: currentPrice,
      addons: chosenAddons,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden flex flex-col transition-all duration-200",
      !item.is_available
        ? "opacity-65 grayscale-[35%] border-gray-200 select-none"
        : "hover:shadow-ninja-lg hover:-translate-y-0.5"
    )}>
      {/* Food Image / Placeholder */}
      <div className="h-44 sm:h-48 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 relative flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name_ar}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-center p-4">
            <span className="text-6xl sm:text-7xl select-none filter drop-shadow-md">🍔</span>
            <div className="mt-1 text-xs font-bold text-ninja-red/70 uppercase tracking-widest">
              Ninja Recipe
            </div>
          </div>
        )}

        {/* Brand red accent stripe */}
        <div className="absolute top-3 end-3 bg-ninja-red text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
          {t.freshDaily}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-black text-ninja-dark leading-tight">
              {isArabic ? item.name_ar : (item.name_en || item.name_ar)}
            </h3>
            <span className="text-xs text-gray-400 font-semibold shrink-0">
              {isArabic ? item.name_en : item.name_ar}
            </span>
          </div>

          {(() => {
            const localizedDesc = getLocalizedDescription(
              item.name_en,
              item.name_ar,
              item.description_ar,
              isArabic,
              item.description_en
            );
            return localizedDesc ? (
              <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {localizedDesc}
              </p>
            ) : null;
          })()}
        </div>

        {/* Sizes Selector (if multiple tiers exist) */}
        {sizes.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              {t.sizeLabel}:
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-gray-100/70 p-1 rounded-2xl">
              {sizes.map(({ size, price }) => {
                const isSelected = effectiveSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'py-1.5 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5',
                      isSelected
                        ? 'bg-ninja-red text-white shadow-sm'
                        : 'text-gray-600 hover:text-ninja-dark'
                    )}
                  >
                    <span>{isArabic ? SIZE_LABELS[size] : (size === 'single' ? 'Single' : size === 'double' ? 'Double' : 'Triple')}</span>
                    <span className={cn('text-[10px] opacity-80', isSelected ? 'text-white' : 'text-gray-500')}>
                      {price} {t.currency}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Add-ons section */}
        {toppings.length > 0 && (
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/50">
            <button
              type="button"
              onClick={() => setShowAddons((prev) => !prev)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-gray-700 hover:text-ninja-red transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-ninja-yellow" />
                <span>{t.customizeAddons}</span>
                {selectedAddons.size > 0 && (
                  <span className="bg-ninja-yellow text-ninja-dark text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {selectedAddons.size} {t.addonsSelected}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-[11px] font-normal">
                  {showAddons ? t.close : `(${addons.length} ${t.addonsAvailable})`}
                </span>
                {showAddons ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Expandable Addon Checklist */}
            {showAddons && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 pb-3 pt-1 border-t border-gray-150 max-h-48 overflow-y-auto scrollbar-ninja space-y-1.5"
              >
                {toppings.map((addon) => {
                  const isChecked = selectedAddons.has(addon.id);
                  const isAvailable = addon.is_available !== false;
                  return (
                    <label
                      key={addon.id}
                      onClick={() => {
                        if (isAvailable && item.is_available) {
                          toggleAddon(addon.id);
                        }
                      }}
                      className={cn(
                        'flex items-center justify-between p-1.5 rounded-xl text-xs transition-colors',
                        !isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer',
                        isChecked ? 'bg-red-50 text-ninja-red font-bold' : isAvailable ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                            !isAvailable ? 'border-gray-200 bg-gray-100' : isChecked ? 'bg-ninja-red border-ninja-red text-white' : 'border-gray-300'
                          )}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span>{isArabic ? addon.name_ar : (addon.name_en || addon.name_ar)}</span>
                        {!isAvailable && (
                          <span className="text-[10px] text-red-500 font-bold bg-red-100/80 px-1.5 py-0.2 rounded-md">
                            {isArabic ? 'غير متوفر' : 'Out of stock'}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 font-bold">+{addon.price} {t.currency}</span>
                    </label>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* Bottom Price + Add to Cart action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold leading-none mb-0.5">
              {t.priceLabel}
            </span>
            <span className="text-2xl font-black text-ninja-dark leading-none">
              {totalPrice} <span className="text-sm font-bold text-ninja-red">{t.currency}</span>
            </span>
          </div>

          <motion.div whileTap={{ scale: 0.94 }}>
            <Button
              onClick={handleAdd}
              className={cn(
                'min-w-[125px] sm:min-w-[135px] text-sm py-2.5 px-4 rounded-xl shadow-ninja transition-all font-bold',
                isAdded ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'
              )}
              disabled={!item.is_available}
            >
              {isAdded ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                  <Check size={16} strokeWidth={3} />
                  <span>{t.addedToCart}</span>
                </motion.div>
              ) : item.is_available ? (
                <span className="flex items-center gap-1.5">
                  <Plus size={16} strokeWidth={3} />
                  <span>{t.addToCart}</span>
                </span>
              ) : (
                t.outOfStock
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 bg-red-100 text-ninja-red rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                🔒
              </div>
              <h3 className="text-xl font-black text-ninja-dark">تسجيل الدخول مطلوب</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                لتتمكن من إضافة <span className="font-bold text-ninja-dark">{item.name_ar}</span> إلى سلتك وحفظ طلباتك في حسابك، يُرجى تسجيل الدخول أولاً.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/login?redirect=/')}
                  className="btn-primary w-full py-3 text-base shadow-ninja"
                >
                  تسجيل الدخول 🚀
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="w-full py-2.5 text-sm font-bold text-ninja-red hover:underline"
                >
                  ليس لديك حساب؟ إنشاء حساب جديد
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
