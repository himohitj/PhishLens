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
    <div className="flex-1 max-w-[1380px] w-full mx-auto px-6 py-8 space-y-8">
      {/* Header & PDF Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#F0E7ED] rounded-2xl p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#D94F89]">
            Personal Recognition &amp; Behaviour Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#24212A]">
            Your PhishLens Performance Summary
          </h1>
          <p className="text-sm text-[#716B76] max-w-2xl">
            Measured directly from how you investigated clues, verified senders, and responded across the interactive simulations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {completedSimCount < 5 && (
            <button
              type="button"
              onClick={() => navigate(`/experience/simulation/${nextIncompleteSim}`)}
              className="px-4 py-2.5 text-xs font-semibold text-[#D94F89] bg-[#FFF1F6] hover:bg-[#FCE4EE] rounded-xl cursor-pointer"
            >
              Complete Remaining Simulations ({completedSimCount}/5) →
            </button>
          )}
          <button
            type="button"
            onClick={() => exportPerformanceReportPdf(session)}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Report as PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Key Practical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#F0E7ED] rounded-2xl p-5 space-y-1.5 shadow-2xs">
          <div className="text-xs text-[#716B76]">Starting Recognition</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#24212A]">
            {startingPct !== null ? `${startingPct}%` : '—'}
          </div>
          <div className="text-xs text-[#716B76]">
            Initial scenario decisions
          </div>
        </div>

        <div className="bg-white border border-[#F0E7ED] rounded-2xl p-5 space-y-1.5 shadow-2xs">
          <div className="text-xs text-[#716B76]">Recent / Final Performance</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#D94F89]">
            {finalPct !== null ? `${finalPct}%` : '—'}
          </div>
          <div className="text-xs text-[#716B76]">
            {ppChange !== null
              ? `${ppChange >= 0 ? '+' : ''}${ppChange} percentage-point shift`
              : 'Complete simulations to compare'}
          </div>
        </div>

        <div className="bg-white border border-[#F0E7ED] rounded-2xl p-5 space-y-1.5 shadow-2xs">
          <div className="text-xs text-[#716B76]">Evidence Clues Inspected</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#24212A]">
            {totalCluesInspected}
          </div>
          <div className="text-xs text-[#716B76]">
            Headers, URLs, QR previews &amp; prompts checked
          </div>
        </div>

        <div className="bg-white border border-[#F0E7ED] rounded-2xl p-5 space-y-1.5 shadow-2xs">
          <div className="text-xs text-[#716B76]">Safe Simulation Outcomes</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-700">
            {safeDecisionsCount}/{completedSimCount || 5}
          </div>
          <div className="text-xs text-[#716B76]">
            Reported or verified out-of-band safely
          </div>
        </div>
      </div>

      {/* 12-Column Split: Behaviour Progress Chart + Strongest / Practice Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#F0E7ED] rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#24212A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D94F89]" />
              <span>Simulation-by-Simulation Recognition Accuracy</span>
            </h2>
            <span className="text-xs font-mono text-[#716B76]">
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
                    <span className="font-semibold text-[#24212A]">{item.label}</span>
                    {fb ? (
                      <span className="font-mono tabular-nums text-[#24212A]">
                        {fb.scoreEarned}/100 · {fb.selectedActionLabel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/experience/simulation/${item.id}`)}
                        className="text-[#D94F89] font-semibold hover:underline cursor-pointer"
                      >
                        Try Simulation →
                      </button>
                    )}
                  </div>
                  <div className="w-full h-2.5 bg-[#FCFAFC] border border-[#F0E7ED] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.35 }}
                      className={`h-full rounded-full ${
                        pct >= 80
                          ? 'bg-emerald-500'
                          : pct >= 35
                          ? 'bg-amber-400'
                          : 'bg-[#D94F89]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] text-xs text-[#24212A] leading-relaxed">
            <strong>What This Means:</strong> These scores reflect your practical investigation habits inside five controlled simulations. Real-world security depends on applying these same habits—checking the effective domain before the first slash (<code className="font-mono">/</code>) and never sharing OTPs—whenever an unexpected message pressures you to act quickly.
          </div>
        </div>

        {/* Right 5 Cols: Strongest Area, Area to Practise & Personalised Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#F0E7ED] rounded-2xl p-5 space-y-4 shadow-2xs">
            <h2 className="text-base font-bold text-[#24212A]">
              Strengths &amp; Focus Areas
            </h2>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-xs">
              <div className="font-bold text-emerald-800">Strongest Demonstrated Area</div>
              <div className="text-sm font-bold text-[#24212A]">{strongestCategory}</div>
              <p className="text-emerald-950">
                You effectively inspected technical clues and avoided deceptive prompts here.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1 text-xs">
              <div className="font-bold text-amber-800">Area to Practise Next</div>
              <div className="text-sm font-bold text-[#24212A]">{needsPracticeCategory}</div>
              <p className="text-amber-950">
                Take an extra 5 seconds to verify out-of-band whenever urgency or authority is used.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] flex items-center justify-between text-xs">
              <div>
                <div className="text-[#716B76]">Visual Guides Completed</div>
                <div className="font-bold text-sm text-[#24212A] font-mono tabular-nums">
                  {session.completedModuleSlugs.length} of 8 Topics
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/learn')}
                className="px-3.5 py-2 rounded-xl bg-[#FFF1F6] hover:bg-[#FCE4EE] font-semibold text-[#D94F89] cursor-pointer"
              >
                Explore Guides
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#F0E7ED] rounded-2xl p-5 space-y-3 shadow-2xs text-xs">
            <h3 className="text-sm font-bold text-[#24212A]">
              3 Golden Rules to Take With You
            </h3>
            <ul className="space-y-2 text-[#716B76] leading-relaxed">
              <li>
                <strong className="text-[#24212A]">1. Check the domain before the first /:</strong>{' '}
                Ignore display names and HTTPS padlocks; read right-to-left before the first single slash.
              </li>
              <li>
                <strong className="text-[#24212A]">2. OTPs and passwords are never shared:</strong>{' '}
                No real IT desk or bank fraud specialist will ever ask you for a 6-digit code.
              </li>
              <li>
                <strong className="text-[#24212A]">3. Switch to your own bookmark:</strong>{' '}
                Never resolve an urgent account, package, or Wi-Fi alert using the link or QR code inside the message.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
