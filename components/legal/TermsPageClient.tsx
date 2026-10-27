'use client'

import React from 'react'
import { LegalPageClient, LegalSection } from './LegalPageClient'
import { ShoppingBag, Truck, CreditCard, Ban, Scale, AlertCircle } from 'lucide-react'

export function TermsPageClient() {
  const sections: LegalSection[] = [
    {
      id: 'order-placement',
      icon: ShoppingBag,
      titleAr: 'تقديم الطلبات ودورة حياة التجهيز في المطبخ',
      titleEn: 'Order Placement & Kitchen Preparation Stages',
      contentAr: (
        <div className="space-y-3">
          <p>
            عند تأكيد طلبك عبر منصة <strong>نينجا برجر</strong>، يمر الطلب بالمراحل التشغيلية التالية:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <span className="text-xs font-black text-amber-700 block mb-1">1. قيد الانتظار (Pending)</span>
              <p className="text-xs text-gray-600">تم استلام طلبك ومراجعته بواسطة شاشة إدارة المطبخ. في هذه المرحلة يُسمح بالإلغاء السريع.</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <span className="text-xs font-black text-blue-700 block mb-1">2. مؤكد (Confirmed)</span>
              <p className="text-xs text-gray-600">بدأ شيف النينجا شوي اللحم البلدي وتجهيز السندوتشات الطازجة. تتوقف إمكانية الإلغاء لبدء طهي الطعام.</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl">
              <span className="text-xs font-black text-purple-700 block mb-1">3. في التوصيل (On Delivery)</span>
              <p className="text-xs text-gray-600">استلم المندوب وجبتك في حقيبة حفظ الحرارة وهو في طريقه المباشر لعنوانك.</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 pt-1">
            متوسط وقت التجهيز والتوصيل يتراوح بين 25 إلى 45 دقيقة بحسب حجم الطلب وحركة السير في منطقة المعادي.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            When placing an order on the <strong>Ninja Burger</strong> platform, your order progresses through distinct operational stages:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <span className="text-xs font-black text-amber-700 block mb-1">1. Pending</span>
              <p className="text-xs text-gray-600">Order received and queued. Instant cancellation is allowed during this brief window.</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <span className="text-xs font-black text-blue-700 block mb-1">2. Confirmed</span>
              <p className="text-xs text-gray-600">Our chefs start flame-grilling fresh patties. Cancellation is locked as cooking has commenced.</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl">
              <span className="text-xs font-black text-purple-700 block mb-1">3. On Delivery</span>
              <p className="text-xs text-gray-600">Dispatched in insulated thermal bags directly to your pin location.</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 pt-1">
            Average preparation and delivery timeline ranges between 25 to 45 minutes depending on order volume and traffic.
          </p>
        </div>
      ),
    },
    {
      id: 'customer-responsibilities',
      icon: Truck,
      titleAr: 'مسؤوليات العميل وبيانات التوصيل',
      titleEn: 'Customer Delivery Responsibilities',
      contentAr: (
        <div className="space-y-3">
          <p>
            لضمان وصول وجبتك بأعلى جودة وفي أسرع وقت، يلتزم العميل بما يلي:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-gray-700 marker:text-ninja-red">
            <li>
              <strong>رقم هاتف متاح ويعمل:</strong> الرد على اتصال مندوب التوصيل عند وصوله إلى موقعك. عدم الرد لمدة تزيد عن 10 دقائق بعد وصول المندوب قد يؤدي لإلغاء الطلب دون استرداد قيمة التوصيل.
            </li>
            <li>
              <strong>دقة العنوان وتثبيت الخريطة:</strong> كتابة تفاصيل الشارع، العمارة، رقم الشقة، وتثبيت المؤشر على الخريطة في صفحة الدفع لتفادي أي تأخير.
            </li>
            <li>
              <strong>التواجد في موقع التوصيل:</strong> التواجد في العنوان المحدد خلال نافذة التوصيل المتوقعة أو تعيين شخص لاستلام الوجبة.
            </li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            To ensure your food arrives piping hot and on time, customers are expected to maintain the following standards:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-gray-700 marker:text-ninja-red">
            <li>
              <strong>Reachable Mobile Phone:</strong> Keeping your phone reachable upon courier arrival. Failure to respond within 10 minutes of courier arrival may forfeit the order.
            </li>
            <li>
              <strong>Accurate Address & Map Pin:</strong> Providing accurate street, building, apartment numbers, and a precise map pin in checkout.
            </li>
            <li>
              <strong>Physical Presence:</strong> Remaining present at the specified address during the delivery window or delegating a receiver.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'pricing-payment',
      icon: CreditCard,
      titleAr: 'شفافية الأسعار، رسوم التوصيل، وطرق الدفع',
      titleEn: 'Transparent Pricing, Delivery Fees & Payment Methods',
      contentAr: (
        <div className="space-y-3">
          <p>
            نلتزم في <strong>نينجا برجر</strong> بأعلى معايير الشفافية المالية وفقاً لقانون حماية المستهلك المصري:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700">
            <li>
              <strong>لا توجد أي رسوم خفية:</strong> السعر المعروض في ملخص السلة قبل الضغط على &ldquo;تأكيد الطلب&rdquo; هو السعر النهائي الشامل للوجبة، الإضافات، ورسوم التوصيل الثابتة (30 ج).
            </li>
            <li>
              <strong>الدفع نقداً عند الاستلام (COD):</strong> متاح لجميع الطلبات بدون حد أدنى معقد.
            </li>
            <li>
              <strong>تعديل الأسعار:</strong> تحتفظ الإدارة بالحق في تحديث أسعار الأصناف والعروض بحسب تكاليف الخامات واللحوم، ولا يسري أي تعديل سعري على الطلبات التي تم تأكيدها مسبقاً.
            </li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            In compliance with Egyptian consumer transparency standards, Ninja Burger guarantees straightforward billing:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700">
            <li>
              <strong>Zero Hidden Fees:</strong> The total shown in your checkout summary is the exact, final price including food items, chosen toppings, and fixed delivery charge (30 EGP).
            </li>
            <li>
              <strong>Cash on Delivery (COD):</strong> Supported on all standard customer orders.
            </li>
            <li>
              <strong>Price Adjustments:</strong> Menu prices may adjust based on market raw ingredient costs, but pre-confirmed orders are strictly locked at the ordered rate.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'fake-orders',
      icon: Ban,
      titleAr: 'حظر الطلبات الوهمية وحماية حقوق المطعم',
      titleEn: 'Prohibition of Fraudulent Orders & Platform Integrity',
      contentAr: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            نظراً لأن الوجبات السريعة تُحضر خصيصاً لكل عميل، فإن إنشاء طلبات وهمية، أو رفض استلام الوجبة بدون سبب مشروع عند وصول المندوب، يعرض الحساب ورقم الهاتف للحظر الدائم من المنصة مع الاحتفاظ بالحقوق القانونية للمطعم لملاحقة حالات الاحتيال المتعمد.
          </p>
          <p className="font-semibold text-ninja-red">
            يحق للإدارة التحقق هاتفياً من صحة أرقام الهواتف الجديدة أو الطلبات الكبيرة قبل البدء في تجهيزها.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            Because fast-food smash burgers are perishable and customized per order, submitting fraudulent orders or refusing handoff without valid cause will trigger permanent blacklisting of the account and phone number.
          </p>
          <p className="font-semibold text-ninja-red">
            Management reserves the right to phone-verify first-time customers or large volume orders prior to kitchen firing.
          </p>
        </div>
      ),
    },
    {
      id: 'legal-governance',
      icon: Scale,
      titleAr: 'القانون الواجب التطبيق وحل النزاعات',
      titleEn: 'Governing Law & Dispute Resolution',
      contentAr: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            تخضع شروط هذه الخدمة وتُفسر وفقاً لأحكام <strong>قوانين جمهورية مصر العربية</strong>، وخاصة قانون حماية المستهلك رقم 181 لسنة 2018 وقانون التجارة الإلكترونية.
          </p>
          <p>
            في حال وجود أي نزاع، نفضل دائماً الحل الودي والسريع عبر التواصل المباشر مع إدارة خدمة العملاء عبر واتساب <strong>01008427736</strong> قبل اللجوء لأي إجراءات قانونية.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            These terms are governed by and construed in accordance with the laws of the <strong>Arab Republic of Egypt</strong>, specifically Consumer Protection Law No. 181 of 2018.
          </p>
          <p>
            We prioritize amicable resolutions through our direct customer hotline <strong>01008427736</strong> for immediate, fair settlement of any service disputes.
          </p>
        </div>
      ),
    },
  ]

  return (
    <LegalPageClient
      pageType="terms"
      badgeAr="وثيقة رسمية ومعتمدة"
      badgeEn="Official Legal Document"
      titleAr="شروط الاستخدام والخدمة"
      titleEn="Terms of Service & Usage Agreement"
      subtitleAr="القواعد والشروط المنظمة لطلب وتوصيل وجبات نينجا برجر الساخنة، حقوق والتزامات العميل، وإجراءات المطبخ والتوصيل."
      subtitleEn="Terms and guidelines governing food ordering and delivery services at Ninja Burger, customer responsibilities, and kitchen operational policies."
      lastUpdatedAr="آخر تحديث: 28 أكتوبر 2026"
      lastUpdatedEn="Last Updated: October 28, 2026"
      highlightAr={{
        title: 'التزام متبادل لضمان وجبة طازجة وساخنة',
        desc: 'نحن نلتزم بأعلى معايير جودة اللحم البلدي وسرعة الطهي، ونرجو منكم التأكد من دقة العنوان ورقم الهاتف للرد على المندوب فور وصوله.',
      }}
      highlightEn={{
        title: 'Mutual Commitment to Freshness & Punctuality',
        desc: 'We are committed to prime beef standards and swift flame-grilling. We request accurate address coordinates and phone readiness upon courier arrival.',
      }}
      sections={sections}
    />
  )
}
