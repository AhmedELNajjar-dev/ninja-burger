'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { cn } from '../ui/cn';

interface CategoryTabsProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-3 w-max">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={cn(
                'relative px-6 py-2.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap overflow-hidden border-2',
                isActive
                  ? 'border-transparent text-white'
                  : 'border-gray-200 text-gray-600 hover:border-ninja-red hover:text-ninja-red'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute inset-0 bg-ninja-red rounded-full -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {category.name_ar}
            </button>
          );
        })}
      </div>
    </div>
  );
}
