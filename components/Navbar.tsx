'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Menu, User, LogOut, ShieldCheck, X, Globe } from 'lucide-react';
import { cn } from './ui/cn';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';
import type { Profile } from '@/types';

interface NavbarProps {
  profile?: Profile | null;
}

export function Navbar({ profile }: NavbarProps = {}) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, isArabic, toggleLanguage } = useTranslation();
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    useCartStore.getState().clearCart();
    router.refresh();
    window.location.href = '/';
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? '';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200 bg-ninja-red text-white',
        isScrolled ? 'shadow-md py-3' : 'py-4'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <span>NINJA</span>
            <span className="text-amber-200">BURGER</span>
            <span className="text-2xl">🥷</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
            <Link href="/" className="hover:text-amber-200 transition-colors">
              {t.menu}
            </Link>
            {profile && (
              <Link href="/orders" className="hover:text-amber-200 transition-colors">
                {t.myOrders}
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-amber-200 hover:text-white transition-colors bg-white/15 px-2.5 py-1 rounded-lg font-bold"
              >
                <ShieldCheck size={16} />
                {t.adminDashboard}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher Button (Desktop & Mobile) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-white/15 hover:bg-white/25 active:scale-95 transition-all border border-white/20 text-white cursor-pointer shadow-sm"
            title={isArabic ? 'Switch language to English' : 'التحويل إلى اللغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-200" />
            <span>{t.langButtonText}</span>
          </button>

          {/* Cart button */}
          <button
            className="relative p-2 hover:bg-red-700 rounded-full transition-colors flex items-center cursor-pointer"
            onClick={() => useCartStore.setState({ isCartOpen: true })}
            title={t.cart}
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-ninja-yellow text-red-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1 shadow">
                {totalItems}
              </span>
            )}
          </button>

          {/* User auth state buttons (desktop) */}
          {profile ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm font-bold bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User size={15} />
                {firstName}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-red-700 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
                title={t.logout}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="bg-white text-ninja-red hover:bg-ninja-yellow hover:text-white px-4 py-1.5 rounded-full font-bold text-sm transition-all shadow-sm"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="border-2 border-white/80 text-white hover:bg-white hover:text-ninja-red px-3 py-1 rounded-full font-bold text-sm transition-all"
              >
                {t.register}
              </Link>
            </div>
          )}

          {/* Hamburger toggle for mobile */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 hover:bg-red-700 rounded-full transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ninja-red-dark border-t border-white/10 px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold py-2 border-b border-white/10"
          >
            🍔 {t.menu}
          </Link>
          {profile ? (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-bold py-2 border-b border-white/10"
              >
                📦 {t.myOrders}
              </Link>
              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-bold py-2 text-amber-200 border-b border-white/10"
                >
                  🛡️ {t.adminDashboard}
                </Link>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-white/90">
                  👤 {firstName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold hover:bg-white/30 cursor-pointer"
                >
                  <LogOut size={14} />
                  {t.logout}
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-white text-ninja-red font-bold py-2.5 rounded-xl shadow-sm text-base"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center border-2 border-white text-white font-bold py-2.5 rounded-xl text-base"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
