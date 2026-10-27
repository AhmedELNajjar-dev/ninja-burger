import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { LegalPageClient, LegalSection } from '@/components/legal/LegalPageClient'
import type { Profile } from '@/types'
import { ShoppingBag, Banknote, MapPin, Truck, AlertCircle, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'شروط واستخدام الخدمة | Terms of Service — نينجا برجر',
  description:
    'شروط وأحكام استخدام منصة نينجا برجر: قواعد الطلب، رسوم التوصيل الشفافة (35 ج)، الدفع عند الاستلام، ومسؤوليات العميل.',
}

export default async function TermsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = data ?? null
  }

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
              <p className="text-xs text-gray-600">Chefs have begun grilling fresh beef and assembling ingredients. Cancellation closes as cooking begins.</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl">
              <span className="text-xs font-black text-purple-700 block mb-1">3. Out for Delivery</span>
              <p className="text-xs text-gray-600">Packed in insulated thermal delivery bags and dispatched with the assigned courier to your door.</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 pt-1">
            Estimated prep & delivery duration ranges between 25 to 45 minutes depending on order volume and Maadi traffic.
          </p>
        </div>
      ),
    },
    {
      id: 'pricing-payment',
      icon: Banknote,
      titleAr: 'شفافية الأسعار، رسوم التوصيل، وطرق الدفع المعتمدة',
      titleEn: 'Pricing Transparency, Delivery Fees & Accepted Payment',
      contentAr: (
        <div className="space-y-3">
          <p>
            نحن نلتزم بالوضوح التام مع عملائنا دون أي رسوم مخفية أو تكاليف غير معلنة:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 marker:text-ninja-red">
            <li>
              <strong>الأسعار المعلنة:</strong> جميع أسعار السندوتشات والإضافات والمشروبات معروضة بالجنيه المصري (ج.م) وتشمل كافة الضرائب القانونية المطبقة.
            </li>
            <li>
              <strong>رسوم التوصيل الثابتة (35 ج):</strong> رسوم توصيل الطلبات للمنازل محددة بمبلغ ثابت 35 جنيهاً مصرياً لكافة مناطق التغطية في المعادي والمناطق المحيطة.
            </li>
            <li>
              <strong>الاستلام من الفرع (0 ج مجاناً):</strong> في حال اختيار الاستلام من الفرع (شارع 9، المعادي)، لا يتم احتساب أي رسوم توصيل على الإطلاق.
            </li>
            <li>
              <strong>الدفع عند الاستلام (Cash on Delivery):</strong> يتم سداد إجمالي الفاتورة نقداً للمندوب فور فحص واستلام وجبتك. كما نقبل التحويل عبر المحافظ الرقمية وتطبيقات الدفع المعتمدة (مثل إنستاباي InstaPay) بالتنسيق المسبق مع خدمة العملاء.
            </li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            We guarantee 100% pricing transparency with zero hidden fees:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 marker:text-ninja-red">
            <li>
              <strong>Displayed Prices:</strong> All sandwich, side, and drink prices are listed in Egyptian Pounds (EGP) inclusive of applicable taxes.
            </li>
            <li>
              <strong>Fixed Delivery Fee (35 EGP):</strong> Home delivery carries a transparent flat fee of 35 EGP throughout our Maadi service perimeter.
            </li>
            <li>
              <strong>Store Pickup (0 EGP Free):</strong> Selecting pickup from our main branch (Street 9, Maadi) carries zero delivery charges.
            </li>
            <li>
              <strong>Cash on Delivery (COD):</strong> Orders are settled in cash upon receipt from the courier. Verified mobile payment transfers (e.g. InstaPay / Vodafone Cash) may be coordinated with support.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'customer-responsibilities',
      icon: MapPin,
      titleAr: 'مسؤوليات العميل ودقة بيانات التوصيل والتواصل',
      titleEn: 'Customer Responsibilities & Accurate Delivery Coordinates',
      contentAr: (
        <div className="space-y-3">
          <p>
            لضمان وصول وجبتك بأعلى جودة وسخونة، يلتزم العميل بالآتي:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <strong>📞 إتاحة هاتف محمول فعال:</strong> يجب أن يكون رقم الهاتف المصري المدخل في الطلب مفتوحاً ومتاحاً للرد على اتصالات مندوب التوصيل للتنسيق عند الوصول.
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <strong>📍 دقة العنوان وتثبيت الدبوس:</strong> إدخال اسم الشارع، رقم العمارة، الدور، الشقة، وتثبيت الدبوس على الخريطة لتفادي أي تأخير ناتج عن تشابه أسماء الشوارع.
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <strong>⏱️ مهلة انتظار المندوب:</strong> ينتظر المندوب في موقع التوصيل بحد أقصى 10 دقائق بعد محاولات الاتصال. في حال تعذر الوصول للعميل، يحق للمطعم إعادة الوجبة نظراً لتعرض الأطعمة الجاهزة للتلف.
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            To maintain premium food temperature and fast fulfillment, customers agree to:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <strong>📞 Reachable Contact Number:</strong> Keep the registered Egyptian phone reachable for driver coordination upon arrival.
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <strong>📍 Detailed Address & Pin:</strong> Provide accurate building, floor, apartment numbers, and map pin to prevent routing delays.
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <strong>⏱️ Courier Waiting Grace Period:</strong> Couriers wait up to 10 minutes at the destination. If the customer remains unreachable after multiple call attempts, the restaurant may cancel delivery due to food perishing risks.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'perishable-goods-law',
      icon: AlertCircle,
      titleAr: 'طبيعة السلع الغذائية الجاهزة وحماية المستهلك',
      titleEn: 'Perishable Prepared Food Regulations (Consumer Protection)',
      contentAr: (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 text-xs sm:text-sm space-y-1.5">
            <strong className="block font-black text-amber-900">
              قانون حماية المستهلك المصري رقم 181 لسنة 2018 (المادة 17)
            </strong>
            <p className="leading-relaxed">
              تُعد وجبات الطعام والبرجر الطازجة المحضرة خصيصاً للعميل من السلع القابلة للتلف السريع، وتُستثنى بحكم القانون من أحكام الاسترجاع والاستبدال العامة المطبقة على السلع المعمرة بمجرد بدء تجهيزها أو تسليمها، وذلك حفاظاً على الصحة العامة وسلامة الغذاء.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            في حالة وجود أي خطأ في الأصناف المستلمة أو تلف ناتج عن التوصيل، تطبق فوراً إجراءات التعويض والاستبدال الموضحة في <strong>سياسة الاسترجاع والتعويض</strong>.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 text-xs sm:text-sm space-y-1.5">
            <strong className="block font-black text-amber-900">
              Egyptian Consumer Protection Law No. 181/2018 (Article 17)
            </strong>
            <p className="leading-relaxed">
              Custom-prepared meals and burgers constitute rapidly perishable foodstuffs exempt by law from general 14-day statutory return rights once cooked or dispatched, safeguarding food hygiene and public health.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            In the event of culinary discrepancy, damaged delivery, or kitchen oversight, our prompt compensation procedure applies immediately under our <strong>Refund Policy</strong>.
          </p>
        </div>
      ),
    },
    {
      id: 'service-modifications',
      icon: FileCheck,
      titleAr: 'التعديلات وسريان الشروط',
      titleEn: 'Terms Amendments & Enforceability',
      contentAr: (
        <div className="space-y-3">
          <p>
            تحتفظ إدارة نينجا برجر بالحق في تحديث وتطوير هذه الشروط لتعكس أي تغييرات في اللوائح القانونية أو سياسات التشغيل. استمرارك في استخدام المنصة وتقديم الطلبات يعد موافقة تامة على الشروط المحدثة.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            Ninja Burger reserves the right to periodically revise these service terms in accordance with operational improvements and legal standards. Continued usage of our online ordering platform constitutes full acceptance.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-ninja-gray flex flex-col justify-between">
      <Navbar profile={profile} />

      <LegalPageClient
        pageType="terms"
        badgeAr="عقد تقديم الخدمة والشروط"
        badgeEn="Service Agreement & Terms"
        titleAr="شروط واستخدام منصة نينجا برجر"
        titleEn="Terms of Service & Ordering Agreement"
        subtitleAr="توضح هذه الوثيقة التزامات نينجا برجر تجاه عملائنا الكرام، وقواعد تقديم الطلبات، شفافية الأسعار، ومسؤوليات الاستلام والتوصيل."
        subtitleEn="This document outlines our mutual commitments, ordering lifecycle, transparent delivery fees, and customer coordination protocols."
        lastUpdatedAr="آخر تحديث: 28 أكتوبر 2026"
        lastUpdatedEn="Last Updated: October 28, 2026"
        highlightAr={{
          title: 'أسعار واضحة ورسوم توصيل ثابتة (35 ج)',
          desc: 'لا توجد أي رسوم خفية أو تكاليف غير معلنة. جميع الأسعار نهائية وتوصيلنا ثابت، مع توفير خيار الاستلام المجاني من الفرع.',
        }}
        highlightEn={{
          title: 'Transparent Pricing & Flat 35 EGP Delivery',
          desc: 'Zero hidden fees. All meal prices are all-inclusive with flat delivery rates and 100% free branch pickup.',
        }}
        sections={sections}
      />

      <Footer />
    </div>
  )
}
