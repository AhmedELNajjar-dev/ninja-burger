'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock } from 'lucide-react';
import { Order, OrderStatus, SIZE_LABELS } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../ui/cn';

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  isNew?: boolean;
}

export function OrderCard({ order, onStatusChange, isNew }: OrderCardProps) {
  const timeAgo = (dateStr: string) => {
    const minDiff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (minDiff < 1) return 'الآن';
    if (minDiff < 60) return `منذ ${minDiff} دقيقة`;
    return `منذ ${Math.floor(minDiff / 60)} ساعة`;
  };

  return (
    <motion.div
      initial={isNew ? { scale: 0.95, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "bg-white rounded-2xl border p-5 transition-all shadow-sm relative overflow-hidden",
        isNew ? "border-ninja-yellow shadow-[0_0_15px_rgba(245,166,35,0.3)] animate-pulse" : "border-gray-200"
      )}
    >
      {isNew && <div className="absolute top-0 right-0 w-full h-1 bg-ninja-yellow" />}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-black text-gray-900">
            #{order.order_number.toString().padStart(4, '0')}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4" />
            <span dir="ltr">{timeAgo(order.created_at)}</span>
          </div>
        </div>
        <StatusBadge
          status={order.status}
          orderId={order.id}
          onStatusChange={(status) => onStatusChange(order.id, status)}
        />
      </div>

      <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-3">
        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-6 flex justify-center"><Phone className="w-4 h-4 text-gray-400" /></div>
          <span className="font-bold">{order.customer_name}</span>
          <span className="text-sm" dir="ltr">{order.customer_phone}</span>
        </div>
        <div className="flex items-start gap-2 text-gray-700">
          <div className="w-6 flex justify-center mt-1"><MapPin className="w-4 h-4 text-gray-400" /></div>
          <span className="text-sm leading-relaxed">{order.delivery_address}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">الطلبات</p>
        <ul className="space-y-2">
          {order.items.map((item, idx) => (
            <li key={idx} className="text-sm flex gap-2">
              <span className="font-bold text-ninja-red">{item.quantity}x</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900">
                  {item.name_ar} <span className="text-xs font-normal text-gray-500">({SIZE_LABELS[item.size]})</span>
                </p>
                {item.addons.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    + {item.addons.map(a => a.name_ar).join('، ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {order.notes && (
        <div className="mb-4 text-sm bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-100">
          <span className="font-bold block mb-1">ملاحظات:</span>
          {order.notes}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
        <span className="font-bold text-gray-500">الإجمالي</span>
        <span className="text-xl font-black text-gray-900">{order.total_amount} ج</span>
      </div>
    </motion.div>
  );
}
