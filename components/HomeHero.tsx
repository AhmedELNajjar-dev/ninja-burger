'use client'

import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/useTranslation'

export default function HomeHero() {
  const { t, isArabic } = useTranslation()

  return (
    <section className="relative bg-ninja-gradient overflow-hidden min-h-[240px] sm:min-h-[320px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-25" />

      {/* Decorative circles */}
      <div className="absolute -top-16 -left-16 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 sm:w-80 h-56 sm:h-80 bg-black/10 rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
        {/* Text content */}
        <motion.div
          className={`flex-1 text-center ${isArabic ? 'sm:text-right' : 'sm:text-left'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo-style heading */}
          <div className="inline-flex items-center gap-3 mb-2 sm:mb-3">
            <span className="text-4xl sm:text-5xl select-none">🥷</span>
            <div className={isArabic ? 'text-right' : 'text-left'}>
              <div className="text-3xl sm:text-5xl font-black text-white leading-none tracking-tight">
                NINJA
              </div>
              <div className="text-2xl sm:text-4xl font-black text-amber-200 leading-none tracking-tight">
                BURGER
              </div>
            </div>
          </div>

          <motion.p
            className="text-white/95 text-base sm:text-xl font-bold mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {t.brandTagline}
          </motion.p>
          <motion.p
            className="text-white text-xs sm:text-sm max-w-sm mx-auto sm:mx-0 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {t.heroDesc}
          </motion.p>

          {/* CTA & Address */}
          <div className={`flex flex-wrap items-center justify-center ${isArabic ? 'sm:justify-start' : 'sm:justify-start'} gap-3 mt-4 sm:mt-6`}>
            <motion.a
              href="#menu"
              className="inline-flex items-center gap-2 bg-ninja-yellow hover:bg-ninja-yellow-dark text-white font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl shadow-lg transition-all text-sm sm:text-base shadow-ninja"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {t.orderNow}
            </motion.a>

            <div className="text-white/70 text-xs flex items-center gap-1">
              <span>📍 {isArabic ? '156 شارع 9، ميدان دمشق، المعادي' : '156 Street 9, Damascus Sq, Maadi'}</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative burger illustration */}
        <motion.div
          className="shrink-0 flex items-center justify-center select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border-2 border-white/20 shadow-2xl">
              <span className="text-7xl sm:text-9xl filter drop-shadow-2xl animate-float">
                🍔
              </span>
            </div>
            <div className="absolute -bottom-2 -end-2 bg-ninja-yellow text-red-900 text-xs font-black px-3 py-1 rounded-full shadow-lg border border-white/30">
              {t.freshDaily}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
