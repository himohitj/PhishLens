import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, ChevronDown, Search, Sparkles } from 'lucide-react';
import { EASE_OUT_EXPO } from './motion.tsx';

/** The 30-second interactive warm-up shown on the landing page. */
export function WarmupTeaser() {
  const [senderExpanded, setSenderExpanded] = useState(false);
  const [linkPreviewed, setLinkPreviewed] = useState(false);
  const [choice, setChoice] = useState<'trust' | 'flag' | null>(null);
  const found = Number(senderExpanded) + Number(linkPreviewed);

  return (
    <div className="rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-40px_rgba(22,19,29,0.35)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b border-line bg-canvas/70">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-2 text-xs font-medium text-muted">Workspace Mail · Inbox</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">Clues found</span>
          <span className="flex gap-1">
            {[0, 1].map((i) => (
              <motion.span key={i} className="h-1.5 w-6 rounded-full" animate={{ backgroundColor: i < found ? '#d6457f' : '#ece6f0' }} transition={{ duration: 0.4 }} />
            ))}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg sm:text-xl font-semibold">Shared document: “Q4 Compensation &amp; Bonus Adjustment.pdf”</h3>
            <span className="text-xs font-mono text-muted shrink-0">10:18</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-soft to-blush text-brand font-semibold grid place-items-center">HR</div>
              <div>
                <div className="font-semibold text-sm">People &amp; Culture Shared Drive</div>
                <div className="text-muted">To: you@workspace.example.com</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSenderExpanded((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                senderExpanded ? 'bg-blush border-brand-soft text-brand' : 'bg-surface border-line hover:border-brand-soft'
              }`}
            >
              1 · Inspect sender
              <motion.span animate={{ rotate: senderExpanded ? 180 : 0 }}><ChevronDown className="w-3.5 h-3.5" /></motion.span>
            </button>
          </div>
          <AnimatePresence initial={false}>
            {senderExpanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE_OUT_EXPO }} className="overflow-hidden">
                <div className="p-3.5 rounded-xl bg-blush border border-rose-soft text-xs space-y-1.5">
                  <div className="font-mono">
                    <span className="text-muted">From:</span> People &amp; Culture &lt;<span className="text-brand font-semibold">notifications@drive-share-auth.example.net</span>&gt;
                  </div>
                  <div className="flex gap-1.5 text-brand font-medium"><Sparkles className="w-3.5 h-3.5 shrink-0 mt-px" /> The display name says “People &amp; Culture”, but the domain is an external lookalike.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed">
          Hi there — Human Resources has uploaded your updated Q4 compensation letter to the private folder. Please review and acknowledge receipt before 5:00 PM today.
        </p>

        <div className="p-4 rounded-2xl border border-line bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Q4_Compensation_Adjustment_Letter.pdf</div>
            <div className="text-xs text-muted">Cloud document link · Requires workspace sign-in</div>
          </div>
          <button type="button" onClick={() => setLinkPreviewed((p) => !p)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-soft text-xs font-semibold text-brand hover:bg-blush transition-colors cursor-pointer shrink-0">
            <Search className="w-3.5 h-3.5" /> 2 · Inspect link
          </button>
        </div>
        <AnimatePresence initial={false}>
          {linkPreviewed && (
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE_OUT_EXPO }} className="p-4 rounded-2xl bg-night text-night-text font-mono text-xs space-y-1.5">
              <div className="text-night-subtle font-sans text-[11px] uppercase tracking-wider">Real destination</div>
              <div className="break-all">
                <span className="text-night-subtle">https://workspace.example.com.</span>
                <span className="text-amber-300 font-semibold">login-verify-gateway.example.net</span>
                <span className="text-night-subtle">/doc/view</span>
              </div>
              <div className="font-sans text-night-muted">“workspace.example.com” is a decoy prefix. The site you would actually visit is <code className="text-amber-300">login-verify-gateway.example.net</code>.</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-semibold">Your call: open it, or report it?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSenderExpanded(true); setLinkPreviewed(true); setChoice('trust'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${choice === 'trust' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'border-line hover:bg-canvas'}`}
            >
              Open &amp; sign in
            </button>
            <button
              type="button"
              onClick={() => { setSenderExpanded(true); setLinkPreviewed(true); setChoice('flag'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer ${choice === 'flag' ? 'bg-emerald-600' : 'bg-ink hover:bg-brand'}`}
            >
              Report phishing
            </button>
          </div>
        </div>
        <AnimatePresence>
          {choice && (
            <motion.div
              key={choice}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className={`p-4 rounded-2xl border text-sm space-y-1.5 ${choice === 'flag' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'}`}
            >
              <div className="font-semibold flex items-center gap-2">
                {choice === 'flag' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-amber-700" />}
                {choice === 'flag' ? 'Spot on. You caught the lookalike sender and the disguised link.' : 'Simulated outcome: that’s how easily urgent lures catch busy people.'}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Attackers use emotional topics like pay changes so you click before checking the sender’s domain, or the part of the link just before the first single slash.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
