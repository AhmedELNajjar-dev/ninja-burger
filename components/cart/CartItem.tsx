'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType, SIZE_LABELS } from '@/types';
import { useTranslation } from '@/lib/useTranslation';

interface CartItemProps {
  item: CartItemType;
  onRemove: (cartId: string) => void;
  onQuantityChange: (cartId: string, qty: number) => void;
}

export function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  const { t, isArabic } = useTranslation();

  const sizeLabel = isArabic
    ? SIZE_LABELS[item.size]
    : item.size === 'single'
    ? 'Single'
    : item.size === 'double'
    ? 'Double'
    : 'Triple';

  const name = isArabic ? item.name_ar : (item.name_en || item.name_ar);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="flex gap-4 p-4 bg-white border-b border-gray-100 last:border-0"
    >
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gray-900">{name}</h4>
            <span className="inline-block mt-1 text-sm font-medium text-ninja-red bg-red-50 px-2 py-0.5 rounded">
              {sizeLabel}
            </span>
          </div>
          <span className="font-black text-gray-900">{item.lineTotal} {t.currency}</span>
        </div>

        {item.addons.length > 0 && (
          <ul className="text-sm text-gray-500 space-y-0.5">
            {item.addons.map((addon) => (
              <li key={addon.id} className="flex justify-between">
                <span>+ {isArabic ? addon.name_ar : (addon.name_ar)}</span>
                <span>{addon.price} {t.currency}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => onQuantityChange(item.cartId, Math.max(1, item.quantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-ninja-red cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.cartId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-ninja-red cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.cartId)}
            className="text-gray-400 hover:text-ninja-red transition-colors p-1 cursor-pointer"
            title="حذف"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
