'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, AlertTriangle, CheckCircle2, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { Order, OrderStatus, SIZE_LABELS } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../ui/cn';

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  isNew?: boolean;
}

export function OrderCard({
  order,
  onStatusChange,
  onEditOrder,
  onDeleteOrder,
  isNew,
}: OrderCardProps) {
  const timeAgo = (dateStr: string) => {
    const minDiff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (minDiff < 1) return 'الآن';
    if (minDiff < 60) return `منذ ${minDiff} دقيقة`;
    return `منذ ${Math.floor(minDiff / 60)} ساعة`;
  };

  // Google Maps link if coordinates or URL are included in the address
  const googleMapsUrl =
    order.map_url ||
    (order.delivery_address.includes('http')
      ? order.delivery_address.match(/https?:\/\/[^\s]+/)?.[0]
      : null);

  return (
    <motion.div
      initial={isNew ? { scale: 0.95, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'bg-white rounded-2xl border p-5 transition-all shadow-sm relative overflow-hidden',
        order.status === 'cancelled'
          ? 'border-red-200 bg-red-50/30 opacity-80'
          : isNew
          ? 'border-ninja-yellow shadow-[0_0_15px_rgba(245,166,35,0.3)] animate-pulse'
          : 'border-gray-200'
      )}
    >
      {isNew && <div className="absolute top-0 right-0 w-full h-1 bg-ninja-yellow" />}

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-gray-900">
              #{order.order_number.toString().padStart(4, '0')}
            </h3>

            {/* First-Time Customer Verification Badge */}
            {order.is_first_order ? (
              <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm animate-bounce">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                عميل جديد (أول طلب) — تأكيد هاتفي مطلوب 📞
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                عميل موثوق (طلب سابقاً)
              </span>
            )}
          </div>

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

      <div className="space-y-2.5 mb-4 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-700 flex-wrap">
          <div className="w-6 flex justify-center">
            <Phone className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-bold">{order.customer_name}</span>
          <a
            href={`tel:${order.customer_phone}`}
            className="text-sm font-mono text-ninja-red hover:underline font-bold bg-white px-2 py-0.5 rounded border border-gray-200"
            dir="ltr"
          >
            {order.customer_phone} 📞
          </a>
        </div>

        <div className="flex items-start gap-2 text-gray-700">
          <div className="w-6 flex justify-center mt-1">
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 text-sm leading-relaxed">
            <span className="font-medium">{order.delivery_address}</span>
            {googleMapsUrl && (
              <div className="mt-1">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  عرض اللوكيشن على Google Maps 🗺️
                </a>
              </div>
            )}
          </div>
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
                  {item.name_ar}{' '}
                  <span className="text-xs font-normal text-gray-500">
                    ({SIZE_LABELS[item.size]})
                  </span>
                </p>
                {item.addons.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    + {item.addons.map((a) => a.name_ar).join('، ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {order.notes && (
        <div className="mb-4 text-sm bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-100">
          <span className="font-bold block mb-1">ملاحظات العميل:</span>
          {order.notes}
        </div>
      )}

      {/* Footer: Total Amount + Edit & Delete Actions */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
        <div>
          <span className="font-bold text-gray-400 text-xs block">الإجمالي</span>
          <span className="text-xl font-black text-gray-900">{order.total_amount} ج</span>
        </div>

        <div className="flex items-center gap-2">
          {onEditOrder && (
            <button
              type="button"
              onClick={() => onEditOrder(order)}
              className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 size={14} />
              <span>تعديل</span>
            </button>
          )}

          {onDeleteOrder && (
            <button
              type="button"
              onClick={() => onDeleteOrder(order)}
              className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
              title="حذف الطلب نهائياً"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
