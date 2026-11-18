import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Archive, ArrowLeft, ArrowRight, Bell, ChevronDown, ChevronLeft, Clock, FileText, Flag, Forward, Hash, Inbox,
  Info, KeyRound, Lock, Mail, MoreHorizontal, Paperclip, Plus, RotateCw, ScanLine, Search, Send, Star, Trash2, X, Zap,
} from 'lucide-react';
import { ActionTarget, Hotspot, PhoneFrame, PhoneStatusBar, WindowDots, useRoom } from './RoomKit.tsx';
import { EASE_OUT_EXPO } from '../../components/motion.tsx';

/* =========================================================================
   Room 01 · Email client
   ========================================================================= */

const MAIL = [
  { id: 'phish', from: 'Northstar Security Operations', initials: 'NS', time: '09:14', subject: '[ACTION REQUIRED] Unverified Sign-In — Suspension in 2 Hours', snippet: 'Automated Security Notice: complete identity validation within 120 minutes…', unread: true },
  { id: 'elena', from: 'Elena Vance', initials: 'EV', time: 'Yesterday', subject: 'Notes from Tuesday sprint planning', snippet: 'Thanks everyone for reviewing the Q4 milestones. No action needed.', unread: false },
  { id: 'facilities', from: 'Workplace Facilities', initials: 'WF', time: 'Mon', subject: '3rd floor coffee machine filter replaced', snippet: 'Maintenance on the 3rd floor breakroom machine is complete.', unread: false },
];
const EMAIL_URL = 'https://northstar.example.com.session-check-auth.example.net/auth/verify?token=89f2a';

export function EmailArtifact() {
  const [selected, setSelected] = useState('phish');
  const [details, setDetails] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const msg = MAIL.find((m) => m.id === selected)!;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-[0_40px_80px_-40px_rgba(22,19,29,0.45)]">
      <div className="flex items-center gap-3 border-b border-line bg-[#f6f5f8] px-4 py-2.5">
        <WindowDots />
        <div className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-ink"><Mail className="h-3.5 w-3.5 text-[#2c4bd8]" /> Northstar Mail</div>
        <div className="mx-auto hidden w-full max-w-xs items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] text-muted sm:flex"><Search className="h-3 w-3" /> Search mail</div>
        <span className="hidden text-[11px] text-muted sm:block">alex.rivera@northstar.example.com</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[230px_1fr]">
        <div className="hidden border-r border-line bg-[#fbfafc] md:block">
          <div className="flex items-center justify-between px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span className="inline-flex items-center gap-1.5"><Inbox className="h-3.5 w-3.5" /> Inbox</span><span>3</span>
          </div>
          {MAIL.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setSelected(m.id); setDetails(false); }}
              className={`relative block w-full border-b border-line px-3 py-2.5 text-left transition-colors cursor-pointer ${selected === m.id ? 'bg-[#eef2ff]' : 'hover:bg-white'}`}
            >
              {selected === m.id && <span className="absolute inset-y-0 left-0 w-[3px] bg-[#2c4bd8]" />}
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate text-[12.5px] ${m.unread ? 'font-bold text-ink' : 'font-medium text-ink-soft'}`}>{m.from}</span>
                <span className="shrink-0 text-[10.5px] text-muted">{m.time}</span>
              </div>
              <div className={`truncate text-[12px] ${m.unread ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{m.subject}</div>
              <div className="truncate text-[11px] text-muted">{m.snippet}</div>
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2 text-[12px]">
            <ActionTarget action="act-reply-sender" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-ink-soft hover:bg-canvas"><ArrowLeft className="h-3.5 w-3.5" /> Reply</ActionTarget>
            <Hotspot as="button" decoy="Forwarding to a colleague just spreads the lure. Use Report instead." className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-ink-soft"><Forward className="h-3.5 w-3.5" /> Forward</Hotspot>
            <Hotspot as="button" decoy="Archiving hides it from you, but colleagues still have it." className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-ink-soft"><Archive className="h-3.5 w-3.5" /> Archive</Hotspot>
            <span className="mx-1 h-4 w-px bg-line" />
            <ActionTarget action="act-report-phish" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"><Flag className="h-3.5 w-3.5" /> Report phishing</ActionTarget>
            <Hotspot as="button" decoy="Deleting protects you, but doesn't warn the security team." className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 text-ink-soft"><Trash2 className="h-3.5 w-3.5" /></Hotspot>
          </div>

          <div className="min-h-[420px] flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            {selected !== 'phish' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{msg.subject}</h3>
                <div className="flex items-center gap-3 text-xs"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">{msg.initials}</span><div><div className="font-semibold text-ink">{msg.from}</div><div className="text-muted">to me · {msg.time}</div></div></div>
                <p className="text-sm leading-relaxed text-ink-soft">{msg.snippet}</p>
                <button type="button" onClick={() => setSelected('phish')} className="text-xs font-semibold text-[#2c4bd8] hover:underline cursor-pointer">← Back to the security notice</button>
              </div>
            ) : (
              <div className="space-y-5">
                <Hotspot as="div" clue="ev-1-urgency" className="block"><h3 className="text-lg font-semibold leading-snug">[ACTION REQUIRED] Unverified Sign-In — Suspension in 2 Hours</h3></Hotspot>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e0e7ff] text-xs font-bold text-[#2c4bd8]">NS</span>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <Hotspot clue="ev-1-sender" onActivate={() => setDetails(true)} className="inline-flex items-center gap-1 px-0.5 text-[13px] font-semibold text-ink">
                        Northstar Security Operations <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${details ? 'rotate-180' : ''}`} />
                      </Hotspot>
                      <Hotspot decoy="That's just when it arrived." className="px-0.5 text-muted">Today, 09:14</Hotspot>
                    </div>
                    <Hotspot decoy="That's your own address." className="px-0.5 text-muted">to me</Hotspot>
                    <AnimatePresence initial={false}>
                      {details && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE_OUT_EXPO }} className="overflow-hidden">
                          <dl className="mt-2 grid grid-cols-[72px_1fr] gap-x-3 gap-y-1.5 rounded-xl border border-line bg-canvas p-3 font-mono text-[11px]">
                            <dt className="text-muted">from</dt>
                            <dd><Hotspot clue="ev-1-sender" className="px-0.5 text-ink break-all">security-noreply@northstar-id-verify.example.com</Hotspot></dd>
                            <dt className="text-muted">reply-to</dt>
                            <dd><Hotspot clue="ev-1-replyto" className="px-0.5 text-ink break-all">support-ticket-882@external-mail-relay.example.net</Hotspot></dd>
                            <dt className="text-muted">to</dt>
                            <dd><Hotspot decoy="That's your real address." className="px-0.5 text-ink">alex.rivera@northstar.example.com</Hotspot></dd>
                            <dt className="text-muted">mailed-by</dt>
                            <dd><Hotspot clue="ev-1-sender" className="px-0.5 text-ink break-all">mailer4.northstar-id-verify.example.com</Hotspot></dd>
                          </dl>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3 text-[14px] leading-relaxed text-ink-soft">
                  <Hotspot as="div" decoy="Greeting you by email address is common in genuine and fake notices alike." className="block px-1">Automated Security Notice for alex.rivera@northstar.example.com:</Hotspot>
                  <Hotspot as="div" decoy="Technical-sounding jargon proves nothing either way. Check the evidence." className="block px-1">Our identity protection engine detected an unrecognized token synchronization attempt on your Northstar Workspace profile. As a precaution, outbound mail and shared drive permissions have been queued for suspension.</Hotspot>
                  <Hotspot as="div" clue="ev-1-urgency" className="block px-1">Failure to complete identity validation within <b className="text-ink">120 minutes</b> will trigger automatic account lock and permanent revocation of shared drive access.</Hotspot>
                  <Hotspot as="div" decoy="An instruction on its own isn't a clue. Where does the link go?" className="block px-1">Please validate your active browser session immediately using the secure verification link below:</Hotspot>
                </div>

                <div className="pt-1">
                  <Hotspot
                    as="span"
                    clue="ev-1-link"
                    actionWhenLensOff="act-click-link"
                    onHoverChange={(h) => setStatus(h ? EMAIL_URL : null)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2c4bd8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2340c0]"
                  >
                    Keep My Account Active <ArrowRight className="h-4 w-4" />
                  </Hotspot>
                </div>
                <Hotspot as="div" decoy="Footers are easy to copy from real emails." className="block border-t border-line px-1 pt-3 text-[11px] text-muted">Northstar Security Operations · This is an automated message, please do not reply.</Hotspot>
              </div>
            )}
          </div>
          <div className="h-6 truncate border-t border-line bg-[#f6f5f8] px-3 font-mono text-[10.5px] leading-6 text-muted">{status ?? ' '}</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Room 02 · Browser sign-in page
   ========================================================================= */

export function BrowserArtifact() {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  return (
    <div className="flex flex-col overflow-hidden rounded-[22px] border border-[#2a2433] bg-[#202124] shadow-[0_40px_80px_-40px_rgba(22,19,29,0.6)]">
      <div className="flex items-end gap-2 px-3 pt-2.5">
        <WindowDots tone="dark" />
        <div className="ml-3 flex max-w-[260px] items-center gap-2 rounded-t-xl bg-[#35363a] px-3 py-2 text-[11.5px] text-[#e8eaed]">
          <span className="h-3.5 w-3.5 rounded bg-gradient-to-br from-[#2c4bd8] to-[#7b3fe4]" />
          <span className="truncate">Sign in · Northstar Cloud Identity</span>
          <X className="ml-1 h-3 w-3 text-[#9aa0a6]" />
        </div>
        <Plus className="mb-2 h-3.5 w-3.5 text-[#9aa0a6]" />
      </div>
      <div className="flex items-center gap-2 bg-[#35363a] px-3 py-2">
        <ArrowLeft className="h-4 w-4 text-[#9aa0a6]" />
        <ArrowRight className="h-4 w-4 text-[#5f6368]" />
        <RotateCw className="h-3.5 w-3.5 text-[#9aa0a6]" />
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-[#202124] px-2 py-1.5">
          <Hotspot clue="ev-2-cert" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#9aa0a6] hover:bg-white/10"><Lock className="h-3.5 w-3.5" /></Hotspot>
          <Hotspot clue="ev-2-urlbar" onActivate={() => setExpanded(true)} className="min-w-0 flex-1 truncate px-1 font-mono text-[12px] text-[#e8eaed]">
            {expanded ? (
              <span className="whitespace-normal break-all">
                <span className="text-[#9aa0a6]">https://sso-northstar-cloud.</span>
                <span className="rounded bg-amber-400/20 px-0.5 font-semibold text-amber-300">auth-gateway-verify.example.net</span>
                <span className="text-[#9aa0a6]">/login?redirect=roadmap_q4</span>
              </span>
            ) : (
              <span><span>sso-northstar-cloud.auth-gateway-verify.example.net</span><span className="text-[#9aa0a6]">/login?redirect=roadmap_q4</span></span>
            )}
          </Hotspot>
          <Hotspot clue="ev-2-urlbar" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#9aa0a6] hover:bg-white/10"><KeyRound className="h-3.5 w-3.5" /></Hotspot>
          <Hotspot decoy="Bookmarking doesn't make a page legitimate." className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#9aa0a6] hover:bg-white/10"><Star className="h-3.5 w-3.5" /></Hotspot>
        </div>
      </div>

      <div className="relative bg-[#f3f4f7] px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[380px] rounded-2xl border border-[#e4e5ea] bg-white p-7 shadow-[0_10px_30px_rgba(20,20,40,0.06)]">
          <Hotspot as="div" decoy="Logos and colours take seconds to copy." className="mb-4 flex items-center gap-2 px-1 text-sm font-bold text-[#1f1d24]"><span className="h-6 w-6 rounded-md bg-gradient-to-br from-[#2c4bd8] to-[#7b3fe4]" /> Northstar Cloud Identity</Hotspot>
          <Hotspot as="div" decoy="A believable document name is the lure, not the evidence." className="block px-1">
            <div className="text-[19px] font-bold leading-snug text-[#1f1d24]">Sign in to open “Q4_Product_Roadmap.pdf”</div>
          </Hotspot>
          <Hotspot as="div" decoy="Phishing kits pre-fill your email from the link to feel personal." className="mt-2 inline-flex rounded-full border border-[#e4e5ea] bg-[#f8f8fb] px-2.5 py-1 text-[11.5px] text-[#55525c]">alex.rivera@northstar.example.com</Hotspot>
          <Hotspot as="div" clue="ev-2-form" className="mt-5 block space-y-3 p-1">
            <label className="block text-[12px] font-semibold text-[#3b3842]">Password
              <span className="mt-1 block rounded-lg border border-[#cfd0d8] bg-white px-3 py-2.5 font-mono text-[13px] tracking-widest text-[#8a8792]">••••••••••</span>
            </label>
            <label className="block text-[12px] font-semibold text-[#3b3842]">6-digit authenticator code
              <span className="mt-1 block rounded-lg border border-[#cfd0d8] bg-white px-3 py-2.5 font-mono text-[13px] text-[#b2afb9]">— — — — — —</span>
            </label>
          </Hotspot>
          <ActionTarget action="act-submit-login" className="mt-5 block w-full rounded-lg bg-[#2c4bd8] py-3 text-sm font-bold text-white hover:bg-[#2340c0]">Continue sign-in</ActionTarget>
          <div className="mt-4 flex items-center justify-center gap-3 text-[11.5px]">
            {['Privacy', 'Help', 'Terms'].map((l) => (
              <Hotspot key={l} clue="ev-2-footer" onHoverChange={(h) => setStatus(h ? 'https://sso-northstar-cloud.auth-gateway-verify.example.net/login#none' : null)} className="px-1 text-[#2c4bd8] underline-offset-2 hover:underline">{l}</Hotspot>
            ))}
          </div>
        </div>
        {status && <div className="absolute bottom-0 left-0 max-w-full truncate rounded-tr-md bg-[#35363a] px-2 py-0.5 font-mono text-[10.5px] text-[#e8eaed]">{status}</div>}
      </div>
    </div>
  );
}

/* =========================================================================
   Room 03 · SMS on a phone
   ========================================================================= */

export function SmsArtifact() {
  const [preview, setPreview] = useState(false);
  return (
    <div className="flex justify-center py-2">
      <PhoneFrame>
        <div className="bg-[#f7f7f9]">
          <PhoneStatusBar />
          <div className="flex items-center gap-2 border-b border-black/5 bg-[#f7f7f9]/95 px-3 pb-3 pt-2">
            <ChevronLeft className="h-6 w-6 text-[#0a84ff]" />
            <div className="flex flex-1 flex-col items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-[#a8adb7] to-[#868b95] text-sm font-semibold text-white">?</span>
              <Hotspot clue="ev-3-number" className="mt-1 px-1 text-[12px] font-medium text-black">+1 (555) 017-8392 ›</Hotspot>
            </div>
            <Info className="h-5 w-5 text-[#0a84ff]" />
          </div>
          <div className="flex items-center justify-between gap-2 bg-white px-4 py-2.5 text-[11.5px] text-[#6b6b70]">
            <span>This sender is not in your contact list.</span>
            <ActionTarget action="act-check-carrier-app" className="shrink-0 font-semibold text-[#0a84ff]">Report Junk</ActionTarget>
          </div>

          <div className="min-h-[430px] space-y-2 px-3 py-4">
            <Hotspot as="div" decoy="Just the delivery time." className="mx-auto block w-fit px-1 text-center text-[10.5px] font-medium text-[#8e8e93]">Text Message · Today 1:42 PM</Hotspot>
            <div className="max-w-[86%] rounded-[20px] rounded-bl-[6px] bg-[#e9e9eb] px-3.5 py-2.5 text-[14px] leading-snug text-black">
              <Hotspot decoy="A brand name costs nothing to type into a text." className="px-0.5 font-semibold">SwiftPost Express:</Hotspot>{' '}
              <Hotspot decoy="Failed deliveries happen. The story isn't the evidence." className="px-0.5">Delivery attempt #2 failed for parcel SP-904182 due to unreadable street label.</Hotspot>{' '}
              <Hotspot clue="ev-3-fee" className="px-0.5">Please confirm delivery address and settle <b>$1.85</b> re-dispatch handling before 5:00 PM today</Hotspot>{' '}
              <span>or item returns to warehouse: </span>
              <Hotspot clue="ev-3-url" actionWhenLensOff="act-tap-sms-link" onActivate={() => setPreview(true)} className="break-all px-0.5 text-[#0a84ff] underline">https://swiftpost-parcel-redelivery.example.org/claim-id-492</Hotspot>
            </div>
            <AnimatePresence>
              {preview && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-w-[86%] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                  <div className="h-14 bg-gradient-to-br from-amber-100 to-rose-100" />
                  <div className="px-3 py-2">
                    <div className="text-[12px] font-semibold text-black">Parcel redelivery</div>
                    <div className="font-mono text-[10.5px] text-[#8e8e93]">swiftpost-parcel-redelivery.example.org</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 border-t border-black/5 bg-[#f7f7f9] px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e5e5ea] text-[#8e8e93]"><Plus className="h-4 w-4" /></span>
            <ActionTarget action="act-reply-stop" className="flex-1 rounded-full border border-[#d1d1d6] bg-white px-3.5 py-1.5 text-left text-[13px] text-[#8e8e93]">Text Message</ActionTarget>
          </div>
          <div className="flex justify-center pb-2 pt-1"><span className="h-1 w-28 rounded-full bg-black/80" /></div>
        </div>
      </PhoneFrame>
    </div>
  );
}

/* =========================================================================
   Room 04 · QR poster + phone camera
   ========================================================================= */

const QR_URL = 'wifi-cert-portal.device-enroll-auth.example.net';

function QrGlyph({ className = '' }: { className?: string }) {
  const cells = [
    '1111111010101111111', '1000001001101000001', '1011101011001011101', '1011101000101011101', '1011101010011011101', '1000001001101000001',
    '1111111010101111111', '0000000011100000000', '1101011100111010010', '0110100111001101101', '1011011010110010110', '0100110101011101001',
    '1110101011100110110', '0000000010010101001', '1111111001101110101', '1000001011010101110', '1011101010111010011', '1000001001001101101', '1111111011010110110',
  ];
  return (
    <svg viewBox="0 0 19 19" className={className} shapeRendering="crispEdges" aria-label="QR code">
      <rect width="19" height="19" fill="#fff" />
      {cells.flatMap((row, y) => [...row].map((c, x) => (c === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#16131d" /> : null)))}
    </svg>
  );
}

export function QrArtifact() {
  const reduce = useReducedMotion();
  const [scan, setScan] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <div className="grid items-center gap-6 rounded-[22px] border border-line bg-[radial-gradient(ellipse_at_top,#f4efe7,#e8e1d6)] p-5 sm:p-8 md:grid-cols-[1.1fr_1fr]">
      <div className="mx-auto w-full max-w-[340px] rotate-[-1.5deg] rounded-sm bg-white p-6 shadow-[0_20px_40px_-20px_rgba(60,40,20,0.5)]">
        <Hotspot as="div" decoy="Anyone can print a company name on a notice." className="block px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2c4bd8]">Northstar IT · Staff notice</Hotspot>
        <Hotspot as="div" decoy="A convincing headline is the lure itself." className="mt-2 block px-1 text-[19px] font-extrabold leading-tight text-ink">Mandatory Staff Wi-Fi Certificate Renewal</Hotspot>
        <Hotspot as="div" decoy="Network upgrades really happen. Check how you're asked to act." className="mt-2 block px-1 text-[12.5px] leading-relaxed text-ink-soft">To prevent wireless disconnection during today’s network upgrade, renew your device certificate before 17:00.</Hotspot>
        <div className="my-4 flex justify-center">
          <Hotspot as="div" decoy="You can't read a QR code by eye. Scan it with the phone camera to see where it goes." className="p-1.5"><QrGlyph className="h-32 w-32" /></Hotspot>
        </div>
        <ol className="space-y-1.5 text-[12px] text-ink-soft">
          <li><Hotspot decoy="Scanning only reveals the address. It's opening it that matters." className="px-1"><b>1.</b> Scan the code with your phone camera.</Hotspot></li>
          <li><Hotspot clue="ev-4-channelshift" className="px-1"><b>2.</b> Do not use your laptop browser. Use your personal smartphone and sign in with your Northstar password.</Hotspot></li>
        </ol>
        <Hotspot as="div" clue="ev-4-physical" className="mt-4 block border-t border-dashed border-line-strong px-1 pt-3 text-[10.5px] text-muted">— Network Operations Team · Questions? Reply to the email this notice came with.</Hotspot>
      </div>

      <PhoneFrame className="max-w-[260px]">
        <div className="relative h-[460px] bg-black">
          <div className="absolute inset-x-0 top-0 z-10"><PhoneStatusBar dark time="10:07" /></div>
          <div className="absolute inset-0 grid place-items-center">
            <div className={`transition-all duration-700 ${scan === 'idle' ? 'scale-90 opacity-60 blur-[1.5px]' : 'scale-100 opacity-90 blur-0'}`}>
              <div className="rotate-[-1.5deg] rounded-sm bg-white p-2"><QrGlyph className="h-28 w-28" /></div>
            </div>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2" aria-hidden>
            {['left-0 top-0 border-l-4 border-t-4 rounded-tl-xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-xl'].map((c) => (
              <span key={c} className={`absolute h-7 w-7 border-[#febc2e] ${c}`} />
            ))}
            {scan === 'scanning' && !reduce && (
              <motion.span className="absolute inset-x-2 h-0.5 bg-[#febc2e] shadow-[0_0_12px_#febc2e]" initial={{ top: '8%' }} animate={{ top: ['8%', '92%', '8%'] }} transition={{ duration: 1.1, ease: 'easeInOut' }} />
            )}
          </div>
          <div className="absolute inset-x-0 top-12 z-10 flex justify-center px-3">
            <AnimatePresence>
              {scan === 'done' && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}>
                  <Hotspot clue="ev-4-qrdecode" actionWhenLensOff="act-scan-open-url" className="flex max-w-[210px] items-center gap-1.5 rounded-full bg-[#febc2e] px-3 py-1.5 text-[11px] font-semibold text-black">
                    <span ref={setAnchor as React.Ref<HTMLSpanElement>} className="truncate">{QR_URL}</span>
                  </Hotspot>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#febc2e]">{scan === 'done' ? 'QR code detected' : scan === 'scanning' ? 'Scanning…' : 'Photo'}</span>
            <ScanButton
              disabled={scan !== 'idle'}
              onScan={() => {
                setScan('scanning');
                window.setTimeout(() => setScan('done'), reduce ? 0 : 1100);
              }}
            />
          </div>
          <QrAutoInspect active={scan === 'done'} anchor={anchor} />
        </div>
      </PhoneFrame>
    </div>
  );
}

function ScanButton({ onScan, disabled }: { onScan: () => void; disabled: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onScan} aria-label="Scan QR code" className="grid h-14 w-14 place-items-center rounded-full border-4 border-white/90 bg-white/20 transition-transform enabled:hover:scale-105 enabled:cursor-pointer disabled:opacity-60">
      <ScanLine className="h-5 w-5 text-white" />
    </button>
  );
}

/** When the camera decodes the code, log the destination as a clue automatically. */
function QrAutoInspect({ active, anchor }: { active: boolean; anchor: HTMLElement | null }) {
  const [done, setDone] = useState(false);
  const room = useRoom();
  useEffect(() => {
    if (active && anchor && !done) {
      setDone(true);
      room.inspect('ev-4-qrdecode', anchor);
    }
  }, [active, anchor, done, room]);
  return null;
}


/* =========================================================================
   Room 05 · Workplace chat
   ========================================================================= */

export function ChatArtifact() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(reduce ? 3 : 0);
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    if (reduce) return;
    const ts = [setTimeout(() => setStage(1), 500), setTimeout(() => setStage(2), 1900), setTimeout(() => setStage(3), 3400)];
    return () => ts.forEach(clearTimeout);
  }, [reduce]);
  useEffect(() => {
    if (stage < 3) return;
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  return (
    <div className="relative flex min-h-[600px] overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_40px_80px_-40px_rgba(22,19,29,0.45)]">
      <div className="hidden w-[190px] shrink-0 flex-col bg-[#3f0e40] text-[#cfc3cf] sm:flex">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3 text-[13px] font-bold text-white"><WindowDots /> <span className="ml-1">Northstar</span></div>
        <div className="space-y-0.5 px-2 py-3 text-[12.5px]">
          {['general', 'product-ops', 'random'].map((c) => <div key={c} className="flex items-center gap-1.5 rounded px-2 py-1"><Hash className="h-3.5 w-3.5" /> {c}</div>)}
          <div className="px-2 pb-1 pt-4 text-[10.5px] font-semibold uppercase tracking-wider text-[#a48ea5]">Direct messages</div>
          <div className="flex items-center gap-2 rounded px-2 py-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Elena Vance</div>
          <div className="flex items-center gap-2 rounded bg-[#1164a3] px-2 py-1 font-semibold text-white"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Marcus Chen</div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8912d] text-xs font-bold text-white">MC</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-bold text-ink">Marcus Chen</span>
              <Hotspot clue="ev-5-pretext" className="rounded-md border border-amber-300 bg-amber-50 px-1.5 py-px text-[10.5px] font-semibold text-amber-800">External</Hotspot>
            </div>
            <Hotspot decoy="Anyone can type a job title into their profile." className="px-0.5 text-[11.5px] text-muted">IT Security Desk</Hotspot>
          </div>
          <ActionTarget action="act-refuse-verify-independent" className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11.5px] font-semibold text-rose-700 hover:bg-rose-50 sm:inline-flex" title="Block and report"><Flag className="h-3.5 w-3.5" /> Block &amp; report</ActionTarget>
          <MoreHorizontal className="h-4 w-4 text-muted" />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {stage >= 1 && (
            <ChatMsg time="4:51 PM">
              <Hotspot decoy="Greetings are not evidence." className="px-0.5">Hi Alex —</Hotspot>{' '}
              <span>contacting you urgently from IT Security per </span>
              <Hotspot clue="ev-5-pretext" className="px-0.5 font-semibold">Elena Vance’s Product Ops team list</Hotspot>{' '}
              <Hotspot decoy="Ticket numbers are trivial to invent, but on their own they aren't the giveaway." className="px-0.5">(Ticket #INC-9921)</Hotspot>.{' '}
              <span>We see an unauthorized login trying to copy files from your workspace.</span>
            </ChatMsg>
          )}
          {stage >= 2 && (
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE_OUT_EXPO }} className="flex justify-end">
              <Hotspot as="div" clue="ev-5-otptrigger" className="block w-full max-w-[300px] rounded-2xl border border-black/5 bg-[#f5f5f7] p-3 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between text-[10.5px] text-muted"><span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider"><Bell className="h-3 w-3" /> Your phone · Messages</span><span>4:52 PM</span></div>
                <div className="mt-1 text-[12.5px] font-semibold text-ink">Northstar Login</div>
                <div className="text-[12px] leading-snug text-ink-soft">Your one-time verification code was just requested. Never share this code with anyone, including support.</div>
              </Hotspot>
            </motion.div>
          )}
          {stage === 2 && <Typing />}
          {stage >= 3 && (
            <ChatMsg time="4:52 PM">
              <span>I just sent a 6-digit security cancellation code to your phone. </span>
              <Hotspot clue="ev-5-otpask" className="px-0.5 font-semibold">Type that 6-digit code here in the next 60 seconds</Hotspot>
              <span> so I can block the intruder and protect your account.</span>
              <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"><Clock className="h-3 w-3" /> 0:{String(seconds).padStart(2, '0')} remaining</span>
            </ChatMsg>
          )}
        </div>

        <div className="border-t border-line px-4 pb-4 pt-3">
          {stage >= 3 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              <ActionTarget action="act-share-otp" className="rounded-full border border-line px-3 py-1 text-[11.5px] text-ink-soft hover:border-brand-soft hover:bg-blush">“Here’s the code: ••••••”</ActionTarget>
              <ActionTarget action="act-ask-badge-id" className="rounded-full border border-line px-3 py-1 text-[11.5px] text-ink-soft hover:border-brand-soft hover:bg-blush">“What’s your employee ID?”</ActionTarget>
              <ActionTarget action="act-refuse-close" className="rounded-full border border-line px-3 py-1 text-[11.5px] text-ink-soft hover:border-brand-soft hover:bg-blush">“I won’t share that.” (close chat)</ActionTarget>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-[13px] text-muted">
            <Zap className="h-4 w-4" /> <span className="flex-1">Message Marcus Chen</span> <Paperclip className="h-4 w-4" /> <Send className="h-4 w-4" />
          </div>
        </div>
      </div>

    </div>
  );
}

function ChatMsg({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT_EXPO }} className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e8912d] text-xs font-bold text-white">MC</span>
      <div className="min-w-0">
        <div className="text-[13px]"><span className="font-bold text-ink">Marcus Chen</span> <span className="ml-1 text-[11px] text-muted">{time}</span></div>
        <div className="text-[14px] leading-relaxed text-ink-soft">{children}</div>
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2 pl-12 text-[11.5px] text-muted">
      <span className="flex gap-1">{[0, 1, 2].map((i) => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />)}</span>
      Marcus Chen is typing…
    </div>
  );
}

export const ARTIFACTS: Record<string, { component: React.ComponentType; chrome: string; icon: React.ComponentType<{ className?: string }> }> = {
  'sim-1': { component: EmailArtifact, chrome: 'Mail client', icon: Mail },
  'sim-2': { component: BrowserArtifact, chrome: 'Web browser', icon: FileText },
  'sim-3': { component: SmsArtifact, chrome: 'Phone · Messages', icon: Mail },
  'sim-4': { component: QrArtifact, chrome: 'Poster + phone camera', icon: ScanLine },
  'sim-5': { component: ChatArtifact, chrome: 'Workplace chat', icon: Mail },
};
