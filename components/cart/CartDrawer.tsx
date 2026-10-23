'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from './CartItem';
import { Button } from '../ui/Button';
import { useTranslation } from '@/lib/useTranslation';

export function CartDrawer() {
  const { items, isCartOpen, removeItem, updateQuantity, getTotal } = useCartStore();
  const setIsCartOpen = (open: boolean) => useCartStore.setState({ isCartOpen: open });
  const openCheckout = () => useCartStore.setState({ isCheckoutOpen: true, isCartOpen: false });
  const { t, isArabic } = useTranslation();

  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  const total = getTotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: isArabic ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isArabic ? 'right-0' : 'left-0'} h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-ninja-red" />
                <h2 className="text-xl font-black text-gray-900">{t.cart}</h2>
                <span className="bg-ninja-yellow text-red-900 px-2 py-0.5 rounded-full text-xs font-bold">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-medium">{t.cartEmpty}</p>
                  <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                    {t.browseMenu}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItem
                        key={item.cartId}
                        item={item}
                        onRemove={removeItem}
                        onQuantityChange={updateQuantity}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 sm:p-6 pb-8 sm:pb-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-bold text-gray-600 text-sm sm:text-base">{t.subtotal}</span>
                  <span className="text-2xl font-black text-ninja-red">{total} {t.currency}</span>
                </div>
                <Button className="w-full text-base sm:text-lg h-12 sm:h-14 font-black shadow-ninja" onClick={openCheckout}>
                  {t.checkout} 🚀
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
