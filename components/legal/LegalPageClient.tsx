'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  Lock,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Globe,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export interface LegalSection {
  id: string
  icon: React.ElementType
  titleAr: string
  titleEn: string
  contentAr: React.ReactNode
  contentEn: React.ReactNode
}

export interface LegalPageClientProps {
  pageType: 'privacy' | 'terms' | 'refunds'
  badgeAr: string
  badgeEn: string
  titleAr: string
  titleEn: string
  subtitleAr: string
  subtitleEn: string
  lastUpdatedAr: string
  lastUpdatedEn: string
  highlightAr?: { title: string; desc: string }
  highlightEn?: { title: string; desc: string }
  sections: LegalSection[]
}

export function LegalPageClient({
  pageType,
  badgeAr,
  badgeEn,
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  lastUpdatedAr,
  lastUpdatedEn,
  highlightAr,
  highlightEn,
  sections,
}: LegalPageClientProps) {
  const { t, isArabic, toggleLanguage } = useTranslation()

  const ArrowIcon = isArabic ? ArrowRight : ArrowLeft

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Navigation & Language Switch */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-ninja-red transition-colors"
        >
          <ArrowIcon className="w-4 h-4" />
          <span>{isArabic ? 'العودة للرئيسية والقائمة' : 'Back to Home & Menu'}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200 shadow-sm cursor-pointer transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-ninja-red" />
          <span>{t.langButtonText}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-gray-150 mb-8"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-ninja-red/10 text-ninja-red text-xs font-black rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isArabic ? badgeAr : badgeEn}
          </span>
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {isArabic ? lastUpdatedAr : lastUpdatedEn}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-ninja-dark leading-tight mb-3">
          {isArabic ? titleAr : titleEn}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
          {isArabic ? subtitleAr : subtitleEn}
        </p>

        {/* Highlight Callout Box (if present) */}
        {((isArabic && highlightAr) || (!isArabic && highlightEn)) && (
          <div className="mt-6 p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 space-y-1">
              <strong className="font-black block text-amber-900">
                {isArabic ? highlightAr?.title : highlightEn?.title}
              </strong>
              <p className="leading-relaxed opacity-90">
                {isArabic ? highlightAr?.desc : highlightEn?.desc}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Navigation Pills */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          {isArabic ? 'فهرس البنود السريع:' : 'Quick Navigation:'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {sections.map((section, idx) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-3 py-1.5 bg-white hover:bg-ninja-red hover:text-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors shadow-xs"
            >
              {idx + 1}. {isArabic ? section.titleAr : section.titleEn}
            </a>
          ))}
        </div>
      </div>

      {/* Main Legal Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => {
          const IconComponent = section.icon
          return (
            <motion.section
              id={section.id}
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-150 scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-ninja-red/10 text-ninja-red flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-ninja-red uppercase tracking-wider">
                    {isArabic ? `البند ${index + 1}` : `Section ${index + 1}`}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-ninja-dark">
                    {isArabic ? section.titleAr : section.titleEn}
                  </h3>
                </div>
              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-4">
                {isArabic ? section.contentAr : section.contentEn}
              </div>
            </motion.section>
          )
        })}
      </div>

      {/* Official Support & Contact Box */}
      <div className="mt-10 bg-gradient-to-br from-ninja-dark to-black text-white rounded-3xl p-6 sm:p-8 shadow-card border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-ninja-yellow uppercase tracking-wider">
              {isArabic ? 'خدمة العملاء وحقوق المستهلك' : 'Support & Consumer Rights'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isArabic
                ? 'هل لديك أي استفسار أو طلب بخصوص السياسات؟'
                : 'Have questions or requests regarding our policies?'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              {isArabic
                ? 'فريق خدمة عملاء نينجا برجر متاح يومياً لتلقي استفساراتك، طلبات حذف البيانات، أو متابعة التعويضات الفورية.'
                : 'Ninja Burger support team is available daily for inquiries, data deletion requests, or instant compensation coordination.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-3 w-full sm:w-auto">
            <a
              href="https://wa.me/201008427736"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isArabic ? 'محادثة واتساب مباشرة' : 'WhatsApp Support'}</span>
            </a>
            <a
              href="tel:01008427736"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">01008427736</span>
            </a>
          </div>
        </div>
      </div>

      {/* Cross-Policy Navigation Links */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
          {isArabic ? 'وثائق وسياسات نينجا برجر الأخرى:' : 'Other Ninja Burger Policies:'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/terms"
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              pageType === 'terms'
                ? 'bg-ninja-red text-white border-ninja-red shadow-sm font-black'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold'
            }`}
          >
            <FileText className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <span className="text-xs sm:text-sm">
              {isArabic ? 'شروط الاستخدام' : 'Terms of Service'}
            </span>
          </Link>

          <Link
            href="/privacy"
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              pageType === 'privacy'
                ? 'bg-ninja-red text-white border-ninja-red shadow-sm font-black'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold'
            }`}
          >
            <Lock className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <span className="text-xs sm:text-sm">
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </span>
          </Link>

          <Link
            href="/refunds"
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              pageType === 'refunds'
                ? 'bg-ninja-red text-white border-ninja-red shadow-sm font-black'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold'
            }`}
          >
            <RotateCcw className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <span className="text-xs sm:text-sm">
              {isArabic ? 'سياسة الاسترجاع والإلغاء' : 'Refund Policy'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
