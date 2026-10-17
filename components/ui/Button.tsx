'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-ninja-red text-white hover:bg-red-700 focus:ring-ninja-red',
    secondary: 'bg-ninja-yellow text-white hover:bg-yellow-600 focus:ring-ninja-yellow',
    outline: 'border-2 border-gray-200 text-gray-800 hover:border-ninja-red hover:text-ninja-red focus:ring-ninja-red bg-transparent',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
    danger: 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { scale: 0.95 } : undefined}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
      {children}
    </motion.button>
  );
}
