import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Eye,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { SimulationFeedbackRecord, SessionStateResponse } from '../types/phishlens.ts';

interface FeedbackPageProps {
  scenarioId: string;
  session: SessionStateResponse;
  navigate: (path: string) => void;
}

export function FeedbackPage({ scenarioId, session, navigate }: FeedbackPageProps) {
  const feedback: SimulationFeedbackRecord | undefined = session.simulationFeedbacks[scenarioId];

  if (!feedback) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-14 space-y-4">
        <div className="bg-surface border border-line rounded-3xl p-6 space-y-4 shadow-soft">
          <h1 className="text-lg font-bold text-ink">
            No Decision Recorded Yet for This Simulation
          </h1>
          <p className="text-sm text-muted">
            Interact with the simulated interface first to unlock the detailed evidence debrief.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/experience/simulation/${scenarioId}`)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-strong rounded-xl cursor-pointer"
          >
            Open Interactive Simulation
          </button>
        </div>
      </div>
    );
  }

  const simOrder = ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'];
  const currentIdx = simOrder.indexOf(scenarioId);
  const nextSimId =
    currentIdx >= 0 && currentIdx < simOrder.length - 1 ? simOrder[currentIdx + 1] : null;

  const isSafe =
    feedback.outcomeClassification === 'optimal' ||
    feedback.outcomeClassification === 'safe_partial';

  return (
    <div className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-10 space-y-6 stagger-children">
      {/* Top Result Banner */}
      <div
        className={`rounded-3xl border p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isSafe
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {isSafe ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            )}
            <span>
              {feedback.scenarioTitle} · Debrief &amp; Clue Breakdown
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink">{feedback.resultHeadline}</h1>
          <p className="text-sm text-ink/80 max-w-3xl">{feedback.actionExplanation}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {nextSimId ? (
            <button
              type="button"
              onClick={() => navigate(`/experience/simulation/${nextSimId}`)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-semibold cursor-pointer shadow-soft"
            >
              <span>Next Simulation ({currentIdx + 2} of 5)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-semibold cursor-pointer shadow-soft"
            >
              <span>View Personal Recognition Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 12-Column Grid: 4-Part Debrief + Annotated Clues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface border border-line rounded-3xl p-5 space-y-3 shadow-soft">
            <div className="text-xs font-bold text-brand">1. Action Comparison</div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-canvas border border-line">
                <div className="text-muted">Your Action:</div>
                <div className="font-bold text-ink text-sm mt-0.5">
                  {feedback.selectedActionLabel}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="text-emerald-800 font-medium">Safest Response:</div>
                <div className="font-bold text-emerald-950 text-sm mt-0.5">
                  {feedback.safestActionLabel}
                </div>
                <p className="text-emerald-900 mt-1 leading-relaxed">
                  {feedback.safestActionRationale}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blush border border-rose-soft rounded-3xl p-5 space-y-2">
            <div className="text-xs font-bold text-brand">
              2. Practical Rule to Remember
            </div>
            <p className="text-sm font-medium text-ink leading-relaxed">
              {feedback.preventionTip}
            </p>
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(`/learn/${feedback.relatedModuleSlug}`)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore Visual Guide: {feedback.relatedModuleTitle}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Annotated Evidence Clues */}
        <div className="lg:col-span-7 bg-surface border border-line rounded-3xl p-6 space-y-4 shadow-soft">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand" />
              <h2 className="text-sm font-bold text-ink">
                Clues Inside the Interface ({feedback.inspectedEvidenceIds.length}/
                {feedback.missedOrSpottedEvidence.length} Inspected)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/experience/simulation/${scenarioId}`)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-Open Simulation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {feedback.missedOrSpottedEvidence.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-canvas border border-line space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-ink">{item.label}</span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      item.wasInspected ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {item.wasInspected ? '✓ Inspected' : '○ Uninspected'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-line font-mono text-[11px] text-brand break-all">
                  {item.rawValue}
                </div>
                <p className="text-muted leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
