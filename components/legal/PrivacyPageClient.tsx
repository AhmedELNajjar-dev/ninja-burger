'use client'

import React from 'react'
import { LegalPageClient, LegalSection } from './LegalPageClient'
import { Database, ShieldCheck, Cookie, Trash2, UserCheck, Smartphone } from 'lucide-react'

export function PrivacyPageClient() {
  const sections: LegalSection[] = [
    {
      id: 'data-collected',
      icon: Smartphone,
      titleAr: 'ما هي البيانات التي نجمعها ولماذا؟',
      titleEn: 'What Data We Collect & Why',
      contentAr: (
        <div className="space-y-3">
          <p>
            في <strong>نينجا برجر (Ninja Burger)</strong>، نحرص على جمع الحد الأدنى الضروري من البيانات الشخصية لتشغيل خدمة توصيل الطعام وتجهيز وجباتك بدقة متناهية:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 marker:text-ninja-red">
            <li>
              <strong>الاسم بالكامل (Full Name):</strong> لتمييز صاحب الطلب وطباعة اسم العميل على فاتورة المطبخ وتغليف السندوتشات.
            </li>
            <li>
              <strong>رقم الهاتف المحمول (Egyptian Phone Number):</strong> لتسجيل الدخول بأمان، وإرسال إشعارات حالة الطلب عبر واتساب أو الرسائل، وتمكين مندوب التوصيل من الاتصال بك عند الوصول.
            </li>
            <li>
              <strong>عنوان التوصيل والإحداثيات (Delivery Address & Location Pin):</strong> اسم الشارع، رقم العمارة، الدور، الشقة، وإحداثيات GPS الدقيقة لضمان وصول وجبتك طازجة وساخنة وبأسرع وقت.
            </li>
            <li>
              <strong>سجل الطلبات والتفضيلات (Order History):</strong> لحفظ تفضيلاتك وسندوتشاتك المفضلة وتسهيل إعادة الطلب بنقرة واحدة من صفحة &ldquo;طلباتي&rdquo;.
            </li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            At <strong>Ninja Burger</strong>, we practice strict data minimization, collecting only essential personal information required to prepare and deliver your fresh meals:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 marker:text-ninja-red">
            <li>
              <strong>Full Name:</strong> To accurately label your kitchen ticket, meal bags, and verify customer identity upon handoff.
            </li>
            <li>
              <strong>Mobile Phone Number:</strong> For secure authentication, WhatsApp/SMS order status updates, and courier arrival contact.
            </li>
            <li>
              <strong>Delivery Address & GPS Pin:</strong> Street name, building, floor, apartment number, and coordinates to guarantee prompt delivery.
            </li>
            <li>
              <strong>Order History & Favorites:</strong> Saved items and preferences to enable quick one-click reordering from &ldquo;My Orders&rdquo;.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'security-supabase',
      icon: Database,
      titleAr: 'تأمين البيانات والتخزين السحابي (Supabase)',
      titleEn: 'Cloud Storage & Supabase Security Architecture',
      contentAr: (
        <div className="space-y-3">
          <p>
            تُحفظ كافة بيانات العملاء وكلمات المرور المشفرة وسجلات العناوين على بنية تحتية سحابية آمنة توفرها شركة <strong>Supabase Inc.</strong>، مع تطبيق المعايير العالمية التالية:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-150">
              <span className="text-xs font-black text-ninja-red block mb-1">🔐 تشفير تام للاتصال (TLS 1.3 / SSL)</span>
              <p className="text-xs text-gray-600">كافة الاتصالات بين هاتفك أو حاسوبك وقواعد البيانات مشفرة بالكامل أثناء النقل والتخزين.</p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-150">
              <span className="text-xs font-black text-ninja-red block mb-1">🛡️ أمان على مستوى الصف (RLS Policies)</span>
              <p className="text-xs text-gray-600">لا يمكن لأي عميل الاطلاع على بيانات أو طلبات أو عناوين أي عميل آخر نهائياً.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 pt-1">
            نحن لا نخزن أي أرقام بطاقات ائتمانية على خوادمنا نهائياً. يتم التعامل مع الدفع عبر بوابات دفع بنكية معتمدة ومشفرة.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            All user profiles, encrypted credentials, and delivery addresses are hosted on enterprise cloud infrastructure powered by <strong>Supabase Inc.</strong> under strict security controls:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-150">
              <span className="text-xs font-black text-ninja-red block mb-1">🔐 End-to-End Encryption (TLS 1.3 / SSL)</span>
              <p className="text-xs text-gray-600">All data in transit and at rest is secured via modern cryptographic protocols.</p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-150">
              <span className="text-xs font-black text-ninja-red block mb-1">🛡️ Row Level Security (RLS)</span>
              <p className="text-xs text-gray-600">Strict database rules isolate customer records; no user can ever access another customer&apos;s data.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 pt-1">
            We never store raw debit/credit card numbers on our servers. Electronic payments are processed by PCI-DSS certified banking gateways.
          </p>
        </div>
      ),
    },
    {
      id: 'no-third-party-sale',
      icon: ShieldCheck,
      titleAr: 'عدم بيع البيانات والحد من مشاركتها',
      titleEn: 'Strict Non-Disclosure & Zero Data Selling',
      contentAr: (
        <div className="space-y-3">
          <p className="font-semibold text-ninja-dark">
            تلتزم إدارة نينجا برجر التزاماً قانونياً وأخلاقياً صارماً بعدم بيع أو تأجير أو المتاجرة ببيانات العملاء لأي طرف ثالث أو شبكات تسويقية أو وكالات إعلانية تحت أي ظرف.
          </p>
          <p>
            مشاركة البيانات تقتصر حصراً على الأطراف التشغيلية المباشرة الضرورية لتوصيل وجبتك:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700">
            <li>
              <strong>مندوب التوصيل المباشر:</strong> يحصل على اسمك ورقم هاتفك وعنوانك لتسليم الطلب والتواصل معك عند الوصول فقط.
            </li>
            <li>
              <strong>خدمة العملاء:</strong> للرد على استفساراتك عبر واتساب أو الهاتف ومساعدتك في تعديل الطلب أو متابعة الشكاوى.
            </li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p className="font-semibold text-ninja-dark">
            Ninja Burger makes an uncompromising legal and ethical commitment: We never sell, rent, monetize, or trade your personal data to any third party, broker, or advertising network.
          </p>
          <p>
            Data access is strictly limited to direct operational personnel required to fulfill your food order:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700">
            <li>
              <strong>Assigned Delivery Courier:</strong> Receives customer name, phone, and delivery pin exclusively to navigate and hand off the order.
            </li>
            <li>
              <strong>Customer Support Team:</strong> To assist you with order status, address updates, or refund coordination via WhatsApp/Phone.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'functional-cookies',
      icon: Cookie,
      titleAr: 'ملفات تعريف الارتباط الوظيفية (بدون تتبع إعلاني)',
      titleEn: 'Strictly Functional Cookies (Zero Ad Trackers)',
      contentAr: (
        <div className="space-y-3">
          <p>
            يستخدم موقع <strong>نينجا برجر</strong> ملفات تعريف ارتباط (Cookies) وظيفية حتمية فقط:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 marker:text-ninja-red">
            <li>
              <strong>ملفات جلسة الدخول المشفرة (sb-*-auth-token):</strong> للحفاظ على تسجيل دخولك الآمن وحفظ سلة المشتريات الخاصة بك.
            </li>
            <li>
              <strong>تفضيل اللغة (Direction & Language Preference):</strong> لتذكر اختيارك بين العربية والإنجليزية عند إعادة الزيارة.
            </li>
          </ul>
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
            ✅ نحن لا نستخدم أي كوكيز تتبع تسويقي خارجي (مثل Facebook Pixel أو Google Ads Remarketing). لذلك لا يحتاج موقعنا لنوافذ موافقة منبثقة مزعجة طبقاً للوائح حماية المستهلك والخصوصية العالمية.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            <strong>Ninja Burger</strong> utilizes strictly essential first-party cookies necessary for platform operation:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 marker:text-ninja-red">
            <li>
              <strong>Encrypted Authentication Tokens (sb-*-auth-token):</strong> To keep your session securely authenticated and maintain your active cart.
            </li>
            <li>
              <strong>Language & Layout Preference:</strong> To remember your Arabic (RTL) or English (LTR) language selection.
            </li>
          </ul>
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
            ✅ We do not load third-party marketing or cross-site tracking cookies (e.g. Meta Pixel, TikTok Ads). Consequently, intrusive cookie consent banners are neither legally required nor deployed.
          </p>
        </div>
      ),
    },
    {
      id: 'deletion-rights',
      icon: Trash2,
      titleAr: 'حق حذف البيانات وإلغاء الحساب (Right to Erasure)',
      titleEn: 'Data Deletion Requests & Right to Erasure',
      contentAr: (
        <div className="space-y-3">
          <p>
            يحق لك في أي وقت ممارسة حقك القانوني في حذف بياناتك الشخصية بالكامل من خوادم نينجا برجر:
          </p>
          <p className="text-xs text-gray-700">
            لحذف حسابك، سجل عناوينك، أو رقم هاتفك، يمكنك إرسال رسالة مباشرة إلى فريق الدعم عبر <strong>واتساب (01008427736)</strong> أو البريد الإلكتروني مع ذكر رقم الهاتف المسجل.
          </p>
          <p className="text-xs text-gray-500 italic">
            * ملاحظة: يتم حذف الحساب والبيانات الشخصية خلال 48 ساعة كحد أقصى، مع الاحتفاظ فقط بفواتير الحسابات المالية المشفرة المفروضة بحكم قوانين الضرائب والمحاسبة التجارية المصرية.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            You retain full legal rights under data protection principles to request the complete erasure of your personal records from Ninja Burger databases:
          </p>
          <p className="text-xs text-gray-700">
            To delete your account, saved addresses, or phone number, simply message our support line on <strong>WhatsApp (01008427736)</strong> or email us with your registered phone number.
          </p>
          <p className="text-xs text-gray-500 italic">
            * Note: Account records are purged within 48 business hours, retaining only anonymized tax invoice archives mandated by Egyptian commercial accounting regulations.
          </p>
        </div>
      ),
    },
    {
      id: 'compliance-officer',
      icon: UserCheck,
      titleAr: 'مسؤول الامتثال والتواصل القانوني',
      titleEn: 'Data Protection Officer & Legal Contact',
      contentAr: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            إذا كان لديك أي استفسار قانوني، ملاحظة تتعلق ببياناتك، أو طلب مساعدة في ممارسة حقوقك كمستهلك، يسعدنا تواصلك مع إدارة المطعم:
          </p>
          <ul className="space-y-1 font-semibold text-ninja-dark">
            <li>📍 <strong>المقر الرئيسي:</strong> شارع 9، المعادي، القاهرة، جمهورية مصر العربية.</li>
            <li>📞 <strong>الخط الساخن:</strong> 01008427736</li>
            <li>💬 <strong>واتساب الشكاوى:</strong> +201008427736</li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            For legal inquiries, data protection queries, or to exercise your consumer rights under Egyptian Consumer Protection Law, contact our management desk:
          </p>
          <ul className="space-y-1 font-semibold text-ninja-dark">
            <li>📍 <strong>Restaurant Headquarters:</strong> Street 9, Maadi, Cairo, Arab Republic of Egypt.</li>
            <li>📞 <strong>Hotline:</strong> 01008427736</li>
            <li>💬 <strong>WhatsApp Inquiries:</strong> +201008427736</li>
          </ul>
        </div>
      ),
    },
  ]

  return (
    <LegalPageClient
      pageType="privacy"
      badgeAr="وثيقة رسمية ومعتمدة"
      badgeEn="Official Legal Document"
      titleAr="سياسة الخصوصية وأمان البيانات"
      titleEn="Privacy & Data Security Policy"
      subtitleAr="نلتزم في نينجا برجر بحماية بياناتك الشخصية وتأمينها في Supabase، واستخدام ملفات تعريف ارتباط وظيفية فقط دون أي تتبع إعلاني."
      subtitleEn="At Ninja Burger, we are committed to safeguarding your personal data in Supabase with strictly essential session cookies and zero commercial tracking."
      lastUpdatedAr="آخر تحديث: 28 أكتوبر 2026"
      lastUpdatedEn="Last Updated: October 28, 2026"
      highlightAr={{
        title: 'خصوصيتك محمية 100% بدون أي تتبع تسويقي',
        desc: 'بياناتك الشخصية تُستخدم فقط لتجهيز وتوصيل وجبتك الساخنة. لا نشارك بياناتك مع أي معلنين أو شبكات تسويقية.',
      }}
      highlightEn={{
        title: '100% Protected Privacy with Zero Ad Tracking',
        desc: 'Your personal data is strictly collected to prepare and deliver your meal. We never share or sell customer data to advertisers.',
      }}
      sections={sections}
    />
  )
}
