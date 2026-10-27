import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { LegalPageClient, LegalSection } from '@/components/legal/LegalPageClient'
import type { Profile } from '@/types'
import { RotateCcw, XCircle, Award, Camera, CheckCircle2, AlertTriangle, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الإلغاء والاسترجاع والتعويض | Refund Policy — نينجا برجر',
  description:
    'سياسة الإلغاء والتعويض الفوري في نينجا برجر: متى يُسمح بإلغاء الطلب، ضمان جودة الطعام 100%، وإجراءات استبدال الوجبة أو استرداد الأموال عبر واتساب.',
}

export default async function RefundsPage() {
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
                Status: Pending (قيد الانتظار)
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Cancellation Allowed:</strong> You can cancel freely via your &ldquo;My Orders&rdquo; dashboard or instant support message with zero cancellation penalty.
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <span className="text-xs font-black text-red-800 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Status: Confirmed or Out for Delivery
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Cancellation Locked:</strong> Once the kitchen confirms your ticket and cooking begins, orders cannot be cancelled due to perishable culinary standards.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'quality-guarantee',
      icon: Award,
      titleAr: 'ضمان الجودة والتعويض الفوري (الاستبدال أو استرداد المبلغ)',
      titleEn: 'Quality Guarantee & Instant Compensation Procedure',
      contentAr: (
        <div className="space-y-3">
          <p>
            رضاك التام هو أولويتنا القصوى في <strong>نينجا برجر</strong>. إذا واجهت أي من الحالات التالية عند استلام وجبتك:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-700 marker:text-ninja-red">
            <li>
              <strong>خطأ في الصنف أو الحجم:</strong> استلام سندوتش مختلف عن المطلوب أو بحجم أو إضافات خاطئة.
            </li>
            <li>
              <strong>عناصر ناقصة:</strong> نقص في عبوات الصوصات، المشروبات، أو باكيت الفرايز المدفوع في الفاتورة.
            </li>
            <li>
              <strong>تلف ناتج عن التوصيل:</strong> تأثر التغليف أو انسكاب الصوصات أو برودة الطعام غير المعتادة أثناء الشحن.
            </li>
          </ul>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs sm:text-sm space-y-1">
            <strong className="block font-black text-amber-900">
              ⚡ خيارات التعويض الفوري بحسب رغبتك:
            </strong>
            <p className="leading-relaxed">
              1. إرسال وجبة جديدة بديلة فوراً على حساب المطعم مع سائق سريع مجاناً.<br />
              2. استرداد فوري لمبلغ الصنف المتضرر نقداً أو عبر المحفظة الرقمية (InstaPay / Vodafone Cash).<br />
              3. إضافة رصيد تعويضي في حسابك للاستفادة منه في طلبك القادم.
            </p>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            We take absolute pride in our food. If your order arrives with any of the following issues:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-700 marker:text-ninja-red">
            <li>
              <strong>Incorrect Item or Size:</strong> Receiving a burger variant, size, or topping combination distinct from your ticket.
            </li>
            <li>
              <strong>Missing Items:</strong> Omitted drinks, side sauces, or fries packets invoiced on your ticket.
            </li>
            <li>
              <strong>Delivery Damage:</strong> Packaging compromise, spillage, or unacceptable transit temperature loss.
            </li>
          </ul>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs sm:text-sm space-y-1">
            <strong className="block font-black text-amber-900">
              ⚡ Your Guaranteed Compensation Options:
            </strong>
            <p className="leading-relaxed">
              1. Immediate priority redelivery of replacement items at zero additional cost.<br />
              2. Immediate refund via digital mobile wallet (InstaPay / Vodafone Cash) or cash courier return.<br />
              3. Account store credit voucher for future ordering ease.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'photo-verification',
      icon: Camera,
      titleAr: 'خطوات التحقق السريع عبر واتساب (خلال 60 دقيقة)',
      titleEn: 'Rapid Photo Verification via WhatsApp (Within 60 Mins)',
      contentAr: (
        <div className="space-y-3">
          <p>
            لتسريع عملية التعويض وصرف البديل في دقائق معدودة، يُرجى اتباع الخطوات التالية:
          </p>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 text-xs sm:text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-ninja-red text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>التقاط صورة واضحة للصنف المتضرر أو الفاتورة المستلمة خلال <strong>60 دقيقة</strong> من استلام الطلب.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-ninja-red text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>إرسال الصورة ورقم الطلب مباشرة إلى واتساب خدمة العملاء:</span>
            </div>
            <div className="pt-1">
              <a
                href="https://wa.me/201008427736?text=مرحباً%20نينجا%20برجر،%20لدي%20ملاحظة%20بخصوص%20طلبي"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال الصورة عبر واتساب: +20 100 842 7736</span>
              </a>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <span className="w-5 h-5 rounded-full bg-ninja-red text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>يقوم فريق الدعم بالتحقق الفوري واعتماد التعويض دون أي إجراءات بيروقراطية معقدة.</span>
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            To process your instant replacement or refund in minutes, please follow this simple 3-step channel:
          </p>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 text-xs sm:text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-ninja-red text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Snap a quick photo of the delivered packaging or incorrect item within <strong>60 minutes</strong> of delivery.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-ninja-red text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Forward the photo and your order ID to our official customer care WhatsApp:</span>
            </div>
            <div className="pt-1">
              <a
                href="https://wa.me/201008427736?text=Hello%20Ninja%20Burger%20Support,%20I%20have%20an%20issue%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Submit Photo on WhatsApp: +20 100 842 7736</span>
              </a>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <span className="w-5 h-5 rounded-full bg-ninja-red text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Our support agent verifies within minutes and initiates compensation immediately.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'perishable-rules',
      icon: RotateCcw,
      titleAr: 'قواعد الأغذية القابلة للتلف والسلامة الصحية',
      titleEn: 'Hygiene & Perishable Food Handling Safety Standards',
      contentAr: (
        <div className="space-y-3">
          <p>
            تطبيقاً لأعلى معايير سلامة الأغذية المعمول بها في مصر:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            لا يقبل المطعم استرجاع السندوتشات أو الأطعمة الساخنة بعد فتحها أو بعد مغادرة المندوب لموقع الاستلام لغير الأسباب المتعلقة بأخطاء التحضير أو التلف، وذلك لضمان الحفاظ على سلامة ونظافة سلسلة الغذاء لجميع المستهلكين.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            In alignment with national food hygiene guidelines:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Prepared food items cannot be physically accepted back into restaurant storage once delivered or opened, except for verified inspection and compensation purposes, safeguarding cross-contamination hygiene protocols.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-ninja-gray flex flex-col justify-between">
      <Navbar profile={profile} />

      <LegalPageClient
        pageType="refunds"
        badgeAr="ضمان الجودة وحق التعويض"
        badgeEn="Quality Guarantee & Compensation"
        titleAr="سياسة الإلغاء والاسترجاع والتعويض"
        titleEn="Refund, Cancellation & Compensation Policy"
        subtitleAr="نضمن لك طعماً لا يُنسى وحق التعويض الفوري أو الاستبدال في حال وجود أي نقص أو خطأ في الوجبة عند التوصيل."
        subtitleEn="We guarantee unrivaled taste and immediate compensation or replacement if your order arrives damaged, incorrect, or missing items."
        lastUpdatedAr="آخر تحديث: 28 أكتوبر 2026"
        lastUpdatedEn="Last Updated: October 28, 2026"
        highlightAr={{
          title: 'ضمان رضا العميل 100% وتعويض فوري',
          desc: 'في حال وجود أي خطأ أو صنف ناقص، أرسل صورة للطلب عبر واتساب خلال 60 دقيقة وسنوفر لك وجبة بديلة فوراً أو استرداد نقدي كامل.',
        }}
        highlightEn={{
          title: '100% Customer Satisfaction & Instant Remedy',
          desc: 'If an item is incorrect or missing, send a quick photo via WhatsApp within 60 minutes for immediate replacement dispatch or full refund.',
        }}
        sections={sections}
      />

      <Footer />
    </div>
  )
}
