'use client'

import React, { useEffect } from 'react'
import { useLanguageStore } from '@/store/languageStore'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((state) => state.language)

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  return <>{children}</>
}
