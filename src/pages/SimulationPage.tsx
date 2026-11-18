import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle, ArrowRight, BookOpen, Check, CheckCircle2, CircleDashed, Lightbulb, Lock, MousePointer2,
  RotateCcw, Search, ShieldAlert, ShieldCheck, Sparkles, Target, XCircle,
} from 'lucide-react';
import type { SessionStateResponse, SimulationFeedbackRecord } from '../types/phishlens.ts';
import { evaluateSimulationDecisionSync } from '../lib/sessionStore.ts';
import { getPublicScenarioById } from '../server/data.ts';
import { ARTIFACTS } from './rooms/artifacts.tsx';
import { Callout, RoomContext, type CalloutState, type RoomContextValue } from './rooms/RoomKit.tsx';
import { ScoreRing } from '../components/ui/ScoreRing.tsx';
import { EASE_OUT_EXPO, Stagger, StaggerItem } from '../components/motion.tsx';

interface SimulationPageProps {
  scenarioId: string;
  session: SessionStateResponse;
  onInspectEvidence: (scenarioId: string, evidenceId: string) => void;
  onUpdateRoomTask: (scenarioId: string, stepIndex: number) => void;
  onDecisionRecorded: (feedback: SimulationFeedbackRecord) => void;
  navigate: (path: string) => void;
}

const ORDER = ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'];

const ROOM_META: Record<string, { rule: string; lesson: string; next: string }> = {
  'sim-1': {
    lesson: 'Display names and urgent buttons are easy to fake',
    rule: 'Never use a link inside an unexpected security email to sign in. Open your own bookmark, or report the message.',
    next: 'Room 02: a shared-document link opens a sign-in page. Does it deserve your password?',
  },
  'sim-2': {
    lesson: 'A padlock proves encryption, not identity',
    rule: 'Read the domain right before the first single slash, and never enter a password and a one-time code together on an unfamiliar page.',
    next: 'Room 03: a text says your parcel is on hold for a $1.85 fee.',
  },
  'sim-3': {
    lesson: 'Tiny fees are bait for full card details',
    rule: 'Never tap links in unexpected delivery or toll texts. Check orders in the courier’s or retailer’s own app.',
    next: 'Room 04: an office notice asks you to scan a QR code with your personal phone.',
  },
  'sim-4': {
    lesson: 'A QR code is just a hidden link',
    rule: 'Read the camera’s URL preview before opening any QR code, and never sign in to work accounts through one.',
    next: 'Room 05: an urgent chat from “IT Security” asks for the code that just arrived on your phone.',
  },
  'sim-5': {
    lesson: 'Real support never asks for your one-time code',
    rule: 'Never share a password or one-time code with anyone, however urgent the story or whoever they claim to be.',
    next: 'All five rooms done. Your report is ready, or step into a Sandbox Lab for a full investigation.',
  },
};

const OUTCOME: Record<SimulationFeedbackRecord['outcomeClassification'], { label: string; card: string; ring: string; icon: React.ReactNode }> = {
  optimal: { label: 'Threat neutralised', card: 'bg-emerald-50 border-emerald-200 text-emerald-950', ring: '#10b981', icon: <ShieldCheck className="h-5 w-5" /> },
  safe_partial: { label: 'Safe, with room to improve', card: 'bg-sky-50 border-sky-200 text-sky-950', ring: '#0ea5e9', icon: <ShieldCheck className="h-5 w-5" /> },
  risky: { label: 'Risky move', card: 'bg-amber-50 border-amber-200 text-amber-950', ring: '#f59e0b', icon: <AlertTriangle className="h-5 w-5" /> },
  compromised: { label: 'Simulated compromise', card: 'bg-rose-50 border-rose-200 text-rose-950', ring: '#e11d48', icon: <ShieldAlert className="h-5 w-5" /> },
};

/** Stable per-room shuffle so the safest option isn't always listed first. */
function stableShuffle<T extends { id: string }>(items: T[], seed: string): T[] {
  const h = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return [...items].sort((a, b) => h(seed + a.id) - h(seed + b.id));
}

export function SimulationPage({ scenarioId, session, onInspectEvidence, onUpdateRoomTask, onDecisionRecorded, navigate }: SimulationPageProps) {
  const scenario = getPublicScenarioById(scenarioId) ?? getPublicScenarioById('sim-1')!;
  const id = scenario.id;
  const meta = ROOM_META[id];
  const hotspots = scenario.evidenceHotspots;
  const saved = session.simulationFeedbacks[id] ?? null;
  const Artifact = ARTIFACTS[id].component;
  const [roomNo, roomTitle] = scenario.title.split(': ');

  const [mode, setMode] = useState<'investigate' | 'debrief'>(saved ? 'debrief' : 'investigate');
  const [found, setFound] = useState<string[]>(() => (saved ? [] : session.inspectedEvidenceByScenario[id] ?? []));
  const [lens, setLens] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const [hinted, setHinted] = useState<string[]>([]);
  const [checks, setChecks] = useState(0);
  const [callout, setCallout] = useState<CalloutState>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const foundRef = useRef(found);
  foundRef.current = found;
  const decisionRef = useRef<HTMLDivElement>(null);
  const hintTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const s = session.simulationFeedbacks[id] ?? null;
    setMode(s ? 'debrief' : 'investigate');
    setFound(s ? [] : session.inspectedEvidenceByScenario[id] ?? []);
    setLens(true);
    setHint(null);
    setHinted([]);
    setChecks(0);
    setCallout(null);
    setChoice(null);
    setDeciding(false);
    setAttempt((a) => a + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const inspect = useCallback(
    (clueId: string, el: HTMLElement | null) => {
      const h = hotspots.find((x) => x.id === clueId);
      if (!h) return;
      const fresh = !foundRef.current.includes(clueId);
      if (fresh) {
        const next = [...foundRef.current, clueId];
        foundRef.current = next;
        setFound(next);
        onInspectEvidence(id, clueId);
        onUpdateRoomTask(id, next.length);
      }
      setCallout({ kind: 'clue', hotspot: h, index: hotspots.indexOf(h) + 1, total: hotspots.length, fresh, el });
    },
    [hotspots, id, onInspectEvidence, onUpdateRoomTask]
  );

  const decoy = useCallback((text: string, el: HTMLElement | null) => {
    setChecks((c) => c + 1);
    setCallout({ kind: 'decoy', text, el });
  }, []);

  const act = useCallback((actionId: string) => {
    setChoice(actionId);
    setDeciding(true);
    setCallout(null);
    window.setTimeout(() => decisionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  }, []);

  const ctx: RoomContextValue = useMemo(() => ({ lens, found, hint, hotspots, inspect, decoy, act }), [lens, found, hint, hotspots, inspect, decoy, act]);

  const showHint = () => {
    const next = hotspots.find((h) => !found.includes(h.id) && !hinted.includes(h.id)) ?? hotspots.find((h) => !found.includes(h.id));
    if (!next) return;
    setHinted((list) => (list.includes(next.id) ? list : [...list, next.id]));
    setHint(next.id);
    document.querySelector(`[data-clue="${next.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 2800);
  };

  const submit = () => {
    if (!choice) return;
    const fb = evaluateSimulationDecisionSync({ scenarioId: id, actionId: choice, inspectedEvidenceIds: found });
    onDecisionRecorded(fb);
    onUpdateRoomTask(id, hotspots.length);
    setCallout(null);
    setMode('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const replay = () => {
    setMode('investigate');
    setFound([]);
    foundRef.current = [];
    setChoice(null);
    setDeciding(false);
    setHint(null);
    setHinted([]);
    setChecks(0);
    setLens(true);
    setAttempt((a) => a + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextId = ORDER[ORDER.indexOf(id) + 1] ?? null;
  const actions = useMemo(() => stableShuffle(scenario.actions, id), [scenario.actions, id]);

  if (mode === 'debrief' && saved) {
    return <Debrief feedback={saved} meta={meta} roomNo={roomNo} roomTitle={roomTitle} nextId={nextId} navigate={navigate} onReplay={replay} />;
  }

  const total = hotspots.length;
  const allFound = found.length === total;

  return (
    <RoomContext.Provider value={ctx}>
      <div className="mx-auto w-full max-w-[1320px] flex-1 space-y-5 px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT_EXPO }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-brand">
              <span>{roomNo}</span><span className="text-line-strong">/</span><span className="text-muted">{scenario.attackTypeLabel}</span><span className="text-line-strong">/</span><span className="text-muted">{scenario.difficulty}</span>
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{roomTitle}</h1>
            <p className="text-[15px] leading-relaxed text-ink-soft">{scenario.situationBrief}</p>
          </div>
          <LensToggle lens={lens} setLens={setLens} />
        </motion.header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Interface */}
          <motion.section initial={{ opacity: 0, y: 20, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.05 }} className="min-w-0 space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] text-muted">
              <span className="font-mono">{ARTIFACTS[id].chrome}</span>
              <span className="inline-flex items-center gap-1.5">
                {lens ? <><Search className="h-3.5 w-3.5 text-brand" /> Click anything to inspect it. Links won’t open.</> : <><MousePointer2 className="h-3.5 w-3.5 text-amber-600" /> Interact mode: links and buttons behave for real.</>}
              </span>
            </div>
            <div key={attempt}>
              <Artifact />
            </div>
          </motion.section>

          {/* Field notes */}
          <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.15 }} className="space-y-4 lg:sticky lg:top-[156px]">
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted">Field notes</div>
                  <div className="text-sm font-semibold">{allFound ? 'Every clue found' : `${found.length} of ${total} clues found`}</div>
                </div>
                <ClueMeter found={found.length} total={total} />
              </div>
              <ol className="mt-4 space-y-2">
                {hotspots.map((h, i) => {
                  const isFound = found.includes(h.id);
                  const isHinted = hinted.includes(h.id);
                  return (
                    <li key={h.id}>
                      <motion.div layout className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${isFound ? 'border-amber-300 bg-amber-50/70' : 'border-dashed border-line-strong bg-canvas/60'}`}>
                        <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold ${isFound ? 'bg-amber-500 text-white' : 'bg-line text-muted'}`}>
                          {isFound ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                        </span>
                        <div className="min-w-0 text-[12.5px] leading-snug">
                          <AnimatePresence mode="wait" initial={false}>
                            {isFound ? (
                              <motion.div key="f" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="font-semibold text-ink">{h.findingTitle}</div>
                                <div className="text-[11px] text-muted">{h.location}</div>
                              </motion.div>
                            ) : (
                              <motion.div key="u" className="text-muted">
                                <div className="inline-flex items-center gap-1.5 font-medium"><Lock className="h-3 w-3" /> Hidden clue</div>
                                {isHinted && <div className="text-[11px] text-brand">Look at: {h.location}</div>}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted">
                <button type="button" onClick={showHint} disabled={allFound} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-brand hover:bg-blush disabled:text-muted disabled:hover:bg-transparent cursor-pointer disabled:cursor-default">
                  <Lightbulb className="h-3.5 w-3.5" /> {hinted.length ? `Another hint (${hinted.length} used)` : 'Give me a hint'}
                </button>
                <span>{checks > 0 ? `${checks} normal element${checks > 1 ? 's' : ''} checked` : 'Nothing checked yet'}</span>
              </div>
            </div>

            <div ref={decisionRef} className="scroll-mt-40 rounded-3xl border border-line bg-surface p-5 shadow-soft">
              {!deciding ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-brand" /> Make your call</div>
                  <p className="text-[12.5px] leading-relaxed text-muted">
                    {allFound ? 'You’ve uncovered everything. Decide how to handle it.' : 'Decide whenever you’re ready, here or by using the interface itself (Report, Sign in, Reply…). Real attackers won’t wait for you to finish investigating.'}
                  </p>
                  <button type="button" onClick={() => setDeciding(true)} className={`group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${allFound ? 'bg-ink text-white hover:bg-brand' : 'border border-line bg-surface text-ink hover:border-brand-soft'}`}>
                    Choose a response <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-brand" /> What do you do?</div>
                    <button type="button" onClick={() => { setDeciding(false); setChoice(null); }} className="text-[11.5px] text-muted hover:text-ink cursor-pointer">Keep investigating</button>
                  </div>
                  <div role="radiogroup" className="space-y-2">
                    {actions.map((a) => {
                      const active = choice === a.id;
                      return (
                        <button key={a.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(a.id)} className={`w-full rounded-xl border p-3 text-left transition-all cursor-pointer ${active ? 'border-ink bg-ink text-white shadow-lift' : 'border-line bg-canvas/50 hover:border-brand-soft hover:bg-blush/40'}`}>
                          <div className="flex items-start gap-2.5">
                            <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${active ? 'border-white bg-white' : 'border-line-strong'}`}>{active && <span className="h-2 w-2 rounded-full bg-ink" />}</span>
                            <span>
                              <span className="block text-[13px] font-semibold leading-snug">{a.label}</span>
                              <span className={`block text-[11.5px] leading-snug ${active ? 'text-white/75' : 'text-muted'}`}>{a.description}</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {!allFound && (
                    <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-900">
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" /> {total - found.length} clue{total - found.length > 1 ? 's' : ''} still hidden. You can still decide; your debrief will show what you missed.
                    </div>
                  )}
                  <button type="button" disabled={!choice} onClick={submit} className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">
                    Lock in decision <ArrowRight className="h-4 w-4 transition-transform group-enabled:group-hover:translate-x-1" />
                  </button>
                  <p className="text-center text-[10.5px] text-muted">Every action is simulated. Nothing leaves this page.</p>
                </motion.div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>

      <Callout state={callout} onClose={() => setCallout(null)} />
      <MobileBar found={found.length} total={total} onDecide={() => { setDeciding(true); decisionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} onHint={showHint} />
    </RoomContext.Provider>
  );
}

/* ------------------------------ pieces ------------------------------ */

function LensToggle({ lens, setLens }: { lens: boolean; setLens: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-1 self-start rounded-2xl border border-line bg-surface p-1 shadow-soft lg:self-auto" role="radiogroup" aria-label="Interaction mode">
      {[
        { v: true, label: 'Inspect', icon: <Search className="h-3.5 w-3.5" /> },
        { v: false, label: 'Interact', icon: <MousePointer2 className="h-3.5 w-3.5" /> },
      ].map((o) => (
        <button key={o.label} type="button" role="radio" aria-checked={lens === o.v} onClick={() => setLens(o.v)} className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${lens === o.v ? 'text-white' : 'text-muted hover:text-ink'}`}>
          {lens === o.v && <motion.span layoutId="lens-toggle" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className="relative inline-flex items-center gap-1.5">{o.icon}{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function ClueMeter({ found, total }: { found: number; total: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-12 w-12" aria-label={`${found} of ${total} clues`}>
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#ece6f0" strokeWidth="4" />
        <motion.circle cx="22" cy="22" r={r} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - found / total) }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }} />
      </svg>
      <motion.span key={found} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="absolute inset-0 grid place-items-center text-[13px] font-semibold tabular-nums">{found}/{total}</motion.span>
    </div>
  );
}

function MobileBar({ found, total, onDecide, onHint }: { found: number; total: number; onDecide: () => void; onHint: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-2xl border border-white/10 bg-night/95 p-2 text-night-text shadow-2xl backdrop-blur lg:hidden">
      <span className="inline-flex items-center gap-1.5 px-2 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5 text-amber-300" /> {found}/{total} clues</span>
      <button type="button" onClick={onHint} className="ml-auto rounded-xl px-3 py-2 text-xs font-semibold text-night-muted hover:text-white cursor-pointer"><Lightbulb className="h-4 w-4" /></button>
      <button type="button" onClick={onDecide} className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-ink cursor-pointer">Make your call</button>
    </div>,
    document.body
  );
}

/* ------------------------------ debrief ------------------------------ */

function Debrief({ feedback, meta, roomNo, roomTitle, nextId, navigate, onReplay }: {
  feedback: SimulationFeedbackRecord; meta: { rule: string; lesson: string; next: string }; roomNo: string; roomTitle: string; nextId: string | null; navigate: (p: string) => void; onReplay: () => void;
}) {
  const o = OUTCOME[feedback.outcomeClassification];
  const spotted = feedback.missedOrSpottedEvidence.filter((e) => e.wasInspected).length;
  const totalClues = feedback.missedOrSpottedEvidence.length;
  const matchedSafest = feedback.selectedActionLabel === feedback.safestActionLabel;

  return (
    <div className="mx-auto w-full max-w-[1240px] flex-1 space-y-5 px-4 py-6 sm:px-6">
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted">{roomNo} · {roomTitle} · Debrief</div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_OUT_EXPO }} className={`flex flex-wrap items-center gap-6 rounded-[28px] border p-6 sm:p-8 ${o.card}`}>
        <ScoreRing score={feedback.scoreEarned} color={o.ring} />
        <div className="min-w-[240px] flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">{o.icon} {o.label}</div>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{feedback.resultHeadline}</h1>
          <p className="max-w-2xl leading-relaxed opacity-90">{feedback.actionExplanation}</p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11.5px] font-semibold">
            <span className="rounded-full bg-white/70 px-2.5 py-1">{spotted}/{totalClues} clues found</span>
            {feedback.inspectedBonusEarned && <span className="rounded-full bg-white/70 px-2.5 py-1">+5 thoroughness bonus</span>}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-[28px] border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Your investigation</h2>
          <p className="text-[12.5px] text-muted">Every piece of evidence in this room, and whether you found it.</p>
          <Stagger className="mt-4 space-y-2.5" gap={0.07}>
            {feedback.missedOrSpottedEvidence.map((e) => (
              <StaggerItem key={e.id} y={8}>
                <div className={`rounded-2xl border p-3.5 ${e.wasInspected ? 'border-amber-200 bg-amber-50/60' : 'border-line bg-canvas/60'}`}>
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    {e.wasInspected ? <CheckCircle2 className="h-4 w-4 text-amber-600" /> : <CircleDashed className="h-4 w-4 text-muted" />}
                    {e.label}
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10.5px] ${e.wasInspected ? 'bg-amber-100 text-amber-800' : 'bg-line text-muted'}`}>{e.wasInspected ? 'Found' : 'Missed'}</span>
                  </div>
                  <div className="mt-2 rounded-lg bg-night px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-amber-200 break-all">{e.rawValue}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{e.explanation}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <div className="space-y-5">
          <section className="rounded-[28px] border border-line bg-surface p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Your call vs the safest call</h2>
            {matchedSafest ? (
              <div className="mt-3 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div><div className="text-sm font-semibold">You chose the safest response: {feedback.safestActionLabel}</div><p className="mt-1 text-[12.5px] leading-relaxed opacity-90">{feedback.safestActionRationale}</p></div>
              </div>
            ) : (
              <div className="mt-3 grid gap-2.5">
                <div className="flex gap-3 rounded-2xl border border-line bg-canvas p-4">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                  <div><div className="text-[11px] font-mono uppercase tracking-wider text-muted">You chose</div><div className="text-sm font-semibold">{feedback.selectedActionLabel}</div></div>
                </div>
                <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div><div className="text-[11px] font-mono uppercase tracking-wider text-emerald-800">Safest response</div><div className="text-sm font-semibold">{feedback.safestActionLabel}</div><p className="mt-1 text-[12.5px] leading-relaxed opacity-90">{feedback.safestActionRationale}</p></div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-night-line bg-night p-6 text-night-text">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-brand-soft">How the attack works</div>
            <h2 className="mt-1 text-lg font-semibold text-white">{meta.lesson}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-night-muted">{feedback.attackMechanics}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-night-muted">{feedback.realWorldConsequence}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Rule to remember</div>
              <p className="mt-1 text-[14px] font-medium leading-relaxed text-white">{meta.rule}</p>
            </div>
          </section>
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-5 shadow-soft sm:flex-row sm:items-center">
        <p className="flex-1 text-[13px] text-ink-soft">{meta.next}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onReplay} className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-xs font-semibold hover:border-brand-soft cursor-pointer"><RotateCcw className="h-3.5 w-3.5" /> Replay room</button>
          <button type="button" onClick={() => navigate(`/learn/${feedback.relatedModuleSlug}`)} className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-xs font-semibold hover:border-brand-soft cursor-pointer"><BookOpen className="h-3.5 w-3.5" /> {feedback.relatedModuleTitle}</button>
          {nextId ? (
            <button type="button" onClick={() => navigate(`/experience/simulation/${nextId}`)} className="group inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand cursor-pointer">Next room <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></button>
          ) : (
            <button type="button" onClick={() => navigate('/report')} className="group inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand cursor-pointer">View my report <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></button>
          )}
        </div>
      </section>
    </div>
  );
}
