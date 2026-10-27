'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Heart,
} from 'lucide-react';

export function Footer() {
  const { t, isArabic } = useTranslation();
  return (
    <footer className="bg-ninja-dark text-white border-t border-white/10 mt-16 pt-12 pb-8" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Col 1: Brand Info & Accreditation */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🥷</span>
              <div>
                <span className="text-2xl font-black text-white">NINJA</span>{' '}
                <span className="text-2xl font-black text-ninja-yellow">BURGER</span>
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isArabic
                ? 'أقوى وألذ برجر مشوي على الفحم في المعادي. مكونات طازجة 100%، صوصات سرية خاصة، وتوصيل سريع! 🍔🔥'
                : 'The best charcoal flame-grilled smashed burgers in Maadi. 100% fresh ingredients, secret sauces, and fast delivery! 🍔🔥'}
            </p>

            {/* Commercial Badges */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-ninja-yellow shrink-0" />
                <span>{isArabic ? 'سجل تجاري:' : 'CR No:'}</span>
                <span className="font-mono text-white font-bold">184920</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-ninja-yellow shrink-0" />
                <span>{isArabic ? 'بطاقة ضريبية:' : 'Tax ID:'}</span>
                <span className="font-mono text-white font-bold">683-912-450</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com/your-page-placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-ninja-red flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/your-page-placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-ninja-red flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/201008427736"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Working Hours & Delivery */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-ninja-yellow" />
              {t.workingHours}
            </h4>
            <div className="text-xs text-gray-400 space-y-2">
              <p className="flex justify-between border-b border-white/5 pb-1">
                <span>{isArabic ? 'السبت – الأربعاء:' : 'Sat – Wed:'}</span>
                <span className="text-white font-mono" dir="ltr">12:00 PM – 02:00 AM</span>
              </p>
              <p className="flex justify-between border-b border-white/5 pb-1">
                <span>{isArabic ? 'الخميس – الجمعة:' : 'Thu – Fri:'}</span>
                <span className="text-white font-mono" dir="ltr">12:00 PM – 03:30 AM</span>
              </p>
              <p className="text-[11px] text-ninja-yellow font-semibold pt-1">
                {isArabic ? '⚡ توصيل مستمر طوال ساعات العمل' : '⚡ Continuous delivery during open hours'}
              </p>
            </div>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ninja-yellow" />
              {t.contactUs}
            </h4>
            <ul className="text-xs text-gray-400 space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-ninja-red shrink-0 mt-0.5" />
                <span>{t.locationDesc}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ninja-red shrink-0" />
                <a href="tel:01008427736" className="text-white hover:text-ninja-yellow transition-colors font-mono" dir="ltr">
                  01008427736
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/201008427736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-emerald-400 transition-colors font-mono"
                  dir="ltr"
                >
                  +20 100 842 7736 (واتساب)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-ninja-red shrink-0" />
                <a href="mailto:info@ninjaburger-placeholder.com" className="hover:text-ninja-yellow transition-colors font-mono text-[11px]" dir="ltr">
                  info@ninjaburger-placeholder.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ninja-yellow" />
              {t.quickLinks}
            </h4>
            <ul className="text-xs text-gray-400 space-y-2">
              <li>
                <Link href="/#menu" className="hover:text-white transition-colors">
                  {isArabic ? '🍔 قائمة البرجر والوجبات' : '🍔 Burgers & Meals'}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  {isArabic ? '📦 تتبع ومتابعة طلباتي' : '📦 Track My Orders'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {isArabic ? '👤 حسابي الشخصي' : '👤 My Account'}
                </Link>
              </li>
            </ul>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-400 mt-2">
              {isArabic
                ? '🛡️ لحوم بلدية طازجة يومياً 100% بدون إضافات مصنعة.'
                : '🛡️ 100% fresh local beef prepared daily with no artificial fillers.'}
            </div>
          </div>

          {/* Col 5: Dedicated Policies & Legal Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ninja-red" />
              {t.policiesTitle}
            </h4>
            <ul className="text-xs text-gray-400 space-y-2">
              <li>
                <Link href="/terms" className="hover:text-ninja-yellow transition-colors">
                  {isArabic ? '📄 شروط الاستخدام والخدمة' : '📄 Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ninja-yellow transition-colors">
                  {isArabic ? '🔒 سياسة الخصوصية وأمان البيانات' : '🔒 Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-ninja-yellow transition-colors">
                  {isArabic ? '🔄 سياسة الإلغاء والاسترجاع والتعويض' : '🔄 Refund & Cancellation'}
                </Link>
              </li>
            </ul>
            <div className="p-2.5 bg-ninja-red/10 border border-ninja-red/30 rounded-xl text-[11px] text-gray-300">
              {isArabic
                ? '✅ خاضعون لمعايير سلامة الغذاء وحماية المستهلك المصرية.'
                : '✅ Compliant with Egyptian Food Safety & Consumer Protection regulations.'}
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className={`border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3 text-center ${isArabic ? 'sm:text-right' : 'sm:text-left'}`}>
          <p>
            {isArabic
              ? `© ${new Date().getFullYear()} نينجا برجر (Ninja Burger). جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Ninja Burger. All rights reserved.`}
          </p>
          <p className="flex items-center justify-center gap-1">
            {isArabic ? 'صُنع بحب' : 'Made with'}{' '}
            <Heart className="w-3.5 h-3.5 text-ninja-red inline fill-ninja-red" />{' '}
            {isArabic ? 'لخدمة عشاق البرجر' : 'for burger lovers'}
          </p>
        </div>
      </div>
    </footer>
  );
}
