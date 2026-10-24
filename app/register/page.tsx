'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Globe } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

const egyptianPhone = /^(\+?2)?0(10|11|12|15)[0-9]{8}$/

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(60),
    phone: z
      .string()
      .regex(egyptianPhone, 'رقم الهاتف غير صحيح (مثال: 01012345678)'),
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'كلمتا المرور غير متطابقتين',
  })

type RegisterForm = z.infer<typeof registerSchema>

const PasswordStrength = ({ password }: { password: string }) => {
  const { t } = useTranslation()
  const checks = [
    { label: t.passwordReqMin, pass: password.length >= 8 },
    { label: t.passwordReqUpper, pass: /[A-Z]/.test(password) },
    { label: t.passwordReqNum, pass: /[0-9]/.test(password) },
  ]
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2 text-xs">
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${
              c.pass ? 'bg-green-500' : 'bg-gray-200'
            }`}
          />
          <span className={c.pass ? 'text-green-600' : 'text-gray-400'}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { t, isArabic, toggleLanguage } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
          password: data.password,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'حدث خطأ، حاول مرة أخرى')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setServerError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ninja-gray flex flex-col">
      <div className="bg-ninja-red h-1.5 w-full" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-lg"
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
            <Link href="/">
              <div className="inline-flex items-center gap-2 bg-ninja-red rounded-2xl px-6 py-3 shadow-ninja">
                <span className="text-3xl">🥷</span>
                <div>
                  <div className="text-2xl font-black text-white leading-none">NINJA</div>
                  <div className="text-xl font-black text-amber-200 leading-none">BURGER</div>
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-ninja-dark mt-5">{t.registerTitle}</h1>
            <p className="text-gray-500 mt-1">{t.registerSubtitle}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-card p-8">
            {/* Success state */}
            {success && (
              <motion.div
                className="flex flex-col items-center justify-center py-8 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 className="text-green-500 mb-3" size={56} />
                <h2 className="text-xl font-bold text-ninja-dark">{t.accountCreatedSuccess}</h2>
                <p className="text-gray-500 mt-2">{t.redirectingToLogin}</p>
              </motion.div>
            )}

            {!success && (
              <>
                {/* Server error */}
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
                  {/* Full name */}
                  <div>
                    <label className="block text-sm font-semibold text-ninja-dark mb-2">
                      {t.fullName}
                    </label>
                    <input
                      {...register('full_name')}
                      type="text"
                      autoComplete="name"
                      placeholder={isArabic ? 'أحمد محمد' : 'Ahmed Mohamed'}
                      className={`input-field ${errors.full_name ? 'input-field-error' : ''}`}
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-ninja-dark mb-2">
                      {t.phone}
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="01012345678"
                      dir="ltr"
                      className={`input-field ${errors.phone ? 'input-field-error' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {t.phoneHelp}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-ninja-dark mb-2">
                      {t.email}
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      placeholder="example@email.com"
                      dir="ltr"
                      className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-ninja-dark mb-2">
                      {t.password}
                    </label>
                    <div className="relative" dir="ltr">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`input-field pr-11 pl-4 ${errors.password ? 'input-field-error' : ''}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password && <PasswordStrength password={password} />}
                    {errors.password && !password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-semibold text-ninja-dark mb-2">
                      {t.confirmPassword}
                    </label>
                    <div className="relative" dir="ltr">
                      <input
                        {...register('confirm_password')}
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`input-field pr-11 pl-4 ${errors.confirm_password ? 'input-field-error' : ''}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirm_password.message}
                      </p>
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
                        {t.creatingAccount}
                      </span>
                    ) : (
                      t.createAccountBtn
                    )}
                  </motion.button>
                </form>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-sm">{t.or}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <p className="text-center text-gray-600">
                  {t.haveAccount}{' '}
                  <Link href="/login" className="text-ninja-red font-bold hover:underline">
                    {t.login}
                  </Link>
                </p>
              </>
            )}
          </div>

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
