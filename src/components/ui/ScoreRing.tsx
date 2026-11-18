import React from 'react';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO } from '../motion.tsx';

/** Animated circular score (0–100). */
export function ScoreRing({ score, color, size = 144 }: { score: number; color: string; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.6, ease: EASE_OUT_EXPO, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-semibold tabular-nums">{score}</div>
          <div className="text-[11px] opacity-60 font-mono">/ 100</div>
        </div>
      </div>
    </div>
  );
}
