'use client'

import React from 'react'
import { LegalPageClient, LegalSection } from './LegalPageClient'
import { XCircle, RefreshCw, CheckCircle2, AlertTriangle, Clock, HelpCircle, UtensilsCrossed } from 'lucide-react'

export function RefundsPageClient() {
  const sections: LegalSection[] = [
    {
      id: 'cancellation-window',
      icon: XCircle,
      titleAr: 'نافذة إلغاء الطلب المسموحة (قبل تأكيد المطبخ)',
      titleEn: 'Permitted Order Cancellation Window (Pre-Kitchen Confirmation)',
      contentAr: (
        <div className="space-y-3">
          <p>
            حرصاً على تقديم أعلى درجات الطزاجة ولأن سندوتشاتنا تُشوى طازجة 100% بالطلب، فإن قواعد إلغاء الطلبات محددة كالتالي:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                حالة الطلب: قيد الانتظار (Pending)
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>يُسمح بالإلغاء الفوري:</strong> يمكنك إلغاء طلبك مباشرة وبضغطة زر من صفحة &ldquo;طلباتي&rdquo; أو بالتواصل الفوري مع خدمة العملاء دون أي رسوم أو التزامات.
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <span className="text-xs font-black text-red-800 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                حالة الطلب: مؤكد (Confirmed) أو في التوصيل
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>لا يمكن الإلغاء:</strong> بمجرد تأكيد المطبخ للطلب والبدء في طهي وشوي اللحم وتجهيز المكونات، لا يمكن إلغاء الطلب نظراً لطبيعة الوجبات السريعة القابلة للتلف.
              </p>
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            Because our smash burgers are flame-grilled 100% fresh to order, our cancellation policy operates on clear kitchen lifecycle checkpoints:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Status: Pending
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Instant Cancellation Allowed:</strong> You can cancel without penalty from &ldquo;My Orders&rdquo; or via WhatsApp support before the kitchen accepts the ticket.
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <span className="text-xs font-black text-red-800 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Status: Confirmed or Out for Delivery
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Cancellation Locked:</strong> Once our chefs start grilling the meat patties and assembling fresh buns, orders cannot be canceled due to food perishability.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'damaged-incorrect-orders',
      icon: RefreshCw,
      titleAr: 'ضمان الجودة، استبدال الطلب، والتعويض الفوري',
      titleEn: 'Quality Guarantee, Instant Replacement & Compensation',
      contentAr: (
        <div className="space-y-3">
          <p>
            إذا وصلك الطلب بحالة غير مطابقة لمواصفات الجودة المعتمدة لدينا، فإننا نتحمل المسؤولية كاملة ونوفر الحلول التالية فوراً:
          </p>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
              <strong className="text-ninja-dark block mb-0.5">1. صنف غير صحيح أو مكونات خاطئة (Wrong Item):</strong>
              <p>يتم إرسال الصنف الصحيح فوراً مع أولوية قصوى ودون أي رسوم توصيل إضافية، أو استرداد كامل قيمة الصنف.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
              <strong className="text-ninja-dark block mb-0.5">2. نقص في الأصناف أو الصوصات (Missing Items):</strong>
              <p>إرسال مندوب سريع لاستكمال الناقص فوراً، أو خصم/استرداد قيمة الصنف الناقص إلى حسابك.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
              <strong className="text-ninja-dark block mb-0.5">3. تلف أثناء النقل أو انسكاب الصوصات (Transit Damage):</strong>
              <p>تعويض فوري بإعادة تجهيز الوجبة المتضررة وإرسالها ساخنة مع اعتذار رسمي من إدارة الفرع.</p>
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            If your order arrives damaged, incomplete, or inconsistent with your selected sandwich toppings, Ninja Burger takes full responsibility:
          </p>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
              <strong className="text-ninja-dark block mb-0.5">1. Incorrect Item Delivered:</strong>
              <p>We dispatch the correct item immediately via expedited courier at zero cost, or issue an immediate refund for that item.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
              <strong className="text-ninja-dark block mb-0.5">2. Missing Sandwiches, Fries, or Sauces:</strong>
              <p>Immediate express delivery of missing items, or a cash/account refund for the unfulfilled value.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
              <strong className="text-ninja-dark block mb-0.5">3. Transit Packaging Damage or Spills:</strong>
              <p>Instant replacement meal freshly prepared and delivered with priority dispatch.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'claim-procedure',
      icon: Clock,
      titleAr: 'خطوات تقديم طلب التعويض أو الشكوى',
      titleEn: 'Simple 3-Step Compensation Claim Process',
      contentAr: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-gray-700">
            للحصول على تعويض أو استبدال فوري، يُرجى اتباع الخطوات البسيطة التالية في غضون <strong>30 دقيقة</strong> من استلام الطلب:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700 marker:font-black marker:text-ninja-red">
            <li>
              <strong>التقاط صورة واضحة:</strong> تصوير الوجبة المتضررة أو الصنف غير الصحيح مع الفاتورة المرفقة على الكيس.
            </li>
            <li>
              <strong>إرسال الصورة عبر واتساب:</strong> إرسال الصورة ورقم الهاتف إلى رقم خدمة العملاء <strong>01008427736</strong>.
            </li>
            <li>
              <strong>تنسيق التعويض الفوري:</strong> يقوم مسؤول الجودة بالموافقة الفورية واختيارك بين إعادة التوصيل الساخن أو استرداد المبلغ.
            </li>
          </ol>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-gray-700">
            To ensure rapid investigation and resolution, follow this 3-step claim procedure within <strong>30 minutes</strong> of delivery:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700 marker:font-black marker:text-ninja-red">
            <li>
              <strong>Take a Photo:</strong> Capture a clear photo of the damaged/incorrect item alongside the order ticket on the bag.
            </li>
            <li>
              <strong>WhatsApp Our Support Line:</strong> Send the photo and your order phone number to <strong>+201008427736</strong>.
            </li>
            <li>
              <strong>Instant Resolution:</strong> Our supervisor approves replacement dispatch or refund within minutes.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'perishable-exemption',
      icon: UtensilsCrossed,
      titleAr: 'استثناء الأطعمة الجاهزة وفقاً لقانون حماية المستهلك',
      titleEn: 'Perishable Goods Statutory Exemption (Egyptian Law 181/2018)',
      contentAr: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            وفقاً للمادة (17) من <strong>قانون حماية المستهلك المصري رقم 181 لسنة 2018</strong>، تُستثنى السلع سريعة التلف (بما يشمل الوجبات الغذائية المطهية والجاهزة للاستهلاك الفوري) من حق الاسترجاع خلال 14 يوماً المعمول به في السلع المعمرة، ما لم يكن بالسلعة عيب أو مخالفة للمواصفات.
          </p>
          <p className="text-gray-500 italic">
            لذلك لا يُقبل إرجاع الوجبات المطهية بعد استلامها بحالة سليمة لأسباب تتعلق بتغيير رغبة العميل بعد الطهي.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            Under Article 17 of <strong>Egyptian Consumer Protection Law No. 181 of 2018</strong>, prepared fast foods and perishable meals are statutory exemptions to the standard 14-day return rule, unless an objective defect or non-conformity is proven.
          </p>
          <p className="text-gray-500 italic">
            Consequently, delivered meals that meet ordered specifications cannot be returned solely due to subjective change of mind post-cooking.
          </p>
        </div>
      ),
    },
  ]

  return (
    <LegalPageClient
      pageType="refunds"
      badgeAr="وثيقة رسمية ومعتمدة"
      badgeEn="Official Legal Document"
      titleAr="سياسة الإلغاء والاسترجاع والتعويض"
      titleEn="Cancellation, Refund & Replacement Policy"
      subtitleAr="القواعد المحددة لإلغاء طلبات الوجبات السريعة، معايير ضمان الجودة، وإجراءات التعويض الفوري السريع عند وجود أي ملاحظة."
      subtitleEn="Clear rules for order cancellations, food quality guarantees, and swift compensation or replacement procedures."
      lastUpdatedAr="آخر تحديث: 28 أكتوبر 2026"
      lastUpdatedEn="Last Updated: October 28, 2026"
      highlightAr={{
        title: 'ضمان الرضا 100% — نينجا برجر يعوضك فوراً',
        desc: 'إذا وصلك أي صنف بارد أو غير مطابق لاختياراتك، صور الوجبة وأرسلها على واتساب 01008427736 وسنعيد توصيل الصنف الساخن مجاناً.',
      }}
      highlightEn={{
        title: '100% Satisfaction Guarantee — Instant Replacement',
        desc: 'If any item arrives damaged or incorrect, send a photo to WhatsApp 01008427736 and we will dispatch a hot replacement immediately at zero charge.',
      }}
      sections={sections}
    />
  )
}
