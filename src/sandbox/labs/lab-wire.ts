import type { LabImage } from '../types.ts';
import { CONTACTS, CORVANE_DNS, CORVANE_WHOIS, DEFAULT_CALLS, PERSONA, distractorMail, dvTls, realLoginPage, ssoLogin } from './common.ts';

const EVIL = 'corvane-finance.co';

export const LAB_WIRE: LabImage = {
  id: 'lab-wire',
  version: '1.0.0',
  order: 1,
  codename: 'URGENT-WIRE',
  title: 'The Urgent Wire',
  tagline: 'Your CFO needs a vendor’s bank details changed before 3pm, and asks you not to call.',
  difficulty: 'Foundational',
  estimatedMinutes: 6,
  attackFamily: 'Business Email Compromise',
  relatedModuleSlug: 'email-phishing',
  persona: PERSONA,
  briefing: [
    'You are Sam, in Accounts Payable. Payment runs close at 15:00.',
    'An email marked as coming from the CFO has just arrived. Work out whether it is genuine before anyone moves money.',
    'You have Mail, a forensic Terminal, the company Directory and a Browser. Nothing you do can leave this container.',
  ],
  apps: ['mail', 'terminal', 'directory', 'browser', 'files'],
  startApp: 'mail',
  mail: [
    {
      id: 'mail-wire',
      folder: 'inbox',
      unread: true,
      suspicious: true,
      externalBanner: true,
      fromName: 'Dana Whitfield (CFO)',
      fromAddress: `dana.whitfield@${EVIL}`,
      replyTo: 'dwhitfield.exec@securemail-box.net',
      to: PERSONA.email,
      subject: 'Confidential: Lumen Logistics bank change before 3pm',
      date: 'Mon 13:47',
      preview: 'Sam, I need this handled discreetly today. I’m in back-to-back board sessions…',
      bodyHtml: `<p>Sam,</p>
<p>Lumen Logistics have moved banks after an audit, and their invoice <b>#LL-20931 (£48,250.00)</b> has to go out on today’s run or we lose the early-settlement terms.</p>
<p>The updated remittance details are attached. Please update the vendor record and confirm by reply once it’s scheduled. I’m in board sessions all afternoon, so <b>please don’t call. Email only.</b> Keep this between us until the audit is announced.</p>
<p>Thanks for being quick on this,<br/>Dana</p>
<p style="color:#888;font-size:12px">Dana Whitfield · Chief Financial Officer · Corvane<br/>Sent from my iPad</p>`,
      auth: { spf: 'pass', dkim: 'pass', dmarc: 'none' },
      rawHeaders: `Return-Path: <bounce@${EVIL}>
Received: from vps-4471.cheaphost.example (203.0.113.77) by mx1.corvane.io with ESMTP; Mon, 16 Nov 2026 13:47:09 +0000
Authentication-Results: mx1.corvane.io;
  spf=pass smtp.mailfrom=${EVIL};
  dkim=pass header.d=${EVIL} header.s=default;
  dmarc=none (no policy) header.from=${EVIL}
From: "Dana Whitfield (CFO)" <dana.whitfield@${EVIL}>
Reply-To: <dwhitfield.exec@securemail-box.net>
To: <sam.rivera@corvane.io>
Subject: Confidential: Lumen Logistics bank change before 3pm
X-Mailer: PHPMailer 6.8.1
Message-ID: <20261116134709.4471@vps-4471.cheaphost.example>`,
      attachments: [
        { id: 'att-remit', name: 'Lumen_Remittance_Update.pdf.html', size: '4 KB', savesTo: '/home/sam/Downloads/Lumen_Remittance_Update.pdf.html' },
      ],
    },
    ...distractorMail(),
  ],
  threads: [],
  files: [
    {
      path: '/home/sam/Downloads/Lumen_Remittance_Update.pdf.html',
      displayName: 'Lumen_Remittance_Update.pdf',
      kind: 'html',
      size: '4 KB',
      magic: 'HTML document, ASCII text',
      sha256: '5f1c0e9a77b3c2d4e8a1f60b9d2c7e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
      content: `<html><head><title>Secure Document</title></head>
<body onload="location='https://${EVIL}/docs/view?ref=LL-20931'">
<!-- "PDF" is a redirect to a sign-in page -->
</body></html>`,
      opensUrl: `https://${EVIL}/docs/view?ref=LL-20931`,
      hidden: true,
    },
  ],
  web: [
    {
      url: `https://${EVIL}/docs/view`,
      title: 'Corvane Secure Documents',
      html: ssoLogin({ title: 'Verify to view document', subtitle: 'This remittance file is protected. Sign in with your Corvane account to continue.', form: 'login', account: PERSONA.email }),
      tls: dvTls(EVIL, 2, [EVIL, `www.${EVIL}`]),
      headers: { server: 'nginx/1.18.0 (Ubuntu)', 'x-powered-by': 'PHP/7.4.3', 'set-cookie': 'PHPSESSID=8f2c…; path=/' },
      vaultHasLogin: false,
      forms: { login: { toast: 'Error: document expired. Please contact the sender.' } },
      sourceNotes: ['The form posts to /collect.php on the same lookalike host, not to Corvane Identity.'],
    },
    realLoginPage(),
  ],
  dns: {
    ...CORVANE_DNS,
    [EVIL]: { A: ['203.0.113.77'], MX: [`10 mail.${EVIL}.`], TXT: [`"v=spf1 ip4:203.0.113.77 -all"`], NS: ['ns1.parkdns.example.', 'ns2.parkdns.example.'] },
    'securemail-box.net': { A: ['192.0.2.144'], MX: ['10 mx.securemail-box.net.'] },
  },
  whois: {
    ...CORVANE_WHOIS,
    [EVIL]: `Domain Name: ${EVIL}
Registrar: QuickReg Online LLC
Creation Date: 2026-11-14T02:13:51Z   <-- registered 2 days ago
Registry Expiry Date: 2027-11-14T02:13:51Z
Registrant Organization: REDACTED FOR PRIVACY
Registrant Country: REDACTED
Name Server: ns1.parkdns.example`,
    'securemail-box.net': `Domain Name: securemail-box.net
Registrar: QuickReg Online LLC
Creation Date: 2025-06-30T11:02:10Z
Registrant Organization: REDACTED FOR PRIVACY
Notes: free anonymous mailbox provider`,
  },
  shortLinks: {},
  threatIntel: {
    [EVIL]: `SUSPICIOUS — newly registered domain (2 days) imitating corvane.io. 3 other organisations reported invoice-fraud lures from this sender today.`,
    'securemail-box.net': 'INFO — anonymous webmail provider. Commonly used as a Reply-To drop box in BEC campaigns.',
    'corvane.io': 'CLEAN — your organisation’s primary domain.',
  },
  contacts: CONTACTS,
  calls: {
    ...DEFAULT_CALLS,
    dana: [
      'Dana: Dana Whitfield.',
      'You: Hi Dana, it’s Sam from AP. Did you just ask me to change Lumen Logistics’ bank details?',
      'Dana: No, I didn’t. I’ve been in the board meeting, and I’d never ask for a bank change over email. Please don’t touch the vendor record. Report that message to Security.',
    ],
  },
  timeline: [
    {
      id: 'nudge',
      trigger: { afterSeconds: 75 },
      effect: {
        kind: 'mail',
        mail: {
          id: 'mail-wire-chase',
          folder: 'inbox',
          suspicious: true,
          externalBanner: true,
          fromName: 'Dana Whitfield (CFO)',
          fromAddress: `dana.whitfield@${EVIL}`,
          replyTo: 'dwhitfield.exec@securemail-box.net',
          to: PERSONA.email,
          subject: 'RE: Confidential: Lumen Logistics bank change before 3pm',
          date: 'Mon 13:58',
          preview: 'Any update? The board is asking.',
          bodyHtml: '<p>Any update? The board is asking. I need confirmation in the next 30 minutes.</p><p>D.</p>',
          auth: { spf: 'pass', dkim: 'pass', dmarc: 'none' },
          rawHeaders: `From: "Dana Whitfield (CFO)" <dana.whitfield@${EVIL}>\nReply-To: <dwhitfield.exec@securemail-box.net>\nReceived: from vps-4471.cheaphost.example (203.0.113.77)`,
        },
      },
    },
  ],
  objectives: [
    { id: 'sender', label: 'Find out which address the email really came from', hint: 'Click the sender’s name, or use Show original.', why: 'Display names are free text. Only the address after the @ tells you who sent the message.', points: 20, match: { type: 'mail_headers', where: { id: 'mail-wire' } } },
    { id: 'replyto', label: 'Spot where your reply would actually go', hint: 'Show original and look at Reply-To, or start a reply and read the To: line (without sending).', why: 'A Reply-To pointing at an outside mailbox means the attacker will read your answer, not the CFO.', points: 15, match: { type: 'mail_headers', where: { id: 'mail-wire', view: 'raw' } } },
    { id: 'whois', label: 'Check how old the sending domain is', hint: `In Terminal: whois ${EVIL}`, why: 'Lookalike domains are usually registered days before an attack. A real supplier’s or your own domain will be years old.', points: 20, match: { type: 'cmd', where: { name: 'whois', args: 'corvane-finance' } } },
    { id: 'callback', label: 'Check the request with Dana through a trusted channel', hint: 'Open Directory and call Dana on the number HR holds.', why: '“Don’t call” is how attackers stop you checking. A call to a number you already know beats any email.', points: 25, match: { type: 'call', where: { contactId: 'dana' } } },
    { id: 'report', label: 'Report the email to Security', hint: 'Select the email, then press Report phishing.', why: 'Reporting lets Security pull the same lure out of every inbox and block the domain.', points: 20, verdict: true, match: { type: 'report', where: { target: 'mail-wire' } } },
  ],
  traps: [
    { id: 'reply', label: 'You replied to the attacker', consequence: 'Your reply went to an anonymous outside mailbox. The attacker now knows you’ll act on it and will send the “new bank details” next.', penalty: 30, match: { type: 'mail_reply', where: { id: 'mail-wire' } } },
    { id: 'creds', label: 'You entered credentials on a lookalike site', consequence: `Your Corvane email and password were posted to ${EVIL}. In the real world the attacker would sign in to your mailbox within minutes.`, penalty: 45, match: { type: 'form_submit', where: { host: EVIL } } },
  ],
  debrief: {
    whatHappened: 'This was a classic Business Email Compromise (BEC) lure. A domain registered two days ago imitated Corvane, a Reply-To sent your answers to an anonymous mailbox, and the “PDF” was an HTML file that redirected to a credential-harvesting page.',
    redFlags: [
      `Sender domain ${EVIL}, not corvane.io`,
      'Reply-To pointed to securemail-box.net',
      'SPF and DKIM pass for the attacker’s own domain. Passing authentication does not make a sender trustworthy.',
      'Urgency, secrecy and “don’t call me”',
      'Double extension .pdf.html hidden by the client',
    ],
    rightMove: 'Never act on a payment change from email alone. Call the requester on a number you already hold, then report the message.',
    realWorld: 'BEC is one of the costliest kinds of cybercrime. Losses per incident are often six figures, and the money is rarely recovered once it has been sent.',
  },
};
