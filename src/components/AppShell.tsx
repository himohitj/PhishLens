import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, RotateCcw, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { SessionStateResponse } from '../types/phishlens.ts';
import { getResumeRouteForSession } from '../lib/sessionStore.ts';

interface AppShellProps {
  currentPath: string;
  navigate: (path: string) => void;
  session: SessionStateResponse;
  onResetSession: () => void;
  children: React.ReactNode;
}

export function AppShell({
  currentPath,
  navigate,
  session,
  onResetSession,
  children,
}: AppShellProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const isLanding = currentPath === '/';
  const resumePath = getResumeRouteForSession(session);
  const completedSimCount = session.completedScenarioIds.length;
  const hasStarted =
    completedSimCount > 0 ||
    Boolean(session.baselineAssessment) ||
    session.completedModuleSlugs.length > 0;

  const nextIncompleteSim =
    ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'].find(
      (id) => !session.completedScenarioIds.includes(id)
    ) || 'sim-1';

  const primaryCtaLabel = hasStarted ? 'Resume Lab' : 'Start Interactive Lab';
  const primaryCtaTarget = hasStarted
    ? resumePath
    : `/experience/simulation/${nextIncompleteSim}`;

  // Compute accurate active step and remaining time estimate
  const remainingSims = Math.max(0, 5 - completedSimCount);
  const estMinutesLeft = Math.max(2, remainingSims * 2 + (session.finalAssessment ? 0 : 2));

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAFC] text-[#24212A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#F0E7ED] bg-white/95 backdrop-blur-md">
        <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="text-lg font-bold tracking-tight text-[#24212A] hover:text-[#D94F89] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D94F89]"
          >
            PhishLens
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#716B76]"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className={`hover:text-[#24212A] transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath === '/'
                  ? 'text-[#24212A] font-semibold underline underline-offset-8 decoration-[#D94F89] decoration-2'
                  : ''
              }`}
            >
              Discover
            </a>
            <a
              href={`/experience/simulation/${nextIncompleteSim}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/experience/simulation/${nextIncompleteSim}`);
              }}
              className={`hover:text-[#24212A] transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath.startsWith('/experience')
                  ? 'text-[#24212A] font-semibold underline underline-offset-8 decoration-[#D94F89] decoration-2'
                  : ''
              }`}
            >
              Simulations
            </a>
            <a
              href="/learn"
              onClick={(e) => {
                e.preventDefault();
                navigate('/learn');
              }}
              className={`hover:text-[#24212A] transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath.startsWith('/learn')
                  ? 'text-[#24212A] font-semibold underline underline-offset-8 decoration-[#D94F89] decoration-2'
                  : ''
              }`}
            >
              Learn
            </a>
            <a
              href="/report"
              onClick={(e) => {
                e.preventDefault();
                navigate('/report');
              }}
              className={`hover:text-[#24212A] transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentPath === '/report'
                  ? 'text-[#24212A] font-semibold underline underline-offset-8 decoration-[#D94F89] decoration-2'
                  : ''
              }`}
            >
              My Report
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => navigate(primaryCtaTarget)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] active:bg-[#A82E63] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89]"
            >
              {primaryCtaLabel}
            </button>
          </div>
        </div>
      </header>

      {/* Compact Single-Row Guided Context Bar (Only on active workspace routes) */}
      {!isLanding && (
        <div className="border-b border-[#F0E7ED] bg-[#FFF1F6]/70">
          <div className="max-w-[1380px] mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Left: Current Activity & Direct Manipulation Simulation Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#24212A]">
                {currentPath.startsWith('/experience/simulation') ||
                currentPath.startsWith('/experience/feedback')
                  ? 'Learning Rooms:'
                  : currentPath.startsWith('/learn')
                  ? 'Visual Threat Guide:'
                  : currentPath === '/report'
                  ? 'Personal Recognition Report:'
                  : 'Quick Calibration:'}
              </span>

              <div className="flex items-center gap-1">
                {[
                  { id: 'sim-1', label: 'Room 01 · Email' },
                  { id: 'sim-2', label: 'Room 02 · Sign-In' },
                  { id: 'sim-3', label: 'Room 03 · SMS' },
                  { id: 'sim-4', label: 'Room 04 · QR Scan' },
                  { id: 'sim-5', label: 'Room 05 · IT Chat' },
                ].map((sim) => {
                  const isDone = session.completedScenarioIds.includes(sim.id);
                  const isCurrent =
                    currentPath === `/experience/simulation/${sim.id}` ||
                    currentPath === `/experience/feedback/${sim.id}`;
                  return (
                    <button
                      key={sim.id}
                      type="button"
                      onClick={() => navigate(`/experience/simulation/${sim.id}`)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? 'bg-[#D94F89] text-white shadow-2xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-[#716B76] border border-[#F0E7ED] hover:text-[#24212A] hover:border-[#E879A8]'
                      }`}
                    >
                      {isDone && !isCurrent && (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                      <span>{sim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Progress Summary & Session Controls */}
            <div className="flex items-center gap-4 text-[#716B76] shrink-0">
              <span className="font-mono tabular-nums">
                {completedSimCount} of 5 rooms completed
                {completedSimCount < 5 ? ` · ~${estMinutesLeft} min left` : ' · All rooms complete'}
              </span>

              <button
                type="button"
                onClick={() => navigate('/report')}
                className="font-semibold text-[#D94F89] hover:underline cursor-pointer whitespace-nowrap"
              >
                View Report
              </button>

              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="inline-flex items-center gap-1 text-[#716B76] hover:text-[#24212A] transition-colors cursor-pointer whitespace-nowrap"
                title="Reset session progress"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container with Gentle Motion Transition */}
      <main className="flex-1 flex flex-col">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#F0E7ED] bg-white py-6 px-6 text-xs text-[#716B76]">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-semibold text-[#24212A]">
              PhishLens — See through the deception.
            </div>
            <p className="text-[#716B76]">
              Safe, controlled simulations. No real passwords, OTPs, or personal data are ever requested or collected.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="/experience/intro"
              onClick={(e) => {
                e.preventDefault();
                navigate('/experience/intro');
              }}
              className="hover:text-[#24212A] transition-colors whitespace-nowrap"
            >
              Safety & Calibration
            </a>
            <a
              href="/learn"
              onClick={(e) => {
                e.preventDefault();
                navigate('/learn');
              }}
              className="hover:text-[#24212A] transition-colors whitespace-nowrap"
            >
              Visual Guides
            </a>
            <a
              href="/report"
              onClick={(e) => {
                e.preventDefault();
                navigate('/report');
              }}
              className="hover:text-[#24212A] transition-colors whitespace-nowrap"
            >
              My Report
            </a>
          </div>
        </div>
      </footer>

      {/* Reset Session Confirmation Modal */}
      {confirmResetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#24212A]/40 backdrop-blur-xs p-4"
        >
          <div className="max-w-md w-full bg-white border border-[#F0E7ED] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#D94F89] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 id="reset-dialog-title" className="text-base font-bold text-[#24212A]">
                  Start a fresh PhishLens session?
                </h2>
                <p className="text-sm text-[#716B76] leading-relaxed">
                  This clears your current simulation decisions, inspected clues, and report progress stored in this browser.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#24212A] bg-[#FCFAFC] border border-[#F0E7ED] hover:bg-[#FFF1F6] rounded-lg transition-colors cursor-pointer"
              >
                Keep My Progress
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetOpen(false);
                  onResetSession();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-lg transition-colors cursor-pointer"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
