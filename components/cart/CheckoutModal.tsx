'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCartStore } from '@/store/cartStore';
import { CheckCircle2, MessageCircle, RefreshCw } from 'lucide-react';

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
  isPhoneVerified?: boolean;
}

export function CheckoutModal({ userPhone, userName, isPhoneVerified = false }: CheckoutModalProps) {
  const { items, getTotal, isCheckoutOpen, clearCart } = useCartStore();
  const setIsCheckoutOpen = (open: boolean) => useCartStore.setState({ isCheckoutOpen: open });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // WhatsApp verification state within checkout
  const [verifiedState, setVerifiedState] = useState(isPhoneVerified);
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: userName || '',
      customer_phone: userPhone || '',
      delivery_address: '',
      notes: '',
    }
  });

  const currentPhone = watch('customer_phone') || userPhone || '';

  const handleSendWhatsAppCode = async () => {
    setIsSendingCode(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/verify-phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || 'تعذر إرسال كود التأكيد');
        return;
      }
      setWhatsappLink(data.whatsappUrl);
      setShowVerifyBox(true);
      // Auto open WhatsApp in new tab
      window.open(data.whatsappUrl, '_blank');
    } catch {
      setVerifyError('حدث خطأ في الاتصال');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!verifyOtpInput || verifyOtpInput.length !== 4) {
      setVerifyError('أدخل الرمز المكون من 4 أرقام');
      return;
    }
    setIsCheckingCode(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/verify-phone/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyOtpInput, phone: currentPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || 'رمز التأكيد غير صحيح');
        return;
      }
      setVerifiedState(true);
      setShowVerifyBox(false);
    } catch {
      setVerifyError('فشل تأكيد الرمز');
    } finally {
      setIsCheckingCode(false);
    }
  };

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
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700">رقم الهاتف</label>
              {verifiedState ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  رقم موثق عبر واتساب
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendWhatsAppCode}
                  disabled={isSendingCode}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 transition-colors"
                >
                  <MessageCircle size={13} />
                  {isSendingCode ? 'جاري الإرسال...' : 'توثيق الرقم عبر واتساب (مجاناً)'}
                </button>
              )}
            </div>
            <Input
              type="tel"
              dir="ltr"
              className="text-right"
              {...register('customer_phone')}
              error={errors.customer_phone?.message}
            />
          </div>

          {/* Interactive Verification Sub-panel if user requested WhatsApp code */}
          {showVerifyBox && !verifiedState && (
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageCircle size={16} className="text-emerald-600" />
                  تأكيد رقمك عبر واتساب
                </span>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 font-bold underline"
                  >
                    فتح واتساب مجدداً
                  </a>
                )}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                اضغط على زر فتح واتساب لإرسال رسالة التأكيد التلقائية، ثم اكتب الكود المكون من 4 أرقام هنا:
              </p>
              {verifyError && (
                <p className="text-xs text-red-600 font-medium">{verifyError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={verifyOtpInput}
                  onChange={(e) => setVerifyOtpInput(e.target.value)}
                  placeholder="1234"
                  dir="ltr"
                  className="w-24 text-center font-black tracking-widest text-lg bg-white border border-emerald-300 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  disabled={isCheckingCode}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-1.5 text-sm transition-colors shadow-sm"
                >
                  {isCheckingCode ? 'جاري التحقق...' : 'تأكيد الرمز ✓'}
                </button>
              </div>
            </div>
          )}

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
