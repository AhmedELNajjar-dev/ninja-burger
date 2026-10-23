'use client';

import React from 'react';
import Link from 'next/link';
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
  return (
    <footer className="bg-ninja-dark text-white border-t border-white/10 mt-16 pt-12 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🥷</span>
              <div>
                <span className="text-2xl font-black text-white">NINJA</span>{' '}
                <span className="text-2xl font-black text-ninja-yellow">BURGER</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              أقوى وألذ برجر مشوي على الفحم في قلب المعادي. مكونات طازجة 100%، صوصات سرية خاصة، وطعم لا يُنسى! 🍔🔥
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com/your-page-placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-ninja-red flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/your-page-placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-ninja-red flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/201008427736"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-ninja-yellow" />
              ساعات العمل والتوصيل
            </h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p className="flex justify-between border-b border-white/5 pb-1.5">
                <span>السبت – الأربعاء:</span>
                <span className="text-white font-mono" dir="ltr">12:00 PM – 02:00 AM</span>
              </p>
              <p className="flex justify-between border-b border-white/5 pb-1.5">
                <span>الخميس – الجمعة:</span>
                <span className="text-white font-mono" dir="ltr">12:00 PM – 03:30 AM</span>
              </p>
              <p className="text-xs text-ninja-yellow font-semibold pt-1">
                ⚡ خدمة التوصيل متوفرة طوال ساعات العمل
              </p>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ninja-yellow" />
              العنوان والتواصل
            </h4>
            <ul className="text-sm text-gray-400 space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-ninja-red shrink-0 mt-0.5" />
                <span>156 شارع 9، ميدان دمشق، المعادي، القاهرة</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-ninja-red shrink-0" />
                <a href="tel:01008427736" className="text-white hover:text-ninja-yellow transition-colors font-mono" dir="ltr">
                  01008427736
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-ninja-red shrink-0" />
                <a href="mailto:info@ninjaburger-placeholder.com" className="hover:text-ninja-yellow transition-colors font-mono text-xs" dir="ltr">
                  info@ninjaburger-placeholder.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links & Service Guarantee */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ninja-yellow" />
              روابط سريعة
            </h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>
                <Link href="#menu" className="hover:text-white transition-colors">
                  🍔 قائمة البرجر والسندوتشات
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  📦 تتبع طلباتي السابقة
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-ninja-yellow transition-colors text-xs text-gray-500">
                  🔒 لوحة تحكم الإدارة
                </Link>
              </li>
            </ul>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-400 mt-2">
              🛡️ لحوم بلدي طازجة 100% يومياً، بدون مواد حافظة.
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3 text-center sm:text-right">
          <p>© {new Date().getFullYear()} نينجا برجر (Ninja Burger). جميع الحقوق محفوظة.</p>
          <p className="flex items-center justify-center gap-1">
            صُنع بحب <Heart className="w-3.5 h-3.5 text-ninja-red inline fill-ninja-red" /> لخدمة عشاق البرجر
          </p>
        </div>
      </div>
    </footer>
  );
}
