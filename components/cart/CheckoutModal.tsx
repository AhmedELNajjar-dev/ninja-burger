'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCartStore } from '@/store/cartStore';
import { LocationPickerModal } from './LocationPickerModal';
import { MapPin, Building, Hash, Layers } from 'lucide-react';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'الاسم مطلوب'),
  customer_phone: z.string().min(11, 'رقم هاتف غير صالح (مثال: 01012345678)'),
  delivery_address: z.string().min(3, 'أدخل اسم الشارع والمنطقة'),
  building_no: z.string().optional(),
  floor_no: z.string().optional(),
  apartment_no: z.string().optional(),
  map_url: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  userPhone?: string;
  userName?: string;
}

export function CheckoutModal({ userPhone, userName }: CheckoutModalProps) {
  const { items, getTotal, isCheckoutOpen, clearCart } = useCartStore();
  const setIsCheckoutOpen = (open: boolean) => useCartStore.setState({ isCheckoutOpen: open });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: userName || '',
      customer_phone: userPhone || '',
      delivery_address: '',
      building_no: '',
      floor_no: '',
      apartment_no: '',
      map_url: '',
      notes: '',
    }
  });

  const selectedMapUrl = watch('map_url');

  const handleLocationPicked = (loc: {
    lat: number;
    lng: number;
    addressText: string;
    mapUrl: string;
  }) => {
    setMapCoords({ lat: loc.lat, lng: loc.lng });
    setValue('delivery_address', loc.addressText, { shouldValidate: true });
    setValue('map_url', loc.mapUrl);
  };

  const onSubmit = async (data: CheckoutForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...data,
        map_coordinates: mapCoords || undefined,
        items: items.map(i => ({
          menuItemId: i.menuItemId,
          name_ar: i.name_ar,
          name_en: i.name_en,
          size: i.size,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          addons: i.addons,
          lineTotal: i.lineTotal,
        })),
        total_amount: getTotal(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('فشل إرسال الطلب');

      setSuccess(true);
      clearCart();
      setTimeout(() => {
        setSuccess(false);
        setIsCheckoutOpen(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isCheckoutOpen} onClose={() => !isLoading && setIsCheckoutOpen(false)} title="تأكيد الطلب">
        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 text-3xl">✓</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">تم استلام طلبك!</h3>
            <p className="text-gray-500">جاري التجهيز... شكراً لاختيارك نينجا برجر 🥷</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
            
            <Input label="الاسم" {...register('customer_name')} error={errors.customer_name?.message} />
            <Input
              label="رقم الهاتف"
              type="tel"
              dir="ltr"
              className="text-right"
              {...register('customer_phone')}
              error={errors.customer_phone?.message}
            />

            {/* Address Field with Map Picker Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">الشارع والمنطقة</label>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="text-xs font-bold text-ninja-red hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full border border-red-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedMapUrl ? 'تم تحديد الموقع ✓' : 'تحديد على الخريطة 📍'}
                </button>
              </div>
              <Input
                placeholder="مثال: 156 شارع 9، ميدان دمشق، المعادي"
                {...register('delivery_address')}
                error={errors.delivery_address?.message}
              />
            </div>

            {/* Building, Floor, and Apartment Numbers (Egyptian Standard) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  رقم العمارة
                </label>
                <input
                  type="text"
                  placeholder="15"
                  {...register('building_no')}
                  className="w-full text-center rounded-xl border border-gray-200 px-2 py-2 text-sm text-gray-900 focus:border-ninja-red focus:outline-none focus:ring-1 focus:ring-ninja-red"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  الدور
                </label>
                <input
                  type="text"
                  placeholder="الثالث"
                  {...register('floor_no')}
                  className="w-full text-center rounded-xl border border-gray-200 px-2 py-2 text-sm text-gray-900 focus:border-ninja-red focus:outline-none focus:ring-1 focus:ring-ninja-red"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  رقم الشقة
                </label>
                <input
                  type="text"
                  placeholder="6"
                  {...register('apartment_no')}
                  className="w-full text-center rounded-xl border border-gray-200 px-2 py-2 text-sm text-gray-900 focus:border-ninja-red focus:outline-none focus:ring-1 focus:ring-ninja-red"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">ملاحظات للمندوب (اختياري)</label>
              <textarea
                placeholder="علامة مميزة، خبط الجرس، الخ..."
                {...register('notes')}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-ninja-red focus:outline-none focus:ring-1 focus:ring-ninja-red min-h-[70px] resize-none"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mt-4">
              <div className="flex justify-between items-center font-bold text-gray-900">
                <span>الإجمالي المطلوب:</span>
                <span className="text-xl text-ninja-red">{getTotal()} ج</span>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-13 text-lg font-black shadow-ninja" isLoading={isLoading}>
                تأكيد الطلب 🚀
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Interactive Map Picker Modal */}
      {showMapModal && (
        <LocationPickerModal
          onSelectLocation={handleLocationPicked}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </>
  );
}
