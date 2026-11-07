import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Globe,
  Smartphone,
  QrCode,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { SessionStateResponse } from '../types/phishlens.ts';
import { getResumeRouteForSession } from '../lib/sessionStore.ts';
import { HeroLensScene } from '../components/HeroLensScene.tsx';

const HERO_HEADLINE = 'Would you spot a scam before it costs you?';

interface LandingPageProps {
  session: SessionStateResponse;
  navigate: (path: string) => void;
}

export function LandingPage({ session, navigate }: LandingPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [typedLength, setTypedLength] = useState(
    prefersReducedMotion ? HERO_HEADLINE.length : 0
  );

  // Smooth typing animation for the hero headline
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedLength(HERO_HEADLINE.length);
      return;
    }

    setTypedLength(0);
    const interval = window.setInterval(() => {
      setTypedLength((prev) => {
        if (prev >= HERO_HEADLINE.length) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 42);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  // Interactive 30-second teaser state (below the fold in How It Works)
  const [senderExpanded, setSenderExpanded] = useState(false);
  const [linkPreviewed, setLinkPreviewed] = useState(false);
  const [teaserChoice, setTeaserChoice] = useState<'trust' | 'flag' | null>(null);

  const hasProgress =
    session.completedScenarioIds.length > 0 ||
    Boolean(session.baselineAssessment) ||
    session.completedModuleSlugs.length > 0;

  const nextSimId =
    ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'].find(
      (id) => !session.completedScenarioIds.includes(id)
    ) || 'sim-1';

  const startDestination = hasProgress
    ? getResumeRouteForSession(session)
    : `/experience/simulation/${nextSimId}`;

  const handleExploreHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden">
      {/* Main Hero: Responsive Two-Column Layout with 3D Animated Lens Scene */}
      <section className="relative border-b border-[#F0E7ED] bg-gradient-to-b from-[#FFF1F6]/65 via-[#FCFAFC] to-[#FCFAFC] py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 cols): Eyebrow, Headline, Copy, Primary & Secondary CTAs, Safety Note */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold tracking-wider text-[#D94F89]">
                Interactive Phishing Awareness Lab
              </div>
              <h1
                aria-label={HERO_HEADLINE}
                className="relative text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-[#24212A] leading-[1.12]"
              >
                {/* Invisible layout stabilizer so buttons below never shift while typing */}
                <span aria-hidden="true" className="invisible select-none block">
                  {HERO_HEADLINE}
                </span>
                {/* Visible typed text overlay */}
                <span aria-hidden="true" className="absolute inset-0">
                  {HERO_HEADLINE.slice(0, typedLength)}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="inline-block w-[3px] h-[0.88em] bg-[#D94F89] ml-1 align-middle translate-y-[-2px] rounded-full"
                  />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#716B76] leading-relaxed max-w-xl">
                Phishing is designed to look ordinary. Step into safe, hands-on simulations, uncover the clues attackers hope you miss, and build the confidence to respond.
              </p>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="space-y-3.5 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(startDestination)}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[46px] text-sm font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] active:bg-[#A82E63] rounded-xl shadow-sm transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89]"
                >
                  <span>
                    {hasProgress
                      ? `Start the experience (${session.completedScenarioIds.length}/5 done)`
                      : 'Start the experience'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleExploreHowItWorks}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[46px] text-sm font-semibold text-[#24212A] bg-white hover:bg-[#FFF1F6] border border-[#F0E7ED] rounded-xl transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89]"
                >
                  <span>Explore how it works</span>
                </button>
              </div>

              {/* Safety Microcopy */}
              <div className="text-xs text-[#716B76] flex flex-wrap items-center gap-2 pt-0.5">
                <span>No sign-up required</span>
                <span aria-hidden="true">·</span>
                <span>Safe simulations</span>
                <span aria-hidden="true">·</span>
                <span>No real credentials collected</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): 3D Animated Lens Scene */}
          <div className="lg:col-span-7">
            <HeroLensScene />
          </div>
        </div>
      </section>

      {/* How It Works + 5 Guided Learning Rooms Overview */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 px-4 sm:px-6 border-b border-[#F0E7ED] bg-white scroll-mt-16"
      >
        <div className="max-w-[1380px] mx-auto space-y-10">
          {/* Header & Guided Loop Explanation */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#F0E7ED]">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-semibold text-[#D94F89]">
                How PhishLens Works · Hands-On Discovery, Not a Lecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#24212A]">
                Five Guided Learning Rooms You Can Explore
              </h2>
              <p className="text-sm text-[#716B76] leading-relaxed">
                Each room places you inside a realistic digital situation with 3–4 short tasks. You inspect one clue at a time, get immediate feedback, and see what happens when you make your call.
              </p>
            </div>

            {/* Learning Loop Steps */}
            <div className="bg-[#FCFAFC] border border-[#F0E7ED] rounded-2xl px-4 py-3.5 shrink-0">
              <div className="text-[11px] font-semibold text-[#716B76] mb-1.5">
                Every Room Follows This Guided Loop:
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold text-[#D94F89]">
                <span>BRIEFING</span>
                <span className="text-[#716B76]">→</span>
                <span>TASK</span>
                <span className="text-[#716B76]">→</span>
                <span>INTERACT</span>
                <span className="text-[#716B76]">→</span>
                <span>FEEDBACK</span>
                <span className="text-[#716B76]">→</span>
                <span>REVEAL</span>
              </div>
            </div>
          </div>

          {/* 5 Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                id: 'sim-1',
                icon: <Mail className="w-4 h-4 text-[#D94F89]" />,
                step: 'Room 01 · Email Inbox',
                title: "The Message That Can't Wait",
                desc: 'Open an urgent suspension warning, expand the sender details, and preview where the link really goes.',
              },
              {
                id: 'sim-2',
                icon: <Globe className="w-4 h-4 text-[#D94F89]" />,
                step: 'Room 02 · Browser Window',
                title: 'The Suspicious Sign-In',
                desc: 'Inspect the browser address bar and spot why the login card asks for your password and 6-digit code together.',
              },
              {
                id: 'sim-3',
                icon: <Smartphone className="w-4 h-4 text-[#D94F89]" />,
                step: 'Room 03 · Phone SMS',
                title: 'Your Delivery Is On Hold',
                desc: 'Check an unknown phone number and preview the link behind a $1.85 parcel redelivery fee request.',
              },
              {
                id: 'sim-4',
                icon: <QrCode className="w-4 h-4 text-[#D94F89]" />,
                step: 'Room 04 · QR Scanner',
                title: 'Scan Before You Trust',
                desc: 'Scan a demonstration Wi-Fi notice QR code to reveal the web address before opening it on your phone.',
              },
              {
                id: 'sim-5',
                icon: <MessageSquare className="w-4 h-4 text-[#D94F89]" />,
                step: 'Room 05 · Support Chat',
                title: 'The Urgent IT Request',
                desc: 'Verify an external chat sender who drops your manager’s name and asks for your 6-digit sign-in code.',
              },
            ].map((item) => {
              const isDone = session.completedScenarioIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/experience/simulation/${item.id}`)}
                  className="text-left bg-[#FCFAFC] hover:bg-[#FFF1F6]/60 border border-[#F0E7ED] hover:border-[#E879A8] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-[#FFF1F6] border border-[#FCE4EE]">
                        {item.icon}
                      </div>
                      {isDone && (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[#716B76]">{item.step}</div>
                    <h3 className="text-sm font-bold text-[#24212A] group-hover:text-[#D94F89] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#716B76] leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="text-xs font-semibold text-[#D94F89] inline-flex items-center gap-1">
                    <span>Enter Room</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive 30-Second Sandbox Teaser */}
          <div className="bg-[#FCFAFC] border border-[#F0E7ED] rounded-2xl overflow-hidden">
            <div className="bg-[#FFF1F6] border-b border-[#F0E7ED] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D94F89]" />
                <span className="text-xs font-bold text-[#24212A]">
                  Try a 30-Second Warm-Up Right Here
                </span>
              </div>
              <span className="text-xs text-[#716B76]">
                Click the sender header or link preview below, then make your call
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="border-b border-[#F0E7ED] pb-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-[#24212A]">
                    Shared Document: “Q4 Compensation &amp; Bonus Adjustment.pdf”
                  </h3>
                  <span className="text-xs font-mono text-[#716B76] shrink-0">
                    10:18 AM
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-[#FCE4EE] text-[#D94F89] font-bold flex items-center justify-center shrink-0">
                      HR
                    </div>
                    <div>
                      <div className="font-semibold text-[#24212A]">
                        People &amp; Culture Shared Drive
                      </div>
                      <div className="text-[#716B76]">To: you@workspace.example.com</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSenderExpanded((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      senderExpanded
                        ? 'bg-[#FFF1F6] border-[#E879A8] text-[#D94F89]'
                        : 'bg-white border-[#F0E7ED] text-[#24212A] hover:bg-[#FFF1F6]'
                    }`}
                  >
                    <span>{senderExpanded ? 'Sender Details Open' : '1. Inspect Sender Address'}</span>
                    {senderExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {senderExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 rounded-xl bg-[#FFF1F6]/80 border border-[#FCE4EE] text-xs space-y-1 font-mono">
                        <div className="text-[#24212A]">
                          <span className="text-[#716B76]">From:</span> People &amp; Culture &lt;
                          <span className="text-[#D94F89] font-semibold">
                            notifications@drive-share-auth.example.net
                          </span>
                          &gt;
                        </div>
                        <div className="font-sans text-[#D94F89] font-medium pt-1">
                          Clue Found: The display name says “People &amp; Culture”, but the actual domain is an external lookalike (`drive-share-auth.example.net`).
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4 text-sm text-[#24212A] leading-relaxed">
                <p>
                  Hi there — Human Resources has uploaded your updated Q4 compensation letter to the private folder. Please review and acknowledge receipt before 5:00 PM today.
                </p>

                <div className="p-4 rounded-xl bg-white border border-[#F0E7ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-[#24212A]">
                      Q4_Compensation_Adjustment_Letter.pdf
                    </div>
                    <div className="text-xs text-[#716B76]">
                      Cloud Document Link · Requires Workspace Sign-In
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLinkPreviewed((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FCFAFC] border border-[#E879A8] text-xs font-semibold text-[#D94F89] hover:bg-[#FFF1F6] transition-colors cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>2. Inspect Link URL</span>
                  </button>
                </div>

                <AnimatePresence>
                  {linkPreviewed && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="p-3 rounded-xl bg-[#24212A] text-white font-mono text-xs space-y-1"
                    >
                      <div className="text-[#FCE4EE] text-[11px] font-sans font-medium">
                        Link Preview (Website Before First Single Slash):
                      </div>
                      <div className="break-all text-amber-300">
                        https://workspace.example.com.login-verify-gateway.example.net/doc/view
                      </div>
                      <div className="text-xs font-sans text-slate-200 pt-0.5">
                        Clue Found: “workspace.example.com” is placed at the start as a decoy! The real website is <code className="text-amber-300">login-verify-gateway.example.net</code>.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-3 border-t border-[#F0E7ED] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#24212A]">
                    Your Call: Would you open this document or report it as phishing?
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSenderExpanded(true);
                        setLinkPreviewed(true);
                        setTeaserChoice('trust');
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        teaserChoice === 'trust'
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-white border-[#F0E7ED] text-[#24212A] hover:bg-[#FCFAFC]'
                      }`}
                    >
                      Open Document &amp; Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSenderExpanded(true);
                        setLinkPreviewed(true);
                        setTeaserChoice('flag');
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        teaserChoice === 'flag'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#D94F89] hover:bg-[#C23B75] text-white'
                      }`}
                    >
                      Report Phishing
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {teaserChoice && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        teaserChoice === 'flag'
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50/90 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="font-bold text-sm flex items-center gap-2">
                        {teaserChoice === 'flag' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Spot on! You caught the lookalike sender and disguised link.</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Simulated outcome — that’s how easily urgent lures catch busy people!</span>
                          </>
                        )}
                      </div>

                      <p className="leading-relaxed">
                        Attackers use emotional topics like compensation updates so you click before checking the sender address or the domain right before the first single slash (<code className="font-mono">login-verify-gateway.example.net</code>).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters & Safe Sandbox Guarantee */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-[1380px] mx-auto bg-[#FFF1F6] border border-[#FCE4EE] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <ShieldCheck className="w-6 h-6 text-[#D94F89] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-[#24212A]">
                Safe to Explore, Safe to Make Mistakes
              </h2>
              <p className="text-sm text-[#716B76] leading-relaxed">
                Every link, attachment, QR scan, and chat reply stays 100% inside this browser sandbox. If you choose a risky option, PhishLens safely shows the simulated outcome and the exact clue that gave the deception away.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(startDestination)}
            className="px-6 py-3.5 text-sm font-semibold text-white bg-[#D94F89] hover:bg-[#C23B75] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {hasProgress ? 'Continue Your Lab Session' : 'Start Room 01 →'}
          </button>
        </div>
      </section>
    </div>
  );
}
