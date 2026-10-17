'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function HomeHero() {
  return (
    <section className="relative bg-ninja-gradient overflow-hidden min-h-[280px] sm:min-h-[360px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />

      {/* Decorative circles */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ninja-red-light/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center gap-8 w-full">
        {/* Text content */}
        <motion.div
          className="flex-1 text-center sm:text-right"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Logo-style heading */}
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🥷</span>
            <div className="text-right">
              <div className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
                NINJA
              </div>
              <div className="text-3xl sm:text-4xl font-black text-ninja-yellow leading-none tracking-tight">
                BURGER
              </div>
            </div>
          </div>

          <motion.p
            className="text-white/90 text-lg sm:text-xl font-semibold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            طعم ملوش منافس 🔥
          </motion.p>
          <motion.p
            className="text-white/70 text-sm sm:text-base max-w-sm mx-auto sm:mx-0 sm:mr-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            سندوتشات بيف سماش وتشيكن طازجة — توصيل سريع لباب بيتك
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#menu"
            className="inline-flex items-center gap-2 mt-6 bg-ninja-yellow hover:bg-ninja-yellow-dark text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 text-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            🍔 اطلب دلوقتي
          </motion.a>

          {/* Address badge */}
          <motion.div
            className="flex items-center justify-center sm:justify-end gap-2 mt-5 text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>📍 156 شارع 9، ميدان دمشق، المعادي</span>
          </motion.div>
        </motion.div>

        {/* Decorative burger illustration area */}
        <motion.div
          className="hidden sm:flex flex-shrink-0 w-48 h-48 rounded-full bg-white/10 border-4 border-white/20 items-center justify-center shadow-ninja-lg"
          initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        >
          <span className="text-8xl select-none">🍔</span>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L1440 60L1440 20C1080 60 360 0 0 40L0 60Z"
            fill="#F8F8F8"
          />
        </svg>
      </div>
    </section>
  )
}
