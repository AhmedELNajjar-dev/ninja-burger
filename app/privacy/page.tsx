import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { LegalPageClient, LegalSection } from '@/components/legal/LegalPageClient'
import type { Profile } from '@/types'
import { Database, ShieldCheck, Cookie, Trash2, UserCheck, Smartphone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية وأمان البيانات | Privacy Policy — نينجا برجر',
  description:
    'سياسة الخصوصية وحماية بيانات العملاء في نينجا برجر: كيفية حفظ بياناتك في سوبابيز، الاستخدام الوظيفي لملفات تعريف الارتباط، وضمان عدم بيع أي بيانات.',
}

export default async function PrivacyPage() {
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
            At <strong>Ninja Burger</strong>, we practice strict data minimization. We only collect essential information required to prepare and safely deliver your fresh food:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 marker:text-ninja-red">
            <li>
              <strong>Full Name:</strong> To identify the customer and print order labels for kitchen packing.
            </li>
            <li>
              <strong>Egyptian Mobile Phone:</strong> Used as your unique account credential, order confirmation channel, and courier contact upon arrival.
            </li>
            <li>
              <strong>Delivery Address & GPS Pin:</strong> Street name, building number, floor, apartment, and optional map coordinates to ensure fast, piping-hot delivery.
            </li>
            <li>
              <strong>Order History & Notes:</strong> Stored to enable quick reordering and kitchen preparation according to your culinary preferences.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-security',
      icon: Database,
      titleAr: 'أمان وتخزين البيانات في Supabase وحظر بيع البيانات',
      titleEn: 'Data Security in Supabase & Zero Commercial Resale',
      contentAr: (
        <div className="space-y-3">
          <p>
            نحن نعتبر خصوصية بياناتك أمانة مقدسة. إليك التزاماتنا التقنية والأخلاقية:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <h4 className="font-bold text-ninja-dark text-sm mb-1">🔐 تشفير وتأمين Supabase</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                تُحفظ كافة بيانات الحسابات وقواعد البيانات على بنية سوبابيز التحتية المشفرة سحابياً، مع تفعيل سياسات الأمان على مستوى الصف (Row Level Security - RLS).
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <h4 className="font-bold text-ninja-dark text-sm mb-1">🚫 لا إعلانات أو بيع للبيانات</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                لا نبيع أو نؤجر أو نشارك أي بيانات شخصية مع جهات إعلانية أو وسطاء تسويق خارجيين على الإطلاق.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 pt-2">
            <strong>المشاركة الحصرية:</strong> يتم تزويد مندوب التوصيل المباشر باسمك ورقم هاتفك وعنوانك فقط خلال فترة تنفيذ التوصيل لغرض تسليم الوجبة.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            We take data security seriously with high industry standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <h4 className="font-bold text-ninja-dark text-sm mb-1">🔐 Supabase Cloud & RLS</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                All profile and order records are secured using Supabase PostgreSQL databases with strict Row Level Security (RLS) policies.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <h4 className="font-bold text-ninja-dark text-sm mb-1">🚫 Zero Third-Party Advertising</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                We never monetize, rent, or sell your personal customer data to data brokers or advertising networks.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 pt-2">
            <strong>Direct courier fulfillment:</strong> Your name, phone, and delivery pin are exclusively accessible to the active delivery driver to complete delivery.
          </p>
        </div>
      ),
    },
    {
      id: 'cookies-policy',
      icon: Cookie,
      titleAr: 'ملفات تعريف الارتباط الوظيفية الحصرية (Cookies Policy)',
      titleEn: 'Strictly Essential Cookies Only (No Tracking Scripts)',
      contentAr: (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-sm">
            <strong className="block font-black text-emerald-900 mb-1">
              ✓ نينجا برجر خالي تماماً من أدوات التتبع الإعلانية المزعجة
            </strong>
            <p className="text-xs leading-relaxed opacity-90">
              نحن لا نستخدم أي كوكيز تتبع تسويقية أو ملفات ارتباط خارجية (Third-party tracking cookies). لذلك لا نثقل متصفحك بنوافذ الموافقة المزعجة.
            </p>
          </div>
          <p>
            ملفات تعريف الارتباط الوحيدة المستخدمة على موقعنا هي ملفات وظيفية أساسية ومؤقتة:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-700">
            <li>
              <strong>رموز الجلسة (sb-*-auth-token):</strong> ملفات كوكي آمنة مشفرة لإبقاء جلسة تسجيل دخولك نشطة أثناء تصفحك وتسهيل إتمام طلباتك.
            </li>
            <li>
              <strong>تفضيل اللغة واتجاه الواجهة:</strong> حفظ خيارك المفضل (العربية أو الإنجليزية) في التخزين المحلي لمتصفحك.
            </li>
            <li>
              <strong>سلة الطلبات المؤقتة:</strong> حفظ محتويات سلة مشترياتك حتى لا تفقدها أثناء تصفح القائمة.
            </li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-sm">
            <strong className="block font-black text-emerald-900 mb-1">
              ✓ 100% Free of Invasive Ad Tracking & Profiling
            </strong>
            <p className="text-xs leading-relaxed opacity-90">
              We do not inject third-party ad retargeting pixels or cross-domain tracking beacons. No cookie consent banners are necessary because our cookies are strictly essential.
            </p>
          </div>
          <p>
            The only cookies stored in your browser are strictly functional:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-700">
            <li>
              <strong>Session Tokens (sb-*-auth-token):</strong> First-party authenticated JWT session cookies provided by Supabase Auth.
            </li>
            <li>
              <strong>Language & Direction Preferences:</strong> Locally stored choice of Arabic RTL or English LTR display.
            </li>
            <li>
              <strong>Client Shopping Cart:</strong> Temporary client-side cart storage for uninterrupted ordering.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-deletion',
      icon: Trash2,
      titleAr: 'حق حذف البيانات وإلغاء الحساب (Account Deletion Channel)',
      titleEn: 'Right to Account Deletion & Data Removal',
      contentAr: (
        <div className="space-y-3">
          <p>
            وفقاً لقوانين حماية البيانات وحقوق المستهلك، يحق لك في أي وقت طلب حذف حسابك نهائياً وكافة البيانات المرتبطة به من سجلاتنا.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-black text-sm text-ninja-dark">
              طريقة تقديم طلب الحذف الفوري:
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              أرسل رسالة من رقم هاتفك المسجل تفيد بالرغبة في حذف الحساب عبر:
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://wa.me/201008427736?text=أرغب%20في%20حذف%20حسابي%20وكافة%20بياناتي%20من%20نينجا%20برجر"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>واتساب الدعم: +20 100 842 7736</span>
              </a>
              <a
                href="mailto:info@ninjaburger-placeholder.com?subject=طلب%20حذف%20حساب%20نينجا%20برجر"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-ninja-dark font-bold text-xs rounded-xl transition-colors"
              >
                <span>البريد الإلكتروني: info@ninjaburger-placeholder.com</span>
              </a>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              يتم معالجة طلب الحذف وتأكيده لك خلال 24 ساعة عمل مع مسح كافة السجلات غير المطلوبة بموجب القوانين الضريبية والمحاسبية.
            </p>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            In full compliance with consumer data protection rights, you have the right to request the complete deletion of your account and personal profile data at any time.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-black text-sm text-ninja-dark">
              How to Request Immediate Account Deletion:
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Simply contact our customer support from your registered phone number via:
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://wa.me/201008427736?text=I%20request%20the%20complete%20deletion%20of%20my%20Ninja%20Burger%20account%20and%20data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp: +20 100 842 7736</span>
              </a>
              <a
                href="mailto:info@ninjaburger-placeholder.com?subject=Ninja%20Burger%20Account%20Deletion%20Request"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-ninja-dark font-bold text-xs rounded-xl transition-colors"
              >
                <span>Email: info@ninjaburger-placeholder.com</span>
              </a>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Your deletion request will be processed within 24 business hours, permanently removing personal identifying records.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'consumer-protection',
      icon: UserCheck,
      titleAr: 'الامتثال لقوانين حماية المستهلك المصرية',
      titleEn: 'Compliance with Egyptian Consumer Protection Laws',
      contentAr: (
        <div className="space-y-3">
          <p>
            تخضع منصة نينجا برجر لكافة القوانين واللوائح المنظمة لسلامة الغذاء وحماية المستهلك المعمول بها في جمهورية مصر العربية (بما فيها القانون رقم 181 لسنة 2018).
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            نحن ملتزمون بالشفافية الكاملة في عرض الأسعار، توفير فواتير واضحة، وحماية خصوصية العملاء في كافة مراحل الطلب والتوصيل.
          </p>
        </div>
      ),
      contentEn: (
        <div className="space-y-3">
          <p>
            Ninja Burger operates under applicable Egyptian e-commerce, consumer protection (Law No. 181/2018), and national food safety authority standards.
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            We are dedicated to transparent pricing, explicit order breakdowns, and total customer privacy throughout all digital ordering steps.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-ninja-gray flex flex-col justify-between">
      <Navbar profile={profile} />

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

      <Footer />
    </div>
  )
}
