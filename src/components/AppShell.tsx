import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, Menu, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { SessionStateResponse } from '../types/phishlens.ts';
import { getResumeRouteForSession } from '../lib/sessionStore.ts';
import { EASE_OUT_EXPO, Magnetic, ScrollProgress } from './motion.tsx';

interface AppShellProps {
  currentPath: string;
  navigate: (path: string) => void;
  session: SessionStateResponse;
  onResetSession: () => void;
  children: React.ReactNode;
}

const ROOMS = [
  { id: 'sim-1', short: '01', label: 'Email' },
  { id: 'sim-2', short: '02', label: 'Sign-In' },
  { id: 'sim-3', short: '03', label: 'SMS' },
  { id: 'sim-4', short: '04', label: 'QR Scan' },
  { id: 'sim-5', short: '05', label: 'IT Chat' },
];

export function AppShell({ currentPath, navigate, session, onResetSession, children }: AppShellProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  useEffect(() => setMenuOpen(false), [currentPath]);

  const isLanding = currentPath === '/' || currentPath === '';
  const showRoomsBar = currentPath.startsWith('/experience');
  const completedSimCount = session.completedScenarioIds.length;
  const hasStarted = completedSimCount > 0 || Boolean(session.baselineAssessment) || session.completedModuleSlugs.length > 0;
  const nextIncompleteSim = ROOMS.find((r) => !session.completedScenarioIds.includes(r.id))?.id ?? 'sim-1';
  const primaryCtaTarget = hasStarted ? getResumeRouteForSession(session) : `/experience/simulation/${nextIncompleteSim}`;

  const links = [
    { href: '/', label: 'Discover', active: isLanding },
    { href: `/experience/simulation/${nextIncompleteSim}`, label: 'Rooms', active: currentPath.startsWith('/experience') },
    { href: '/labs', label: 'Sandbox Labs', active: currentPath.startsWith('/labs') },
    { href: '/learn', label: 'Learn', active: currentPath.startsWith('/learn') },
    { href: '/report', label: 'Report', active: currentPath === '/report' },
  ];

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <ScrollProgress />

      {/* Floating navigation */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-4 pt-3 pointer-events-none">
        <motion.nav
          aria-label="Primary"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          className={`pointer-events-auto w-full flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-night/92 backdrop-blur-xl text-night-text shadow-[0_10px_40px_-12px_rgba(11,9,16,0.55)] transition-[max-width,padding] duration-500 ease-out ${
            scrolled ? 'max-w-[980px] px-3 py-2' : 'max-w-[1240px] px-4 py-2.5'
          }`}
        >
          <a href="/" onClick={go('/')} className="group flex items-center gap-2.5 shrink-0 rounded-lg">
            <LensMark />
            <span className="text-[15px] font-semibold tracking-tight">PhishLens</span>
          </a>

          <div className="hidden md:flex items-center gap-0.5 text-[13px]">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={go(l.href)}
                className={`relative px-3.5 py-1.5 rounded-lg transition-colors ${l.active ? 'text-white' : 'text-night-muted hover:text-white'}`}
              >
                {l.active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-white/10 ring-1 ring-white/15"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex"><Magnetic>
              <button
                type="button"
                onClick={() => navigate(primaryCtaTarget)}
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-ink cursor-pointer"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-rose-soft to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">{hasStarted ? 'Resume' : 'Start training'}</span>
                <ArrowRight className="relative w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Magnetic></span>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden bg-night/95 backdrop-blur-xl text-night-text px-6 pt-24 pb-10 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul
              className="space-y-1"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
            >
              {links.map((l) => (
                <motion.li key={l.label} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: EASE_OUT_EXPO, duration: 0.6 } } }}>
                  <a href={l.href} onClick={go(l.href)} className={`flex items-center justify-between py-3 text-3xl font-semibold tracking-tight border-b border-white/10 ${l.active ? 'text-white' : 'text-night-muted'}`}>
                    {l.label}
                    <ArrowUpRight className="w-5 h-5 opacity-50" />
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <button type="button" onClick={() => navigate(primaryCtaTarget)} className="mt-auto rounded-xl bg-white text-ink py-3.5 text-sm font-semibold cursor-pointer">
              {hasStarted ? 'Resume training' : 'Start training'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms bar for the guided experience */}
      {showRoomsBar && (
        <div className="sticky top-[68px] z-30 mt-[84px] px-3 sm:px-4">
          <div className="mx-auto max-w-[1240px] rounded-2xl border border-line glass shadow-[0_8px_30px_-18px_rgba(22,19,29,0.35)] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              {ROOMS.map((room) => {
                const isDone = session.completedScenarioIds.includes(room.id);
                const isCurrent = currentPath === `/experience/simulation/${room.id}` || currentPath === `/experience/feedback/${room.id}`;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => navigate(`/experience/simulation/${room.id}`)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      isCurrent ? 'text-white' : isDone ? 'text-emerald-700 hover:bg-emerald-50' : 'text-muted hover:text-ink hover:bg-blush'
                    }`}
                  >
                    {isCurrent && (
                      <motion.span layoutId="room-active" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative font-mono text-[10px] opacity-60">{room.short}</span>
                    <span className="relative">{room.label}</span>
                    {isDone && !isCurrent && <Check className="relative w-3 h-3" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-muted">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-line overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-violet"
                    initial={false}
                    animate={{ width: `${(completedSimCount / ROOMS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                  />
                </div>
                <span className="font-mono tabular-nums">{completedSimCount}/5</span>
              </div>
              <button type="button" onClick={() => setConfirmResetOpen(true)} className="inline-flex items-center gap-1 hover:text-ink cursor-pointer" title="Reset session progress">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page transition */}
      <main className={`flex-1 flex flex-col ${isLanding || showRoomsBar ? '' : 'pt-[84px]'}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer navigate={navigate} onReset={() => setConfirmResetOpen(true)} />

      {/* Reset confirmation */}
      <AnimatePresence>
        {confirmResetOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-night/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmResetOpen(false)}
          >
            <motion.div
              className="max-w-md w-full bg-surface border border-line rounded-3xl p-6 space-y-4 shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blush"><ShieldAlert className="w-5 h-5 text-brand" /></div>
                <div className="space-y-1">
                  <h2 id="reset-dialog-title" className="text-lg font-semibold">Start a fresh session?</h2>
                  <p className="text-sm text-muted leading-relaxed">
                    This clears your room decisions, inspected clues, lab results and report progress stored in this browser.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setConfirmResetOpen(false)} className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-line hover:bg-blush cursor-pointer">
                  Keep my progress
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmResetOpen(false);
                    onResetSession();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white rounded-xl bg-ink hover:bg-brand transition-colors cursor-pointer"
                >
                  Reset session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LensMark({ className = '' }: { className?: string }) {
  return (
    <span className={`relative grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-brand via-violet to-cyan ${className}`}>
      <span className="absolute inset-[3px] rounded-[6px] bg-night-2" />
      <svg viewBox="0 0 24 24" className="relative w-4 h-4" fill="none" stroke="url(#lm)" strokeWidth="2.2" strokeLinecap="round">
        <defs>
          <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ee7eae" />
            <stop offset="1" stopColor="#7b61ff" />
          </linearGradient>
        </defs>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5 5" />
      </svg>
    </span>
  );
}

function Footer({ navigate, onReset }: { navigate: (p: string) => void; onReset: () => void }) {
  const col = (title: string, items: { label: string; href?: string; onClick?: () => void }[]) => (
    <div className="space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-night-subtle">{title}</div>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            <a
              href={i.href ?? '#'}
              onClick={(e) => {
                e.preventDefault();
                if (i.onClick) i.onClick();
                else if (i.href) navigate(i.href);
              }}
              className="text-night-muted hover:text-white transition-colors"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative overflow-hidden bg-night text-night-text grain">
      <div className="absolute inset-0 bg-grid-night mask-radial opacity-60" aria-hidden />
      <div className="relative max-w-[1240px] mx-auto px-6 pt-16 pb-8 space-y-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2.5">
              <LensMark />
              <span className="font-semibold tracking-tight">PhishLens</span>
            </div>
            <p className="text-sm text-night-muted leading-relaxed">
              Hands-on phishing and social-engineering training. Safe simulations, isolated sandbox labs, and no real credentials ever collected.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] font-mono text-night-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Everything runs in your browser
            </div>
          </div>
          {col('Train', [
            { label: 'Guided rooms', href: '/experience/simulation/sim-1' },
            { label: 'Sandbox labs', href: '/labs' },
            { label: 'Calibration check', href: '/experience/intro' },
          ])}
          {col('Learn', [
            { label: 'Threat guides', href: '/learn' },
            { label: 'Email phishing', href: '/learn/email-phishing' },
            { label: 'Malware basics', href: '/learn/malware-basics' },
          ])}
          {col('You', [
            { label: 'My report', href: '/report' },
            { label: 'Reset session', onClick: onReset },
          ])}
        </div>
        <div className="select-none text-[18vw] md:text-[11rem] leading-[0.8] font-semibold tracking-[-0.06em] bg-gradient-to-b from-white/20 to-white/0 bg-clip-text text-transparent" aria-hidden>
          PhishLens
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-night-subtle border-t border-white/10 pt-6">
          <span>See through the deception.</span>
          <span>All scenarios, people and domains are fictional.</span>
        </div>
      </div>
    </footer>
  );
}
