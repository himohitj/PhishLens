import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Clock, Cpu, Eye, Lightbulb, Lock, Power,
  RotateCcw, ShieldAlert, ShieldCheck, Skull, WifiOff, XCircle,
} from 'lucide-react';
import { ContainerHost, mintContainerId, type ContainerStatus } from '../sandbox/ContainerHost.tsx';
import { LAB_IMAGES, getLabImage } from '../sandbox/labs/index.ts';
import { OUTCOME_COPY, describeEvent, evaluateLab, type LabEvaluation } from '../sandbox/engine.ts';
import type { LabImage, SandboxEvent } from '../sandbox/types.ts';
import type { LabResultRecord, SessionStateResponse } from '../types/phishlens.ts';
import { Aurora, EASE_OUT_EXPO, Magnetic, Reveal, SplitText, SpotlightCard, Stagger, StaggerItem } from '../components/motion.tsx';
import { Eyebrow } from '../components/ui/Eyebrow.tsx';

interface LabsPageProps {
  labId?: string;
  session: SessionStateResponse;
  onLabComplete: (result: LabResultRecord) => void;
  navigate: (path: string) => void;
}

const TONE: Record<string, { card: string; ring: string }> = {
  good: { card: 'bg-emerald-50 text-emerald-900 border-emerald-200', ring: '#10b981' },
  warn: { card: 'bg-amber-50 text-amber-900 border-amber-200', ring: '#f59e0b' },
  bad: { card: 'bg-rose-50 text-rose-900 border-rose-200', ring: '#e11d48' },
  neutral: { card: 'bg-canvas text-ink border-line', ring: '#6b6575' },
};

export function LabsPage({ labId, session, onLabComplete, navigate }: LabsPageProps) {
  if (labId) {
    const image = getLabImage(labId);
    if (image) return <LabWorkspace key={image.id} image={image} session={session} onLabComplete={onLabComplete} navigate={navigate} />;
  }
  return <LabCatalog session={session} navigate={navigate} />;
}

/* ------------------------------ Catalog ------------------------------ */

function LabCatalog({ session, navigate }: { session: SessionStateResponse; navigate: (p: string) => void }) {
  const isolation = [
    { icon: Lock, t: 'Opaque origin', d: 'No access to your cookies, storage or this page' },
    { icon: WifiOff, t: 'Zero egress', d: 'A strict CSP blocks every network request' },
    { icon: Cpu, t: 'Runs locally', d: 'Nothing about your session is sent to a server' },
    { icon: RotateCcw, t: 'Disposable', d: 'Reset boots a clean image with a new ID' },
  ];
  return (
    <div className="flex-1">
      <section className="relative -mt-[84px] pt-[150px] pb-24 bg-night text-night-text grain overflow-hidden px-4 sm:px-6">
        <Aurora intensity={0.8} />
        <div className="absolute inset-0 bg-grid-night mask-radial" aria-hidden />
        <div className="relative max-w-[1240px] mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-12 items-end">
          <div className="space-y-6">
            <Reveal><Eyebrow tone="night">Sandbox Labs</Eyebrow></Reveal>
            <SplitText text="Investigate real attacks in a *throwaway* machine." className="text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.0] tracking-[-0.045em] text-white" />
            <Reveal delay={0.3}>
              <p className="text-lg text-night-muted leading-relaxed max-w-2xl">
                Each lab boots its own isolated workstation in your browser, with mail, a browser, files and a forensic terminal. Click the link, open the attachment, run the commands. If you get compromised, it stays inside the container.
              </p>
            </Reveal>
          </div>
          <Stagger className="grid grid-cols-2 gap-3" gap={0.07} delay={0.3}>
            {isolation.map((f) => (
              <StaggerItem key={f.t}>
                <SpotlightCard tone="night" className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <f.icon className="w-4 h-4 text-brand-soft" />
                  <div className="mt-3 text-sm font-semibold text-white">{f.t}</div>
                  <div className="text-xs text-night-muted mt-0.5 leading-relaxed">{f.d}</div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-20">
        <Stagger className="max-w-[1240px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5" gap={0.08}>
          {LAB_IMAGES.map((lab) => {
            const result = session.labResults[lab.id];
            const copy = result ? OUTCOME_COPY[result.outcome] : null;
            return (
              <StaggerItem key={lab.id}>
                <SpotlightCard as="article" className="h-full flex flex-col rounded-3xl border border-line bg-surface transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(22,19,29,0.4)]">
                  <div className="relative m-2 mb-0 rounded-[20px] bg-night overflow-hidden h-36">
                    <div className="absolute inset-0 bg-grid-night opacity-70" aria-hidden />
                    <div className="absolute -right-10 -top-16 w-48 h-48 rounded-full bg-brand/40 blur-3xl transition-transform duration-700 group-hover/spot:scale-125" aria-hidden />
                    <div className="absolute -left-10 -bottom-20 w-48 h-48 rounded-full bg-violet/30 blur-3xl" aria-hidden />
                    <div className="relative h-full p-4 flex flex-col justify-between font-mono text-[11px] text-night-muted">
                      <div className="flex items-center justify-between">
                        <span className="text-brand-soft">{lab.codename}</span>
                        <span>image {lab.version}</span>
                      </div>
                      <div className="space-y-0.5">
                        <div><span className="text-emerald-400">$</span> phishlens boot {lab.id}</div>
                        <div className="text-night-subtle">sandbox=allow-scripts · egress=none</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-blush text-brand font-semibold">{lab.attackFamily}</span>
                      <span className="px-2 py-0.5 rounded-full border border-line text-muted">{lab.difficulty}</span>
                      <span className="px-2 py-0.5 rounded-full border border-line text-muted inline-flex items-center gap-1"><Clock className="w-3 h-3" />{lab.estimatedMinutes} min</span>
                    </div>
                    <h2 className="text-xl font-semibold">{lab.title}</h2>
                    <p className="text-sm text-muted leading-relaxed flex-1">{lab.tagline}</p>
                    {result && copy && (
                      <div className={`text-xs rounded-xl border px-3 py-2 ${TONE[copy.tone].card}`}>
                        Best <b className="tabular-nums">{result.score}/100</b> · {copy.label} · {result.attempts} run{result.attempts > 1 ? 's' : ''}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/labs/${lab.id}`)}
                      className="group mt-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-ink hover:bg-brand rounded-xl transition-colors cursor-pointer"
                    >
                      <Power className="w-4 h-4" /> {result ? 'Run again' : 'Launch container'}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}

/* ----------------------------- Workspace ----------------------------- */

type Phase = 'briefing' | 'running' | 'debrief';

const BOOT_STEPS = [
  'Allocating opaque origin (sandbox=allow-scripts)',
  'Applying CSP: default-src none, connect-src none',
  'Mounting lab image and virtual DNS',
  'Opening private MessagePort, verifying nonce',
  'Starting desktop session',
];

function LabWorkspace({ image, onLabComplete, navigate }: { image: LabImage } & Omit<LabsPageProps, 'labId'>) {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [containerId, setContainerId] = useState(mintContainerId);
  const [events, setEvents] = useState<SandboxEvent[]>([]);
  const [status, setStatus] = useState<ContainerStatus>('stopped');
  const [hints, setHints] = useState<string[]>([]);
  const [final, setFinal] = useState<LabEvaluation | null>(null);
  const [bootStep, setBootStep] = useState(0);
  const startedAt = useRef<number>(0);

  const evaluation = useMemo(() => evaluateLab(image, events), [image, events]);
  const onEvent = useCallback((e: SandboxEvent) => setEvents((prev) => [...prev, e]), []);

  useEffect(() => {
    if (phase !== 'running' || bootStep >= BOOT_STEPS.length) return;
    const t = window.setTimeout(() => setBootStep((s) => s + 1), 230);
    return () => window.clearTimeout(t);
  }, [phase, bootStep, containerId]);

  const start = () => {
    setEvents([]);
    setHints([]);
    setFinal(null);
    setBootStep(0);
    setContainerId(mintContainerId());
    startedAt.current = Date.now();
    setPhase('running');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const end = () => {
    const ev = evaluateLab(image, events);
    setFinal(ev);
    setPhase('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onLabComplete({
      labId: image.id,
      labTitle: image.title,
      containerId,
      score: ev.score,
      outcome: ev.outcome,
      investigationDepth: ev.investigationDepth,
      objectivesCompleted: ev.objectives.filter((o) => o.completed).length,
      objectivesTotal: ev.objectives.length,
      trapsTriggered: ev.traps.filter((t) => t.triggered).map((t) => t.id),
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      attempts: 1,
      completedAt: new Date().toISOString(),
    });
  };

  const next = LAB_IMAGES.find((l) => l.order === image.order + 1);
  const done = evaluation.objectives.filter((o) => o.completed).length;
  const booted = bootStep >= BOOT_STEPS.length && status === 'running';

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => navigate('/labs')} className="grid place-items-center w-10 h-10 rounded-xl border border-line bg-surface hover:border-brand-soft hover:-translate-x-0.5 transition-all cursor-pointer" aria-label="All labs">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-muted uppercase tracking-wider">{image.codename} · {image.attackFamily}</div>
            <h1 className="text-2xl font-semibold truncate">{image.title}</h1>
          </div>
        </div>
        <AnimatePresence>
          {phase === 'running' && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <button type="button" onClick={start} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-line bg-surface hover:border-brand-soft cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" /> Reset container
              </button>
              <button type="button" onClick={end} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white rounded-xl bg-ink hover:bg-brand transition-colors cursor-pointer">
                <Power className="w-3.5 h-3.5" /> End mission &amp; debrief
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'briefing' && (
        <Reveal>
          <section className="grid lg:grid-cols-[1.25fr_1fr] gap-6 rounded-[28px] border border-line bg-surface p-6 sm:p-10 shadow-[0_30px_80px_-50px_rgba(22,19,29,0.4)]">
            <div className="space-y-5">
              <Eyebrow>Mission briefing</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-semibold">{image.tagline}</h2>
              <Stagger className="space-y-3" gap={0.08}>
                {image.briefing.map((p) => (
                  <StaggerItem key={p}><p className="text-ink-soft leading-relaxed">{p}</p></StaggerItem>
                ))}
              </Stagger>
              <p className="text-sm text-muted">
                You are <b className="text-ink">{image.persona.name}</b>, {image.persona.role}. Investigate as you would at work, then make a call and end the mission. Don’t type real passwords or personal details.
              </p>
              <Magnetic>
                <button type="button" onClick={start} className="group inline-flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white bg-ink hover:bg-brand rounded-2xl transition-colors cursor-pointer shadow-[0_20px_40px_-20px_rgba(214,69,127,0.8)]">
                  <Power className="w-4 h-4" /> Boot isolated container
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Magnetic>
            </div>
            <IsolationCard />
          </section>
        </Reveal>
      )}

      {phase === 'running' && (
        <div className="grid xl:grid-cols-[320px_1fr] gap-4">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.2 }} className="space-y-4 order-2 xl:order-1">
            <div className="rounded-3xl border border-line bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Objectives</h2>
                <span className="text-xs font-mono text-muted tabular-nums">{done}/{evaluation.objectives.length}</span>
              </div>
              <div className="h-1 rounded-full bg-line overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-brand via-violet to-cyan" animate={{ width: `${(done / evaluation.objectives.length) * 100}%` }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} />
              </div>
              <ol className="space-y-3">
                {image.objectives.map((o) => {
                  const r = evaluation.objectives.find((x) => x.id === o.id);
                  const shown = hints.includes(o.id);
                  return (
                    <li key={o.id} className="text-sm">
                      <div className="flex gap-2.5">
                        <AnimatePresence mode="wait" initial={false}>
                          {r?.completed ? (
                            <motion.span key="d" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            </motion.span>
                          ) : (
                            <motion.span key="o"><Circle className="w-4 h-4 text-line-strong shrink-0 mt-0.5" /></motion.span>
                          )}
                        </AnimatePresence>
                        <span className={`transition-colors duration-500 ${r?.completed ? 'text-muted line-through decoration-emerald-400' : 'text-ink'}`}>{o.label}</span>
                      </div>
                      {!r?.completed && (
                        <AnimatePresence initial={false} mode="wait">
                          {shown ? (
                            <motion.p key="h" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="ml-6 mt-1.5 text-xs text-ink-soft font-mono bg-canvas border border-line rounded-lg px-2.5 py-1.5 overflow-hidden">
                              {o.hint}
                            </motion.p>
                          ) : (
                            <motion.button key="b" type="button" onClick={() => setHints([...hints, o.id])} className="ml-6 mt-1 inline-flex items-center gap-1 text-[11px] text-brand hover:underline cursor-pointer">
                              <Lightbulb className="w-3 h-3" /> Hint
                            </motion.button>
                          )}
                        </AnimatePresence>
                      )}
                    </li>
                  );
                })}
              </ol>
              <AnimatePresence>
                {evaluation.compromised && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-xs rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2.5 flex gap-2">
                    <Skull className="w-4 h-4 shrink-0" /> The container has been compromised. Report it to contain the damage.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="rounded-3xl border border-night-line bg-night text-night-text p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Container telemetry</h2>
                <span className="relative flex h-2 w-2">
                  {booted && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${booted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-night-muted">
                <dt className="text-night-subtle">id</dt><dd className="text-white">{containerId}</dd>
                <dt className="text-night-subtle">image</dt><dd>{image.id}@{image.version}</dd>
                <dt className="text-night-subtle">status</dt><dd className={booted ? 'text-emerald-400' : 'text-amber-300'}>{booted ? 'running' : 'booting'}</dd>
                <dt className="text-night-subtle">events</dt>
                <dd>
                  <motion.span key={events.length} initial={{ color: '#ee7eae' }} animate={{ color: '#b9b1c6' }} transition={{ duration: 0.8 }} className="tabular-nums">{events.length}</motion.span>
                </dd>
                <dt className="text-night-subtle">egress</dt><dd>blocked · {events.filter((e) => e.type === 'egress_blocked').length} dropped</dd>
              </dl>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="order-1 xl:order-2 relative rounded-[22px] p-[1px] bg-gradient-to-br from-brand-soft/60 via-night-line to-violet/50 shadow-[0_40px_100px_-40px_rgba(11,9,16,0.7)]"
          >
            <div className="relative rounded-[21px] overflow-hidden bg-[#15131a]">
              <ContainerHost image={image} containerId={containerId} running onEvent={onEvent} onStatus={setStatus} className="w-full h-[620px] sm:h-[700px] block" />
              <AnimatePresence>
                {!booted && (
                  <motion.div
                    key={containerId}
                    className="absolute inset-0 bg-night text-night-muted font-mono text-xs p-6 sm:p-10 flex flex-col justify-end"
                    exit={{ opacity: 0, filter: 'blur(8px)', scale: 1.02 }}
                    transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                  >
                    <div className="absolute inset-0 bg-grid-night mask-radial" aria-hidden />
                    <div className="relative space-y-1.5 max-w-xl">
                      <div className="text-brand-soft mb-3">phishlens-container {containerId}</div>
                      {BOOT_STEPS.slice(0, bootStep + 1).map((s, i) => (
                        <motion.div key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                          <span className={i < bootStep ? 'text-emerald-400' : 'text-amber-300'}>{i < bootStep ? '[ ok ]' : '[ .. ]'}</span>
                          <span>{s}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      {phase === 'debrief' && final && <Debrief image={image} evaluation={final} events={events} onRetry={start} navigate={navigate} nextLabId={next?.id} />}
    </div>
  );
}

function IsolationCard() {
  const rows: [string, string][] = [
    ['sandbox', 'allow-scripts (only)'],
    ['origin', 'opaque · no cookies, no storage'],
    ['network', "CSP default-src 'none'"],
    ['forms', 'blocked · popups blocked'],
    ['top-nav', 'blocked'],
    ['channel', 'MessagePort + per-boot nonce'],
    ['lifetime', 'ephemeral (memory only)'],
    ['telemetry', 'actions only, never typed values'],
  ];
  return (
    <div className="relative rounded-3xl bg-night text-night-text p-6 font-mono text-xs overflow-hidden">
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand/25 blur-3xl" aria-hidden />
      <div className="relative text-brand-soft font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4" /> container isolation profile</div>
      <Stagger className="relative space-y-2" gap={0.05}>
        {rows.map(([k, v]) => (
          <StaggerItem key={k} y={6} className="grid grid-cols-[90px_1fr] gap-3">
            <span className="text-night-subtle">{k}</span>
            <span className="text-night-muted">{v}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 shrink-0">
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

function Debrief({ image, evaluation, events, onRetry, navigate, nextLabId }: {
  image: LabImage; evaluation: LabEvaluation; events: SandboxEvent[]; onRetry: () => void; navigate: (p: string) => void; nextLabId?: string;
}) {
  const copy = OUTCOME_COPY[evaluation.outcome];
  const tone = TONE[copy.tone];
  const timeline = events
    .filter((e) => e.type !== 'app_open')
    .map((e) => ({ t: e.t, text: describeEvent(e) ?? '', type: e.type }))
    .filter((x) => x.text.length > 0);
  const fmt = (ms: number) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
      <section className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_OUT_EXPO }} className={`rounded-[28px] border p-6 sm:p-8 flex flex-wrap items-center gap-8 ${tone.card}`}>
          <ScoreRing score={evaluation.score} color={tone.ring} />
          <div className="flex-1 min-w-[220px] space-y-2">
            <div className="text-2xl font-semibold flex items-center gap-2">
              {copy.tone === 'good' ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />} {copy.label}
            </div>
            <p className="leading-relaxed">{copy.summary}</p>
            <div className="flex items-center gap-3 pt-1 text-xs opacity-80">
              <span>Investigation depth</span>
              <div className="h-1.5 w-32 rounded-full bg-black/10 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: tone.ring }} initial={{ width: 0 }} animate={{ width: `${evaluation.investigationDepth}%` }} transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.5 }} />
              </div>
              <span className="font-mono tabular-nums">{evaluation.investigationDepth}%</span>
            </div>
          </div>
        </motion.div>

        <Reveal className="rounded-[28px] border border-line bg-surface p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">What happened</h2>
          <p className="text-ink-soft leading-relaxed">{image.debrief.whatHappened}</p>
          <h3 className="font-semibold text-sm pt-2">Red flags in this lab</h3>
          <Stagger className="space-y-2" gap={0.06}>
            {image.debrief.redFlags.map((f) => (
              <StaggerItem key={f} y={8} className="flex gap-2.5 text-sm text-ink-soft">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />{f}
              </StaggerItem>
            ))}
          </Stagger>
          <div className="rounded-2xl bg-blush border border-rose-soft p-4 text-sm"><b>The right move:</b> {image.debrief.rightMove}</div>
          <p className="text-xs text-muted">{image.debrief.realWorld}</p>
        </Reveal>

        <Reveal className="rounded-[28px] border border-line bg-surface p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold">Objectives</h2>
          <Stagger className="space-y-4" gap={0.07}>
            {evaluation.objectives.map((o) => (
              <StaggerItem key={o.id} y={8} className="flex gap-3 text-sm">
                {o.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-line-strong shrink-0 mt-0.5" />}
                <div>
                  <div className="font-medium">{o.label} <span className="text-xs text-muted font-mono">+{o.points}</span></div>
                  <div className="text-xs text-muted mt-0.5">{o.why}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          {evaluation.traps.filter((t) => t.triggered).map((t) => (
            <div key={t.id} className="flex gap-3 text-sm rounded-2xl bg-rose-50 border border-rose-200 p-4">
              <Skull className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div><div className="font-semibold text-rose-800">{t.label} <span className="font-mono text-xs">−{t.penalty}</span></div><div className="text-xs text-rose-800/80 mt-0.5">{t.consequence}</div></div>
            </div>
          ))}
        </Reveal>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-28 self-start">
        <Reveal className="rounded-[28px] border border-night-line bg-night text-night-text p-6">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-4"><Eye className="w-4 h-4 text-brand-soft" /> Container timeline replay</h2>
          <ol className="font-mono text-[11.5px] space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {timeline.length === 0 && <li className="text-night-subtle">No activity recorded.</li>}
            {timeline.map((x, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                className={`flex gap-3 ${x.type === 'compromised' ? 'text-[#ff6b7d]' : x.type === 'report' ? 'text-emerald-400' : 'text-night-muted'}`}
              >
                <span className="text-night-subtle shrink-0">{fmt(x.t)}</span><span className="break-all">{x.text}</span>
              </motion.li>
            ))}
          </ol>
        </Reveal>
        <div className="flex flex-col gap-2">
          {nextLabId ? (
            <button type="button" onClick={() => navigate(`/labs/${nextLabId}`)} className="group inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-white bg-ink hover:bg-brand rounded-2xl transition-colors cursor-pointer">
              Next lab <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button type="button" onClick={() => navigate('/report')} className="group inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-white bg-ink hover:bg-brand rounded-2xl transition-colors cursor-pointer">
              View my report <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
          <button type="button" onClick={onRetry} className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold rounded-2xl border border-line bg-surface hover:border-brand-soft cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Re-run with a clean container
          </button>
          <button type="button" onClick={() => navigate(`/learn/${image.relatedModuleSlug}`)} className="inline-flex items-center justify-center gap-1.5 text-sm text-brand hover:underline cursor-pointer py-2">
            <BookOpen className="w-4 h-4" /> Read the related threat guide
          </button>
        </div>
      </aside>
    </div>
  );
}
