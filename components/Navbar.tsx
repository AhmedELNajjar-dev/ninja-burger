'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, User } from 'lucide-react';
import { cn } from './ui/cn';
import { useCartStore } from '@/store/cartStore';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Link href="/" className="hover:text-ninja-yellow transition-colors">المنيو</Link>
            <Link href="/orders" className="hover:text-ninja-yellow transition-colors">طلباتي</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="hidden md:flex p-2 hover:bg-red-700 rounded-full transition-colors"
            aria-label="Profile"
          >
            <User className="w-6 h-6" />
          </button>
          
          <button 
            className="relative p-2 hover:bg-red-700 rounded-full transition-colors flex items-center"
            onClick={() => useCartStore.setState({ isCartOpen: true })}
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-ninja-yellow text-red-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                {totalItems}
              </span>
            )}
          </button>

          <button className="md:hidden p-2 hover:bg-red-700 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
