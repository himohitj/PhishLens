import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import {
  ArrowRight, Box, Eye, FileWarning, Fingerprint, Globe, KeyRound, Lock, Mail, MessageSquare, MousePointerClick,
  QrCode, RotateCcw, ShieldCheck, Smartphone, Sparkles, Target, TrendingUp, WifiOff,
} from 'lucide-react';
import { SessionStateResponse } from '../types/phishlens.ts';
import { getResumeRouteForSession } from '../lib/sessionStore.ts';
import { HeroLensScene } from '../components/HeroLensScene.tsx';
import { WarmupTeaser } from '../components/WarmupTeaser.tsx';
import { Eyebrow } from '../components/ui/Eyebrow.tsx';
import { LEARNING_MODULES } from '../server/data.ts';
import { LAB_IMAGES } from '../sandbox/labs/index.ts';
import {
  Aurora, CountUp, EASE_OUT_EXPO, Magnetic, Marquee, Reveal, SplitText, SpotlightCard, Stagger, StaggerItem, Tilt, TypingTerminal,
} from '../components/motion.tsx';

interface LandingPageProps {
  session: SessionStateResponse;
  navigate: (path: string) => void;
}

const ROOMS = [
  { id: 'sim-1', icon: Mail, medium: 'Email inbox', title: "The Message That Can't Wait", desc: 'Expand the sender, preview the real link, and decide before the countdown gets to you.', span: 'lg:col-span-3' },
  { id: 'sim-2', icon: Globe, medium: 'Browser window', title: 'The Suspicious Sign-In', desc: 'Read the address bar like an analyst and spot why the page wants your password and code together.', span: 'lg:col-span-3' },
  { id: 'sim-3', icon: Smartphone, medium: 'Phone SMS', title: 'Your Delivery Is On Hold', desc: 'An unknown number and a tiny fee. Preview the link before you tap.', span: 'lg:col-span-2' },
  { id: 'sim-4', icon: QrCode, medium: 'QR scanner', title: 'Scan Before You Trust', desc: 'Decode a poster’s QR code and see the destination before your phone opens it.', span: 'lg:col-span-2' },
  { id: 'sim-5', icon: MessageSquare, medium: 'Support chat', title: 'The Urgent IT Request', desc: 'An external “helpdesk” drops your manager’s name and asks for your code.', span: 'lg:col-span-2' },
];

const LOOP = [
  { icon: Eye, title: 'Experience', text: 'Step into a realistic inbox, browser, phone or chat. No slides, no lectures.' },
  { icon: MousePointerClick, title: 'Decide', text: 'Make the call you would make on a busy Tuesday, under the same pressure.' },
  { icon: Fingerprint, title: 'Discover', text: 'Inspect headers, hover links and decode QR codes to surface the clues attackers hide.' },
  { icon: Sparkles, title: 'Understand', text: 'Get an instant debrief: what you spotted, what you missed, and why it worked.' },
  { icon: Target, title: 'Practise', text: 'Go deeper in isolated sandbox labs with a forensic terminal and real tools.' },
  { icon: TrendingUp, title: 'Improve', text: 'Track your recognition score from your first call to your last.' },
];

const THREATS = ['Business Email Compromise', 'Credential harvesting', 'Smishing', 'Quishing', 'MFA fatigue', 'Malicious attachments', 'Vishing', 'Lookalike domains', 'Adversary-in-the-middle', 'Pretexting'];

export function LandingPage({ session, navigate }: LandingPageProps) {
  const hasProgress = session.completedScenarioIds.length > 0 || Boolean(session.baselineAssessment) || session.completedModuleSlugs.length > 0;
  const nextSimId = ROOMS.find((r) => !session.completedScenarioIds.includes(r.id))?.id ?? 'sim-1';
  const startDestination = hasProgress ? getResumeRouteForSession(session) : `/experience/simulation/${nextSimId}`;

  return (
    <div className="flex-1 overflow-x-clip">
      <Hero hasProgress={hasProgress} done={session.completedScenarioIds.length} onStart={() => navigate(startDestination)} onLabs={() => navigate('/labs')} />

      {/* Threat marquee */}
      <section className="border-b border-line bg-surface py-7">
        <Marquee>
          {THREATS.map((t) => (
            <span key={t} className="flex items-center gap-10 text-sm font-medium text-muted whitespace-nowrap">
              {t}
              <span className="w-1.5 h-1.5 rounded-full bg-brand-soft" aria-hidden />
            </span>
          ))}
        </Marquee>
      </section>

      <LoopSection />

      {/* Rooms bento */}
      <section id="how-it-works" className="relative px-4 sm:px-6 py-24 sm:py-32 scroll-mt-24">
        <div className="max-w-[1240px] mx-auto space-y-14">
          <div className="grid lg:grid-cols-2 gap-6 items-end">
            <div className="space-y-4">
              <Reveal><Eyebrow>Guided rooms</Eyebrow></Reveal>
              <SplitText as="h2" text="Five rooms. Five ways *attackers* get in." className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]" />
            </div>
            <Reveal delay={0.1}>
              <p className="text-lg text-muted leading-relaxed lg:max-w-md lg:ml-auto">
                Each room drops you into a different medium with 3–4 short tasks. You inspect one clue at a time, get instant feedback, and see exactly what happens when you make your call.
              </p>
            </Reveal>
          </div>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4" gap={0.07}>
            {ROOMS.map((room, i) => {
              const Icon = room.icon;
              const done = session.completedScenarioIds.includes(room.id);
              return (
                <StaggerItem key={room.id} className={room.span}>
                  <SpotlightCard
                    as="button"
                    type="button"
                    onClick={() => navigate(`/experience/simulation/${room.id}`)}
                    className="h-full w-full text-left rounded-3xl border border-line bg-surface p-6 sm:p-7 flex flex-col gap-10 cursor-pointer transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(22,19,29,0.35)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="relative grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-rose-soft text-brand transition-transform duration-500 group-hover/spot:scale-110 group-hover/spot:-rotate-6">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs text-muted">{done ? <span className="text-emerald-600">✓ done</span> : `0${i + 1}`}</span>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted">{room.medium}</div>
                      <h3 className="text-xl font-semibold">{room.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{room.desc}</p>
                      <div className="pt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                        Enter room
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/spot:translate-x-1" />
                      </div>
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <SandboxShowcase onLaunch={() => navigate('/labs')} />

      {/* Warm-up */}
      <section className="px-4 sm:px-6 py-24 sm:py-32">
        <div className="max-w-[1240px] mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
          <div className="space-y-5 lg:sticky lg:top-32">
            <Reveal><Eyebrow>30-second warm-up</Eyebrow></Reveal>
            <SplitText as="h2" text="Try it *right here.*" className="text-4xl sm:text-5xl font-semibold leading-[1.02]" />
            <Reveal delay={0.1}>
              <p className="text-lg text-muted leading-relaxed">
                Inspect the sender, unmask the link, then make your call. This is the whole PhishLens loop in miniature.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <WarmupTeaser />
          </Reveal>
        </div>
      </section>

      <FinalCta onStart={() => navigate(startDestination)} hasProgress={hasProgress} />
    </div>
  );
}

/* --------------------------------- Hero --------------------------------- */

function Hero({ hasProgress, done, onStart, onLabs }: { hasProgress: boolean; done: number; onStart: () => void; onLabs: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const rotateX = useTransform(smooth, [0, 0.5], [18, 0]);
  const scale = useTransform(smooth, [0, 0.5], [0.9, 1]);
  const sceneY = useTransform(smooth, [0, 1], [0, -60]);
  const copyY = useTransform(smooth, [0, 1], [0, 140]);
  const copyOpacity = useTransform(smooth, [0, 0.45], [1, 0]);

  return (
    <section ref={ref} className="relative bg-night text-night-text grain overflow-hidden pt-36 sm:pt-44 pb-24">
      <Aurora />
      <div className="absolute inset-0 bg-grid-night mask-radial" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" aria-hidden />

      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.15 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-soft animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-soft" />
          </span>
          <span className="text-shimmer text-night-muted">New · isolated Sandbox Labs</span>
          <button type="button" onClick={onLabs} className="text-white/90 hover:text-white inline-flex items-center gap-0.5 cursor-pointer">
            Explore <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        <SplitText
          text="See through the *deception.*"
          delay={0.25}
          stagger={0.08}
          className="text-[44px] leading-[0.98] sm:text-7xl lg:text-[104px] font-semibold tracking-[-0.05em] text-white"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.75 }}
          className="mx-auto max-w-2xl text-base sm:text-xl text-night-muted leading-relaxed"
        >
          Phishing is designed to look ordinary. Step into realistic simulations and disposable sandbox machines, uncover the clues attackers hope you miss, and build instincts that hold up under pressure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Magnetic>
            <button
              type="button"
              onClick={onStart}
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-ink shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_20px_50px_-15px_rgba(214,69,127,0.6)] cursor-pointer overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-rose-soft to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{hasProgress ? `Resume training · ${done}/5` : 'Start the experience'}</span>
              <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Magnetic>
          <Magnetic strength={0.2}>
            <button
              type="button"
              onClick={onLabs}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <Box className="w-4 h-4" /> Boot a sandbox lab
            </button>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-night-subtle"
        >
          {['No sign-up', 'Runs entirely in your browser', 'No real credentials collected'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />{t}</span>
          ))}
        </motion.div>
      </motion.div>

      {/* Product shot with scroll-linked perspective */}
      <div className="relative z-10 mt-16 sm:mt-20 px-4 sm:px-6" style={{ perspective: 1600 }}>
        <motion.div
          style={{ rotateX, scale, y: sceneY, transformOrigin: 'center top' }}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.6 }}
          className="relative mx-auto max-w-[1080px]"
        >
          <div className="absolute -inset-x-10 -top-10 bottom-10 rounded-[40px] bg-gradient-to-b from-brand/30 via-violet/20 to-transparent blur-3xl" aria-hidden />
          <Tilt max={3}>
            <div className="relative rounded-[28px] border border-white/15 bg-white/[0.06] p-2 sm:p-3 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
              <div className="rounded-[20px] overflow-hidden bg-canvas text-ink">
                <HeroLensScene />
              </div>
            </div>
          </Tilt>
          <FloatingChip className="hidden md:flex -left-10 top-[22%]" delay={1.4} icon={<Mail className="w-3.5 h-3.5" />} title="Sender mismatch" sub="northstar-verify-mail.example.net" />
          <FloatingChip className="hidden md:flex -right-8 top-[55%]" delay={1.6} icon={<Lock className="w-3.5 h-3.5" />} title="Lookalike link" sub="decoy prefix detected" tone="warn" />
        </motion.div>
      </div>

      <Stats />
    </section>
  );
}

function FloatingChip({ className, delay, icon, title, sub, tone = 'brand' }: { className: string; delay: number; icon: React.ReactNode; title: string; sub: string; tone?: 'brand' | 'warn' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay }}
      className={`absolute z-20 items-center gap-2.5 rounded-2xl border border-white/15 bg-night-2/95 px-3.5 py-2.5 text-xs shadow-2xl animate-float ${className}`}
    >
      <span className={`grid place-items-center w-7 h-7 rounded-lg ${tone === 'warn' ? 'bg-amber-400/15 text-amber-300' : 'bg-brand/20 text-brand-soft'}`}>{icon}</span>
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="block font-mono text-[10.5px] text-night-subtle">{sub}</span>
      </span>
    </motion.div>
  );
}

function Stats() {
  const stats = [
    { value: 5, label: 'Interactive rooms' },
    { value: LAB_IMAGES.length, label: 'Isolated sandbox labs' },
    { value: LEARNING_MODULES.length, label: 'Visual threat guides' },
    { value: 0, label: 'Bytes of your data sent', suffix: ' B' },
  ];
  return (
    <div className="relative z-10 max-w-[1080px] mx-auto px-4 sm:px-6 mt-20">
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl border border-white/10 bg-white/[0.03] divide-x divide-y lg:divide-y-0 divide-white/10 overflow-hidden">
        {stats.map((s) => (
          <StaggerItem key={s.label} className="p-6 sm:p-8">
            <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-white tabular-nums">
              <CountUp to={s.value} suffix={s.suffix ?? ''} />
            </div>
            <div className="mt-1 text-sm text-night-subtle">{s.label}</div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/* ---------------------------- Scroll-driven loop ---------------------------- */

function LoopSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  return (
    <section className="px-4 sm:px-6 py-24 sm:py-32 border-b border-line bg-gradient-to-b from-surface to-canvas">
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-14">
        <div className="space-y-5 lg:sticky lg:top-32 self-start">
          <Reveal><Eyebrow>The learning loop</Eyebrow></Reveal>
          <SplitText as="h2" text="Built on *action,* not attention spans." className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02]" />
          <Reveal delay={0.1}>
            <p className="text-lg text-muted leading-relaxed max-w-md">
              People don’t fall for phishing because they lack theory. They fall for it because real interfaces hide the evidence. So PhishLens makes you find it.
            </p>
          </Reveal>
        </div>
        <div ref={ref} className="relative pl-10">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line" aria-hidden />
          <motion.div className="absolute left-[15px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-brand via-violet to-cyan" style={{ scaleY: line }} aria-hidden />
          <div className="space-y-12">
            {LOOP.map((step, i) => (
              <LoopStep key={step.title} index={i} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoopStep({ icon: Icon, title, text, index }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; index: number }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0.25 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.9, margin: '-20% 0px -30% 0px' }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="absolute -left-10 top-0 grid place-items-center w-8 h-8 rounded-full border border-line bg-surface text-muted"
        whileInView={{ scale: [0.8, 1.1, 1], backgroundColor: '#16131d', color: '#ffffff', borderColor: '#16131d' }}
        viewport={{ amount: 0.9, margin: '-20% 0px -30% 0px' }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        <Icon className="w-3.5 h-3.5" />
      </motion.span>
      <div className="font-mono text-xs text-muted">0{index + 1}</div>
      <h3 className="text-2xl sm:text-3xl font-semibold mt-1">{title}</h3>
      <p className="mt-2 text-muted leading-relaxed max-w-lg">{text}</p>
    </motion.div>
  );
}

/* ------------------------------ Sandbox showcase ------------------------------ */

function SandboxShowcase({ onLaunch }: { onLaunch: () => void }) {
  const features = [
    { icon: Lock, title: 'Opaque origin', text: 'Each container is a script-only sandboxed frame with no access to your cookies, storage or this page.' },
    { icon: WifiOff, title: 'Zero egress', text: 'A strict CSP drops every network request. The lab’s “internet” is a virtual DNS and web.' },
    { icon: FileWarning, title: 'Detonate safely', text: 'Run the payload, submit the form, approve the push. Compromise stays inside the container.' },
    { icon: RotateCcw, title: 'Disposable', text: 'One click destroys the machine and boots a clean image with a fresh container ID.' },
  ];
  return (
    <section className="relative bg-night text-night-text grain overflow-hidden px-4 sm:px-6 py-24 sm:py-32">
      <Aurora intensity={0.7} />
      <div className="absolute inset-0 bg-grid-night mask-radial opacity-70" aria-hidden />
      <div className="relative max-w-[1240px] mx-auto space-y-16">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <div className="space-y-5">
            <Reveal><Eyebrow tone="night">Sandbox Labs</Eyebrow></Reveal>
            <SplitText as="h2" text="A disposable machine for *every* lesson." className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] text-white" />
          </div>
          <Reveal delay={0.1} className="space-y-6 lg:max-w-md lg:ml-auto">
            <p className="text-lg text-night-muted leading-relaxed">
              Boot an isolated workstation in your browser, with mail, a web browser, files and a forensic terminal. Investigate like an analyst, or click the bad link on purpose and watch what happens.
            </p>
            <Magnetic>
              <button type="button" onClick={onLaunch} className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-ink cursor-pointer">
                Launch a lab <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 items-stretch">
          <Reveal y={40}>
            <div className="h-full rounded-3xl border border-white/10 bg-[#0f0d13] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </span>
                <span className="ml-2 font-mono text-[11px] text-brand-soft rounded-full border border-white/10 px-2 py-0.5">plc-8d92c903</span>
                <span className="ml-auto font-mono text-[11px] text-night-subtle inline-flex items-center gap-1"><WifiOff className="w-3 h-3" /> lab network only</span>
              </div>
              <TypingTerminal
                prompt="sam@corv-lt-0417:~$"
                className="p-5 sm:p-6 font-mono text-[12.5px] leading-relaxed space-y-1 min-h-[320px]"
                lines={[
                  { kind: 'cmd', text: 'whois corvane-finance.co' },
                  { kind: 'warn', text: 'Creation Date: 2026-11-14T02:13:51Z   <-- registered 2 days ago' },
                  { kind: 'cmd', text: 'file Shipping_Label_8841.pdf.exe' },
                  { kind: 'warn', text: 'Shipping_Label_8841.pdf.exe: PE32+ executable (GUI) x86-64, for MS Windows' },
                  { kind: 'cmd', text: 'intel a3f9c2e17b4d58e0…' },
                  { kind: 'warn', text: 'MALICIOUS (61/68 engines): CryptLock ransomware loader' },
                  { kind: 'cmd', text: 'ping example.com' },
                  { kind: 'ok', text: 'ping: network egress is disabled inside PhishLens containers' },
                ]}
              />
            </div>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 gap-4" gap={0.09}>
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <SpotlightCard tone="night" className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
                  <f.icon className="w-5 h-5 text-brand-soft" />
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-night-muted leading-relaxed">{f.text}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Stagger className="grid md:grid-cols-3 gap-4" gap={0.08}>
          {LAB_IMAGES.map((lab) => (
            <StaggerItem key={lab.id}>
              <button type="button" onClick={onLaunch} className="group w-full text-left rounded-2xl border border-white/10 hover:border-brand-soft/50 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between font-mono text-[11px] text-night-subtle">
                  <span>{lab.codename}</span>
                  <KeyRound className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
                </div>
                <div className="mt-3 font-semibold text-white">{lab.title}</div>
                <div className="text-sm text-night-muted">{lab.attackFamily}</div>
              </button>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------------------------- CTA ---------------------------------- */

function FinalCta({ onStart, hasProgress }: { onStart: () => void; hasProgress: boolean }) {
  return (
    <section className="px-4 sm:px-6 pb-24">
      <div className="relative max-w-[1240px] mx-auto overflow-hidden rounded-[36px] bg-night text-white grain px-6 py-20 sm:py-28 text-center">
        <Aurora intensity={1.1} />
        <div className="absolute inset-0 bg-grid-night mask-radial" aria-hidden />
        <div className="relative space-y-8">
          <SplitText as="h2" text="Your next click could be *the one.*" className="text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-[-0.045em]" />
          <Reveal delay={0.2}>
            <p className="mx-auto max-w-xl text-night-muted text-lg">Twenty minutes of practice here is cheaper than one real incident.</p>
          </Reveal>
          <Reveal delay={0.3}>
            <Magnetic>
              <button type="button" onClick={onStart} className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-ink cursor-pointer shadow-[0_20px_60px_-15px_rgba(214,69,127,0.7)]">
                {hasProgress ? 'Pick up where you left off' : 'Start the experience'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
