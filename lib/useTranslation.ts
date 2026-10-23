'use client'

import { useLanguageStore } from '@/store/languageStore'
import { translations } from '@/lib/translations'

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore()
  const isArabic = language === 'ar'
  const t = translations[language]

  return {
    language,
    isArabic,
    setLanguage,
    toggleLanguage,
    t,
  }
}
