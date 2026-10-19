'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Menu, User, LogOut, ShieldCheck, X } from 'lucide-react';
import { cn } from './ui/cn';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface NavbarProps {
  profile?: Profile | null;
}

export function Navbar({ profile }: NavbarProps = {}) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            <span className="text-ninja-yellow">BURGER</span>
            <span className="text-2xl">🥷</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
            <Link href="/" className="hover:text-ninja-yellow transition-colors">
              المنيو
            </Link>
            {profile && (
              <Link href="/orders" className="hover:text-ninja-yellow transition-colors">
                طلباتي
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-ninja-yellow hover:text-white transition-colors bg-white/10 px-2.5 py-1 rounded-lg"
              >
                <ShieldCheck size={16} />
                لوحة الإدارة
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Cart button */}
          <button
            className="relative p-2 hover:bg-red-700 rounded-full transition-colors flex items-center"
            onClick={() => useCartStore.setState({ isCartOpen: true })}
            title="سلة الطلبات"
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
                className="p-2 hover:bg-red-700 rounded-full transition-colors text-white/80 hover:text-white"
                title="تسجيل الخروج"
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
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="border-2 border-white/80 text-white hover:bg-white hover:text-ninja-red px-3 py-1 rounded-full font-bold text-sm transition-all"
              >
                حساب جديد
              </Link>
            </div>
          )}

          {/* Hamburger toggle for mobile */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 hover:bg-red-700 rounded-full transition-colors"
            aria-label="القائمة"
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
            🍔 المنيو
          </Link>
          {profile ? (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-bold py-2 border-b border-white/10"
              >
                📦 طلباتي
              </Link>
              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-bold py-2 text-ninja-yellow border-b border-white/10"
                >
                  🛡️ لوحة الإدارة
                </Link>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-white/90">
                  👤 مرحباً، {profile.full_name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold hover:bg-white/30"
                >
                  <LogOut size={14} />
                  خروج
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
                تسجيل الدخول 🚀
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center border-2 border-white text-white font-bold py-2 rounded-xl text-sm"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
