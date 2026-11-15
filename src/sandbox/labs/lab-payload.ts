import type { LabImage } from '../types.ts';
import { CONTACTS, CORVANE_DNS, CORVANE_WHOIS, DEFAULT_CALLS, PERSONA, distractorMail } from './common.ts';

const EXE_HASH = 'a3f9c2e17b4d58e0c6a1f3b9d7e2c4a8b0d6f1e3c5a7b9d2e4f6a8c0b1d3e5f7';
const DOC_HASH = '7c1e4b9a2d6f8e0c3a5b7d9f1e2c4a6b8d0f2e4c6a8b0d2f4e6a8c0b2d4f6e8a';

export const LAB_PAYLOAD: LabImage = {
  id: 'lab-payload',
  version: '1.0.0',
  order: 3,
  codename: 'DELIVERY-EXCEPTION',
  title: 'Delivery Exception',
  tagline: 'A courier says your parcel is stuck at customs. The label is attached.',
  difficulty: 'Intermediate',
  estimatedMinutes: 7,
  attackFamily: 'Malicious attachment',
  relatedModuleSlug: 'malware-basics',
  persona: PERSONA,
  briefing: [
    'A courier email carries two attachments: a shipping label and a customs invoice.',
    'Your file manager hides “known” file extensions, as many operating systems do by default.',
    'Use Files and the forensic Terminal (file, sha256sum, strings, intel) to find out what the attachments really are. If you detonate one, it only goes off inside this container.',
  ],
  apps: ['mail', 'files', 'terminal', 'directory'],
  startApp: 'mail',
  mail: [
    {
      id: 'mail-courier',
      folder: 'inbox',
      unread: true,
      suspicious: true,
      externalBanner: true,
      fromName: 'SwiftParcel Express',
      fromAddress: 'tracking@swiftparcel-notice.com',
      to: PERSONA.email,
      subject: 'Delivery exception #SP-8841: customs documents required',
      date: 'Wed 11:20',
      preview: 'Your shipment is on hold. Print the attached label and invoice within 48 hours…',
      bodyHtml: `<div style="font-family:system-ui"><div style="background:#ffcc00;padding:12px 16px;font-weight:800">SwiftParcel Express</div>
<p>Dear customer,</p><p>Your shipment <b>SP-8841</b> could not be delivered because customs documentation is missing.</p>
<p>Please open the attached <b>shipping label</b> and complete the <b>customs invoice</b> within <b>48 hours</b>, or the parcel will be returned to sender and a storage fee charged.</p>
<p style="color:#888;font-size:12px">This is an automated message. Please do not reply.</p></div>`,
      auth: { spf: 'pass', dkim: 'none', dmarc: 'none' },
      rawHeaders: `Return-Path: <tracking@swiftparcel-notice.com>
Received: from [192.0.2.61] (unknown) by mx1.corvane.io; Wed, 18 Nov 2026 11:20:18 +0000
Authentication-Results: mx1.corvane.io; spf=pass smtp.mailfrom=swiftparcel-notice.com; dkim=none; dmarc=none
From: SwiftParcel Express <tracking@swiftparcel-notice.com>
To: <sam.rivera@corvane.io>
Subject: Delivery exception #SP-8841: customs documents required
X-Attachment-Scan: skipped (password-less archive limit)`,
      attachments: [
        { id: 'att-label', name: 'Shipping_Label_8841.pdf.exe', size: '1.2 MB', savesTo: '/home/sam/Downloads/Shipping_Label_8841.pdf.exe' },
        { id: 'att-invoice', name: 'Customs_Invoice.docm', size: '88 KB', savesTo: '/home/sam/Downloads/Customs_Invoice.docm' },
      ],
    },
    ...distractorMail(),
  ],
  threads: [],
  files: [
    {
      path: '/home/sam/Downloads/Shipping_Label_8841.pdf.exe',
      displayName: 'Shipping_Label_8841.pdf',
      kind: 'executable',
      size: '1.2 MB',
      magic: 'PE32+ executable (GUI) x86-64, for MS Windows, icon resource: Adobe PDF lookalike',
      sha256: EXE_HASH,
      strings: [
        '!This program cannot be run in DOS mode.',
        '.text  .rdata  .rsrc',
        'CRYPTLOCK_TRAINING_SAMPLE_v3 // inert PhishLens specimen',
        'vssadmin delete shadows /all /quiet   (simulated string)',
        'hxxps://cdn-swiftparcel[.]top/stage2.bin',
        'YOUR FILES HAVE BEEN ENCRYPTED. Read RESTORE_FILES.txt',
        'bc1q-training-wallet-not-real',
      ],
      onOpen: {},
      hidden: true,
    },
    {
      path: '/home/sam/Downloads/Customs_Invoice.docm',
      displayName: 'Customs_Invoice',
      kind: 'macro_doc',
      size: '88 KB',
      magic: 'Microsoft Word 2007+ document with macros (VBA project present)',
      sha256: DOC_HASH,
      strings: [
        'word/vbaProject.bin',
        'Sub AutoOpen()',
        '  Shell "powershell -nop -w hidden -enc <PHISHLENS-TRAINING-REDACTED>"',
        'End Sub',
        'Please click “Enable Content” to view this protected invoice',
      ],
      content: `SWIFTPARCEL EXPRESS — CUSTOMS INVOICE

[ This document is protected. ]

To view its contents, click “Enable Content” above.
███████████████████████████████
███████████████████████████████`,
      onOpen: { requiresEnableContent: true },
      hidden: true,
    },
  ],
  web: [],
  dns: {
    ...CORVANE_DNS,
    'swiftparcel-notice.com': { A: ['192.0.2.61'], MX: [] },
    'swiftparcel.com': { A: ['198.51.100.90'], MX: ['10 mx.swiftparcel.com.'], TXT: ['"v=spf1 include:_spf.swiftparcel.com -all"'] },
  },
  whois: {
    ...CORVANE_WHOIS,
    'swiftparcel-notice.com': `Domain Name: swiftparcel-notice.com
Creation Date: 2026-11-17T19:03:22Z   <-- registered yesterday
Registrant Organization: REDACTED FOR PRIVACY`,
    'swiftparcel.com': `Domain Name: swiftparcel.com
Creation Date: 2009-05-12T00:00:00Z
Registrant Organization: SwiftParcel Express Ltd`,
  },
  shortLinks: {},
  threatIntel: {
    [EXE_HASH]: 'MALICIOUS (61/68 engines) — CryptLock ransomware loader. Disguises itself with a PDF icon and a double extension. Encrypts local files and network shares.',
    [DOC_HASH]: 'MALICIOUS (44/68 engines) — VBA downloader. AutoOpen macro starts hidden PowerShell to fetch a second stage.',
    'swiftparcel-notice.com': 'SUSPICIOUS — 1-day-old domain imitating swiftparcel.com. Linked to malspam campaigns.',
    'swiftparcel.com': 'CLEAN — the courier’s genuine domain.',
  },
  contacts: CONTACTS,
  calls: {
    ...DEFAULT_CALLS,
    'it-desk': ['IT Desk: Service Desk.', 'IT Desk: A courier asking you to open an .exe? Definitely not. Delete it, report the email, and if you opened anything, unplug from the network and call us straight back.'],
  },
  timeline: [],
  objectives: [
    { id: 'extensions', label: 'Reveal the files’ real extensions', hint: 'Save the attachments, then click Show file extensions in Files.', why: 'With extensions hidden, “Label.pdf.exe” shows up as “Label.pdf”. Attackers rely on that.', points: 20, match: { type: 'toggle_extensions', where: { visible: true } } },
    { id: 'magic', label: 'Identify what the “label” really is from its contents', hint: 'Terminal: file Shipping_Label_8841.pdf.exe', why: 'A file’s contents decide what it is, not its name or icon. This one is a Windows program.', points: 20, match: { type: 'cmd', where: { name: 'file', args: 'shipping' } } },
    { id: 'intel', label: 'Fingerprint an attachment and check it against threat intel', hint: 'sha256sum <file>, then intel <hash>', why: 'A hash identifies a file exactly. Checking it against intel feeds is how analysts confirm malware without running it.', points: 20, match: { type: 'cmd', where: { name: 'intel', args: 'a3f9c2' } } },
    { id: 'macro', label: 'Find the hidden macro inside the invoice', hint: 'strings Customs_Invoice.docm', why: 'An AutoOpen macro that starts hidden PowerShell is a textbook downloader.', points: 15, match: { type: 'cmd', where: { name: 'strings', args: 'customs' } } },
    { id: 'report', label: 'Report the courier email', hint: 'Mail → Report phishing.', why: 'Reporting gets the sender blocked and the attachment hash added to the mail filters.', points: 25, verdict: true, match: { type: 'report', where: { target: 'mail-courier' } } },
  ],
  traps: [
    { id: 'run-exe', label: 'You ran a ransomware loader', consequence: 'CryptLock started encrypting Downloads and the mapped finance share, and dropped RESTORE_FILES.txt with a ransom note. On a real laptop, unplug from the network immediately and call IT.', penalty: 50, match: { type: 'file_open', where: { kind: 'executable' } } },
    { id: 'macro-run', label: 'You enabled macros', consequence: 'The AutoOpen macro launched hidden PowerShell to download a second-stage payload. Enable Content is what attackers need you to click.', penalty: 40, match: { type: 'file_open', where: { kind: 'macro_doc', enabled: true } } },
  ],
  debrief: {
    whatHappened: 'Malspam delivered a ransomware loader disguised as a PDF (double extension plus a PDF icon), and a Word document whose macro downloads more malware. Neither needs an exploit. They only need you to open the file.',
    redFlags: [
      'Unexpected parcel from a domain registered yesterday',
      'Shipping_Label_8841.pdf.exe: a program pretending to be a document',
      '.docm with an AutoOpen macro and an “Enable Content” lure',
      'Deadline plus fee pressure',
    ],
    rightMove: 'Don’t open unexpected attachments. Check deliveries on the courier’s own site or app. Report the email, and if you did open something, disconnect and call IT at once.',
    realWorld: 'Email attachments remain a leading way ransomware gets in. Recovery often takes weeks even when backups exist.',
  },
};
