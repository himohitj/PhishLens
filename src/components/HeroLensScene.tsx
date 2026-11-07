import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  Search,
  Mail,
  Lock,
  ExternalLink,
  Eye,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

/**
 * 9-second deterministic animation cycle phases:
 * - 'enter' (0.0s - 1.6s): Card & floating elements settle; message looks ordinary
 * - 'scan_sender' (1.6s - 4.4s): Translucent 3D lens glides over the sender header, revealing the lookalike domain
 * - 'scan_link' (4.4s - 7.2s): Lens glides down to the document sign-in link, revealing the deceptive host
 * - 'settle' (7.2s - 9.0s): Lens eases back toward resting position while summary remains legible, looping seamlessly
 */
type ScenePhase = 'enter' | 'scan_sender' | 'scan_link' | 'settle';

export function HeroLensScene() {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<ScenePhase>('scan_sender');
  const [lockedFocus, setLockedFocus] = useState<'none' | 'both' | 'sender' | 'link'>('none');
  const [isPointerInside, setIsPointerInside] = useState(false);

  // Deterministic 9-second timeline loop when not in reduced-motion mode and not manually locked
  useEffect(() => {
    if (prefersReducedMotion || lockedFocus !== 'none' || isPointerInside) {
      return;
    }

    let startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = ((now - startTime) / 1000) % 9.0;
      if (elapsed < 1.6) {
        setPhase((prev) => (prev !== 'enter' ? 'enter' : prev));
      } else if (elapsed < 4.4) {
        setPhase((prev) => (prev !== 'scan_sender' ? 'scan_sender' : prev));
      } else if (elapsed < 7.2) {
        setPhase((prev) => (prev !== 'scan_link' ? 'scan_link' : prev));
      } else {
        setPhase((prev) => (prev !== 'settle' ? 'settle' : prev));
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion, lockedFocus, isPointerInside]);

  // Determine which clues are actively revealed by the lens
  const isStaticOrLockedAll =
    Boolean(prefersReducedMotion) || lockedFocus === 'both' || isPointerInside;

  const senderRevealed =
    isStaticOrLockedAll ||
    lockedFocus === 'sender' ||
    phase === 'scan_sender' ||
    phase === 'scan_link' ||
    phase === 'settle';

  const linkRevealed =
    isStaticOrLockedAll ||
    lockedFocus === 'link' ||
    phase === 'scan_link' ||
    phase === 'settle';

  // Compute deterministic 3D lens coordinates (percentage-based transform via x/y offsets)
  const getLensTransform = () => {
    if (prefersReducedMotion) {
      return { x: 18, y: 8, scale: 1, rotateX: 6, rotateY: -8, rotateZ: -2 };
    }
    if (lockedFocus === 'sender') {
      return { x: -12, y: -38, scale: 1.03, rotateX: 8, rotateY: -6, rotateZ: -3 };
    }
    if (lockedFocus === 'link') {
      return { x: 24, y: 36, scale: 1.03, rotateX: 5, rotateY: -10, rotateZ: 2 };
    }
    if (lockedFocus === 'both' || isPointerInside) {
      return { x: 14, y: 4, scale: 1.04, rotateX: 7, rotateY: -8, rotateZ: -1 };
    }

    switch (phase) {
      case 'enter':
        return { x: -68, y: -64, scale: 0.96, rotateX: 10, rotateY: -12, rotateZ: -6 };
      case 'scan_sender':
        return { x: -8, y: -34, scale: 1.02, rotateX: 8, rotateY: -7, rotateZ: -2 };
      case 'scan_link':
        return { x: 26, y: 38, scale: 1.03, rotateX: 5, rotateY: -9, rotateZ: 2 };
      case 'settle':
        return { x: -42, y: -28, scale: 0.98, rotateX: 9, rotateY: -10, rotateZ: -4 };
    }
  };

  const lensPose = getLensTransform();

  return (
    <div
      className="relative w-full select-none"
      role="region"
      aria-label="Interactive 3D illustration showing the PhishLens optical glass revealing a hidden sender mismatch and deceptive link inside an ordinary-looking message"
    >
      {/* Main 3D Stage Container */}
      <div
        onMouseEnter={() => setIsPointerInside(true)}
        onMouseLeave={() => setIsPointerInside(false)}
        className="relative w-full rounded-3xl bg-gradient-to-br from-[#FFFFFF] via-[#FFF6FA] to-[#FCE4EE]/65 border border-[#F0E7ED] shadow-[0_24px_60px_-18px_rgba(217,79,137,0.14),0_8px_24px_-8px_rgba(36,33,42,0.05)] overflow-hidden p-5 sm:p-7 lg:p-8"
      >
        {/* Subtle Architectural Studio Grid & Soft Radial Ambient Lighting (Decorative) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 72% 28%, rgba(252, 228, 238, 0.75) 0%, rgba(252, 228, 238, 0) 55%),
              radial-gradient(circle at 22% 78%, rgba(232, 121, 168, 0.14) 0%, rgba(232, 121, 168, 0) 50%),
              linear-gradient(to right, rgba(240, 231, 237, 0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(240, 231, 237, 0.45) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
          }}
        />

        {/* Top Stage Header Bar: Tagline & Status Indicator */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-4 sm:pb-5 border-b border-[#F0E7ED]/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#FFF1F6] border border-[#FCE4EE] text-[#D94F89]">
              <Eye className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold tracking-tight text-[#24212A]">
              See through the deception
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#716B76]">
            <span>
              {senderRevealed && linkRevealed
                ? 'Lens reveal: 2 hidden clues exposed'
                : senderRevealed
                  ? 'Lens scanning: Sender header'
                  : 'Surface view: Looks ordinary'}
            </span>
          </div>
        </div>

        {/* 3D Perspective Stage */}
        <div
          className="relative z-10 py-5 sm:py-7 flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? { rotateX: 5, rotateY: -6, y: 0 }
                : {
                    rotateX: [5, 7, 5],
                    rotateY: [-7, -4, -7],
                    y: [0, -5, 0],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full max-w-[540px]"
          >
            {/* Soft 3D Contact Shadow Platform Beneath the Message Card */}
            <div
              aria-hidden="true"
              style={{ transform: 'translateZ(-36px) translateY(18px) scale(0.95)' }}
              className="pointer-events-none absolute inset-0 rounded-3xl bg-[#D94F89]/10 blur-xl"
            />

            {/* Floating Background 3D Element 1: Translucent Envelope Card (Top-Left Depth Plane) */}
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? { y: 0, rotateZ: -4 }
                  : { y: [-3, 4, -3], rotateZ: [-4, -2, -4] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ transform: 'translateZ(-22px)' }}
              className="hidden sm:flex absolute -top-4 -left-4 z-0 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/85 border border-[#FCE4EE] shadow-sm backdrop-blur-xs"
            >
              <div className="w-7 h-7 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] flex items-center justify-center text-[#D94F89]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-semibold text-[#24212A]">Incoming Message</div>
                <div className="text-[#716B76]">Appears routine at first glance</div>
              </div>
            </motion.div>

            {/* Primary 3D Object: Fictional Message Card */}
            <div
              style={{ transform: 'translateZ(0px)' }}
              className="relative z-10 rounded-2xl bg-white border border-[#F0E7ED] shadow-[0_18px_40px_-15px_rgba(36,33,42,0.10),0_2px_10px_-2px_rgba(217,79,137,0.08)] p-4 sm:p-6 space-y-4"
            >
              {/* Card Window Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F0E7ED]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FCE4EE] border border-[#E879A8]/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFF1F6] border border-[#F0E7ED]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FCFAFC] border border-[#F0E7ED]" />
                  </div>
                  <span className="text-xs font-semibold text-[#24212A] ml-1">
                    Shared Workspace Notice
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#716B76]">Today · 09:42 AM</span>
              </div>

              {/* Clue Area 1: Sender Identity Row */}
              <div
                className={`relative rounded-xl p-3 sm:p-3.5 border transition-all duration-500 ${
                  senderRevealed
                    ? 'bg-[#FFF1F6]/90 border-[#D94F89] shadow-[0_8px_24px_-6px_rgba(217,79,137,0.18)]'
                    : 'bg-[#FCFAFC] border-[#F0E7ED]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#FCE4EE] text-[#D94F89] font-bold text-xs flex items-center justify-center shrink-0">
                      NC
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#24212A] truncate">
                        Northstar Cloud Docs
                      </div>
                      <div className="text-[11px] font-mono truncate">
                        {senderRevealed ? (
                          <span className="text-[#24212A]">
                            notice@
                            <span className="font-semibold text-[#D94F89] underline decoration-[#D94F89] decoration-wavy underline-offset-2">
                              northstar-verify-mail.example.net
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#716B76]">
                            notice@northstar-verify-mail.example.net
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revealed Annotation Tag (Icon + Text + Border, never color alone) */}
                  <div
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-500 ${
                      senderRevealed
                        ? 'bg-[#D94F89] text-white border-[#D94F89] opacity-100 translate-y-0'
                        : 'bg-white text-[#716B76] border-[#F0E7ED] opacity-75'
                    }`}
                  >
                    {senderRevealed ? (
                      <>
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Sender mismatch</span>
                      </>
                    ) : (
                      <span>From header</span>
                    )}
                  </div>
                </div>

                {/* Expanded Lens Insight for Sender */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    senderRevealed ? 'max-h-20 opacity-100 mt-2.5 pt-2 border-t border-[#FCE4EE]' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[11px] text-[#24212A] leading-snug">
                    <span className="font-semibold text-[#D94F89]">Clue 01:</span> Display name says{' '}
                    <span className="font-medium">“Northstar Cloud Docs”</span>, but the domain belongs to{' '}
                    <code className="font-mono text-[#D94F89]">northstar-verify-mail.example.net</code>.
                  </p>
                </div>
              </div>

              {/* Calm Fictional Message Line */}
              <div className="px-1 space-y-1">
                <div className="text-xs sm:text-sm font-semibold text-[#24212A]">
                  “Please confirm your sign-in to keep access to Q4_Team_Schedule.pdf”
                </div>
                <p className="text-xs text-[#716B76] leading-relaxed">
                  Your shared folder session expires in 30 minutes. Use the document link below to stay signed in.
                </p>
              </div>

              {/* Clue Area 2: Document Link / Action Row */}
              <div
                className={`relative rounded-xl p-3 sm:p-3.5 border transition-all duration-500 ${
                  linkRevealed
                    ? 'bg-[#FFF1F6]/95 border-[#D94F89] shadow-[0_8px_24px_-6px_rgba(217,79,137,0.18)]'
                    : 'bg-[#FCFAFC] border-[#F0E7ED]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#F0E7ED] flex items-center justify-center text-[#24212A] shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 text-[#D94F89]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#24212A] truncate">
                        Open Q4_Team_Schedule.pdf
                      </div>
                      <div className="text-[11px] font-mono truncate">
                        {linkRevealed ? (
                          <span className="text-[#24212A]">
                            https://northstar.example.com.
                            <span className="font-semibold text-[#D94F89] underline decoration-[#D94F89] decoration-wavy underline-offset-2">
                              auth-check-portal.example.net
                            </span>
                            /login
                          </span>
                        ) : (
                          <span className="text-[#716B76]">
                            https://northstar.example.com.auth-check-portal.example.net/...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-500 ${
                      linkRevealed
                        ? 'bg-[#24212A] text-white border-[#24212A]'
                        : 'bg-white text-[#716B76] border-[#F0E7ED]'
                    }`}
                  >
                    {linkRevealed ? (
                      <>
                        <Search className="w-3 h-3 text-[#E879A8] shrink-0" />
                        <span>Disguised link</span>
                      </>
                    ) : (
                      <span>Document link</span>
                    )}
                  </div>
                </div>

                {/* Expanded Lens Insight for Link */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    linkRevealed ? 'max-h-20 opacity-100 mt-2.5 pt-2 border-t border-[#FCE4EE]' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[11px] text-[#24212A] leading-snug">
                    <span className="font-semibold text-[#D94F89]">Clue 02:</span> The real website before the first slash is{' '}
                    <code className="font-mono text-[#D94F89]">auth-check-portal.example.net</code>, not Northstar.
                  </p>
                </div>
              </div>
            </div>

            {/* Translucent 3D Optical Glass Lens (Floats in Foreground Z-Plane Over the Card) */}
            <motion.div
              aria-hidden="true"
              animate={{
                x: lensPose.x,
                y: lensPose.y,
                scale: lensPose.scale,
                rotateX: lensPose.rotateX,
                rotateY: lensPose.rotateY,
                rotateZ: lensPose.rotateZ,
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 1.9,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              style={{
                transformStyle: 'preserve-3d',
                zIndex: 30,
              }}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {/* Soft Cast Shadow of the 3D Lens onto the Message Card */}
              <div
                style={{ transform: 'translateZ(-24px) translateY(22px)' }}
                className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-[#D94F89]/15 blur-xl"
              />

              {/* Sculpted 3D Acrylic / Glass Lens Assembly */}
              <div
                style={{ transform: 'translateZ(42px)' }}
                className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full flex items-center justify-center"
              >
                {/* Outer Metallic-Rose Bevel Ring */}
                <div
                  className="absolute inset-0 rounded-full border-[5px] border-white/90 shadow-[0_20px_50px_rgba(217,79,137,0.28),inset_0_2px_8px_rgba(255,255,255,0.95),0_0_0_2px_rgba(232,121,168,0.55)]"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.68) 0%, rgba(255,241,246,0.28) 48%, rgba(232,121,168,0.18) 85%, rgba(217,79,137,0.24) 100%)',
                    backdropFilter: 'blur(2px) saturate(1.15)',
                  }}
                />

                {/* Inner Precision Optical Reticle Ring */}
                <div className="absolute inset-3 rounded-full border border-[#D94F89]/40" />
                <div className="absolute inset-6 rounded-full border border-dashed border-white/80" />

                {/* Specular Glass Highlight Arc (Top-Left Refraction) */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <linearGradient id="phishlensGlassArc" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#FCE4EE" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#D94F89" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 38 95 A 62 62 0 0 1 142 46"
                    fill="none"
                    stroke="url(#phishlensGlassArc)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Subtle optical crosshair ticks */}
                  <line x1="100" y1="12" x2="100" y2="22" stroke="#D94F89" strokeWidth="2" strokeOpacity="0.55" />
                  <line x1="100" y1="178" x2="100" y2="188" stroke="#D94F89" strokeWidth="2" strokeOpacity="0.55" />
                  <line x1="12" y1="100" x2="22" y2="100" stroke="#D94F89" strokeWidth="2" strokeOpacity="0.55" />
                  <line x1="178" y1="100" x2="188" y2="100" stroke="#D94F89" strokeWidth="2" strokeOpacity="0.55" />
                </svg>

                {/* Lens Handle / Floating Optical Tag */}
                <div
                  style={{ transform: 'translateZ(12px)' }}
                  className="absolute -bottom-3 right-0 px-3 py-1 rounded-full bg-[#24212A] text-white text-[10px] font-semibold tracking-wide shadow-md flex items-center gap-1.5 border border-[#E879A8]/50 whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3 text-[#E879A8]" />
                  <span>PhishLens Optical Check</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Background 3D Element 2: Verification Summary Badge (Bottom-Right Depth Plane) */}
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? { y: 0 }
                  : { y: [3, -4, 3] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 5.8, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ transform: 'translateZ(26px)' }}
              className="hidden sm:flex absolute -bottom-4 right-3 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#FCE4EE] shadow-md text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D94F89] shrink-0" />
              <span className="font-semibold text-[#24212A]">
                Spot what ordinary interfaces hide
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Optional Accessible User Controls: Inspect Specific Clue or Pause Loop */}
        <div className="relative z-10 pt-4 border-t border-[#F0E7ED]/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#716B76]">
            Inspect a clue with the lens:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setLockedFocus((prev) => (prev === 'sender' ? 'none' : 'sender'))
              }
              aria-pressed={lockedFocus === 'sender'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89] ${
                lockedFocus === 'sender'
                  ? 'bg-[#D94F89] text-white'
                  : 'bg-white hover:bg-[#FFF1F6] text-[#24212A] border border-[#F0E7ED]'
              }`}
            >
              1. Sender Mismatch
            </button>

            <button
              type="button"
              onClick={() =>
                setLockedFocus((prev) => (prev === 'link' ? 'none' : 'link'))
              }
              aria-pressed={lockedFocus === 'link'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89] ${
                lockedFocus === 'link'
                  ? 'bg-[#D94F89] text-white'
                  : 'bg-white hover:bg-[#FFF1F6] text-[#24212A] border border-[#F0E7ED]'
              }`}
            >
              2. Disguised Link
            </button>

            {!prefersReducedMotion && (
              <button
                type="button"
                onClick={() =>
                  setLockedFocus((prev) => (prev === 'both' ? 'none' : 'both'))
                }
                aria-pressed={lockedFocus === 'both'}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#716B76] hover:text-[#24212A] bg-transparent hover:bg-white/80 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F89]"
              >
                {lockedFocus !== 'none' ? (
                  <>
                    <Play className="w-3 h-3 text-[#D94F89]" />
                    <span>Resume loop</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 text-[#716B76]" />
                    <span>Hold all clues</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
