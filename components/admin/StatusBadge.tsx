'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { ChevronDown, XCircle } from 'lucide-react';
import { cn } from '../ui/cn';

interface StatusBadgeProps {
  status: OrderStatus;
  orderId: string;
  onStatusChange: (newStatus: OrderStatus) => void;
}

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'on_delivery', 'finished', 'cancelled'];

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

    if (newStatus === 'cancelled') {
      const confirmed = window.confirm('هل أنت متأكد من إلغاء هذا الطلب وإخطار المطبخ؟');
      if (!confirmed) return;
    }

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
        <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 overflow-hidden">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={cn(
                'w-full text-right px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between',
                s === status ? 'text-ninja-red bg-red-50/50 font-bold' : 'text-gray-700',
                s === 'cancelled' ? 'text-red-600 hover:bg-red-50' : ''
              )}
            >
              <span>{ORDER_STATUS_LABELS[s]}</span>
              {s === 'cancelled' && <XCircle size={14} className="text-red-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
