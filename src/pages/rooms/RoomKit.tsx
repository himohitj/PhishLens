import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Search, Sparkles, X } from 'lucide-react';
import type { EvidenceHotspot } from '../../types/phishlens.ts';
import { EASE_OUT_EXPO } from '../../components/motion.tsx';

/**
 * Room investigation toolkit.
 *
 * Every room renders a realistic interface. Elements that carry evidence are
 * wrapped in <Hotspot clue="…">, and ordinary elements in <Hotspot decoy="…">,
 * so learners can't tell clues from normal UI by appearance alone. Clicking a
 * clue logs it; clicking a decoy tells the learner it looks normal.
 */

export interface RoomContextValue {
  lens: boolean;
  found: string[];
  hint: string | null;
  hotspots: EvidenceHotspot[];
  inspect: (clueId: string, el: HTMLElement | null) => void;
  decoy: (text: string, el: HTMLElement | null) => void;
  act: (actionId: string) => void;
}

export const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom outside a room');
  return ctx;
}

interface HotspotProps {
  /** Evidence id this element reveals. */
  clue?: string;
  /** Explanation shown when an ordinary (non-clue) element is inspected. */
  decoy?: string;
  /** With the lens off, clicking performs this action instead (e.g. following a link). */
  actionWhenLensOff?: string;
  /** Extra behaviour that always runs on click (e.g. expanding a header). */
  onActivate?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  as?: 'span' | 'div' | 'button';
  className?: string;
  children: React.ReactNode;
}

export function Hotspot({ clue, decoy, actionWhenLensOff, onActivate, onHoverChange, as = 'span', className = '', children }: HotspotProps) {
  const ctx = useRoom();
  const ref = useRef<HTMLElement>(null);
  const isFound = Boolean(clue && ctx.found.includes(clue));
  const isHint = Boolean(clue && ctx.hint === clue);

  const activate = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!ctx.lens && actionWhenLensOff) {
      ctx.act(actionWhenLensOff);
      return;
    }
    onActivate?.();
    if (clue) ctx.inspect(clue, ref.current);
    else if (decoy) ctx.decoy(decoy, ref.current);
  };

  const Tag = as as 'span';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      role="button"
      tabIndex={0}
      data-clue={clue}
      aria-label={undefined}
      onClick={activate}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(e);
        }
      }}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={`relative rounded-md transition-[background-color,box-shadow,outline-color] duration-200 outline-2 outline-offset-2 outline-transparent ${
        ctx.lens ? 'cursor-zoom-in hover:outline-dashed hover:outline-brand/70 focus-visible:outline-dashed focus-visible:outline-brand' : 'cursor-pointer'
      } ${isFound ? 'bg-amber-300/25 shadow-[0_0_0_1px_rgba(245,158,11,0.55)]' : ''} ${isHint ? 'animate-hint' : ''} ${className}`}
    >
      {children}
      {isFound && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="pointer-events-none absolute -top-2 -right-2 z-10 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-white shadow"
          aria-hidden
        >
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </motion.span>
      )}
    </Tag>
  );
}

/** An element that performs a decision action inside the interface (Report, Sign in, Send…). */
export function ActionTarget({ action, className = '', children, title }: { action: string; className?: string; children: React.ReactNode; title?: string }) {
  const ctx = useRoom();
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        ctx.act(action);
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Callout ------------------------------ */

export type CalloutState =
  | { kind: 'clue'; hotspot: EvidenceHotspot; index: number; total: number; fresh: boolean; el: HTMLElement | null }
  | { kind: 'decoy'; text: string; el: HTMLElement | null }
  | null;

/**
 * Floating explanation anchored to the inspected element. Rendered in a
 * portal so ancestor transforms (page transitions) can't offset it.
 */
export function Callout({ state, onClose }: { state: CalloutState; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);

  const place = useCallback(() => {
    if (!state?.el) return;
    const r = state.el.getBoundingClientRect();
    const w = Math.min(360, window.innerWidth - 24);
    const h = boxRef.current?.offsetHeight ?? 160;
    const HEADER = 150; // floating nav + rooms bar
    const fitsAbove = r.top - h - 12 > HEADER;
    const fitsBelow = r.bottom + 12 + h < window.innerHeight;
    const above = fitsAbove || !fitsBelow;
    const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12));
    setPos({ top: above ? Math.max(HEADER, r.top - h - 12) : r.bottom + 12, left, above });
  }, [state]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    if (!state) return;
    const onScroll = () => place();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDown = (e: MouseEvent) => {
      if (boxRef.current?.contains(e.target as Node)) return;
      if (state.el?.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    const auto = state.kind === 'decoy' ? window.setTimeout(onClose, 2600) : undefined;
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      window.clearTimeout(t);
      if (auto) window.clearTimeout(auto);
    };
  }, [state, place, onClose]);

  return createPortal(
    <AnimatePresence>
      {state && (
        <motion.div
          key={state.kind === 'clue' ? state.hotspot.id : `decoy-${state.text}`}
          ref={boxRef}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: pos?.above ? 8 : -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 24 : 360), zIndex: 80 }}
          className="pointer-events-auto"
        >
          {state.kind === 'clue' ? (
            <div className="overflow-hidden rounded-2xl border border-amber-300 bg-surface text-ink shadow-[0_24px_60px_-20px_rgba(22,19,29,0.45)]">
              <div className="flex items-center justify-between gap-2 bg-amber-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {state.fresh ? 'Clue found' : 'Clue'} · {state.index} of {state.total}
                </span>
                <button type="button" onClick={onClose} className="rounded p-0.5 hover:bg-amber-100 cursor-pointer" aria-label="Close">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2 px-4 py-3">
                <div className="text-sm font-semibold leading-snug">{state.hotspot.findingTitle}</div>
                <p className="text-xs leading-relaxed text-ink-soft">{state.hotspot.findingDetail}</p>
                <div className="rounded-lg bg-night px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-amber-200 break-all">{state.hotspot.rawValue}</div>
                {state.fresh && <div className="text-[11px] text-muted">Logged to your field notes.</div>}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-fit max-w-full rounded-xl bg-night px-3.5 py-2.5 text-xs text-night-text shadow-xl">
              <div className="flex items-start gap-2">
                <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                <span>
                  <span className="font-semibold text-white">Looks normal.</span> <span className="text-night-muted">{state.text}</span>
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Mac-style window chrome used by desktop artefacts. */
export function WindowDots({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <span className="flex gap-1.5" aria-hidden>
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className={`h-3 w-3 rounded-full ${tone === 'dark' ? 'bg-[#28c840]' : 'bg-[#28c840]'}`} />
    </span>
  );
}

/** Generic phone frame for mobile artefacts. */
export function PhoneFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-[340px] rounded-[46px] border-[10px] border-[#111015] bg-[#111015] shadow-[0_40px_80px_-30px_rgba(22,19,29,0.6)] ${className}`}>
      <div className="absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" aria-hidden />
      <div className="relative overflow-hidden rounded-[36px] bg-white">{children}</div>
    </div>
  );
}

export function PhoneStatusBar({ dark = false, time = '1:42' }: { dark?: boolean; time?: string }) {
  return (
    <div className={`flex items-center justify-between px-7 pt-3 pb-1 text-[12px] font-semibold ${dark ? 'text-white' : 'text-black'}`}>
      <span>{time}</span>
      <span className="flex items-center gap-1" aria-hidden>
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h) => <span key={h} className={`w-[3px] rounded-sm ${dark ? 'bg-white' : 'bg-black'}`} style={{ height: h }} />)}
        </span>
        <span className={`ml-1 h-[11px] w-[22px] rounded-[3px] border ${dark ? 'border-white/80' : 'border-black/70'} p-[1.5px]`}>
          <span className={`block h-full w-3/4 rounded-[1px] ${dark ? 'bg-white' : 'bg-black'}`} />
        </span>
      </span>
    </div>
  );
}
