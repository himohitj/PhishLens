import type { LabImage } from '../types.ts';
import { CONTACTS, CORVANE_DNS, CORVANE_WHOIS, DEFAULT_CALLS, PERSONA, distractorMail, dvTls, page, realLoginPage, ssoLogin } from './common.ts';

const PHISH_HOST = 'login.corvane-sso.com.auth-verify.app';
const PHISH_URL = `https://${PHISH_HOST}/session?doc=fy27-bands`;
const SHORT = 'https://sh.rt/c0rv-fy27';

export const LAB_HARVEST: LabImage = {
  id: 'lab-harvest',
  version: '1.0.0',
  order: 2,
  codename: 'SHARED-WITH-YOU',
  title: 'Shared With You',
  tagline: 'Someone shared “FY27 Compensation Bands”. The sign-in page looks perfect.',
  difficulty: 'Intermediate',
  estimatedMinutes: 7,
  attackFamily: 'Credential harvesting',
  relatedModuleSlug: 'email-phishing',
  persona: PERSONA,
  briefing: [
    'A file-share notification promises next year’s pay bands, a document almost anyone would open.',
    'The link goes through a short-link service to a sign-in page that copies Corvane Identity pixel for pixel.',
    'Your browser has a padlock, a certificate viewer and a password vault. Use them, plus the Terminal, to work out where the link really goes.',
  ],
  apps: ['mail', 'browser', 'terminal', 'directory'],
  startApp: 'mail',
  mail: [
    {
      id: 'mail-share',
      folder: 'inbox',
      unread: true,
      suspicious: true,
      externalBanner: true,
      fromName: 'Priya Natarajan via Corvane Drive',
      fromAddress: 'share-notify@drive-notify.net',
      to: PERSONA.email,
      subject: 'Priya Natarajan shared “FY27 Compensation Bands.xlsx” with you',
      date: 'Tue 09:03',
      preview: 'Priya Natarajan has invited you to view a file. Link expires in 24 hours.',
      bodyHtml: `<div style="font-family:system-ui;max-width:460px">
<p style="font-size:15px"><b>Priya Natarajan</b> shared a file with you</p>
<div style="border:1px solid #ddd;border-radius:10px;padding:14px;margin:12px 0;display:flex;gap:10px;align-items:center">
<div style="width:34px;height:40px;background:#1d7a45;border-radius:4px"></div>
<div><b>FY27 Compensation Bands.xlsx</b><br/><span style="color:#888;font-size:12px">Confidential · People &amp; Culture</span></div></div>
<p>“Sam, these go live next month. Please review your band before Friday. Don’t forward.”</p>
<p><a href="${SHORT}" style="display:inline-block;background:#2c4bd8;color:#fff;padding:9px 18px;border-radius:7px;text-decoration:none;font-weight:600">Open</a></p>
<p style="color:#999;font-size:11px">This link will expire in 24 hours. Corvane Drive, secure file sharing.</p></div>`,
      auth: { spf: 'softfail', dkim: 'none', dmarc: 'none' },
      rawHeaders: `Return-Path: <mailer@drive-notify.net>
Received: from smtp-out.bulkmailer.example (198.51.100.201) by mx1.corvane.io; Tue, 17 Nov 2026 09:03:44 +0000
Authentication-Results: mx1.corvane.io;
  spf=softfail (sender IP not authorised) smtp.mailfrom=drive-notify.net;
  dkim=none (message not signed);
  dmarc=none header.from=drive-notify.net
From: "Priya Natarajan via Corvane Drive" <share-notify@drive-notify.net>
To: <sam.rivera@corvane.io>
Subject: Priya Natarajan shared "FY27 Compensation Bands.xlsx" with you
List-Unsubscribe: <mailto:unsub@bulkmailer.example>`,
    },
    ...distractorMail(),
  ],
  threads: [],
  files: [],
  web: [
    {
      url: PHISH_URL.split('?')[0],
      title: 'Sign in · Corvane Identity',
      html: ssoLogin({ title: 'Sign in to view “FY27 Compensation Bands.xlsx”', subtitle: 'For your security, please confirm your Corvane account.', account: PERSONA.email }),
      tls: dvTls(PHISH_HOST, 1, [PHISH_HOST, '*.auth-verify.app']),
      headers: { server: 'cloudflare-ish', 'cache-control': 'no-store', 'x-kit-version': 'evilproxy-lite/2.3 (training replica)' },
      vaultHasLogin: false,
      forms: { login: { navigate: `https://${PHISH_HOST}/mfa` } },
      sourceNotes: [
        'The page title and logo are copied from login.corvane.io.',
        `Form action posts to https://${PHISH_HOST}/relay. It forwards your password to the real site in real time (adversary-in-the-middle).`,
      ],
    },
    {
      url: `https://${PHISH_HOST}/mfa`,
      title: 'Verify · Corvane Identity',
      html: page(`<div class="card" data-pl-form="mfa"><h1>Enter verification code</h1><p>We sent a 6-digit code to your authenticator app.</p><label for="c">Code</label><input id="c" name="otp" inputmode="numeric" placeholder="••••••" /><button type="button" class="btn" data-pl-submit>Verify</button></div>`, 'Corvane Identity'),
      tls: dvTls(PHISH_HOST, 1, [PHISH_HOST, '*.auth-verify.app']),
      headers: { server: 'cloudflare-ish' },
      vaultHasLogin: false,
      forms: { mfa: { toast: 'Session expired. Please try again later.' } },
    },
    realLoginPage(),
    {
      url: 'https://drive.corvane.io/',
      title: 'Corvane Drive',
      html: page(`<div class="card"><h1>Shared with me</h1><p>No files have been shared with you in the last 7 days.</p><p class="fine">Signed in as ${PERSONA.email}</p></div>`, 'Corvane Drive'),
      tls: { ...dvTls('drive.corvane.io', 211, ['drive.corvane.io']), issuer: 'DigiTrust Global TLS RSA CA 2024', organization: 'Corvane Ltd (GB)', validFrom: 'Apr 18 2026' },
      headers: { server: 'corvane-edge' },
      vaultHasLogin: true,
    },
  ],
  dns: {
    ...CORVANE_DNS,
    'drive.corvane.io': { A: ['198.51.100.32'] },
    'auth-verify.app': { A: ['203.0.113.40'], NS: ['ns1.bulletproof.example.'] },
    [PHISH_HOST]: { CNAME: ['auth-verify.app.'], A: ['203.0.113.40'] },
    'drive-notify.net': { A: ['198.51.100.201'], TXT: ['"v=spf1 ?all"'] },
    'sh.rt': { A: ['192.0.2.8'] },
  },
  whois: {
    ...CORVANE_WHOIS,
    'auth-verify.app': `Domain Name: auth-verify.app
Registrar: NameNinja Inc.
Creation Date: 2026-11-16T22:40:12Z   <-- registered yesterday
Registrant Organization: Privacy Protect
Registrant Country: REDACTED`,
    'drive-notify.net': `Domain Name: drive-notify.net
Creation Date: 2026-10-02T08:15:00Z
Registrant Organization: REDACTED FOR PRIVACY`,
    'corvane-sso.com': 'No match for "corvane-sso.com". (The phishing URL only *contains* this text; the real domain is auth-verify.app.)',
  },
  shortLinks: { [SHORT]: PHISH_URL },
  threatIntel: {
    'auth-verify.app': 'MALICIOUS — adversary-in-the-middle phishing kit. Hosts lookalike sign-in pages for several companies. First seen 11 hours ago.',
    [PHISH_HOST]: 'MALICIOUS — see auth-verify.app',
    'drive-notify.net': 'SUSPICIOUS — bulk sender that imitates file-sharing notifications.',
    'sh.rt': 'INFO — public URL shortener. The destination is hidden until expanded.',
  },
  contacts: CONTACTS,
  calls: DEFAULT_CALLS,
  timeline: [],
  objectives: [
    { id: 'hover', label: 'Preview where the “Open” button leads before clicking it', hint: 'Hover over Open and read the status bar at the bottom.', why: 'Button text can say anything. The real destination only shows when you hover.', points: 15, match: { type: 'link_hover', where: { href: 'sh.rt' } } },
    { id: 'expand', label: 'Unmask the short link without visiting it', hint: `In Terminal: expand ${SHORT}  (or curl -I it)`, why: 'Short links hide the destination. Expanding one shows where it goes without loading the page.', points: 20, match: { anyOf: [{ type: 'cmd', where: { name: 'expand', args: 'sh.rt' } }, { type: 'cmd', where: { name: 'curl', args: 'sh.rt' } }] } },
    { id: 'domain', label: 'Identify the real registered domain behind the sign-in page', hint: 'Read the hostname right to left. Try whois auth-verify.app, or look up its threat intel.', why: `${PHISH_HOST} belongs to auth-verify.app. Everything to the left of it is decoration the attacker chose.`, points: 20, match: { anyOf: [{ type: 'cmd', where: { name: 'whois', args: 'auth-verify.app' } }, { type: 'cmd', where: { name: 'intel', args: 'auth-verify' } }, { type: 'cert_view', where: { host: 'auth-verify.app' } }] } },
    { id: 'vault', label: 'Ask your password vault whether it knows this site', hint: 'On the sign-in page, click the key icon.', why: 'Password managers match exact domains. An empty vault on a “familiar” page is a strong warning sign.', points: 20, match: { type: 'vault_check', where: { host: 'auth-verify.app', matched: false } } },
    { id: 'report', label: 'Report the share notification', hint: 'Back in Mail, press Report phishing.', why: 'Lures like this hit dozens of people at once. Your report protects the ones who haven’t looked yet.', points: 25, verdict: true, match: { type: 'report', where: { target: 'mail-share' } } },
  ],
  traps: [
    { id: 'password', label: 'You typed your password into a phishing kit', consequence: 'The kit relayed your password to the real Corvane sign-in page in real time. In the real world you would need an immediate password reset.', penalty: 40, match: { type: 'form_submit', where: { host: 'auth-verify.app', form: 'login' } } },
    { id: 'otp', label: 'You handed over a one-time code', consequence: 'With your password and a live MFA code, the attacker now holds a valid session cookie. MFA did not help because you gave it away.', penalty: 30, match: { type: 'form_submit', where: { host: 'auth-verify.app', form: 'mfa' } } },
  ],
  debrief: {
    whatHappened: 'An adversary-in-the-middle phishing kit hid behind a short link and a hostname built to start with “login.corvane-sso.com”. The page was a perfect copy of the real one, and its padlock was real too, because anyone can get a free certificate for a domain they own.',
    redFlags: [
      'Notification came from drive-notify.net and failed SPF',
      'Short link hid the destination',
      `The real registered domain was auth-verify.app, created yesterday`,
      'Domain-validated certificate one day old, with no organisation named',
      'Password vault offered no autofill',
    ],
    rightMove: 'Go to services you know by typing their address or using a bookmark. Treat an empty password vault on a familiar-looking page as a stop sign.',
    realWorld: 'Adversary-in-the-middle kits capture MFA codes and session cookies too. Phishing-resistant MFA such as passkeys and FIDO2 keys is the strongest defence.',
  },
};
