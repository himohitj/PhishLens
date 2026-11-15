import React, { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from 'motion/react';

/**
 * PhishLens motion primitives. Everything here respects
 * prefers-reduced-motion (via <MotionConfig reducedMotion="user"> at the
 * root, plus explicit guards for continuous/pointer effects) and animates
 * only transform, opacity and filter so it stays on the compositor.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ------------------------------- Reveal ------------------------------- */

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  amount?: number;
}

/** Fades, lifts and de-blurs its children as they scroll into view. */
export function Reveal({ delay = 0, y = 24, blur = true, once = true, amount = 0.25, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? 'blur(8px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers <StaggerItem> children once in view. */
export function Stagger({ children, className, gap = 0.08, delay = 0, amount = 0.2 }: { children: React.ReactNode; className?: string; gap?: number; delay?: number; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 22 }: { children: React.ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: 'blur(6px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE_OUT_EXPO }, transitionEnd: { filter: 'none' } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ SplitText ------------------------------ */

/**
 * Masked word-by-word headline reveal. Wrap words in *asterisks* to render
 * them in the italic serif accent face with the brand gradient.
 */
export function SplitText({ text, className, delay = 0, stagger = 0.06, as: Tag = 'h1' }: { text: string; className?: string; delay?: number; stagger?: number; as?: 'h1' | 'h2' | 'h3' | 'p' }) {
  const words = text.split(' ');
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      aria-label={text.replace(/\*/g, '')}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {(() => {
        let inAccent = false;
        return words.map((word, i) => {
          const opens = word.startsWith('*');
          if (opens) inAccent = true;
          const accent = inAccent;
          const closes = /\*[.,!?]?$/.test(word);
          if (closes) inAccent = false;
          const trailing = closes ? word.match(/[.,!?]$/)?.[0] ?? '' : '';
          const clean = word.replace(/\*/g, '').replace(closes && trailing ? /[.,!?]$/ : /$^/, '');
          return (
            <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
              <motion.span
                className={`inline-block ${accent ? 'serif-accent text-gradient pr-[0.08em]' : ''}`}
                variants={{
                  hidden: { y: '115%', rotate: 4 },
                  show: { y: '0%', rotate: 0, transition: { duration: 1, ease: EASE_OUT_EXPO } },
                }}
              >
                {clean}
              </motion.span>
              {trailing}
              {i < words.length - 1 ? '\u00a0' : ''}
            </span>
          );
        });
      })()}
    </MotionTag>
  );
}

/* ---------------------------- Magnetic button ---------------------------- */

/** A button that leans toward the pointer with spring physics. */
export function Magnetic({ children, strength = 0.28, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-flex ${className ?? ''}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- Spotlight card ----------------------------- */

/** Card with a cursor-following radial light and glowing border. */
export function SpotlightCard({
  children,
  className = '',
  tone = 'light',
  as = 'div',
  ...rest
}: { children: React.ReactNode; className?: string; tone?: 'light' | 'night'; as?: 'div' | 'button' | 'article' } & React.HTMLAttributes<HTMLElement> & { type?: 'button' }) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const glow = tone === 'night' ? 'rgba(238,126,174,0.16)' : 'rgba(214,69,127,0.10)';
  const ring = tone === 'night' ? 'rgba(238,126,174,0.55)' : 'rgba(214,69,127,0.45)';
  const bg = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${glow}, transparent 65%)`;
  const border = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, ${ring}, transparent 70%)`;
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      {...(rest as HTMLMotionProps<'div'>)}
      className={`group/spot relative isolate overflow-hidden ${className}`}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(-400);
        my.set(-400);
      }}
    >
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100" style={{ background: bg }} />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: border,
          padding: 1,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {children}
    </Comp>
  );
}

/* ------------------------------- Tilt ------------------------------- */

/** Subtle 3D perspective tilt that tracks the pointer. */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 140, damping: 18 });
  const ry = useSpring(0, { stiffness: 140, damping: 18 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200, transformStyle: 'preserve-3d' }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ CountUp ------------------------------ */

export function CountUp({ to, duration = 1.6, suffix = '', prefix = '', className }: { to: number; duration?: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: EASE_OUT_EXPO, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ------------------------------ Marquee ------------------------------ */

export function Marquee({ children, className, reverse = false }: { children: React.ReactNode; className?: string; reverse?: boolean }) {
  return (
    <div className={`group/mq flex overflow-hidden mask-fade-x ${className ?? ''}`}>
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className="flex shrink-0 items-center gap-10 pr-10 animate-marquee group-hover/mq:[animation-play-state:paused]"
          style={reverse ? { animationDirection: 'reverse' } : undefined}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Backdrops ------------------------------ */

/** Slow, drifting aurora blobs for cinematic night sections. */
export function Aurora({ className = '', intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-[30%] -left-[10%] h-[70vmax] w-[70vmax] rounded-full blur-[110px] animate-aurora" style={{ background: `radial-gradient(circle, rgba(214,69,127,${0.42 * intensity}), transparent 60%)` }} />
      <div className="absolute -bottom-[35%] -right-[15%] h-[65vmax] w-[65vmax] rounded-full blur-[120px] animate-aurora [animation-delay:-6s]" style={{ background: `radial-gradient(circle, rgba(123,97,255,${0.38 * intensity}), transparent 60%)` }} />
      <div className="absolute top-[20%] left-[45%] h-[40vmax] w-[40vmax] rounded-full blur-[120px] animate-aurora [animation-delay:-11s]" style={{ background: `radial-gradient(circle, rgba(46,197,211,${0.18 * intensity}), transparent 60%)` }} />
    </div>
  );
}

/** Thin brand-gradient bar that tracks page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand via-violet to-cyan"
      style={{ scaleX }}
    />
  );
}

/** Maps a scroll range of `target` to a parallax offset. */
export function useParallax(target: React.RefObject<HTMLElement | null>, distance = 80): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  return useTransform(scrollYProgress, [0, 1], [distance, -distance]);
}

/* ------------------------------ Typewriter ------------------------------ */

export interface TerminalLine {
  kind: 'cmd' | 'out' | 'warn' | 'ok';
  text: string;
}

/** Types out terminal commands line by line once scrolled into view. */
export function TypingTerminal({ lines, prompt, className }: { lines: TerminalLine[]; prompt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [lineIdx, setLineIdx] = useState(reduce ? lines.length : 0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!inView || reduce || lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (line.kind !== 'cmd') {
      const t = window.setTimeout(() => {
        setLineIdx((i) => i + 1);
        setChars(0);
      }, 260);
      return () => window.clearTimeout(t);
    }
    if (chars < line.text.length) {
      const t = window.setTimeout(() => setChars((c) => c + 1), 28 + Math.random() * 40);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLineIdx((i) => i + 1);
      setChars(0);
    }, 420);
    return () => window.clearTimeout(t);
  }, [inView, reduce, lineIdx, chars, lines]);

  const tone = { cmd: 'text-night-text', out: 'text-night-muted', warn: 'text-amber-300', ok: 'text-emerald-300' };
  return (
    <div ref={ref} className={className}>
      {lines.slice(0, Math.min(lineIdx + 1, lines.length)).map((l, i) => {
        const typing = i === lineIdx && l.kind === 'cmd';
        const shown = typing ? l.text.slice(0, chars) : l.text;
        if (i === lineIdx && l.kind !== 'cmd' && !reduce) return null;
        return (
          <div key={i} className={`whitespace-pre-wrap break-words ${tone[l.kind]}`}>
            {l.kind === 'cmd' && <span className="text-emerald-400">{prompt} </span>}
            {shown}
            {typing && <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-brand-soft animate-pulse" />}
          </div>
        );
      })}
      {lineIdx >= lines.length && (
        <div className="text-night-text">
          <span className="text-emerald-400">{prompt} </span>
          <span className="inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-brand-soft animate-pulse" />
        </div>
      )}
    </div>
  );
}
