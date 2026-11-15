import { PageHero } from '../components/ui/PageHero.tsx';
import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Search,
} from 'lucide-react';
import { LearningModule, SessionStateResponse } from '../types/phishlens.ts';
import { getLearningModulesSync } from '../lib/sessionStore.ts';

interface LearningCentrePageProps {
  slug?: string;
  session: SessionStateResponse;
  onCompleteModule: (slug: string) => void;
  navigate: (path: string) => void;
}

export function LearningCentrePage({
  slug,
  session,
  onCompleteModule,
  navigate,
}: LearningCentrePageProps) {
  const modules: LearningModule[] = getLearningModulesSync();
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string>('');
  const [showAnnotatedReveal, setShowAnnotatedReveal] = useState<boolean>(true);

  useEffect(() => {
    setSelectedQuizAnswer('');
    setShowAnnotatedReveal(true);
  }, [slug]);

  const activeModule = slug
    ? modules.find((m) => m.slug === slug) || modules[0]
    : modules[0];

  if (!activeModule) return null;

  const isCompleted = session.completedModuleSlugs.includes(activeModule.slug);

  return (
    <div className="flex-1">
      <PageHero eyebrow={`Visual threat guides · ${session.completedModuleSlugs.length} of ${modules.length} complete`} title="Spot the *signal* in the noise." subtitle="Annotated examples, before-and-after comparisons and quick knowledge checks for every attack family in PhishLens." />
    <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-10 space-y-6 stagger-children">
      {/* Top Visual Index Bar: Switch between concise visual topics in 1 click */}
      <div className="bg-surface border border-line rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-soft">
        <div className="space-y-1">
          <div className="text-xs font-bold text-brand">
            Embedded Visual Threat Guides · Completed {session.completedModuleSlugs.length} of{' '}
            {modules.length}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">
            Spot the Signal: Annotated Examples &amp; Before/After Comparisons
          </h1>
        </div>

        {/* Visual Topic Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {modules.map((m) => {
            const active = m.slug === activeModule.slug;
            const done = session.completedModuleSlugs.includes(m.slug);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => navigate(`/learn/${m.slug}`)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-brand text-white shadow-soft'
                    : done
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-canvas text-muted border border-line hover:text-ink hover:border-brand-soft'
                }`}
              >
                {done && !active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{m.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Column Interactive Guide Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLUMNS: Annotated Visual Example & Before/After Comparison */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-surface border border-line rounded-3xl p-6 space-y-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <span className="text-xs font-mono text-brand font-semibold">
                  {activeModule.attackTypeLabel}
                </span>
                <h2 className="text-xl font-bold text-ink mt-0.5">
                  {activeModule.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAnnotatedReveal((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blush border border-rose-soft text-xs font-semibold text-brand cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {showAnnotatedReveal ? 'Showing Deception Signals' : 'Show Deception Signals'}
                </span>
              </button>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              {activeModule.whatItIs}
            </p>

            {/* Annotated Before / After Example Box */}
            <div className="rounded-xl border border-line bg-canvas p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink">
                  Annotated Scenario: {activeModule.fictionalExample.title}
                </span>
                <span className="text-muted">{activeModule.fictionalExample.context}</span>
              </div>

              <pre className="p-3.5 rounded-xl bg-ink text-amber-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {activeModule.fictionalExample.artifactText}
              </pre>

              {showAnnotatedReveal && (
                <div className="p-3.5 rounded-xl bg-blush border border-rose-soft text-xs text-ink space-y-1">
                  <div className="font-bold text-brand">
                    How to Read the Clues Above:
                  </div>
                  <p className="leading-relaxed">
                    {activeModule.fictionalExample.deceptionBreakdown}
                  </p>
                </div>
              )}
            </div>

            {/* Warning Signs Grid */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Key Warning Signs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeModule.warningSigns.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-canvas border border-line space-y-1 text-xs"
                  >
                    <div className="font-bold text-ink">{w.signal}</div>
                    <p className="text-muted leading-relaxed">{w.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: Safer Habits Comparison + 1-Question Interactive Check */}
        <div className="lg:col-span-5 space-y-5">
          {/* Do vs Don't Comparison */}
          <div className="bg-surface border border-line rounded-3xl p-5 space-y-4 shadow-soft">
            <h3 className="text-sm font-bold text-ink">
              Before / After Habit Comparison
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Safer Verification Habits</span>
                </div>
                <ul className="space-y-1.5 text-emerald-950">
                  {activeModule.whatToDo.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="font-bold text-emerald-700">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Risky Traps to Avoid</span>
                </div>
                <ul className="space-y-1.5 text-rose-950">
                  {activeModule.whatNotToDo.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="font-bold text-rose-700">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Interactive Check */}
          <div className="bg-surface border border-line rounded-3xl p-5 space-y-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand">
                Quick Spot-Check (Marks Topic Complete)
              </span>
              {isCompleted && (
                <span className="text-xs font-semibold text-emerald-700">✓ Topic Completed</span>
              )}
            </div>

            <p className="text-xs font-semibold text-ink leading-snug">
              {activeModule.knowledgeCheck.question}
            </p>

            <div className="space-y-2">
              {activeModule.knowledgeCheck.options.map((opt) => {
                const isSelected = selectedQuizAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuizAnswer(opt.id);
                      if (opt.isCorrect && !isCompleted) {
                        onCompleteModule(activeModule.slug);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-amber-50 border-amber-400 text-amber-950'
                        : 'bg-canvas border-line hover:border-brand-soft text-ink'
                    }`}
                  >
                    <div className="font-semibold">{opt.text}</div>
                    {isSelected && (
                      <div className="mt-1.5 pt-1.5 border-t border-black/10 text-[11px]">
                        {opt.feedback}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onCompleteModule(activeModule.slug)}
                className="px-3.5 py-2 rounded-xl bg-blush hover:bg-rose-soft text-xs font-semibold text-brand cursor-pointer"
              >
                {isCompleted ? '✓ Completed' : 'Mark Topic Read'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/report')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-semibold cursor-pointer"
              >
                <span>Go to My Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
