'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCartStore } from '@/store/cartStore';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'الاسم مطلوب'),
  customer_phone: z.string().min(11, 'رقم هاتف غير صالح'),
  delivery_address: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل'),
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

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: userName || '',
      customer_phone: userPhone || '',
      delivery_address: '',
      notes: '',
    }
  });

  const onSubmit = async (data: CheckoutForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...data,
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
          <Input label="رقم الهاتف" type="tel" dir="ltr" className="text-right" {...register('customer_phone')} error={errors.customer_phone?.message} />
          <Input label="عنوان التوصيل بالتفصيل" {...register('delivery_address')} error={errors.delivery_address?.message} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">ملاحظات إضافية (اختياري)</label>
            <textarea
              {...register('notes')}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-ninja-red focus:outline-none focus:ring-1 focus:ring-ninja-red min-h-[80px] resize-none"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mt-6">
            <div className="flex justify-between items-center font-bold text-gray-900">
              <span>الإجمالي المطلوب:</span>
              <span className="text-xl text-ninja-red">{getTotal()} ج</span>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-14 text-lg" isLoading={isLoading}>
              تأكيد الطلب
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
