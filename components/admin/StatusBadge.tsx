'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_FLOW } from '@/types';
import { ChevronDown } from 'lucide-react';
import { cn } from '../ui/cn';

interface StatusBadgeProps {
  status: OrderStatus;
  orderId: string;
  onStatusChange: (newStatus: OrderStatus) => void;
}

export function StatusBadge({ status, orderId, onStatusChange }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (newStatus: OrderStatus) => {
    setIsOpen(false);
    if (newStatus === status) return;
    onStatusChange(newStatus);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors cursor-pointer hover:shadow-sm',
          ORDER_STATUS_COLORS[status]
        )}
      >
        {ORDER_STATUS_LABELS[status]}
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 overflow-hidden">
          {ORDER_STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={cn(
                'w-full text-right px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors',
                s === status ? 'text-ninja-red bg-red-50/50' : 'text-gray-700'
              )}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
