'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MenuItem, Addon } from '@/types';
import { MenuCard } from './MenuCard';

interface MenuGridProps {
  items: MenuItem[];
  addons: Addon[];
}

export function MenuGrid({ items, addons }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-6xl mb-4">🥷</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد أصناف هنا</h3>
        <p className="text-gray-500">قريباً سنقوم بإضافة المزيد من الأصناف اللذيذة!</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((menuItem) => (
        <motion.div key={menuItem.id} variants={item}>
          <MenuCard item={menuItem} addons={addons} />
        </motion.div>
      ))}
    </motion.div>
  );
}
