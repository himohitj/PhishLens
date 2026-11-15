import React from 'react';
import { motion } from 'motion/react';
import {
  Download,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Eye,
  BookOpen,
} from 'lucide-react';
import { SessionStateResponse } from '../types/phishlens.ts';
import { CATEGORY_LABELS } from '../server/data.ts';
import { exportPerformanceReportPdf } from '../lib/pdfExport.ts';
import { LAB_IMAGES } from '../sandbox/labs/index.ts';
import { OUTCOME_COPY } from '../sandbox/engine.ts';
import { PageHero, heroGhostBtn, heroPrimaryBtn } from '../components/ui/PageHero.tsx';
import { CountUp } from '../components/motion.tsx';

interface ReportPageProps {
  session: SessionStateResponse;
  navigate: (path: string) => void;
}

export function ReportPage({ session, navigate }: ReportPageProps) {
  const feedbacks = Object.values(session.simulationFeedbacks);
  const completedSimCount = feedbacks.length;

  // Derive practical behaviour metrics from the interactive simulations
  const totalCluesInspected = Object.values(session.inspectedEvidenceByScenario).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const safeDecisionsCount = feedbacks.filter(
    (f) => f.outcomeClassification === 'optimal' || f.outcomeClassification === 'safe_partial'
  ).length;

  // Compute early vs. later simulation progression (or baseline vs final if taken)
  const simOrder = ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'];
  const earlySims = ['sim-1', 'sim-2']
    .map((id) => session.simulationFeedbacks[id])
    .filter(Boolean);
  const laterSims = ['sim-3', 'sim-4', 'sim-5']
    .map((id) => session.simulationFeedbacks[id])
    .filter(Boolean);

  const startingPct = session.baselineAssessment
    ? session.baselineAssessment.percentage
    : earlySims.length > 0
    ? Math.round(earlySims.reduce((s, f) => s + f.scoreEarned, 0) / earlySims.length)
    : null;

  const finalPct = session.finalAssessment
    ? session.finalAssessment.percentage
    : laterSims.length > 0
    ? Math.round(laterSims.reduce((s, f) => s + f.scoreEarned, 0) / laterSims.length)
    : earlySims.length > 0
    ? Math.round(earlySims.reduce((s, f) => s + f.scoreEarned, 0) / earlySims.length)
    : null;

  const ppChange =
    startingPct !== null && finalPct !== null ? finalPct - startingPct : null;

  let strongestCategory = 'Email Header & Link Verification';
  let needsPracticeCategory = 'Live Social Engineering & OTP Protection';

  if (feedbacks.length > 0) {
    const sorted = [...feedbacks].sort((a, b) => b.scoreEarned - a.scoreEarned);
    strongestCategory =
      CATEGORY_LABELS[sorted[0].attackType] || sorted[0].attackTypeLabel;
    needsPracticeCategory =
      CATEGORY_LABELS[sorted[sorted.length - 1].attackType] ||
      sorted[sorted.length - 1].attackTypeLabel;
  }

  const nextIncompleteSim =
    simOrder.find((id) => !session.completedScenarioIds.includes(id)) || 'sim-1';

  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Personal recognition report"
        title="How *sharp* are your instincts?"
        subtitle="Measured from how you investigated clues, verified senders and responded across the rooms and sandbox labs. Not from a quiz."
        aside={
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 grid grid-cols-2 gap-6">
            <div>
              <div className="text-5xl font-semibold text-white tabular-nums"><CountUp to={completedSimCount} /><span className="text-night-subtle text-2xl">/5</span></div>
              <div className="text-xs text-night-subtle mt-1">Rooms completed</div>
            </div>
            <div>
              <div className="text-5xl font-semibold text-white tabular-nums"><CountUp to={Object.keys(session.labResults).length} /><span className="text-night-subtle text-2xl">/{LAB_IMAGES.length}</span></div>
              <div className="text-xs text-night-subtle mt-1">Sandbox labs run</div>
            </div>
          </div>
        }
      >
        <button type="button" onClick={() => exportPerformanceReportPdf(session)} className={heroPrimaryBtn}>
          <Download className="w-4 h-4" /> Download PDF report
        </button>
        {completedSimCount < 5 && (
          <button type="button" onClick={() => navigate(`/experience/simulation/${nextIncompleteSim}`)} className={heroGhostBtn}>
            Complete remaining rooms ({completedSimCount}/5) <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </PageHero>
    <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-12 space-y-8 stagger-children">
      {/* 4 Key Practical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-line rounded-3xl p-6 space-y-1.5 shadow-soft card-hover">
          <div className="text-xs text-muted">Starting Recognition</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-ink">
            {startingPct !== null ? `${startingPct}%` : '—'}
          </div>
          <div className="text-xs text-muted">
            Initial scenario decisions
          </div>
        </div>

        <div className="bg-surface border border-line rounded-3xl p-6 space-y-1.5 shadow-soft card-hover">
          <div className="text-xs text-muted">Recent / Final Performance</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-brand">
            {finalPct !== null ? `${finalPct}%` : '—'}
          </div>
          <div className="text-xs text-muted">
            {ppChange !== null
              ? `${ppChange >= 0 ? '+' : ''}${ppChange} percentage-point shift`
              : 'Complete simulations to compare'}
          </div>
        </div>

        <div className="bg-surface border border-line rounded-3xl p-6 space-y-1.5 shadow-soft card-hover">
          <div className="text-xs text-muted">Evidence Clues Inspected</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-ink">
            {totalCluesInspected}
          </div>
          <div className="text-xs text-muted">
            Headers, URLs, QR previews &amp; prompts checked
          </div>
        </div>

        <div className="bg-surface border border-line rounded-3xl p-6 space-y-1.5 shadow-soft card-hover">
          <div className="text-xs text-muted">Safe Simulation Outcomes</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-700">
            {safeDecisionsCount}/{completedSimCount || 5}
          </div>
          <div className="text-xs text-muted">
            Reported or verified out-of-band safely
          </div>
        </div>
      </div>

      {/* Sandbox lab results */}
      <div className="bg-surface border border-line rounded-3xl p-6 space-y-4 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-ink">Sandbox Lab Investigations</h2>
          <button type="button" onClick={() => navigate('/labs')} className="text-xs font-semibold text-brand hover:underline cursor-pointer">
            Open Sandbox Labs
          </button>
        </div>
        {LAB_IMAGES.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-3">
            {LAB_IMAGES.map((lab) => {
              const r = session.labResults[lab.id];
              return (
                <div key={lab.id} className="rounded-xl border border-line p-4 space-y-1">
                  <div className="text-[11px] font-mono text-muted">{lab.codename}</div>
                  <div className="font-semibold text-sm text-ink">{lab.title}</div>
                  {r ? (
                    <div className="text-xs text-muted">
                      <span className="font-mono text-ink text-lg font-bold">{r.score}</span>/100 · {OUTCOME_COPY[r.outcome].label}
                      <div>{r.objectivesCompleted}/{r.objectivesTotal} objectives · depth {r.investigationDepth}%</div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted">Not attempted yet</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 12-Column Split: Behaviour Progress Chart + Strongest / Practice Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface border border-line rounded-3xl p-6 space-y-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              <span>Simulation-by-Simulation Recognition Accuracy</span>
            </h2>
            <span className="text-xs font-mono text-muted">
              {completedSimCount}/5 Completed
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { id: 'sim-1', label: '1. Email Inbox Triage' },
              { id: 'sim-2', label: '2. Browser Fake SSO Login' },
              { id: 'sim-3', label: '3. Mobile SMS Delivery Fee' },
              { id: 'sim-4', label: '4. QR Code Camera Preview' },
              { id: 'sim-5', label: '5. Live IT Support OTP Chat' },
            ].map((item) => {
              const fb = session.simulationFeedbacks[item.id];
              const pct = fb ? fb.scoreEarned : 0;
              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{item.label}</span>
                    {fb ? (
                      <span className="font-mono tabular-nums text-ink">
                        {fb.scoreEarned}/100 · {fb.selectedActionLabel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/experience/simulation/${item.id}`)}
                        className="text-brand font-semibold hover:underline cursor-pointer"
                      >
                        Try Simulation →
                      </button>
                    )}
                  </div>
                  <div className="w-full h-2.5 bg-canvas border border-line rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.35 }}
                      className={`h-full rounded-full ${
                        pct >= 80
                          ? 'bg-emerald-500'
                          : pct >= 35
                          ? 'bg-amber-400'
                          : 'bg-brand'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-blush border border-rose-soft text-xs text-ink leading-relaxed">
            <strong>What This Means:</strong> These scores reflect your practical investigation habits inside five controlled simulations. Real-world security depends on applying these same habits—checking the effective domain before the first slash (<code className="font-mono">/</code>) and never sharing OTPs—whenever an unexpected message pressures you to act quickly.
          </div>
        </div>

        {/* Right 5 Cols: Strongest Area, Area to Practise & Personalised Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface border border-line rounded-3xl p-5 space-y-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">
              Strengths &amp; Focus Areas
            </h2>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-xs">
              <div className="font-bold text-emerald-800">Strongest Demonstrated Area</div>
              <div className="text-sm font-bold text-ink">{strongestCategory}</div>
              <p className="text-emerald-950">
                You effectively inspected technical clues and avoided deceptive prompts here.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1 text-xs">
              <div className="font-bold text-amber-800">Area to Practise Next</div>
              <div className="text-sm font-bold text-ink">{needsPracticeCategory}</div>
              <p className="text-amber-950">
                Take an extra 5 seconds to verify out-of-band whenever urgency or authority is used.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-line flex items-center justify-between text-xs">
              <div>
                <div className="text-muted">Visual Guides Completed</div>
                <div className="font-bold text-sm text-ink font-mono tabular-nums">
                  {session.completedModuleSlugs.length} of 8 Topics
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/learn')}
                className="px-3.5 py-2 rounded-xl bg-blush hover:bg-rose-soft font-semibold text-brand cursor-pointer"
              >
                Explore Guides
              </button>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-3xl p-5 space-y-3 shadow-soft text-xs">
            <h3 className="text-sm font-bold text-ink">
              3 Golden Rules to Take With You
            </h3>
            <ul className="space-y-2 text-muted leading-relaxed">
              <li>
                <strong className="text-ink">1. Check the domain before the first /:</strong>{' '}
                Ignore display names and HTTPS padlocks; read right-to-left before the first single slash.
              </li>
              <li>
                <strong className="text-ink">2. OTPs and passwords are never shared:</strong>{' '}
                No real IT desk or bank fraud specialist will ever ask you for a 6-digit code.
              </li>
              <li>
                <strong className="text-ink">3. Switch to your own bookmark:</strong>{' '}
                Never resolve an urgent account, package, or Wi-Fi alert using the link or QR code inside the message.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
