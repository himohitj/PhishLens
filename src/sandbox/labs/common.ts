import type { Contact, MailMessage, TlsInfo, WebPage } from '../types.ts';

/**
 * Every lab takes place at Corvane, a fictional company. All domains, people,
 * phone numbers (Ofcom drama range) and IPs (RFC 5737 TEST-NET) are invented,
 * and the container cannot reach the real internet anyway.
 */
export const ORG = {
  name: 'Corvane',
  domain: 'corvane.io',
};

export const PERSONA = {
  name: 'Sam Rivera',
  role: 'Accounts Payable Specialist',
  email: 'sam.rivera@corvane.io',
  hostname: 'corv-lt-0417',
};

export const CONTACTS: Contact[] = [
  { id: 'dana', name: 'Dana Whitfield', role: 'Chief Financial Officer', phone: '+44 20 7946 0102', email: 'dana.whitfield@corvane.io', verified: true },
  { id: 'it-desk', name: 'IT Service Desk', role: 'Internal IT support (24/7)', phone: '+44 20 7946 0999', email: 'servicedesk@corvane.io', verified: true },
  { id: 'security', name: 'Security Operations', role: 'Report incidents here', phone: '+44 20 7946 0911', email: 'security@corvane.io', verified: true },
  { id: 'priya', name: 'Priya Natarajan', role: 'People & Culture Lead', phone: '+44 20 7946 0230', email: 'priya.natarajan@corvane.io', verified: true },
  { id: 'marco', name: 'Marco Bellini', role: 'Procurement Manager', phone: '+44 20 7946 0177', email: 'marco.bellini@corvane.io', verified: true },
];

export const DEFAULT_CALLS: Record<string, string[]> = {
  security: [
    'Security Ops: Security Operations, this is Jordan.',
    'Security Ops: Thanks for calling it in. Use the Report button on the message too, so we get the full headers and can pull copies from other inboxes.',
  ],
  marco: ['Marco: Hi Sam! Nothing urgent from my side today. Why?'],
  priya: ['Priya: Hey Sam, I haven’t shared anything with you this week. What did you get?'],
};

export function legitTls(host: string, ageDays = 211): TlsInfo {
  return {
    subject: host,
    issuer: 'DigiTrust Global TLS RSA CA 2024',
    validFrom: 'Apr 18 2026',
    validTo: 'Apr 18 2027',
    ageDays,
    san: [host, `*.${ORG.domain}`],
    organization: 'Corvane Ltd (GB)',
  };
}

export function dvTls(host: string, ageDays: number, san: string[]): TlsInfo {
  return {
    subject: host,
    issuer: 'OpenCert DV R11 (free, automated)',
    validFrom: ageDays <= 1 ? 'Nov 14 2026' : 'Nov 11 2026',
    validTo: 'Feb 12 2027',
    ageDays,
    san,
  };
}

const passAuth = { spf: 'pass', dkim: 'pass', dmarc: 'pass' } as const;

export function internalHeaders(fromName: string, from: string, subject: string, date: string): string {
  return `Return-Path: <${from}>
Received: from mail-int-02.corvane.io (10.20.4.12) by mx1.corvane.io with ESMTPS; ${date}
Authentication-Results: mx1.corvane.io;
  spf=pass smtp.mailfrom=corvane.io;
  dkim=pass header.d=corvane.io header.s=sel2026;
  dmarc=pass (p=reject) header.from=corvane.io
From: ${fromName} <${from}>
To: Sam Rivera <sam.rivera@corvane.io>
Subject: ${subject}
Date: ${date}
Message-ID: <${Math.abs(hash(subject)).toString(16)}@corvane.io>`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Ordinary internal mail that makes each inbox feel lived-in. */
export function distractorMail(): MailMessage[] {
  return [
    {
      id: 'mail-townhall',
      folder: 'inbox',
      fromName: 'Internal Comms',
      fromAddress: 'comms@corvane.io',
      to: PERSONA.email,
      subject: 'Reminder: Q4 town hall on Thursday',
      date: 'Mon 08:12',
      preview: 'Join us in the atrium or on the stream. Agenda inside.',
      bodyHtml:
        '<p>Hi all,</p><p>A reminder that the Q4 town hall is on <b>Thursday at 16:00</b> in the atrium. The stream link will be on the intranet homepage.</p><p>— Internal Comms</p>',
      auth: passAuth,
      rawHeaders: internalHeaders('Internal Comms', 'comms@corvane.io', 'Reminder: Q4 town hall on Thursday', 'Mon, 16 Nov 2026 08:12:40 +0000'),
    },
    {
      id: 'mail-it-news',
      folder: 'inbox',
      fromName: 'IT Service Desk',
      fromAddress: 'servicedesk@corvane.io',
      to: PERSONA.email,
      subject: 'How to spot a phish (and the one button to press)',
      date: 'Fri 14:30',
      preview: 'IT will never ask for your password or MFA code. Use Report phishing.',
      bodyHtml:
        '<p>Quick reminder from IT:</p><ul><li>We will <b>never</b> ask for your password or an MFA code, by email, chat or phone.</li><li>If something feels off, use <b>Report phishing</b> in Mail. It sends us the full headers.</li><li>To check a request, call the number in the <b>Directory</b> app, not one from the message.</li></ul><p>Thanks — IT Service Desk</p>',
      auth: passAuth,
      rawHeaders: internalHeaders('IT Service Desk', 'servicedesk@corvane.io', 'How to spot a phish', 'Fri, 13 Nov 2026 14:30:02 +0000'),
    },
  ];
}

/* --------------------------- page templates --------------------------- */

const PAGE_CSS = `<style>
.pgw{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1f1d24;min-height:100%;background:#f3f4f7;display:flex;flex-direction:column}
.pgw *{box-sizing:border-box}
.pgw .bar{background:#fff;border-bottom:1px solid #e4e5ea;padding:12px 22px;display:flex;align-items:center;gap:10px;font-weight:700}
.pgw .logo{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#2c4bd8,#7b3fe4);display:inline-block}
.pgw .center{flex:1;display:flex;align-items:center;justify-content:center;padding:28px 16px}
.pgw .card{width:100%;max-width:380px;background:#fff;border:1px solid #e4e5ea;border-radius:14px;padding:26px;box-shadow:0 10px 30px rgba(20,20,40,.06)}
.pgw h1{font-size:21px;margin:0 0 6px}
.pgw p{margin:0 0 12px;color:#55525c;font-size:13.5px;line-height:1.5}
.pgw label{display:block;font-size:12px;font-weight:600;margin:10px 0 4px;color:#3b3842}
.pgw input{width:100%;padding:10px 12px;border:1px solid #cfd0d8;border-radius:8px;font-size:14px;background:#fff;color:#1f1d24}
.pgw .btn{width:100%;margin-top:16px;padding:11px;border:0;border-radius:8px;background:#2c4bd8;color:#fff;font-weight:700;font-size:14px;cursor:pointer;display:block}
.pgw .btn.alt{background:#fff;color:#2c4bd8;border:1px solid #cfd0d8}
.pgw .btn.red{background:#c9283e}
.pgw .fine{font-size:11.5px;color:#8a8792;margin-top:14px}
.pgw a{color:#2c4bd8}
.pgw .perm{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #eee;font-size:13px}
.pgw .perm b{display:block}
.pgw .pill{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;background:#fff3d6;color:#7a5600;font-weight:600}
.pgw .row{display:flex;gap:8px}
.pgw .row .btn{flex:1}
.pgw .muted{color:#8a8792}
.pgw .hero{background:#ffcc00;color:#222;padding:22px;font-weight:800;font-size:20px}
</style>`;

export function page(body: string, brand = 'Corvane'): string {
  return `${PAGE_CSS}<div class="pgw"><div class="bar"><span class="logo"></span>${brand}</div><div class="center">${body}</div></div>`;
}

export function ssoLogin(opts: { title: string; subtitle: string; form?: string; account?: string }): string {
  return page(
    `<div class="card" data-pl-form="${opts.form ?? 'login'}">
      <h1>${opts.title}</h1>
      <p>${opts.subtitle}</p>
      <label for="u">Work email</label>
      <input id="u" name="email" value="${opts.account ?? ''}" autocomplete="off" />
      <label for="p">Password</label>
      <input id="p" name="password" type="password" autocomplete="off" placeholder="Don’t use a real password" />
      <button type="button" class="btn" data-pl-submit>Sign in</button>
      <p class="fine">Protected by Corvane Identity · <a href="https://login.corvane.io/help">Can’t access your account?</a></p>
    </div>`,
    'Corvane Identity'
  );
}


export function realLoginPage(): WebPage {
  return {
    url: 'https://login.corvane.io/',
    title: 'Sign in · Corvane Identity',
    html: ssoLogin({ title: 'Sign in', subtitle: 'Use your Corvane account.', form: 'real-login', account: PERSONA.email }),
    tls: legitTls('login.corvane.io'),
    headers: { server: 'corvane-idp', 'strict-transport-security': 'max-age=63072000; includeSubDomains; preload', 'x-frame-options': 'DENY' },
    vaultHasLogin: true,
    forms: { 'real-login': { toast: 'This is the genuine sign-in page. In this lab there is nothing behind it.' } },
  };
}

export const CORVANE_DNS = {
  'corvane.io': { A: ['198.51.100.20'], MX: ['10 mx1.corvane.io.', '20 mx2.corvane.io.'], TXT: ['"v=spf1 include:_spf.corvane.io -all"', '"_dmarc: v=DMARC1; p=reject; rua=mailto:dmarc@corvane.io"'], NS: ['ns1.corvane.io.', 'ns2.corvane.io.'] },
  'login.corvane.io': { A: ['198.51.100.31'] },
};

export const CORVANE_WHOIS = {
  'corvane.io': `Domain Name: corvane.io
Registrar: Gandara Registrar Ltd
Creation Date: 2014-03-09T10:21:00Z
Registry Expiry Date: 2031-03-09T10:21:00Z
Registrant Organization: Corvane Ltd
Registrant Country: GB
Name Server: ns1.corvane.io`,
};
