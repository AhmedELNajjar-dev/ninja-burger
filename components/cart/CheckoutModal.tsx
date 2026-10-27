'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCartStore } from '@/store/cartStore';
import { LocationPickerModal } from './LocationPickerModal';
import { MapPin, Building, Hash, Layers, Bike, Check, Store, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { cn } from '../ui/cn';

// Fixed delivery fee in EGP for home delivery
const DELIVERY_FEE = 35;

const createCheckoutSchema = (orderType: 'delivery' | 'pickup') =>
  z.object({
    customer_name: z.string().min(2, 'الاسم مطلوب'),
    customer_phone: z.string().min(11, 'رقم هاتف غير صالح (مثال: 01012345678)'),
    delivery_address:
      orderType === 'delivery'
        ? z.string().min(3, 'يرجى كتابة اسم الشارع والمنطقة يدوياً')
        : z.string().optional(),
    building_no:
      orderType === 'delivery'
        ? z.string().min(1, 'رقم العمارة مطلوب')
        : z.string().optional(),
    floor_no:
      orderType === 'delivery'
        ? z.string().min(1, 'الدور مطلوب')
        : z.string().optional(),
    apartment_no:
      orderType === 'delivery'
        ? z.string().min(1, 'رقم الشقة مطلوب')
        : z.string().optional(),
    map_url: z.string().optional(),
    notes: z.string().optional(),
  });

type CheckoutForm = z.infer<ReturnType<typeof createCheckoutSchema>>;

interface CheckoutModalProps {
  userPhone?: string;
  userName?: string;
  savedAddress?: {
    delivery_address?: string;
    building_no?: string;
    floor_no?: string;
    apartment_no?: string;
    map_url?: string;
    notes?: string;
  } | null;
}

export function CheckoutModal({ userPhone, userName, savedAddress }: CheckoutModalProps) {
  const { items, getTotal, isCheckoutOpen, clearCart } = useCartStore();
  const { t, isArabic } = useTranslation();
  const setIsCheckoutOpen = (open: boolean) => useCartStore.setState({ isCheckoutOpen: open });

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const schema = useMemo(() => createCheckoutSchema(orderType), [orderType]);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: userName || '',
      customer_phone: userPhone || '',
      delivery_address: savedAddress?.delivery_address || '',
      building_no: savedAddress?.building_no || '',
      floor_no: savedAddress?.floor_no || '',
      apartment_no: savedAddress?.apartment_no || '',
      map_url: savedAddress?.map_url || '',
      notes: savedAddress?.notes || '',
    }
  });

  // When savedAddress or user details load or change, update the form automatically
  useEffect(() => {
    if (savedAddress || userName || userPhone) {
      reset({
        customer_name: userName || '',
        customer_phone: userPhone || '',
        delivery_address: savedAddress?.delivery_address || '',
        building_no: savedAddress?.building_no || '',
        floor_no: savedAddress?.floor_no || '',
        apartment_no: savedAddress?.apartment_no || '',
        map_url: savedAddress?.map_url || '',
        notes: savedAddress?.notes || '',
      });
    }
  }, [savedAddress, userName, userPhone, reset]);

  const selectedMapUrl = watch('map_url');
  const subTotal = getTotal();
  const deliveryFee = orderType === 'pickup' ? 0 : DELIVERY_FEE;
  const finalTotal = subTotal + deliveryFee;

  const handleLocationPicked = (loc: {
    lat: number;
    lng: number;
    addressText: string;
    mapUrl: string;
  }) => {
    setMapCoords({ lat: loc.lat, lng: loc.lng });
    setValue('map_url', loc.mapUrl);
  };

  const onSubmit = async (data: CheckoutForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...data,
        order_type: orderType,
        delivery_address:
          orderType === 'pickup'
            ? 'استلام من الفرع (Pickup)'
            : data.delivery_address || '',
        building_no: orderType === 'pickup' ? '' : data.building_no,
        floor_no: orderType === 'pickup' ? '' : data.floor_no,
        apartment_no: orderType === 'pickup' ? '' : data.apartment_no,
        map_coordinates: orderType === 'delivery' ? mapCoords || undefined : undefined,
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
        total_amount: finalTotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل إرسال الطلب');
      }

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

  const hasSavedAddress = !!savedAddress?.delivery_address;

  return (
    <>
      <Modal isOpen={isCheckoutOpen} onClose={() => !isLoading && setIsCheckoutOpen(false)} title={t.checkoutTitle}>
        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 text-3xl">✓</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {isArabic ? "تم استلام طلبك بنجاح!" : "Order Received Successfully!"}
            </h3>
            <p className="text-gray-500">
              {orderType === 'pickup'
                ? (isArabic ? "جاري تحضير طلبك للاستلام من الفرع... شكراً لاختيارك نينجا برجر 🥷" : "Preparing your order for pickup at our branch... Thank you for choosing Ninja Burger 🥷")
                : (isArabic ? "جاري التجهيز للتوصيل... شكراً لاختيارك نينجا برجر 🥷" : "Preparing for delivery... Thank you for choosing Ninja Burger 🥷")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

            {/* ── Order Type Switcher (Delivery vs Pickup) ────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 block">
                {t.orderType || 'طريقة الاستلام'}:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer',
                    orderType === 'delivery'
                      ? 'bg-ninja-red text-white shadow-sm'
                      : 'text-gray-600 hover:text-ninja-dark'
                  )}
                >
                  <Bike className="w-4 h-4 shrink-0" />
                  <span>{t.delivery || 'توصيل للمنزل'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer',
                    orderType === 'pickup'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-gray-600 hover:text-ninja-dark'
                  )}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>{t.pickup || 'استلام من الفرع'}</span>
                </button>
              </div>
            </div>

            {/* Branch Pickup Information Banner */}
            {orderType === 'pickup' && (
              <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 space-y-2.5 text-purple-950">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Store className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>{t.pickupNotice || 'الاستلام من فرع نينجا برجر (بدون أي رسوم توصيل)'}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-purple-800">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>{t.branchAddressVal || 'شارع 9، المعادي، القاهرة — نينجا برجر'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-purple-200/70 text-xs">
                  <span className="flex items-center gap-1 font-bold text-purple-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>وقت التجهيز المتوقع: 15-25 دقيقة</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full text-[11px]">
                    {t.pickupFree || 'توصيل مجاني 0 ج'}
                  </span>
                </div>
              </div>
            )}

            {/* Saved Address Pill (only for Delivery) */}
            {orderType === 'delivery' && hasSavedAddress && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.savedAddressNotice}</span>
              </div>
            )}

            {/* Name and Phone (Mandatory for both Delivery & Pickup) */}
            <Input label={t.customerName} {...register('customer_name')} error={errors.customer_name?.message} />
            <Input
              label={t.customerPhone}
              type="tel"
              dir="ltr"
              className="text-right"
              {...register('customer_phone')}
              error={errors.customer_phone?.message}
            />

            {/* Delivery-Only Fields (Street, Building, Floor, Apartment, Map Pin) */}
            {orderType === 'delivery' && (
              <>
                {/* Address Field with Map Pinning Option */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      {t.deliveryAddress} <span className="text-ninja-red">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        selectedMapUrl
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-red-50 hover:bg-red-100 text-ninja-red border-red-200'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedMapUrl ? t.locationPinned : t.pinLocation}
                    </button>
                  </div>
                  <Input
                    placeholder={t.deliveryAddressPlaceholder}
                    {...register('delivery_address')}
                    error={errors.delivery_address?.message}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t.deliveryAddressHelp}
                  </p>
                </div>

                {/* Building, Floor, and Apartment Numbers (MANDATORY FIELDS FOR DELIVERY) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-ninja-red" />
                      <span>{t.buildingNo} <span className="text-ninja-red">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="15"
                      {...register('building_no')}
                      className={`w-full text-center rounded-xl border px-2 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                        errors.building_no
                          ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-ninja-red focus:ring-ninja-red'
                      }`}
                    />
                    {errors.building_no && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 text-center">{errors.building_no.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-ninja-red" />
                      <span>{t.floorNo} <span className="text-ninja-red">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="الثالث"
                      {...register('floor_no')}
                      className={`w-full text-center rounded-xl border px-2 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                        errors.floor_no
                          ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-ninja-red focus:ring-ninja-red'
                      }`}
                    />
                    {errors.floor_no && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 text-center">{errors.floor_no.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-ninja-red" />
                      <span>{t.apartmentNo} <span className="text-ninja-red">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="6"
                      {...register('apartment_no')}
                      className={`w-full text-center rounded-xl border px-2 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                        errors.apartment_no
                          ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-ninja-red focus:ring-ninja-red'
                      }`}
                    />
                    {errors.apartment_no && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 text-center">{errors.apartment_no.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">{t.notes}</label>
              <textarea
                placeholder={t.notesPlaceholder}
                {...register('notes')}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-ninja-red focus:outline-none focus:ring-1 focus:ring-ninja-red min-h-[70px] resize-none"
              />
            </div>

            {/* Bill Breakdown */}
            <div className="bg-gray-50 p-4 rounded-xl mt-4 space-y-2 border border-gray-100">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{t.subtotal}:</span>
                <span className="font-bold">{subTotal} {t.currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 pb-2 border-b border-gray-200">
                <span className="flex items-center gap-1">
                  {orderType === 'pickup' ? (
                    <Store className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Bike className="w-4 h-4 text-ninja-red" />
                  )}
                  {t.deliveryFee}:
                </span>
                <span className={`font-bold ${orderType === 'pickup' ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {orderType === 'pickup' ? t.pickupFree || '0 ج (مجاناً)' : `${DELIVERY_FEE} ${t.currency}`}
                </span>
              </div>
              <div className="flex justify-between items-center font-black text-gray-900 pt-1">
                <span>{t.total}:</span>
                <span className="text-2xl text-ninja-red">{finalTotal} {t.currency}</span>
              </div>
            </div>

            {/* Big, Prominent Order Confirmation Button */}
            <div className="pt-3">
              <Button
                type="submit"
                className="w-full h-16 text-xl sm:text-2xl font-black shadow-[0_8px_25px_rgba(204,31,26,0.4)] active:scale-[0.98] transition-transform rounded-2xl cursor-pointer"
                isLoading={isLoading}
              >
                {t.confirmOrderNow} ({finalTotal} {t.currency})
              </Button>

              {/* Legal disclaimer */}
              <p className="text-[11px] sm:text-xs text-center text-gray-500 mt-2.5 leading-relaxed">
                {isArabic ? (
                  <>
                    بتأكيد طلبك، أنت توافق على{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 underline font-semibold"
                    >
                      شروط الخدمة
                    </Link>{' '}
                    و{' '}
                    <Link
                      href="/refunds"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 underline font-semibold"
                    >
                      سياسة الاسترجاع
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    By confirming your order, you agree to our{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 underline font-semibold"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/refunds"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 underline font-semibold"
                    >
                      Refund Policy
                    </Link>
                    .
                  </>
                )}
              </p>
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
