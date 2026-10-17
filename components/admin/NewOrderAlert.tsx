'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BellRing } from 'lucide-react';
import { Order } from '@/types';

interface NewOrderAlertProps {
  order: Order | null;
  onDismiss: () => void;
}

function playNewOrderSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const frequencies = [523, 659, 784]; // C5, E5, G5 chord
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

export function NewOrderAlert({ order, onDismiss }: NewOrderAlertProps) {
  useEffect(() => {
    if (order) {
      playNewOrderSound();
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [order, onDismiss]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
        >
          <div className="bg-ninja-red text-white rounded-2xl shadow-2xl p-4 pr-12 relative overflow-hidden flex items-start gap-4">
            <div className="absolute top-0 right-0 h-full w-12 bg-red-800/30 flex items-center justify-center">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            
            <div className="flex-1 z-10">
              <h4 className="font-black text-lg mb-1">طلب جديد! 🎉</h4>
              <p className="text-sm text-red-100 mb-2">
                #{order.order_number.toString().padStart(4, '0')} - {order.customer_name}
              </p>
              <p className="text-xl font-black">{order.total_amount} ج</p>
            </div>

            <button
              onClick={onDismiss}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
