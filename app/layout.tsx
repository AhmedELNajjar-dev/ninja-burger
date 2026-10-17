import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'نينجا برجر — طعم ملوش منافس',
    template: '%s | نينجا برجر',
  },
  description:
    'اطلب أشهى برجر في المعادي. سندوتشات بيف سماش وتشيكن طازجة مع توصيل سريع.',
  keywords: ['نينجا برجر', 'برجر', 'توصيل', 'المعادي', 'سندوتش', 'بيف سماش'],
  authors: [{ name: 'Ninja Burger' }],
  creator: 'Ninja Burger',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    title: 'نينجا برجر — طعم ملوش منافس',
    description: 'اطلب أشهى برجر في المعادي. سندوتشات بيف سماش وتشيكن طازجة.',
    siteName: 'نينجا برجر',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#CC1F1A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-white font-sans">
        <a href="#main-content" className="skip-link">
          انتقل إلى المحتوى الرئيسي
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
