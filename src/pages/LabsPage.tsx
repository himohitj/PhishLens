import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Box, CheckCircle2, Circle, Clock, Cpu, Eye, Lightbulb, Lock, Power,
  RotateCcw, ShieldAlert, ShieldCheck, Skull, WifiOff, XCircle,
} from 'lucide-react';
import { ContainerHost, mintContainerId, type ContainerStatus } from '../sandbox/ContainerHost.tsx';
import { LAB_IMAGES, getLabImage } from '../sandbox/labs/index.ts';
import { OUTCOME_COPY, describeEvent, evaluateLab, type LabEvaluation } from '../sandbox/engine.ts';
import type { LabImage, SandboxEvent } from '../sandbox/types.ts';
import type { LabResultRecord, SessionStateResponse } from '../types/phishlens.ts';

interface LabsPageProps {
  labId?: string;
  session: SessionStateResponse;
  onLabComplete: (result: LabResultRecord) => void;
  navigate: (path: string) => void;
}

const TONE: Record<string, string> = {
  good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warn: 'bg-amber-50 text-amber-800 border-amber-200',
  bad: 'bg-rose-50 text-rose-800 border-rose-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
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
  return (
    <div className="max-w-[1180px] w-full mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-end">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#D94F89]">
            <Box className="w-3.5 h-3.5" /> Sandbox Labs
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#24212A]">Investigate real attacks in a throwaway workstation.</h1>
          <p className="text-[#716B76] leading-relaxed max-w-2xl">
            Each lab boots its own isolated container in your browser: a virtual desktop with mail, a browser, files and a forensic terminal.
            Click the link, open the attachment, run the commands. If you get compromised, it stays inside the container, and one click wipes it.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-xs">
          {[
            { icon: <Lock className="w-3.5 h-3.5" />, t: 'Opaque origin', d: 'No access to your cookies or storage' },
            { icon: <WifiOff className="w-3.5 h-3.5" />, t: 'Zero egress', d: 'CSP blocks every network request' },
            { icon: <Cpu className="w-3.5 h-3.5" />, t: 'Runs locally', d: 'Nothing is sent to a server' },
            { icon: <RotateCcw className="w-3.5 h-3.5" />, t: 'Disposable', d: 'Reset gives a clean image' },
          ].map((f) => (
            <li key={f.t} className="rounded-xl border border-[#F0E7ED] bg-white p-3">
              <div className="flex items-center gap-1.5 font-semibold text-[#24212A]">{f.icon}{f.t}</div>
              <div className="text-[#716B76] mt-0.5">{f.d}</div>
            </li>
          ))}
        </ul>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LAB_IMAGES.map((lab) => {
          const result = session.labResults[lab.id];
          const copy = result ? OUTCOME_COPY[result.outcome] : null;
          return (
            <article key={lab.id} className="flex flex-col rounded-2xl border border-[#F0E7ED] bg-white overflow-hidden hover:border-[#E879A8] transition-colors">
              <div className="bg-[#1d1a24] text-[#ece8f1] px-5 py-4 font-mono text-[11px] flex items-center justify-between">
                <span>{lab.codename}</span>
                <span className="text-[#9d95a8]">image {lab.version}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF1F6] text-[#D94F89] font-semibold">{lab.attackFamily}</span>
                  <span className="px-2 py-0.5 rounded-full border border-[#F0E7ED] text-[#716B76]">{lab.difficulty}</span>
                  <span className="px-2 py-0.5 rounded-full border border-[#F0E7ED] text-[#716B76] inline-flex items-center gap-1"><Clock className="w-3 h-3" />{lab.estimatedMinutes} min</span>
                </div>
                <h2 className="text-lg font-bold text-[#24212A]">{lab.title}</h2>
                <p className="text-sm text-[#716B76] leading-relaxed flex-1">{lab.tagline}</p>
                {result && copy && (
                  <div className={`text-xs rounded-lg border px-3 py-2 ${TONE[copy.tone]}`}>
                    Best: <b>{result.score}/100</b> · {copy.label} · {result.attempts} run{result.attempts > 1 ? 's' : ''}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/labs/${lab.id}`)}
                  className="mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-lg cursor-pointer"
                >
                  {result ? 'Run again' : 'Launch container'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- Workspace ----------------------------- */

type Phase = 'briefing' | 'running' | 'debrief';

function LabWorkspace({ image, session, onLabComplete, navigate }: { image: LabImage } & Omit<LabsPageProps, 'labId'>) {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [containerId, setContainerId] = useState(mintContainerId);
  const [events, setEvents] = useState<SandboxEvent[]>([]);
  const [status, setStatus] = useState<ContainerStatus>('stopped');
  const [hints, setHints] = useState<string[]>([]);
  const [final, setFinal] = useState<LabEvaluation | null>(null);
  const startedAt = useRef<number>(0);

  const evaluation = useMemo(() => evaluateLab(image, events), [image, events]);
  const onEvent = useCallback((e: SandboxEvent) => setEvents((prev) => [...prev, e]), []);

  const start = () => {
    setEvents([]);
    setHints([]);
    setFinal(null);
    setContainerId(mintContainerId());
    startedAt.current = Date.now();
    setPhase('running');
  };

  const end = () => {
    const ev = evaluateLab(image, events);
    setFinal(ev);
    setPhase('debrief');
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

  return (
    <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => navigate('/labs')} className="p-2 rounded-lg border border-[#F0E7ED] bg-white hover:border-[#E879A8] cursor-pointer" aria-label="All labs">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-[#716B76]">{image.codename} · {image.attackFamily}</div>
            <h1 className="text-xl font-bold text-[#24212A] truncate">{image.title}</h1>
          </div>
        </div>
        {phase === 'running' && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={start} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[#F0E7ED] bg-white hover:border-[#E879A8] cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> Reset container
            </button>
            <button type="button" onClick={end} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-lg bg-[#24212A] hover:bg-black cursor-pointer">
              <Power className="w-3.5 h-3.5" /> End mission &amp; debrief
            </button>
          </div>
        )}
      </div>

      {phase === 'briefing' && (
        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-6 rounded-2xl border border-[#F0E7ED] bg-white p-6 sm:p-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Mission briefing</h2>
            {image.briefing.map((p) => (
              <p key={p} className="text-[#3b3842] leading-relaxed">{p}</p>
            ))}
            <p className="text-sm text-[#716B76]">
              You are <b>{image.persona.name}</b>, {image.persona.role}. Investigate as you would at work, then make a call and end the mission.
              Don’t type real passwords or personal details, even though nothing typed can leave the container.
            </p>
            <button type="button" onClick={start} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-lg cursor-pointer">
              <Power className="w-4 h-4" /> Boot isolated container
            </button>
          </div>
          <IsolationCard />
        </section>
      )}

      {phase === 'running' && (
        <div className="grid xl:grid-cols-[320px_1fr] gap-4">
          <aside className="space-y-4 order-2 xl:order-1">
            <div className="rounded-2xl border border-[#F0E7ED] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Objectives</h2>
                <span className="text-xs font-mono text-[#716B76]">{done}/{evaluation.objectives.length}</span>
              </div>
              <ol className="space-y-2.5">
                {image.objectives.map((o) => {
                  const r = evaluation.objectives.find((x) => x.id === o.id);
                  const shown = hints.includes(o.id);
                  return (
                    <li key={o.id} className="text-sm">
                      <div className="flex gap-2">
                        {r?.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-[#D8CFD6] shrink-0 mt-0.5" />}
                        <span className={r?.completed ? 'text-[#716B76] line-through decoration-emerald-400' : 'text-[#24212A]'}>{o.label}</span>
                      </div>
                      {!r?.completed && (
                        shown ? (
                          <p className="ml-6 mt-1 text-xs text-[#716B76] font-mono bg-[#FCFAFC] border border-[#F0E7ED] rounded-md px-2 py-1">{o.hint}</p>
                        ) : (
                          <button type="button" onClick={() => setHints([...hints, o.id])} className="ml-6 mt-0.5 inline-flex items-center gap-1 text-[11px] text-[#D94F89] hover:underline cursor-pointer">
                            <Lightbulb className="w-3 h-3" /> Hint
                          </button>
                        )
                      )}
                    </li>
                  );
                })}
              </ol>
              {evaluation.compromised && (
                <div className="text-xs rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 flex gap-2">
                  <Skull className="w-4 h-4 shrink-0" /> The container has been compromised. Report it to contain the damage.
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-[#F0E7ED] bg-white p-4 space-y-2 text-xs">
              <h2 className="text-sm font-bold">Container telemetry</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[#716B76]">
                <dt>id</dt><dd className="text-[#24212A]">{containerId}</dd>
                <dt>image</dt><dd>{image.id}@{image.version}</dd>
                <dt>status</dt><dd className={status === 'running' ? 'text-emerald-700' : 'text-amber-700'}>{status}</dd>
                <dt>events</dt><dd>{events.length}</dd>
                <dt>egress</dt><dd>blocked ({events.filter((e) => e.type === 'egress_blocked').length} dropped)</dd>
              </dl>
            </div>
          </aside>
          <div className="order-1 xl:order-2 rounded-2xl overflow-hidden border border-[#2a2532] bg-[#15131a] shadow-lg">
            <ContainerHost
              image={image}
              containerId={containerId}
              running
              onEvent={onEvent}
              onStatus={setStatus}
              className="w-full h-[620px] sm:h-[680px] block"
            />
          </div>
        </div>
      )}

      {phase === 'debrief' && final && (
        <Debrief image={image} evaluation={final} events={events} onRetry={start} navigate={navigate} nextLabId={next?.id} />
      )}
    </div>
  );
}

function IsolationCard() {
  return (
    <div className="rounded-xl bg-[#1d1a24] text-[#ece8f1] p-5 font-mono text-xs space-y-2">
      <div className="text-[#f07aae] font-semibold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> container isolation profile</div>
      <pre className="whitespace-pre-wrap text-[#c8c2d2] leading-relaxed">{`sandbox      allow-scripts (only)
origin       opaque · no cookies, no storage
network      CSP default-src 'none'
             connect-src 'none'
forms        blocked · popups blocked
top-nav      blocked
channel      MessagePort + per-boot nonce
lifetime     ephemeral (memory only)
telemetry    actions only, never typed values`}</pre>
    </div>
  );
}

function Debrief({ image, evaluation, events, onRetry, navigate, nextLabId }: {
  image: LabImage; evaluation: LabEvaluation; events: SandboxEvent[]; onRetry: () => void; navigate: (p: string) => void; nextLabId?: string;
}) {
  const copy = OUTCOME_COPY[evaluation.outcome];
  const timeline = events
    .filter((e) => e.type !== 'app_open')
    .map((e) => ({ t: e.t, text: describeEvent(e) ?? '', type: e.type }))
    .filter((x) => x.text.length > 0);
  const fmt = (ms: number) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
      <section className="space-y-5">
        <div className={`rounded-2xl border p-6 flex flex-wrap items-center gap-6 ${TONE[copy.tone]}`}>
          <div className="text-5xl font-bold tabular-nums">{evaluation.score}<span className="text-lg opacity-60">/100</span></div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <div className="font-bold text-lg flex items-center gap-2">
              {copy.tone === 'good' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />} {copy.label}
            </div>
            <p className="text-sm">{copy.summary}</p>
            <p className="text-xs opacity-80">Investigation depth {evaluation.investigationDepth}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#F0E7ED] bg-white p-6 space-y-3">
          <h2 className="font-bold">What happened</h2>
          <p className="text-sm text-[#3b3842] leading-relaxed">{image.debrief.whatHappened}</p>
          <h3 className="font-semibold text-sm pt-2">Red flags in this lab</h3>
          <ul className="list-disc ml-5 text-sm text-[#3b3842] space-y-1">
            {image.debrief.redFlags.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <div className="rounded-lg bg-[#FFF1F6] border border-[#FCE4EE] p-3 text-sm"><b>The right move:</b> {image.debrief.rightMove}</div>
          <p className="text-xs text-[#716B76]">{image.debrief.realWorld}</p>
        </div>

        <div className="rounded-2xl border border-[#F0E7ED] bg-white p-6 space-y-3">
          <h2 className="font-bold">Objectives</h2>
          {evaluation.objectives.map((o) => (
            <div key={o.id} className="flex gap-3 text-sm">
              {o.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-[#C9BFC7] shrink-0 mt-0.5" />}
              <div>
                <div className="font-medium">{o.label} <span className="text-xs text-[#716B76] font-mono">+{o.points}</span></div>
                <div className="text-xs text-[#716B76]">{o.why}</div>
              </div>
            </div>
          ))}
          {evaluation.traps.filter((t) => t.triggered).map((t) => (
            <div key={t.id} className="flex gap-3 text-sm rounded-lg bg-rose-50 border border-rose-200 p-3">
              <Skull className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div><div className="font-semibold text-rose-800">{t.label} <span className="font-mono text-xs">−{t.penalty}</span></div><div className="text-xs text-rose-800/80">{t.consequence}</div></div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-[#2a2532] bg-[#1d1a24] text-[#ece8f1] p-5">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-3"><Eye className="w-4 h-4 text-[#f07aae]" /> Container timeline replay</h2>
          <ol className="font-mono text-[11.5px] space-y-1 max-h-[460px] overflow-y-auto pr-1">
            {timeline.length === 0 && <li className="text-[#9d95a8]">No activity recorded.</li>}
            {timeline.map((x, i) => (
              <li key={i} className={`flex gap-3 ${x.type === 'compromised' ? 'text-[#ff6b7d]' : x.type === 'report' ? 'text-[#4fd1a1]' : 'text-[#c8c2d2]'}`}>
                <span className="text-[#9d95a8] shrink-0">{fmt(x.t)}</span><span className="break-all">{x.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onRetry} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg border border-[#F0E7ED] bg-white hover:border-[#E879A8] cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Re-run with a clean container
          </button>
          {nextLabId ? (
            <button type="button" onClick={() => navigate(`/labs/${nextLabId}`)} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-lg cursor-pointer">
              Next lab <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={() => navigate('/report')} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-lg cursor-pointer">
              View my report <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={() => navigate(`/learn/${image.relatedModuleSlug}`)} className="text-sm text-[#D94F89] hover:underline cursor-pointer">
            Read the related threat guide
          </button>
        </div>
      </aside>
    </div>
  );
}
