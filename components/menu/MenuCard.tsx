'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { MenuItem, Addon, ItemSize, SIZE_LABELS } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { cn } from '../ui/cn';
import { Button } from '../ui/Button';

interface MenuCardProps {
  item: MenuItem;
  addons: Addon[];
}

export function MenuCard({ item, addons }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<ItemSize>('single');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [isAdded, setIsAdded] = useState(false);

  const sizes: { size: ItemSize; price: number | null }[] = [
    { size: 'single', price: item.price_single },
    { size: 'double', price: item.price_double },
    { size: 'triple', price: item.price_triple },
  ].filter(s => s.price !== null);

  const toggleAddon = (id: string) => {
    const newSet = new Set(selectedAddons);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAddons(newSet);
  };

  const currentPrice = sizes.find(s => s.size === selectedSize)?.price || item.price_single;
  const addonsTotal = addons
    .filter(a => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const totalPrice = currentPrice + addonsTotal;

  const handleAdd = () => {
    const chosenAddons = addons
      .filter(a => selectedAddons.has(a.id))
      .map(a => ({ id: a.id, name_ar: a.name_ar, price: a.price }));

    addItem({
      menuItemId: item.id,
      name_ar: item.name_ar,
      name_en: item.name_en,
      size: selectedSize,
      unitPrice: currentPrice,
      addons: chosenAddons,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name_ar} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">🍔</div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{item.name_ar}</h3>
          {item.description_ar && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {item.description_ar}
            </p>
          )}
        </div>

        {sizes.length > 1 && (
          <div className="flex gap-2">
            {sizes.map(({ size }) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg text-sm font-bold transition-colors border',
                  selectedSize === size
                    ? 'border-ninja-red bg-red-50 text-ninja-red'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {SIZE_LABELS[size]}
              </button>
            ))}
          </div>
        )}

        {addons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">الإضافات</p>
            <div className="space-y-1.5">
              {addons.map(addon => (
                <label key={addon.id} onClick={() => toggleAddon(addon.id)} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      selectedAddons.has(addon.id) ? "bg-ninja-red border-ninja-red text-white" : "border-gray-300 group-hover:border-ninja-red"
                    )}>
                      {selectedAddons.has(addon.id) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{addon.name_ar}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-500">+{addon.price} ج</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 leading-none">{totalPrice} ج</span>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              onClick={handleAdd}
              className={cn("min-w-[120px]", isAdded && "bg-green-500 hover:bg-green-600")}
              disabled={!item.is_available}
            >
              {isAdded ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>تمت الإضافة</span>
                </motion.div>
              ) : (
                item.is_available ? 'أضف للسلة' : 'غير متوفر'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
