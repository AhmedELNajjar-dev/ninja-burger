'use client'

import React from 'react'
import { useTranslation } from '@/lib/useTranslation'

export function MenuSectionHeader() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-3xl font-extrabold text-ninja-dark">
        🍔 {t.menuTitle}
      </h2>
      <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-ninja-red/30 to-transparent" />
    </div>
  )
}
