'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Phone, Mail, AlertCircle, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { useTranslation } from '@/lib/useTranslation'

const loginSchema = z.object({
  identifier: z.string().min(3, 'أدخل البريد الإلكتروني أو رقم الهاتف'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') ?? '/'
  const redirect =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes('\\')
      ? rawRedirect
      : '/'
  const supabase = createClient()
  const { t, isArabic, toggleLanguage } = useTranslation()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const identifier = watch('identifier', '')
  // Detect if it looks like a phone number for the icon
  const isPhone = /^(0|\+?2)/.test(identifier)

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'حدث خطأ، حاول مرة أخرى')
        return
      }

      // Re-fetch session on client after server sets cookies
      await supabase.auth.refreshSession()
      // Restore user's saved cart from database
      await useCartStore.getState().loadSavedCart()
      router.push(redirect)
      router.refresh()
    } catch {
      setServerError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ninja-gray flex flex-col">
      {/* Top bar */}
      <div className="bg-ninja-red h-1.5 w-full" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Language Toggle */}
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200 shadow-sm cursor-pointer transition-all"
            >
              <Globe size={14} className="text-ninja-red" />
              <span>{t.langButtonText}</span>
            </button>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="inline-flex items-center gap-2 bg-ninja-red rounded-2xl px-6 py-3 shadow-ninja">
                <span className="text-3xl">🥷</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-white leading-none">NINJA</div>
                  <div className="text-xl font-black text-ninja-yellow leading-none">BURGER</div>
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-ninja-dark mt-5">
              {t.welcomeBack}
            </h1>
            <p className="text-gray-500 mt-1">
              {t.signInSubtitle}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-card p-8">
            {/* Error */}
            {serverError && (
              <motion.div
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{serverError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Identifier field */}
              <div>
                <label className="block text-sm font-semibold text-ninja-dark mb-2">
                  {t.identifier}
                </label>
                <div className="relative">
                  <input
                    {...register('identifier')}
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t.identifierPlaceholder}
                    className={`input-field pe-11 ${errors.identifier ? 'input-field-error' : ''}`}
                    dir="ltr"
                  />
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {isPhone ? <Phone size={18} /> : <Mail size={18} />}
                  </span>
                </div>
                {errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-semibold text-ninja-dark mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`input-field pe-11 ${errors.password ? 'input-field-error' : ''}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg mt-2"
                whileTap={{ scale: 0.97 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.loggingIn}
                  </span>
                ) : (
                  t.signInBtn
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">{t.or}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Register link */}
            <p className="text-center text-gray-600">
              {t.noAccount}{' '}
              <Link
                href="/register"
                className="text-ninja-red font-bold hover:underline"
              >
                {t.register}
              </Link>
            </p>
          </div>

          {/* Back to menu */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-ninja-red text-sm transition-colors">
              {isArabic ? '← العودة للقائمة' : '← Back to Menu'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ninja-gray flex items-center justify-center">
          <div className="text-ninja-red font-bold animate-pulse text-lg">جاري التحميل...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  )
}
