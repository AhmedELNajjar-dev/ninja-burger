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
    <div className="w-full overflow-x-auto scrollbar-hide py-2 pb-3">
      <div className="flex items-center gap-2 sm:gap-3 w-max px-1">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                'relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap overflow-hidden border-2 shadow-sm',
                isActive
                  ? 'border-ninja-red text-white bg-ninja-red shadow-ninja'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-ninja-red hover:text-ninja-red'
              )}
            >
              {category.name_ar}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryTabs;
