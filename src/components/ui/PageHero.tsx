import React from 'react';
import { motion } from 'motion/react';
import { Aurora, EASE_OUT_EXPO, SplitText } from '../motion.tsx';
import { Eyebrow } from './Eyebrow.tsx';

/**
 * Cinematic night header used across inner pages. It tucks under the
 * floating nav and flows into the light content below.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative -mt-[84px] pt-[140px] pb-16 sm:pb-20 bg-night text-night-text grain overflow-hidden px-4 sm:px-6">
      <Aurora intensity={0.65} />
      <div className="absolute inset-0 bg-grid-night mask-radial opacity-80" aria-hidden />
      <div className="relative max-w-[1240px] mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}>
            <Eyebrow tone="night">{eyebrow}</Eyebrow>
          </motion.div>
          <SplitText text={title} delay={0.1} className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-[-0.045em] text-white" />
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.35 }}
              className="text-base sm:text-lg text-night-muted leading-relaxed max-w-2xl"
            >
              {subtitle}
            </motion.p>
          )}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              {children}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.4 }}
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export const heroPrimaryBtn =
  'group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-ink cursor-pointer shadow-[0_20px_50px_-20px_rgba(214,69,127,0.7)] transition-transform hover:-translate-y-0.5';
export const heroGhostBtn =
  'inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.1] transition-colors cursor-pointer';
