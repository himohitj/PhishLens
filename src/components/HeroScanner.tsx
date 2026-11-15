import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import {
  AlertTriangle,
  AtSign,
  BadgeAlert,
  Clock3,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  ScanLine,
  ShieldAlert,
  ShieldX,
  UserX,
} from 'lucide-react';
import { EASE_OUT_EXPO } from './motion.tsx';

/**
 * HeroScanner: PhishLens in one picture.
 *
 * A message is rendered twice, row for row: an ordinary "surface" view and
 * an "X-ray" view with the evidence an analyst would surface. A scan beam
 * sweeps down (or follows the user's drag), clipping the X-ray layer into
 * view. Each clue is logged in the analysis panel as the beam crosses it,
 * the risk meter climbs, and a verdict lands once everything is exposed.
 */

type Clue = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
};

type Row = {
  h: number;
  clue?: string;
  surface: React.ReactNode;
  xray: React.ReactNode;
};

type Scenario = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  chrome: string;
  verdict: string;
  advice: string;
  risk: number;
  clues: Clue[];
  rows: Row[];
};

const VIEWPORT_H = 372;

/* ----------------------------- small atoms ----------------------------- */

const Hl = ({ children, tone = 'pink' }: { children: React.ReactNode; tone?: 'pink' | 'amber' }) => (
  <span
    className={`rounded px-1 py-px font-semibold ${
      tone === 'pink' ? 'bg-brand/25 text-[#ffb3d1] ring-1 ring-brand/50' : 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/40'
    }`}
  >
    {children}
  </span>
);

const Tag = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_0_18px_rgba(214,69,127,0.6)]">
    <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-white/25 text-[9px]">{n}</span>
    <span className="hidden sm:inline">{children}</span>
  </span>
);

const XRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`h-full flex items-center justify-between gap-3 px-3.5 sm:px-5 font-mono text-[10.5px] sm:text-[11.5px] text-night-muted ${className}`}>{children}</div>
);

const SRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`h-full flex items-center px-5 ${className}`}>{children}</div>
);

/* ------------------------------ scenarios ------------------------------ */

const SCENARIOS: Scenario[] = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    chrome: 'Mail · Inbox',
    verdict: 'Credential phish',
    advice: 'Report it. Don’t click.',
    risk: 94,
    clues: [
      { id: 'sender', icon: UserX, title: 'Spoofed sender', detail: 'Display name says IT, domain is corvane-support.co' },
      { id: 'auth', icon: ShieldX, title: 'Authentication failed', detail: 'SPF softfail · DMARC fail for corvane.io' },
      { id: 'urgency', icon: Clock3, title: 'Pressure tactic', detail: 'Artificial 2-hour deadline to rush you' },
      { id: 'link', icon: Link2, title: 'Disguised link', detail: 'Real destination: mailbox-upgrade.top' },
    ],
    rows: [
      {
        h: 74,
        clue: 'sender',
        surface: (
          <SRow className="gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">IT</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">IT Service Desk</span>
              <span className="block text-xs text-muted">to me · 09:41</span>
            </span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="truncate">From: &lt;helpdesk@<Hl>corvane-support.co</Hl>&gt;</span>
            <Tag n={1}>spoofed</Tag>
          </XRow>
        ),
      },
      {
        h: 58,
        clue: 'auth',
        surface: (
          <SRow>
            <span className="text-[15px] font-semibold text-ink">Action required: your mailbox is almost full</span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="truncate">spf=<Hl tone="amber">softfail</Hl> dkim=none dmarc=<Hl>fail</Hl></span>
            <Tag n={2}>auth</Tag>
          </XRow>
        ),
      },
      {
        h: 108,
        clue: 'urgency',
        surface: (
          <SRow>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Your mailbox has reached 99% of its storage limit. Upgrade within <b>2 hours</b> to keep receiving email. After that, new messages will be rejected.
            </p>
          </SRow>
        ),
        xray: (
          <XRow className="items-center">
            <span className="leading-relaxed whitespace-normal">
              body.tone = <Hl tone="amber">"within 2 hours"</Hl> + <Hl tone="amber">"will be rejected"</Hl>
              <span className="block text-night-subtle">// urgency + loss framing, a classic lure</span>
            </span>
            <Tag n={3}>pressure</Tag>
          </XRow>
        ),
      },
      {
        h: 132,
        clue: 'link',
        surface: (
          <SRow className="flex-col items-start justify-center gap-3">
            <span className="inline-flex items-center rounded-lg bg-[#2c4bd8] px-4 py-2.5 text-sm font-semibold text-white">Upgrade storage</span>
            <span className="text-[11px] text-muted">Corvane IT · Do not reply to this message</span>
          </SRow>
        ),
        xray: (
          <XRow className="items-center">
            <span className="whitespace-normal break-all leading-relaxed">
              href = https://corvane.io.<Hl>mailbox-upgrade.top</Hl>/auth
              <span className="block text-night-subtle">// registered 3 days ago · not a Corvane domain</span>
            </span>
            <Tag n={4}>lookalike</Tag>
          </XRow>
        ),
      },
    ],
  },
  {
    id: 'login',
    label: 'Sign-in page',
    icon: Globe,
    chrome: 'Browser · New tab',
    verdict: 'Fake login portal',
    advice: 'Close the tab. Use your bookmark.',
    risk: 97,
    clues: [
      { id: 'domain', icon: Globe, title: 'Lookalike domain', detail: 'Real site is session-verify.app, not corvane.io' },
      { id: 'cert', icon: Lock, title: 'Day-old certificate', detail: 'Free DV cert issued yesterday, no organisation' },
      { id: 'vault', icon: KeyRound, title: 'Vault won’t autofill', detail: 'Your password manager doesn’t know this site' },
      { id: 'otp', icon: BadgeAlert, title: 'Asks for code too', detail: 'Password + MFA code on one page = relay attack' },
    ],
    rows: [
      {
        h: 64,
        clue: 'domain',
        surface: (
          <SRow>
            <span className="flex w-full items-center gap-2 rounded-full bg-canvas border border-line px-3 py-2 text-xs text-ink-soft">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> login.corvane.io/…
            </span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="truncate">host = login.corvane.io.<Hl>session-verify.app</Hl></span>
            <Tag n={1}>lookalike</Tag>
          </XRow>
        ),
      },
      {
        h: 74,
        clue: 'cert',
        surface: (
          <SRow className="flex-col items-center justify-center gap-1">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2c4bd8] to-[#7b3fe4]" />
            <span className="text-sm font-semibold text-ink">Sign in to Corvane</span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="truncate">tls.issuer = OpenCert DV · age = <Hl tone="amber">1 day</Hl> · org = none</span>
            <Tag n={2}>cert</Tag>
          </XRow>
        ),
      },
      {
        h: 104,
        clue: 'vault',
        surface: (
          <SRow className="flex-col items-stretch justify-center gap-2">
            <span className="rounded-lg border border-line-strong px-3 py-2 text-xs text-muted">sam.rivera@corvane.io</span>
            <span className="rounded-lg border border-line-strong px-3 py-2 text-xs text-muted">••••••••••</span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="whitespace-normal leading-relaxed">
              vault.match(<span className="text-night-text">session-verify.app</span>) = <Hl>0 logins</Hl>
              <span className="block text-night-subtle">// managers only fill on the exact domain</span>
            </span>
            <Tag n={3}>vault</Tag>
          </XRow>
        ),
      },
      {
        h: 130,
        clue: 'otp',
        surface: (
          <SRow className="flex-col items-stretch justify-center gap-2">
            <span className="rounded-lg border border-line-strong px-3 py-2 text-xs text-muted">6-digit authenticator code</span>
            <span className="rounded-lg bg-[#2c4bd8] py-2.5 text-center text-sm font-semibold text-white">Sign in</span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="whitespace-normal leading-relaxed">
              form.action → <Hl>/relay</Hl> (password <Hl tone="amber">+ otp</Hl>)
              <span className="block text-night-subtle">// adversary-in-the-middle: replays both live</span>
            </span>
            <Tag n={4}>relay</Tag>
          </XRow>
        ),
      },
    ],
  },
  {
    id: 'chat',
    label: 'Helpdesk chat',
    icon: MessageSquare,
    chrome: 'Chat · Direct message',
    verdict: 'Social engineering',
    advice: 'Never share codes. Call IT back.',
    risk: 91,
    clues: [
      { id: 'external', icon: AtSign, title: 'External account', detail: 'Sender is from corvane-helpdesk.net' },
      { id: 'pretext', icon: UserX, title: 'Borrowed authority', detail: 'Name-drops your CFO to lower your guard' },
      { id: 'hour', icon: Clock3, title: 'Odd timing', detail: 'Sent at 23:48, outside support hours' },
      { id: 'code', icon: KeyRound, title: 'Requests your MFA code', detail: 'Real IT never asks for one-time codes' },
    ],
    rows: [
      {
        h: 70,
        clue: 'external',
        surface: (
          <SRow className="gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">IT</span>
            <span>
              <span className="block text-sm font-semibold text-ink">IT Helpdesk</span>
              <span className="block text-xs text-emerald-600">● Active now</span>
            </span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="truncate">tenant = <Hl>corvane-helpdesk.net</Hl> (external)</span>
            <Tag n={1}>external</Tag>
          </XRow>
        ),
      },
      {
        h: 104,
        clue: 'pretext',
        surface: (
          <SRow>
            <span className="max-w-[85%] rounded-2xl rounded-tl-sm bg-canvas border border-line px-3.5 py-2.5 text-[13px] text-ink-soft leading-relaxed">
              Hi Sam, Dana from Finance asked us to fix the sync error on your account before tomorrow’s close.
            </span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="whitespace-normal leading-relaxed">
              pretext = <Hl tone="amber">authority("Dana, CFO")</Hl> + <Hl tone="amber">deadline</Hl>
            </span>
            <Tag n={2}>pretext</Tag>
          </XRow>
        ),
      },
      {
        h: 56,
        clue: 'hour',
        surface: (
          <SRow>
            <span className="text-[11px] text-muted">Today 23:48</span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span>sent_at = <Hl tone="amber">23:48</Hl> · desk hours 08:00–18:00</span>
            <Tag n={3}>timing</Tag>
          </XRow>
        ),
      },
      {
        h: 142,
        clue: 'code',
        surface: (
          <SRow>
            <span className="max-w-[85%] rounded-2xl rounded-tl-sm bg-canvas border border-line px-3.5 py-2.5 text-[13px] text-ink-soft leading-relaxed">
              I’ve just sent a verification prompt. Can you read me the 6-digit code so I can finish up? 🙏
            </span>
          </SRow>
        ),
        xray: (
          <XRow>
            <span className="whitespace-normal leading-relaxed">
              ask = <Hl>"6-digit code"</Hl> → account takeover
              <span className="block text-night-subtle">// policy: IT never requests one-time codes</span>
            </span>
            <Tag n={4}>MFA</Tag>
          </XRow>
        ),
      },
    ],
  },
];

/* ------------------------------ component ------------------------------ */

const SCAN_SECONDS = 3.6;
const HOLD_MS = 2600;
const RESUME_MS = 2800;

export function HeroScanner() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [dragging, setDragging] = useState(false);
  const scenario = SCENARIOS[idx];

  const p = useMotionValue(reduce ? 1 : 0);
  const token = useRef(0);
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const resumeTimer = useRef<number | null>(null);

  // Vertical position (0..1) of each clue row's midpoint inside the viewport.
  const clueStops = useMemo(() => {
    const total = scenario.rows.reduce((s, r) => s + r.h, 0);
    let acc = 0;
    const stops: number[] = [];
    for (const r of scenario.rows) {
      if (r.clue) stops.push((acc + r.h * 0.5) / total);
      acc += r.h;
    }
    return stops;
  }, [scenario]);

  const countAt = useCallback((v: number) => clueStops.filter((s) => s <= v).length, [clueStops]);

  useMotionValueEvent(p, 'change', (v) => {
    const c = countAt(v);
    setRevealed((prev) => (prev === c ? prev : c));
  });

  const stop = useCallback(() => {
    token.current += 1;
    controls.current?.stop();
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  const runFrom = useCallback(() => {
    stop();
    const my = token.current;
    const remaining = Math.max(0.05, 1 - p.get());
    const anim = animate(p, 1, { duration: SCAN_SECONDS * remaining, ease: [0.45, 0, 0.25, 1] });
    controls.current = anim;
    anim.then(() => {
      if (my !== token.current) return;
      resumeTimer.current = window.setTimeout(() => {
        if (my !== token.current) return;
        p.set(0);
        setRevealed(0);
        setIdx((i) => (i + 1) % SCENARIOS.length);
      }, HOLD_MS);
    });
  }, [p, stop]);

  // Autoplay whenever visible; restart on each new scenario.
  useEffect(() => {
    setRevealed(countAt(p.get()));
    if (reduce) {
      p.set(1);
      setRevealed(clueStops.length);
      return;
    }
    if (!inView || dragging) {
      stop();
      return;
    }
    runFrom();
    return stop;
  }, [idx, inView, dragging, reduce, runFrom, stop, p, countAt, clueStops.length]);

  const setFromPointer = (clientY: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    p.set(Math.min(1, Math.max(0, (clientY - r.top) / r.height)));
  };

  const pick = (i: number) => {
    stop();
    p.set(reduce ? 1 : 0);
    setRevealed(reduce ? clueStops.length : 0);
    setIdx(i);
  };

  const inverse = useTransform(p, (v) => `${(1 - v) * 100}%`);
  const clip = useMotionTemplate`inset(0 0 ${inverse} 0)`;
  const beamTop = useTransform(p, (v) => `${v * 100}%`);
  const pillY = useTransform(p, (v) => (v > 0.86 ? -30 : 0));
  const pct = useTransform(p, (v) => `${Math.round(v * 100)}%`);

  const complete = revealed >= scenario.clues.length;
  const risk = Math.round((revealed / scenario.clues.length) * scenario.risk);

  return (
    <div ref={rootRef} className="relative rounded-[24px] border border-white/10 bg-night-2/90 text-night-text overflow-hidden shadow-[0_60px_120px_-40px_rgba(0,0,0,0.85)]">
      {/* Top chrome */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 sm:px-5 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </span>
        <span className="hidden sm:inline font-mono text-[11px] text-night-subtle">phishlens://scan</span>
        <div className="ml-auto flex items-center gap-1 rounded-xl bg-white/[0.04] p-1" role="tablist" aria-label="Scan target">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              onClick={() => pick(i)}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-[11.5px] font-medium cursor-pointer transition-colors ${i === idx ? 'text-white' : 'text-night-subtle hover:text-night-text'}`}
            >
              {i === idx && <motion.span layoutId="scan-tab" className="absolute inset-0 rounded-lg bg-white/10 ring-1 ring-white/15" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <s.icon className="relative w-3.5 h-3.5" />
              <span className="relative hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr]">
        {/* Scanner viewport */}
        <div className="relative p-3 sm:p-4 lg:border-r border-white/10">
          <div className="flex items-center justify-between px-1 pb-2.5 text-[11px] font-mono">
            <span className="text-night-subtle">{scenario.chrome}</span>
            <span className="inline-flex items-center gap-1.5 text-brand-soft">
              <ScanLine className="w-3.5 h-3.5" />
              x-ray <motion.span className="tabular-nums">{pct}</motion.span>
            </span>
          </div>

          <div
            ref={viewportRef}
            className={`relative rounded-2xl overflow-hidden select-none touch-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ height: VIEWPORT_H }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              stop();
              setDragging(true);
              setFromPointer(e.clientY);
            }}
            onPointerMove={(e) => dragging && setFromPointer(e.clientY)}
            onPointerUp={() => {
              setDragging(false);
            }}
            onPointerCancel={() => setDragging(false)}
            aria-label="Drag up and down to scan the message"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={scenario.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                exit={{ opacity: 0, scale: 1.01, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                {/* Surface layer */}
                <div className="absolute inset-0 bg-surface">
                  {scenario.rows.map((r, i) => (
                    <div key={i} style={{ height: r.h }} className={i > 0 ? 'border-t border-line/70' : ''}>
                      {r.surface}
                    </div>
                  ))}
                </div>

                {/* X-ray layer, clipped to the scanned region */}
                <motion.div className="absolute inset-0 bg-[#0d0a14]" style={{ clipPath: clip }} aria-hidden>
                  <div className="absolute inset-0 bg-grid-night opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-violet/10" />
                  <div className="relative">
                    {scenario.rows.map((r, i) => (
                      <div key={i} style={{ height: r.h }} className={i > 0 ? 'border-t border-white/[0.06]' : ''}>
                        {r.xray}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Scan beam */}
            <motion.div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: beamTop }} aria-hidden>
              <div className="absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent to-brand/25" />
              <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-brand-soft to-transparent shadow-[0_0_24px_4px_rgba(238,126,174,0.7)]" />
              <motion.div style={{ y: pillY }} className="absolute right-3 -top-3.5 flex items-center gap-1.5 rounded-full border border-white/20 bg-night/90 px-2.5 py-1 font-mono text-[10px] text-white shadow-lg transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-soft animate-pulse" />
                {dragging ? 'scanning' : 'drag to scan'}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Analysis panel */}
        <div className="relative p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-night-subtle">Threat analysis</div>
              <div className="text-sm font-semibold text-white mt-0.5">{revealed}/{scenario.clues.length} indicators found</div>
            </div>
            <RiskDial value={risk} />
          </div>

          <ul className="space-y-2">
            {scenario.clues.map((c, i) => {
              const on = i < revealed;
              return (
                <li key={`${scenario.id}-${c.id}`} className="relative">
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: on ? 1 : 0.45,
                      borderColor: on ? 'rgba(238,126,174,0.45)' : 'rgba(255,255,255,0.08)',
                      backgroundColor: on ? 'rgba(214,69,127,0.10)' : 'rgba(255,255,255,0.02)',
                    }}
                    transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                    className="flex items-start gap-3 rounded-xl border px-3 py-2.5"
                  >
                    <span className={`mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-md text-[10px] font-semibold transition-colors ${on ? 'bg-brand text-white' : 'bg-white/5 text-night-subtle'}`}>
                      {on ? <c.icon className="w-3.5 h-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] font-semibold ${on ? 'text-white' : 'text-night-subtle'}`}>{on ? c.title : 'Scanning…'}</span>
                      {on ? (
                        <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="block text-[11.5px] text-night-muted leading-snug">
                          {c.detail}
                        </motion.span>
                      ) : (
                        <span className="mt-1.5 block h-2 w-3/4 rounded-full bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-shimmer" />
                      )}
                    </span>
                  </motion.div>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto min-h-[64px]">
            <AnimatePresence mode="wait">
              {complete ? (
                <motion.div
                  key={`v-${scenario.id}`}
                  initial={{ opacity: 0, scale: 1.25, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: -2 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="flex items-center gap-3 rounded-xl border-2 border-[#ff6b7d]/70 bg-[#ff6b7d]/10 px-3.5 py-2.5"
                >
                  <ShieldAlert className="w-6 h-6 text-[#ff8a98] shrink-0" />
                  <span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff8a98]">Verdict · {scenario.verdict}</span>
                    <span className="block text-sm font-semibold text-white">{scenario.advice}</span>
                  </span>
                </motion.div>
              ) : (
                <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 rounded-xl border border-dashed border-white/12 px-3.5 py-3 text-[12px] text-night-subtle">
                  <AlertTriangle className="w-4 h-4 text-amber-300/80" />
                  Looks ordinary on the surface. Keep scanning.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Scenario progress */}
      <div className="grid grid-cols-3 gap-1 px-4 pb-3" aria-hidden>
        {SCENARIOS.map((s, i) => (
          <div key={s.id} className="h-[3px] rounded-full bg-white/10 overflow-hidden">
            {i < idx && <div className="h-full w-full bg-white/40" />}
            {i === idx && <motion.div className="h-full bg-gradient-to-r from-brand-soft to-violet" style={{ width: pct }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskDial({ value }: { value: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const color = value > 70 ? '#ff6b7d' : value > 35 ? '#fbbf24' : '#4fd1a1';
  return (
    <div className="relative w-14 h-14" aria-label={`Risk ${value} of 100`}>
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r={r} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - value / 100), stroke: color }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[13px] font-semibold tabular-nums text-white">{value}</span>
      </div>
    </div>
  );
}
