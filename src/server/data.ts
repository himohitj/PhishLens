import { PublicQuestion, PublicScenario, LearningModule, AttackCategory } from '../types/phishlens.ts';

export interface InternalQuestion extends PublicQuestion {
  internalCorrectOptionId: string;
  explanation: string;
}

export interface InternalScenario extends PublicScenario {
  internalScoringData: {
    safestActionId: string;
    safestActionLabel: string;
    safestActionRationale: string;
    actionScores: Record<string, {
      score: number;
      classification: 'optimal' | 'safe_partial' | 'risky' | 'compromised';
      resultHeadline: string;
      actionExplanation: string;
    }>;
    attackMechanics: string;
    realWorldConsequence: string;
    preventionTip: string;
    relatedModuleTitle: string;
  };
}

export const CATEGORY_LABELS: Record<AttackCategory, string> = {
  email_phishing: 'Email Phishing',
  fake_login: 'Credential Spoofing & Fake Logins',
  smishing: 'SMS Phishing (Smishing)',
  quishing: 'QR Code Phishing (Quishing)',
  social_engineering: 'Live Social Engineering & Pretexting',
  password_mfa: 'Password & MFA Resilience',
  malware_basics: 'Malware & Attachment Traps',
  account_security: 'Account Recovery & Session Hygiene',
};

export const BASELINE_QUESTIONS: InternalQuestion[] = [
  {
    id: 'base-q1',
    assessmentType: 'baseline',
    number: 1,
    category: 'email_phishing',
    categoryLabel: 'Email Phishing',
    contextLabel: 'Scenario 1 of 5 · Inbox Triage',
    prompt: 'You receive an urgent email stating your cloud storage billing failed and your files will be deleted in 12 hours. What is the most reliable technical indicator to inspect before trusting the message?',
    artifactSnippet: {
      type: 'email_header',
      sender: 'CloudVault Billing <notice@cloudvault-account-verify.example.com>',
      subject: 'FINAL NOTICE: Storage Archival Scheduled Today',
      previewText: 'Your automatic renewal was declined. Update your payment profile within 12 hours to prevent permanent data purge.',
      technicalCue: 'Return-Path: bounce@mailer-dispatch-09.example.net',
    },
    options: [
      {
        id: 'opt-a',
        label: 'Check whether the email includes the official company logo and copyright footer',
        description: 'Visual branding and legal disclaimers at the bottom of the message.',
      },
      {
        id: 'opt-b',
        label: 'Inspect the actual sender domain, Return-Path header, and link destination host',
        description: 'Technical routing address after the @ symbol and the true URL host.',
      },
      {
        id: 'opt-c',
        label: 'Reply directly to the email asking if the billing alert is legitimate',
        description: 'Send a quick response to the sender address to verify their identity.',
      },
      {
        id: 'opt-d',
        label: 'Click the link to see if the page has a padlock icon in the browser address bar',
        description: 'Check whether the destination uses HTTPS encryption.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'Logos, footers, and HTTPS padlocks are trivial for attackers to replicate. Inspecting the actual domain after the "@" symbol and verifying the destination URL host reveals lookalike domains.',
  },
  {
    id: 'base-q2',
    assessmentType: 'baseline',
    number: 2,
    category: 'fake_login',
    categoryLabel: 'Credential Spoofing & Fake Logins',
    contextLabel: 'Scenario 2 of 5 · URL & Domain Analysis',
    prompt: 'You are about to sign in to your work portal at "portal.northstar-ops.example.com". Which of the following URLs actually directs your browser to a domain controlled by "northstar-ops.example.com"?',
    artifactSnippet: {
      type: 'url',
      previewText: 'Comparing four candidate login URLs in the browser address bar.',
      technicalCue: 'Standard DNS hierarchy reads domain ownership from right to left before the first single slash (/).',
    },
    options: [
      {
        id: 'opt-a',
        label: 'https://northstar-ops.example.com.auth-session.net/login',
        description: 'Contains northstar-ops.example.com at the start of the address.',
      },
      {
        id: 'opt-b',
        label: 'https://login-northstar-ops.example.org/sso/authorize',
        description: 'Uses a hyphenated login prefix on an .example.org domain.',
      },
      {
        id: 'opt-c',
        label: 'https://sso.northstar-ops.example.com/auth/v2/login',
        description: 'Uses "sso" as a subdomain directly under northstar-ops.example.com.',
      },
      {
        id: 'opt-d',
        label: 'https://secure-redirect.example.net/northstar-ops.example.com/login',
        description: 'Places northstar-ops.example.com in the path after the slash.',
      },
    ],
    internalCorrectOptionId: 'opt-c',
    explanation: 'The registered domain is determined immediately before the first single forward slash (/). Only "sso.northstar-ops.example.com" is a true subdomain of northstar-ops.example.com.',
  },
  {
    id: 'base-q3',
    assessmentType: 'baseline',
    number: 3,
    category: 'smishing',
    categoryLabel: 'SMS Phishing (Smishing)',
    contextLabel: 'Scenario 3 of 5 · Mobile Messaging',
    prompt: 'You receive a text message claiming a parcel cannot be delivered due to an incomplete street address, accompanied by a shortened link and a $1.40 redelivery fee request. What should you do?',
    artifactSnippet: {
      type: 'sms',
      sender: '+1 (555) 019-4821',
      previewText: 'MetroPost: Package #MP-88412 held at regional depot due to missing apartment number. Confirm address & pay $1.40 handling: https://mpost-track-id.example.com/99x',
    },
    options: [
      {
        id: 'opt-a',
        label: 'Open the link in private browsing mode so cookies cannot be stolen',
        description: 'Use incognito mode to inspect the payment form safely.',
      },
      {
        id: 'opt-b',
        label: 'Pay the $1.40 using a virtual or secondary debit card just in case',
        description: 'Minimize financial exposure while ensuring the package arrives.',
      },
      {
        id: 'opt-c',
        label: 'Do not tap the link; check delivery status independently via the courier’s official app or website',
        description: 'Navigate separately using a known bookmark or official tracking number.',
      },
      {
        id: 'opt-d',
        label: 'Text "STOP" to the number to verify if it is an automated carrier short code',
        description: 'Test whether the sender is a legitimate notification system.',
      },
    ],
    internalCorrectOptionId: 'opt-c',
    explanation: 'Small fee lures ($1–$3) are designed to harvest full credit card details and personal data. Always verify shipments independently through the official app or website rather than tapping SMS links.',
  },
  {
    id: 'base-q4',
    assessmentType: 'baseline',
    number: 4,
    category: 'quishing',
    categoryLabel: 'QR Code Phishing (Quishing)',
    contextLabel: 'Scenario 4 of 5 · Physical-to-Digital Vectors',
    prompt: 'Why do attackers increasingly embed QR codes inside PDF attachments or place physical QR stickers over public parking meters?',
    artifactSnippet: {
      type: 'qr_context',
      previewText: 'A printed sticker placed over a municipal parking kiosk reads: "Scan Here for Express Mobile Pay — Meter Keypad Out of Order".',
      technicalCue: 'QR matrix encodes raw URL string invisible to the human eye prior to scanning.',
    },
    options: [
      {
        id: 'opt-a',
        label: 'QR codes automatically install malware onto phones as soon as the camera sees them',
        description: 'Scanning the visual matrix executes code without opening a browser.',
      },
      {
        id: 'opt-b',
        label: 'QR codes obscure the destination URL from visual inspection and often shift users from protected corporate desktops to personal mobile devices',
        description: 'Bypasses email text link scanners and exploits smaller mobile browser address bars.',
      },
      {
        id: 'opt-c',
        label: 'QR codes bypass HTTPS encryption requirements in mobile web browsers',
        description: 'Allows unencrypted websites to appear with a valid security certificate.',
      },
      {
        id: 'opt-d',
        label: 'QR codes can only be generated by verified merchant payment processors',
        description: 'Users assume QR codes require merchant registration.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'Anyone can generate a QR code for any URL. QR codes hide the destination text until scanned and move the user from a desktop to a mobile phone where URL spoofing is harder to spot.',
  },
  {
    id: 'base-q5',
    assessmentType: 'baseline',
    number: 5,
    category: 'social_engineering',
    categoryLabel: 'Live Social Engineering & Pretexting',
    contextLabel: 'Scenario 5 of 5 · Identity & MFA Defense',
    prompt: 'Someone calling from your company’s "Security Operations Desk" knows your employee ID and recent login city. They ask you to read back the 6-digit verification code just sent to your phone to "block an unauthorized session". What is the safest action?',
    artifactSnippet: {
      type: 'chat',
      sender: 'SecOps Analyst (Voice / Chat)',
      previewText: '"We see an active session from Frankfurt on your account. I just triggered a revocation code to your mobile—read me the 6 digits so I can lock them out immediately."',
    },
    options: [
      {
        id: 'opt-a',
        label: 'Provide the 6-digit code because the caller already verified your employee ID and login location',
        description: 'They already possess internal context that an outsider wouldn’t know.',
      },
      {
        id: 'opt-b',
        label: 'Refuse to share the code, hang up, and contact IT Security through the official internal directory',
        description: 'Never share one-time passcodes; verify independently via a trusted channel.',
      },
      {
        id: 'opt-c',
        label: 'Give them only the last 3 digits of the code to confirm they have the first 3 digits',
        description: 'Perform a partial verification check with the caller.',
      },
      {
        id: 'opt-d',
        label: 'Ask the caller to send you an email first, then reply with the code',
        description: 'Create an email audit trail before sharing the OTP.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'Legitimate IT and security teams never ask you to read back a one-time password (OTP) or approve an MFA prompt you did not initiate. Attackers use leaked directory data to sound convincing while triggering a real login or password reset on your account.',
  },
];

export const FINAL_QUESTIONS: InternalQuestion[] = [
  {
    id: 'final-q1',
    assessmentType: 'final',
    number: 1,
    category: 'email_phishing',
    categoryLabel: 'Email Phishing',
    contextLabel: 'Scenario 1 of 5 · Header & Reply-To Inspection',
    prompt: 'You receive an invoice inquiry that appears to come from a known supplier’s display name, "Apex Logistics Finance". When inspecting the message details, what discrepancy signals a reply-hijacking or spoofing attack?',
    artifactSnippet: {
      type: 'email_header',
      sender: 'Apex Logistics Finance <ar-billing@apex-logistics.example.com>',
      subject: 'Updated Wire Routing Instructions — Invoice #AL-4092',
      previewText: 'Please remit this month’s balance to our updated clearing partner account attached below.',
      technicalCue: 'Reply-To: ar-settlement@apex-loglstics-portal.example.net (Note the "l" instead of "i")',
    },
    options: [
      {
        id: 'opt-a',
        label: 'The email was sent at 4:45 PM local time on a Thursday',
        description: 'Standard business hours timestamp.',
      },
      {
        id: 'opt-b',
        label: 'The Reply-To header directs responses to a lookalike domain ("apex-loglstics-portal.example.net") coupled with an urgent bank routing change',
        description: 'Mismatched Reply-To address combined with payment redirection.',
      },
      {
        id: 'opt-c',
        label: 'The subject line contains an invoice number with a hyphen',
        description: 'Formatting of the invoice reference in the subject.',
      },
      {
        id: 'opt-d',
        label: 'The message body uses plain text instead of heavy HTML graphics',
        description: 'Lack of marketing banners in a finance email.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'Business Email Compromise (BEC) frequently pairs a forged display name with a deceptive Reply-To domain (like substituting "l" for "i") so that any reply goes to the attacker. Always verify payment routing changes out-of-band via a known phone number.',
  },
  {
    id: 'final-q2',
    assessmentType: 'final',
    number: 2,
    category: 'fake_login',
    categoryLabel: 'Credential Spoofing & Fake Logins',
    contextLabel: 'Scenario 2 of 5 · Browser Context & Authentication',
    prompt: 'You click a link to view a shared document and land on a clean login page with a valid HTTPS padlock. Before entering credentials, you inspect the address bar: "https://docs-viewer.auth-check-service.example.com/vanguard-workspace/login". How should you evaluate this page?',
    artifactSnippet: {
      type: 'url',
      previewText: 'Address bar shows: https://docs-viewer.auth-check-service.example.com/vanguard-workspace/login',
      technicalCue: 'TLS Certificate issued by Let’s Encrypt for *.auth-check-service.example.com',
    },
    options: [
      {
        id: 'opt-a',
        label: 'Trustworthy, because the TLS certificate is valid and "vanguard-workspace" appears in the URL',
        description: 'HTTPS is active and the organization name is visible in the path.',
      },
      {
        id: 'opt-b',
        label: 'Untrustworthy, because the actual host domain is "auth-check-service.example.com" and HTTPS only encrypts traffic to the attacker’s server',
        description: 'The organization name is merely a folder path on an unrelated domain.',
      },
      {
        id: 'opt-c',
        label: 'Trustworthy, as long as the page layout matches your company’s single sign-on portal',
        description: 'Visual consistency confirms it is hosted by your organization.',
      },
      {
        id: 'opt-d',
        label: 'Enter a fake password first; if it logs you in anyway, then it is a phishing site',
        description: 'Probe the form by submitting dummy inputs.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'An HTTPS padlock only means the connection between your browser and "auth-check-service.example.com" is encrypted—it does not validate who owns that domain. Modern phishing kits also relay credentials in real time, so probing with fake passwords can still expose session metadata or trigger secondary prompts.',
  },
  {
    id: 'final-q3',
    assessmentType: 'final',
    number: 3,
    category: 'smishing',
    categoryLabel: 'SMS Phishing (Smishing)',
    contextLabel: 'Scenario 3 of 5 · Urgent Financial & Toll Alerts',
    prompt: 'You receive an SMS stating: "State E-Toll Services: Your vehicle has an overdue toll balance of $6.80. Avoid a $50.00 late penalty and registration hold by settling before midnight at https://etoll-billing-notice.example.net". What makes this a classic smishing pattern?',
    artifactSnippet: {
      type: 'sms',
      sender: '+1 (555) 013-9920',
      previewText: 'State E-Toll Services: Overdue balance $6.80. Avoid $50.00 civil penalty by midnight: https://etoll-billing-notice.example.net',
    },
    options: [
      {
        id: 'opt-a',
        label: 'It combines an artificial midnight deadline and disproportionate penalty threat with an unofficial domain sent from a standard phone number',
        description: 'Manufactured urgency + penalty fear + untrusted URL.',
      },
      {
        id: 'opt-b',
        label: 'The toll amount ($6.80) is an even number of cents',
        description: 'Real toll systems only charge whole dollar amounts.',
      },
      {
        id: 'opt-c',
        label: 'It uses "https://" instead of "http://" in the text message',
        description: 'Legitimate SMS alerts never use HTTPS links.',
      },
      {
        id: 'opt-d',
        label: 'It mentions vehicle registration, which is public information',
        description: 'Reference to motor vehicle administration.',
      },
    ],
    internalCorrectOptionId: 'opt-a',
    explanation: 'Smishing relies on high-urgency pretexts (overdue tolls, package holds, bank locks) where a tiny fee is paired with a severe penalty to rush you into entering payment card details on a lookalike domain.',
  },
  {
    id: 'final-q4',
    assessmentType: 'final',
    number: 4,
    category: 'quishing',
    categoryLabel: 'QR Code Phishing (Quishing)',
    contextLabel: 'Scenario 4 of 5 · Document QR Verification',
    prompt: 'You receive an email claiming to be from Human Resources with a PDF titled "2026_Benefits_Confirmation.pdf". Inside the PDF, there is no text link—only a QR code instructing you to "Scan with your phone to re-authenticate your employee payroll portal". What is the safest response?',
    artifactSnippet: {
      type: 'qr_context',
      previewText: 'PDF attachment contains a single page with corporate colors and a large QR code: "Scan via Mobile Camera to Sign In & Confirm Direct Deposit".',
    },
    options: [
      {
        id: 'opt-a',
        label: 'Scan the QR code with your phone, since PDF attachments are scanned by email antivirus',
        description: 'Email security gateways already checked the PDF for viruses.',
      },
      {
        id: 'opt-b',
        label: 'Treat the QR code with the same skepticism as an unknown link; do not scan it, and access the HR portal directly via your bookmarked intranet URL',
        description: 'Recognize the PDF + QR combination as a technique to evade link scanners and move you to mobile.',
      },
      {
        id: 'opt-c',
        label: 'Screenshot the QR code and forward it to coworkers to ask if it worked for them',
        description: 'Distribute the QR code internally to crowdsource verification.',
      },
      {
        id: 'opt-d',
        label: 'Scan it only while disconnected from corporate Wi-Fi',
        description: 'Use cellular data when signing in via the QR code.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'Attackers embed QR codes inside PDFs specifically to hide malicious URLs from automated email link scanners and push authentication onto your phone. Always navigate to HR or payroll portals directly via known bookmarks.',
  },
  {
    id: 'final-q5',
    assessmentType: 'final',
    number: 5,
    category: 'social_engineering',
    categoryLabel: 'Live Social Engineering & Pretexting',
    contextLabel: 'Scenario 5 of 5 · MFA Fatigue & Helpdesk Pretexting',
    prompt: 'At 8:30 PM, your phone receives three consecutive Multi-Factor Authentication (MFA) "Approve Sign-In?" push notifications when you are not logging in. Moments later, someone messages you on workplace chat claiming to be an IT engineer running "background token synchronization" and asks you to tap Approve once so the alerts stop. What is happening?',
    artifactSnippet: {
      type: 'chat',
      sender: 'IT Infrastructure Bot / Support',
      previewText: '"Hi! Sorry for the push notification noise—we are migrating SSO certificates tonight. Just tap Approve on the next prompt and enter number 42 so your profile syncs cleanly."',
    },
    options: [
      {
        id: 'opt-a',
        label: 'Routine maintenance; approving one prompt stops the notification loop',
        description: 'IT migrations frequently require users to approve background logins.',
      },
      {
        id: 'opt-b',
        label: 'An active MFA fatigue / push-bombing attack where the attacker already has your password and is trying to trick you into granting them account access',
        description: 'Deny the prompts, never approve an uninitiated login, change your password, and report to security.',
      },
      {
        id: 'opt-c',
        label: 'A harmless software glitch in the authenticator app that can be ignored without changing your password',
        description: 'Repeated prompts happen randomly when cellular signal fluctuates.',
      },
      {
        id: 'opt-d',
        label: 'Approve the prompt first, then immediately log out on your laptop',
        description: 'Clear the queue and reset your local browser session.',
      },
    ],
    internalCorrectOptionId: 'opt-b',
    explanation: 'Repeated unexpected MFA push notifications indicate an attacker already possesses your primary password and is attempting an "MFA fatigue" (push bombing) attack, often paired with a live message pretending to be IT support. Deny the request and report immediately.',
  },
];

export const SCENARIOS: InternalScenario[] = [
  {
    id: 'sim-1',
    order: 1,
    slug: 'email-phishing-alert',
    title: "Room 01: The Message That Can't Wait",
    subtitle: 'Inspect an unexpected workspace account suspension warning one clue at a time.',
    attackType: 'email_phishing',
    attackTypeLabel: 'Email Phishing',
    difficulty: 'Foundational',
    situationBrief: 'It is Tuesday morning. While reviewing your inbox, you spot a high-priority security message claiming your Northstar Workspace account will be suspended in 2 hours unless you verify your identity.',
    whatShouldIDoHint: 'Use the Evidence Lens controls to inspect the sender headers, reply routing, urgency language, and the real destination URL behind the button before choosing your response.',
    relatedModuleSlug: 'email-phishing',
    evidenceHotspots: [
      {
        id: 'ev-1-sender',
        label: 'Sender Address & Return-Path',
        location: 'Email Header · From / Mailed-By',
        rawValue: 'From: Northstar Security <security-noreply@northstar-id-verify.example.com>',
        findingTitle: 'Lookalike External Domain',
        findingDetail: 'While the display name says "Northstar Security", the actual domain is "northstar-id-verify.example.com" rather than the official "northstar.example.com" domain.',
        termDefinition: {
          term: 'Display Name Spoofing',
          definition: 'Attackers can set any friendly text name in the "From" field; email clients often emphasize the display name over the actual domain address.',
        },
      },
      {
        id: 'ev-1-replyto',
        label: 'Reply-To Header Routing',
        location: 'Email Header · Reply-To',
        rawValue: 'Reply-To: support-ticket-882@external-mail-relay.example.net',
        findingTitle: 'Mismatched Reply-To Destination',
        findingDetail: 'Replies are routed to an unrelated relay domain ("external-mail-relay.example.net"), a strong sign the sender does not control the legitimate organization’s mail servers.',
        termDefinition: {
          term: 'Reply-To Header',
          definition: 'An email header that tells your mail client where to send responses, which can differ completely from the visible "From" address.',
        },
      },
      {
        id: 'ev-1-urgency',
        label: 'Coercive Countdown Language',
        location: 'Message Body · Paragraph 2',
        rawValue: '"Failure to complete identity validation within 120 minutes will trigger automatic account lock and permanent revocation of shared drive access."',
        findingTitle: 'Manufactured Time Pressure',
        findingDetail: 'Attackers manufacture tight 2-hour deadlines to trigger panic and bypass careful analytical verification.',
      },
      {
        id: 'ev-1-link',
        label: 'Button Destination URL (Hover Preview)',
        location: 'Call-to-Action Button · Anchor href',
        rawValue: 'https://northstar.example.com.session-check-auth.example.net/auth/verify?token=89f2a',
        findingTitle: 'Subdomain Deception in Link',
        findingDetail: 'The link places "northstar.example.com" as a prefix subdomain on the attacker-controlled domain "session-check-auth.example.net".',
        termDefinition: {
          term: 'Subdomain Trick',
          definition: 'Placing a trusted brand name at the left side of a URL while the true registered domain sits right before the first single slash (/).',
        },
      },
    ],
    actions: [
      {
        id: 'act-report-phish',
        label: 'Report via Phishing Button & Delete',
        description: 'Flag the message to the security team using the built-in reporting workflow without clicking any links.',
        intentType: 'safe_best',
      },
      {
        id: 'act-verify-independent',
        label: 'Ignore Email & Check Account via Official Bookmark',
        description: 'Leave the email untouched and open your known workspace bookmark in a separate browser tab to check for real alerts.',
        intentType: 'safe_passive',
      },
      {
        id: 'act-reply-sender',
        label: 'Reply Asking Security to Confirm the Ticket',
        description: 'Send a reply to the email asking why your account was flagged.',
        intentType: 'investigative',
      },
      {
        id: 'act-click-link',
        label: 'Click "Keep My Account Active" Link',
        description: 'Follow the link in the email to resolve the suspension before the 2-hour deadline expires.',
        intentType: 'unsafe',
        requiresConfirmation: false,
      },
    ],
    artifact: {
      kind: 'email',
      senderDisplayName: 'Northstar Security Operations',
      senderAddress: 'security-noreply@northstar-id-verify.example.com',
      replyToAddress: 'support-ticket-882@external-mail-relay.example.net',
      mailedByDomain: 'mailer4.northstar-id-verify.example.com',
      subject: '[ACTION REQUIRED] Unverified Sign-In Detected — Account Suspension in 2 Hours',
      timestamp: 'Today, 09:14 AM',
      recipient: 'alex.rivera@northstar.example.com',
      bodyParagraphs: [
        'Automated Security Notice for alex.rivera@northstar.example.com:',
        'Our identity protection engine detected an unrecognized token synchronization attempt on your Northstar Workspace profile. As a precaution, outbound mail and shared drive permissions have been queued for suspension.',
        'Failure to complete identity validation within 120 minutes will trigger automatic account lock and permanent revocation of shared drive access.',
        'Please validate your active browser session immediately using the secure verification link below:',
      ],
      ctaLabel: 'Keep My Account Active →',
      hoveredDestinationUrl: 'https://northstar.example.com.session-check-auth.example.net/auth/verify?token=89f2a',
    },
    internalScoringData: {
      safestActionId: 'act-report-phish',
      safestActionLabel: 'Report via Phishing Button & Delete',
      safestActionRationale: 'Reporting alerts security operations so they can block the lookalike domain for everyone else in the organization, while avoiding any interaction with the malicious link or sender.',
      actionScores: {
        'act-report-phish': {
          score: 100,
          classification: 'optimal',
          resultHeadline: 'You spotted the warning signs and protected the organization',
          actionExplanation: 'You avoided the deceptive link and reported the phishing attempt through the proper channel, helping protect colleagues targeted by the same campaign.',
        },
        'act-verify-independent': {
          score: 85,
          classification: 'safe_partial',
          resultHeadline: 'Safe decision — you bypassed the trap using an independent channel',
          actionExplanation: 'Checking your account through a known bookmark kept your credentials safe. Reporting the email as well is even better so defenders can block the campaign.',
        },
        'act-reply-sender': {
          score: 40,
          classification: 'risky',
          resultHeadline: 'Risky action — replying confirms your address is active and routes to the attacker',
          actionExplanation: 'Because the Reply-To header pointed to "external-mail-relay.example.net", replying engages directly with the attacker, confirming your inbox is monitored and inviting follow-up pretexting.',
        },
        'act-click-link': {
          score: 0,
          classification: 'compromised',
          resultHeadline: 'Simulated outcome — following this link leads to an untrusted external domain',
          actionExplanation: 'In this simulation, clicking the button would take your browser to "session-check-auth.example.net", a lookalike address designed to ask for your workspace login.',
        },
      },
      attackMechanics: 'This message combines a familiar display name ("Northstar Security Operations"), a lookalike sender domain, and a 2-hour countdown so you feel rushed into clicking before checking the address.',
      realWorldConsequence: 'If someone signs in after clicking a link like this in real life, attackers can access their workspace files and send convincing messages to coworkers from their account.',
      preventionTip: 'Before acting on an urgent email, expand the sender details and preview where the link actually leads—especially the main domain right before the first single slash (/).',
      relatedModuleTitle: 'Email Phishing: Anatomy of Deceptive Messages',
    },
  },
  {
    id: 'sim-2',
    order: 2,
    slug: 'fake-login-portal',
    title: 'Room 02: The Suspicious Sign-In',
    subtitle: 'Examine a sign-in screen one clue at a time before deciding whether it deserves your trust.',
    attackType: 'fake_login',
    attackTypeLabel: 'Credential Spoofing & Fake Logins',
    difficulty: 'Intermediate',
    situationBrief: 'You clicked a shared document link. A sign-in page has appeared, and your colleague says the document is urgent. Before continuing, check whether this page deserves your trust.',
    whatShouldIDoHint: 'Follow each task in order: first inspect the web address in the browser bar, then check what the sign-in box is asking for, and finally choose how to proceed.',
    relatedModuleSlug: 'password-mfa',
    evidenceHotspots: [
      {
        id: 'ev-2-urlbar',
        label: 'Web Address in Browser Bar',
        location: 'Browser Address Bar',
        rawValue: 'https://sso-northstar-cloud.auth-gateway-verify.example.net/login?redirect=roadmap_q4',
        findingTitle: 'Real Domain Is "auth-gateway-verify.example.net"',
        findingDetail: 'Even though "sso-northstar-cloud" is at the start of the address, the actual website you are visiting is "auth-gateway-verify.example.net" right before the first single slash (/).',
        termDefinition: {
          term: 'Registrable Domain',
          definition: 'The main website name just before the first single slash (/), which tells you who actually owns the page.',
        },
      },
      {
        id: 'ev-2-cert',
        label: 'HTTPS Padlock Status',
        location: 'Browser Security Icon',
        rawValue: 'Connection Encrypted (HTTPS) · Issued to: *.auth-gateway-verify.example.net',
        findingTitle: 'HTTPS Only Encrypts the Connection',
        findingDetail: 'The padlock means your connection to "auth-gateway-verify.example.net" is encrypted—it does not prove the website belongs to Northstar.',
        termDefinition: {
          term: 'HTTPS Padlock',
          definition: 'Indicates an encrypted connection between your browser and the current website, which scammers can also set up on their own domains.',
        },
      },
      {
        id: 'ev-2-form',
        label: 'Sign-In Request Fields',
        location: 'Sign-In Card Prompt',
        rawValue: 'Asks for both your Password AND a 6-digit Authenticator Code on the same screen',
        findingTitle: 'Requests Password + One-Time Code Together',
        findingDetail: 'Normal sign-in pages verify your password first before asking for a second-step code. Asking for both at once is a strong warning sign.',
      },
      {
        id: 'ev-2-footer',
        label: 'Page Footer Links',
        location: 'Bottom of Sign-In Card',
        rawValue: 'Privacy & Help links point to "#none" (inactive placeholder links)',
        findingTitle: 'Inactive Copy-Paste Footer Links',
        findingDetail: 'Fake sign-in pages often copy the visual look of a company login box while leaving the bottom help links non-functional.',
      },
    ],
    actions: [
      {
        id: 'act-close-report',
        label: 'Close the Tab and Report the Link',
        description: 'Leave the suspicious page immediately and let the security team know about the link.',
        intentType: 'safe_best',
      },
      {
        id: 'act-navigate-direct',
        label: 'Use a Saved Bookmark or Official Website Instead',
        description: 'Close this tab and open your known company bookmark to access the document safely.',
        intentType: 'safe_passive',
      },
      {
        id: 'act-test-fake-creds',
        label: 'Try Entering a Fake Password to Test the Page',
        description: 'Submit made-up details to see how the page reacts.',
        intentType: 'investigative',
      },
      {
        id: 'act-submit-login',
        label: 'Continue with the Suspicious Sign-In',
        description: 'Proceed with signing in on this page to open the urgent document.',
        intentType: 'unsafe',
      },
    ],
    artifact: {
      kind: 'login_page',
      timestamp: 'Active Browser Window',
      browserUrlBar: 'https://sso-northstar-cloud.auth-gateway-verify.example.net/login?redirect=roadmap_q4',
      sslCertificateIssuer: 'Issued to: *.auth-gateway-verify.example.net (HTTPS)',
      pageBrandTitle: 'Northstar Cloud Identity',
      pageSubtitle: 'Sign in with your workspace account to view "Q4_Product_Roadmap_Confidential.pdf"',
      fictionalAccountIdentifier: 'alex.rivera@northstar.example.com (Simulated Account)',
      ctaLabel: 'Continue Sign-In',
    },
    internalScoringData: {
      safestActionId: 'act-close-report',
      safestActionLabel: 'Close the Tab and Report the Link',
      safestActionRationale: 'Closing the tab protects your account immediately, and reporting the link helps protect colleagues who received the same shared document invite.',
      actionScores: {
        'act-close-report': {
          score: 100,
          classification: 'optimal',
          resultHeadline: 'Great job — you spotted the spoofed address and closed the trap',
          actionExplanation: 'You noticed that the website belonged to "auth-gateway-verify.example.net" rather than your organization, despite the familiar branding and HTTPS icon.',
        },
        'act-navigate-direct': {
          score: 85,
          classification: 'safe_partial',
          resultHeadline: 'Safe choice — switching to your own bookmark kept your account safe',
          actionExplanation: 'Refusing to use the suspicious page and going through your saved bookmark avoided the trap. Reporting the link as well is the best way to help others.',
        },
        'act-test-fake-creds': {
          score: 50,
          classification: 'risky',
          resultHeadline: 'Cautious instinct, though interacting with suspicious pages is still risky',
          actionExplanation: 'You avoided using real details, which is good. However, it is always safer to close the tab completely rather than interacting with a suspicious form.',
        },
        'act-submit-login': {
          score: 0,
          classification: 'compromised',
          resultHeadline: 'Simulated outcome — continuing would expose your credentials to the attacker',
          actionExplanation: 'In this simulation, continuing would hand both your password and one-time code to "auth-gateway-verify.example.net", allowing an attacker to sign in to the real service right away. (No real data was collected or sent.)',
        },
      },
      attackMechanics: 'Scammers put a familiar company name at the start of the web address ("sso-northstar-cloud") to distract you from the real domain ("auth-gateway-verify.example.net"). They also ask for your password and one-time code together so they can use them immediately.',
      realWorldConsequence: 'If someone enters their password and one-time code on a fake sign-in page, an attacker can log into their real account within seconds—even when two-factor authentication is enabled.',
      preventionTip: 'Always check the main domain name right before the first single slash (/), and remember that an HTTPS padlock only means the connection is encrypted—not that the website is trustworthy.',
      relatedModuleTitle: 'Password Security & Multi-Factor Authentication',
    },
  },
  {
    id: 'sim-3',
    order: 3,
    slug: 'smishing-delivery-fee',
    title: 'Room 03: Your Delivery Is On Hold',
    subtitle: 'Investigate a text message asking for a $1.85 delivery fee before a 5:00 PM cutoff.',
    attackType: 'smishing',
    attackTypeLabel: 'SMS Phishing (Smishing)',
    difficulty: 'Foundational',
    situationBrief: 'While away from your desk, your phone buzzes with an SMS claiming a package addressed to you cannot be delivered due to a damaged barcode and requires a $1.85 redelivery confirmation within 4 hours.',
    whatShouldIDoHint: 'Inspect the sender phone number, the URL structure inside the message, and the psychological fee pretext before choosing how to handle the text.',
    relatedModuleSlug: 'smishing',
    evidenceHotspots: [
      {
        id: 'ev-3-number',
        label: 'Sender Origination Number',
        location: 'SMS Header · Sender ID',
        rawValue: '+1 (555) 017-8392 (Standard 10-digit mobile number, unverified sender)',
        findingTitle: 'Unverified Long-Code Phone Number',
        findingDetail: 'Major national logistics carriers typically send automated alerts from registered short codes (5–6 digits) or verified sender IDs, not random 10-digit mobile numbers.',
      },
      {
        id: 'ev-3-url',
        label: 'Embedded Tracking Link',
        location: 'SMS Body · Hyperlink',
        rawValue: 'https://swiftpost-parcel-redelivery.example.org/claim-id-492',
        findingTitle: 'Lookalike Hyphenated Domain',
        findingDetail: 'Instead of the official carrier domain, the link uses a newly registered hyphenated lookalike ("swiftpost-parcel-redelivery.example.org").',
      },
      {
        id: 'ev-3-fee',
        label: 'Micro-Fee Payment Request ($1.85)',
        location: 'SMS Body · Call to Action',
        rawValue: '"Confirm street address & settle $1.85 customs/redelivery handling fee before 5:00 PM return-to-sender cutoff."',
        findingTitle: 'Low-Friction Card Harvesting Lure',
        findingDetail: 'The attacker isn’t after $1.85—the small amount lowers your guard so you enter your full credit card number, expiration date, CVV, and billing address.',
        termDefinition: {
          term: 'Micro-Fee Pretext',
          definition: 'A social-engineering tactic requesting a trivial charge ($1–$3) so victims focus on resolving the inconvenience rather than questioning the payment form.',
        },
      },
    ],
    actions: [
      {
        id: 'act-check-carrier-app',
        label: 'Do Not Tap Link; Check Official Carrier App & Report Junk',
        description: 'Report/delete the text and check any real expected deliveries directly inside the official carrier app or website.',
        intentType: 'safe_best',
      },
      {
        id: 'act-delete-ignore',
        label: 'Delete the Text Message Without Tapping',
        description: 'Dismiss and delete the SMS from your phone without opening the link.',
        intentType: 'safe_passive',
      },
      {
        id: 'act-reply-stop',
        label: 'Reply "STOP" or Ask Which Store Sent the Package',
        description: 'Send a text reply to see if an automated system responds with sender details.',
        intentType: 'investigative',
      },
      {
        id: 'act-tap-sms-link',
        label: 'Tap the Link to Confirm Address & Pay $1.85',
        description: 'Open the link on your phone to ensure the package is not returned to sender at 5:00 PM.',
        intentType: 'unsafe',
      },
    ],
    artifact: {
      kind: 'sms',
      timestamp: 'Today, 1:42 PM',
      smsSenderNumber: '+1 (555) 017-8392',
      smsCarrierTag: 'SMS · Unknown Sender (Not in Contacts)',
      smsMessageText: 'SwiftPost Express: Delivery attempt #2 failed for parcel SP-904182 due to unreadable street label. Please confirm delivery address and settle $1.85 re-dispatch handling before 5:00 PM today or item returns to warehouse: https://swiftpost-parcel-redelivery.example.org/claim-id-492',
      hoveredDestinationUrl: 'https://swiftpost-parcel-redelivery.example.org/claim-id-492',
    },
    internalScoringData: {
      safestActionId: 'act-check-carrier-app',
      safestActionLabel: 'Do Not Tap Link; Check Official Carrier App & Report Junk',
      safestActionRationale: 'Checking the official carrier app independently confirms whether any real package exists without exposing your mobile browser, and reporting the SMS as junk helps carrier filters block the sender.',
      actionScores: {
        'act-check-carrier-app': {
          score: 100,
          classification: 'optimal',
          resultHeadline: 'You avoided the smishing trap and verified independently',
          actionExplanation: 'You ignored the link inside the text, verified through an independent trusted channel, and reported the message.',
        },
        'act-delete-ignore': {
          score: 85,
          classification: 'safe_partial',
          resultHeadline: 'Safe decision — you deleted the message without tapping the link',
          actionExplanation: 'Deleting the text prevented any exposure to the fraudulent payment page. Using your phone’s "Report Junk" feature also helps mobile carriers block the campaign.',
        },
        'act-reply-stop': {
          score: 35,
          classification: 'risky',
          resultHeadline: 'Risky action — replying to smishing confirms an active human phone number',
          actionExplanation: 'Replying "STOP" or texting back a scammer’s number validates that your phone line is active and read by a human, increasing future smishing and vishing calls.',
        },
        'act-tap-sms-link': {
          score: 0,
          classification: 'compromised',
          resultHeadline: 'Simulated outcome — tapping this link would open a fake fee payment page',
          actionExplanation: 'In this simulation, opening the link would take your phone to "swiftpost-parcel-redelivery.example.org", a page designed to ask for your credit card details under the excuse of a $1.85 fee.',
        },
      },
      attackMechanics: 'Delivery scams work because almost everyone orders packages from time to time, and a tiny $1.85 fee feels too small to worry about—tricking people into entering their full card details.',
      realWorldConsequence: 'In real life, entering a payment card for a fake $1.85 delivery fee gives scammers the card number, security code, and billing address to make much larger unauthorized charges.',
      preventionTip: 'Never tap links in unexpected delivery or toll texts. Open the delivery company’s official app or website directly to check if a package actually needs attention.',
      relatedModuleTitle: 'Smishing: Recognizing Mobile Text Deception',
    },
  },
  {
    id: 'sim-4',
    order: 4,
    slug: 'quishing-qr-poster',
    title: 'Room 04: Scan Before You Trust',
    subtitle: 'Examine a QR code notice asking you to scan with your phone camera to keep Wi-Fi access.',
    attackType: 'quishing',
    attackTypeLabel: 'QR Code Phishing (Quishing)',
    difficulty: 'Intermediate',
    situationBrief: 'A printed notice in the conference room—and a matching PDF in your email—asks staff to scan a QR code with their phone to renew their Wi-Fi access.',
    whatShouldIDoHint: 'Follow the room tasks: first scan the demonstration QR code to preview its web address, then check the notice instructions, and decide whether to open it.',
    relatedModuleSlug: 'quishing',
    evidenceHotspots: [
      {
        id: 'ev-4-qrdecode',
        label: 'QR Code Destination Preview',
        location: 'Camera Scan Preview',
        rawValue: 'https://wifi-cert-portal.device-enroll-auth.example.net/corporate-sso/login',
        findingTitle: 'Points to an Unrelated Website',
        findingDetail: 'Because you cannot read a QR code with your eyes, scanning it reveals that it actually leads to "device-enroll-auth.example.net" rather than your company’s official website.',
        termDefinition: {
          term: 'Quishing (QR Phishing)',
          definition: 'Hiding a deceptive web address inside a QR code so people scan it without realizing where it leads.',
        },
      },
      {
        id: 'ev-4-channelshift',
        label: 'Phone-Only Instruction',
        location: 'Notice Step 2',
        rawValue: '"Do not use your laptop browser. Scan exclusively with your personal smartphone camera and sign in."',
        findingTitle: 'Moves You Away from Your Protected Work Computer',
        findingDetail: 'Asking you to use your personal phone instead of your work laptop is a common trick to bypass workplace security filters.',
      },
      {
        id: 'ev-4-physical',
        label: 'Missing Helpdesk Reference',
        location: 'Bottom of Notice',
        rawValue: 'No IT ticket number or standard internal helpdesk address is listed.',
        findingTitle: 'No Way to Verify on the Company Intranet',
        findingDetail: 'Genuine workplace IT updates give you a normal web address or ticket number you can check on your computer—never just a lone QR code.',
      },
    ],
    actions: [
      {
        id: 'act-report-remove',
        label: 'Cancel and Report the Notice to IT',
        description: 'Do not open the link, and let IT know about the suspicious QR notice.',
        intentType: 'safe_best',
      },
      {
        id: 'act-check-intranet',
        label: 'Cancel and Check the Official IT Page on Your Laptop',
        description: 'Put your phone away and check your company’s official IT page from your computer.',
        intentType: 'safe_passive',
      },
      {
        id: 'act-scan-open-url',
        label: 'Open the QR Link and Sign In',
        description: 'Proceed to the website shown in the QR preview so your Wi-Fi stays connected.',
        intentType: 'unsafe',
      },
    ],
    artifact: {
      kind: 'qr_poster',
      timestamp: 'Conference Room B & Inbox PDF',
      qrPosterLocation: 'Printed Notice & Emailed PDF ("WiFi_Update_2026.pdf")',
      qrPosterHeadline: 'Mandatory Staff Wi-Fi Certificate Renewal',
      qrPosterSubtext: 'To prevent wireless disconnection during today’s network upgrade, scan this QR code using your personal smartphone camera and sign in with your Northstar account.',
      qrDecodedPreviewUrl: 'https://wifi-cert-portal.device-enroll-auth.example.net/corporate-sso/login',
    },
    internalScoringData: {
      safestActionId: 'act-report-remove',
      safestActionLabel: 'Cancel and Report the Notice to IT',
      safestActionRationale: 'Cancelling the scan keeps your account safe, and reporting the notice helps IT remove the fake posters and warn your coworkers.',
      actionScores: {
        'act-report-remove': {
          score: 100,
          classification: 'optimal',
          resultHeadline: 'Well done — you checked the QR preview first and reported the trap',
          actionExplanation: 'You inspected the web address hidden inside the QR code, saw that it led to "device-enroll-auth.example.net", and reported it safely.',
        },
        'act-check-intranet': {
          score: 85,
          classification: 'safe_partial',
          resultHeadline: 'Safe choice — you cancelled the scan and checked from your computer',
          actionExplanation: 'Refusing to follow the QR link and checking your official IT page kept your account safe. Reporting the poster as well protects others in the office.',
        },
        'act-scan-open-url': {
          score: 0,
          classification: 'compromised',
          resultHeadline: 'Simulated outcome — opening this QR link would lead to a fake sign-in page on your phone',
          actionExplanation: 'In this simulation, proceeding would open "device-enroll-auth.example.net" on your mobile browser, where an attacker could ask for your workplace login.',
        },
      },
      attackMechanics: 'A QR code is just a web link turned into a square pattern. Scammers use QR codes in PDFs and on printed signs because you cannot see the web address until you point your camera at it.',
      realWorldConsequence: 'Signing in through a deceptive QR code on your personal phone exposes your workplace password outside the protection of your company computer.',
      preventionTip: 'Treat every QR code like an unknown link: always read the web address preview on your camera screen before tapping to open it, and never sign in to work or bank accounts through an unexpected QR code.',
      relatedModuleTitle: 'Quishing: How QR Codes Hide Malicious Destinations',
    },
  },
  {
    id: 'sim-5',
    order: 5,
    slug: 'social-engineering-support-chat',
    title: 'Room 05: The Urgent IT Request',
    subtitle: 'An IT support agent messages you urgently and asks for a 6-digit verification code.',
    attackType: 'social_engineering',
    attackTypeLabel: 'Live Social Engineering & Pretexting',
    difficulty: 'Advanced',
    situationBrief: 'A chat message pops up from someone claiming to be in IT Security. At the exact same moment, your phone receives a 6-digit verification code. They say they need that code right now to protect your account.',
    whatShouldIDoHint: 'Follow the tasks: read the agent’s opening message, inspect their profile and why a code arrived on your phone, and choose how to respond.',
    relatedModuleSlug: 'social-engineering',
    evidenceHotspots: [
      {
        id: 'ev-5-pretext',
        label: 'Sender Profile & Name-Dropping',
        location: 'Chat Profile Header',
        rawValue: 'External Guest Account · Mentions your manager "Elena Vance" to sound familiar',
        findingTitle: 'Knowing Names Does Not Prove Identity',
        findingDetail: 'Scammers easily look up manager names and job titles on public websites like LinkedIn to make an urgent message feel like it came from inside your company.',
        termDefinition: {
          term: 'Pretexting',
          definition: 'Using real background details and a believable cover story to gain someone’s trust.',
        },
      },
      {
        id: 'ev-5-otptrigger',
        label: 'Code Arriving on Your Phone',
        location: 'Phone Text Notification',
        rawValue: 'Northstar Login: Your one-time verification code is [REDACTED]. Never share this code with anyone.',
        findingTitle: 'Someone Is Trying to Sign In as You Right Now',
        findingDetail: 'Your phone received a sign-in code because the person chatting with you is currently trying to log into your account and needs your 6-digit code to get in.',
      },
      {
        id: 'ev-5-otpask',
        label: 'Request for Your 6-Digit Code',
        location: 'Chat Message 3',
        rawValue: '"Reply with that 6-digit code in the next 60 seconds so I can lock out the intruder."',
        findingTitle: 'Real Support Never Asks for Your One-Time Code',
        findingDetail: 'Legitimate IT staff, helpdesks, and banks never need your password or one-time verification code to secure your account.',
      },
    ],
    actions: [
      {
        id: 'act-refuse-verify-independent',
        label: 'Refuse, End the Chat, and Contact IT Through Official Channels',
        description: 'Do not share the code; close the chat and contact your real IT helpdesk directly.',
        intentType: 'safe_best',
      },
      {
        id: 'act-refuse-close',
        label: 'Refuse to Share the Code and Close the Chat',
        description: 'Decline the request and close the conversation right away.',
        intentType: 'safe_passive',
      },
      {
        id: 'act-ask-badge-id',
        label: 'Ask the Agent for Their Employee ID Number in the Chat',
        description: 'Keep chatting and ask them to type an employee number to prove who they are.',
        intentType: 'investigative',
      },
      {
        id: 'act-share-otp',
        label: 'Share the 6-Digit Code in the Chat (Simulated)',
        description: 'Send the code to the agent so they can stop the alleged breach.',
        intentType: 'unsafe',
      },
    ],
    artifact: {
      kind: 'support_chat',
      timestamp: 'Live Chat · 4:52 PM',
      chatAgentName: 'Marcus Chen · IT Security Desk',
      chatAgentBadge: 'External Guest Account · [ext-secops-dispatch@partner-bridge.example.net]',
      chatChannel: 'Direct Message · Unverified External Sender',
      chatMessages: [
        {
          sender: 'agent',
          time: '4:51 PM',
          text: 'Hi Alex — contacting you urgently from IT Security per Elena Vance’s Product Ops team list (Ticket #INC-9921). We see an unauthorized login trying to copy files from your workspace.',
        },
        {
          sender: 'system',
          time: '4:52 PM',
          text: '[Text Message on Your Phone] Northstar Login: Your one-time verification code was just requested. Never share this code with anyone, including support.',
        },
        {
          sender: 'agent',
          time: '4:52 PM',
          text: 'I just sent a 6-digit security cancellation code to your phone. Type that 6-digit code here in the next 60 seconds so I can block the intruder and protect your account.',
        },
      ],
    },
    internalScoringData: {
      safestActionId: 'act-refuse-verify-independent',
      safestActionLabel: 'Refuse, End the Chat, and Contact IT Through Official Channels',
      safestActionRationale: 'Keeping the 6-digit code private blocks the attacker from signing in, and contacting your real IT team alerts them that someone is impersonating support.',
      actionScores: {
        'act-refuse-verify-independent': {
          score: 100,
          classification: 'optimal',
          resultHeadline: 'Excellent defense — you protected your verification code and verified independently',
          actionExplanation: 'You recognized that real IT support never asks for a one-time code, refused the urgent demand, and contacted IT through an official channel.',
        },
        'act-refuse-close': {
          score: 85,
          classification: 'safe_partial',
          resultHeadline: 'Safe choice — refusing to share the code stopped the attack',
          actionExplanation: 'Keeping the code private prevented the caller from getting into your account. Letting your IT team know is also helpful so they can warn coworkers.',
        },
        'act-ask-badge-id': {
          score: 35,
          classification: 'risky',
          resultHeadline: 'Risky approach — someone who looked up your manager’s name can also fake an ID number',
          actionExplanation: 'Asking for proof inside the same chat isn’t reliable because scammers can type any employee number. Always end the chat and reach out through an official phone number or directory.',
        },
        'act-share-otp': {
          score: 0,
          classification: 'compromised',
          resultHeadline: 'Simulated outcome — sharing the 6-digit code would let the attacker sign in to your account',
          actionExplanation: 'In this simulation, the "cancellation code" was actually a real sign-in code triggered by the scammer. Sharing it would let them finish signing in as you. (No real code was asked for or sent.)',
        },
      },
      attackMechanics: 'Scammers mention real coworker names to build quick trust and create a fake emergency so you panic. While chatting with you, they try to sign in to your account and ask you to hand over the 6-digit verification code that arrives on your phone.',
      realWorldConsequence: 'Sharing a one-time verification code gives a scammer immediate access to your account, even when two-step verification is turned on.',
      preventionTip: 'Make it a simple personal rule: never share a password or one-time verification code (OTP) with anyone—not IT support, not security staff, and not your bank.',
      relatedModuleTitle: 'Social Engineering: Pretexting, Authority & Urgency',
    },
  },
];

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'mod-1',
    slug: 'email-phishing',
    title: 'Email Phishing',
    subtitle: 'How deceptive emails forge sender identity, manipulate urgency, and disguise malicious links.',
    attackType: 'email_phishing',
    attackTypeLabel: 'Email Phishing',
    readingTimeMinutes: 3,
    whatItIs: 'Email phishing is a deceptive message designed to impersonate a trusted organization, colleague, or service in order to trick you into clicking a harmful link, opening a malicious attachment, or divulging sensitive information.',
    howItWorks: [
      'The attacker crafts a convincing pretext—such as an account suspension, failed invoice payment, shared document, or urgent HR policy update.',
      'They mask the sender address using Display Name Spoofing or register a lookalike domain (typosquatting) that closely resembles the target brand.',
      'They embed a call-to-action button whose visible label looks safe, while the underlying HTML anchor (`href`) points to an external server under their control.',
    ],
    warningSigns: [
      {
        signal: 'Display Name vs. Actual Domain Mismatch',
        explanation: 'The friendly name says "Payroll Support", but the address after the @ symbol is an unrelated or hyphenated lookalike domain.',
      },
      {
        signal: 'Mismatched Reply-To Header',
        explanation: 'Expanding the message header shows replies are routed to a different address than the visible sender.',
      },
      {
        signal: 'Artificial Deadlines & Coercive Urgency',
        explanation: 'Threats that your account will be deleted in 2 hours or a fine will be imposed unless you click immediately.',
      },
      {
        signal: 'Subdomain Tricks in Links',
        explanation: 'Links formatted like `https://trusted-brand.com.attacker-host.net/login` where `attacker-host.net` is the actual domain.',
      },
    ],
    fictionalExample: {
      title: 'The "Workspace Storage Full" Trap',
      context: 'An employee receives an email on Monday morning claiming incoming client emails are bouncing.',
      artifactText: 'From: CloudMail Admin <admin@cloudmail-quota-alert.example.net>\nReply-To: helpdesk@relay-box-04.example.org\nSubject: URGENT: 4 Incoming Messages Quarantined\nLink: https://cloudmail.example.com.quota-release.example.net/login',
      deceptionBreakdown: 'Notice three layered signals: (1) the sender domain is `cloudmail-quota-alert.example.net`, (2) the Reply-To points to `relay-box-04.example.org`, and (3) the link uses `cloudmail.example.com` as a decoy subdomain in front of `quota-release.example.net`.',
    },
    whatToDo: [
      'Expand the full sender header to inspect the exact domain after `@` and the `Reply-To` address.',
      'Hover over links (or long-press safely without opening) to read the registered domain right before the first single `/`.',
      'Navigate to the service independently using your own saved bookmark or official app.',
      'Use your organization’s Report Phishing button so security teams can block the campaign.',
    ],
    whatNotToDo: [
      'Do not trust an email simply because it contains high-resolution logos, legal disclaimers, or familiar formatting.',
      'Do not reply to suspicious emails to ask if they are real.',
      'Do not click "Unsubscribe" links in obvious phishing messages—use spam/phishing reporting instead.',
    ],
    knowledgeCheck: {
      question: 'In the URL "https://portal.vanguard-bank.example.com.session-verify.example.net/account/login", which domain actually receives your network request?',
      options: [
        {
          id: 'kc-1-a',
          text: 'vanguard-bank.example.com',
          isCorrect: false,
          feedback: 'Not quite. Everything before "session-verify.example.net" is merely a prefix subdomain.',
        },
        {
          id: 'kc-1-b',
          text: 'session-verify.example.net',
          isCorrect: true,
          feedback: 'Correct! The registered host domain sits immediately before the first single forward slash (/).',
        },
        {
          id: 'kc-1-c',
          text: 'account/login',
          isCorrect: false,
          feedback: 'That part after the slash is the folder path on the server, not the domain.',
        },
      ],
    },
  },
  {
    id: 'mod-2',
    slug: 'smishing',
    title: 'Smishing (SMS Phishing)',
    subtitle: 'Why mobile text messages are a prime vector for delivery, toll, and banking lures.',
    attackType: 'smishing',
    attackTypeLabel: 'SMS Phishing (Smishing)',
    readingTimeMinutes: 3,
    whatItIs: 'Smishing is phishing conducted via SMS or mobile messaging apps. Attackers exploit the personal, immediate nature of text messages and the smaller screen size of smartphones to trick users into tapping malicious links or calling fraudulent numbers.',
    howItWorks: [
      'Attackers send bulk SMS messages using high-probability pretexts: an undeliverable parcel, an unpaid highway toll, a suspicious bank card charge, or an overdue tax notice.',
      'The message includes a shortened or hyphenated URL designed to open in the mobile browser, where the address bar often auto-hides upon scrolling.',
      'Many smishing pages request a small fee ($1.00–$3.50) to harvest full credit card details and personal identity fields.',
    ],
    warningSigns: [
      {
        signal: 'Unverified 10-Digit Sender Numbers or Foreign Country Codes',
        explanation: 'Official parcel carriers and toll agencies rarely send billing links from random standard mobile numbers or iMessage email addresses.',
      },
      {
        signal: 'Micro-Fee Payment Demands',
        explanation: 'Requests for $1.40 or $2.00 redelivery/customs fees are almost universally credit-card harvesting lures.',
      },
      {
        signal: 'Shortened or Hyphenated Tracking Domains',
        explanation: 'Links using generic shorteners or domains like `track-parcel-redelivery.example.org`.',
      },
    ],
    fictionalExample: {
      title: 'The Overdue Highway Toll Alert',
      context: 'A commuter receives a text message at 7:15 PM.',
      artifactText: 'Sender: +1 (555) 018-3310\n"MetroPass Toll Alert: Your vehicle has an unpaid toll balance of $4.25. To avoid a $55.00 administrative fine and license suspension, pay by 11:59 PM at https://metropass-invoice-settle.example.net"',
      deceptionBreakdown: 'The attacker pairs a trivial $4.25 charge with a frightening $55.00 penalty and a midnight deadline so the recipient acts before checking their official toll transponder account.',
    },
    whatToDo: [
      'Open the courier, bank, or toll provider’s official mobile app or bookmarked website independently to check your real account status.',
      'Use your phone’s built-in "Report Junk & Delete" feature.',
      'Enable spam filtering in your mobile messaging settings.',
    ],
    whatNotToDo: [
      'Never tap links inside unexpected SMS alerts about packages, tolls, or account locks.',
      'Do not reply "STOP" to obvious scam texts from random numbers—it confirms your number is active and read by a human.',
      'Never enter payment card numbers on a page reached via an SMS link.',
    ],
    knowledgeCheck: {
      question: 'Why do delivery smishing scams typically ask for a tiny fee like $1.45 instead of $200?',
      options: [
        {
          id: 'kc-2-a',
          text: 'Because credit card processors block transactions over $5 on mobile browsers.',
          isCorrect: false,
          feedback: 'Mobile browsers can process legitimate transactions of any size.',
        },
        {
          id: 'kc-2-b',
          text: 'To lower psychological resistance so you enter your full card number, CVV, and billing data without hesitation.',
          isCorrect: true,
          feedback: 'Exactly. Once you enter the card details for the "$1.45" fee, the attacker steals the card credentials to make much larger fraudulent charges.',
        },
        {
          id: 'kc-2-c',
          text: 'Because the attacker only wants to earn $1.45 per victim.',
          isCorrect: false,
          feedback: 'The form usually doesn’t charge $1.45 at all—it captures the card and bank OTP to drain the account.',
        },
      ],
    },
  },
  {
    id: 'mod-3',
    slug: 'vishing',
    title: 'Vishing (Voice Phishing)',
    subtitle: 'Defending against phone-based impersonation, spoofed caller ID, and urgent voice manipulation.',
    attackType: 'social_engineering',
    attackTypeLabel: 'Live Social Engineering & Pretexting',
    readingTimeMinutes: 3,
    whatItIs: 'Vishing (voice phishing) uses phone calls or voice messages to manipulate victims into revealing credentials, approving MFA prompts, or transferring funds. Attackers often spoof Caller ID so your phone displays the real name and number of your bank or IT helpdesk.',
    howItWorks: [
      'The attacker spoofs the outbound Caller ID to match a trusted institution (e.g., your bank’s fraud department or corporate IT support).',
      'They present an urgent crisis—such as an unauthorized wire transfer in progress or a compromised employee laptop—and speak with calm, professional authority.',
      'To "verify your identity" or "cancel the fraudulent transaction", they ask you to read back a 6-digit SMS code, approve a push notification, or install a remote-access tool.',
    ],
    warningSigns: [
      {
        signal: 'Reliance on Inbound Caller ID',
        explanation: 'Caller ID is easily forged. An incoming call displaying your bank’s real phone number does not prove who is calling.',
      },
      {
        signal: 'Requests to Read Back an OTP or Approve MFA',
        explanation: 'No legitimate bank or IT desk will ever send you a code and ask you to read it back over the phone.',
      },
      {
        signal: 'Pressure to Stay on the Line',
        explanation: 'Insisting that hanging up will result in immediate financial loss or account termination.',
      },
    ],
    fictionalExample: {
      title: 'The Spoofed Bank Fraud Call',
      context: 'An individual receives a phone call whose Caller ID matches the number on the back of their debit card.',
      artifactText: 'Caller: "This is Senior Fraud Specialist Taylor with Horizon Bank. We blocked a $1,400 purchase in Miami. To reverse the charge and reissue your card, please read me the 6-digit security code we just texted to your phone."',
      deceptionBreakdown: 'While on the phone with you, the attacker is clicking "Forgot Password" or authorizing a wire transfer on your real bank account. The text message you received is from your bank—and reading it to the caller hands them the key.',
    },
    whatToDo: [
      'Hang up immediately whenever an inbound caller asks for sensitive information, a one-time code, or remote access.',
      'Wait 30 seconds, then dial the official number printed on the back of your payment card or listed in your company’s internal directory.',
      'Read the full text of any SMS verification message—it almost always states "Never share this code with anyone over the phone."',
    ],
    whatNotToDo: [
      'Never trust inbound Caller ID as proof of identity.',
      'Never read a one-time password (OTP) aloud to anyone on a call you did not initiate.',
      'Never install screen-sharing or remote-support software at the request of an unsolicited caller.',
    ],
    knowledgeCheck: {
      question: 'An incoming phone call displays your bank’s exact name and official 1-800 number on Caller ID. What does this prove?',
      options: [
        {
          id: 'kc-3-a',
          text: 'The call is guaranteed to originate from the bank’s fraud department.',
          isCorrect: false,
          feedback: 'Caller ID headers can be spoofed with inexpensive VoIP software.',
        },
        {
          id: 'kc-3-b',
          text: 'Nothing—inbound Caller ID can be spoofed; you must hang up and dial the official number yourself to verify.',
          isCorrect: true,
          feedback: 'Correct! Outbound calls that you dial to a verified number are trustworthy; inbound Caller ID labels are not.',
        },
        {
          id: 'kc-3-c',
          text: 'It is safe to share your verification code as long as the caller knows the last 4 digits of your card.',
          isCorrect: false,
          feedback: 'Attackers frequently possess partial card numbers from merchant breaches.',
        },
      ],
    },
  },
  {
    id: 'mod-4',
    slug: 'quishing',
    title: 'Quishing (QR Code Phishing)',
    subtitle: 'Understanding how QR codes conceal destination URLs and shift attacks onto mobile devices.',
    attackType: 'quishing',
    attackTypeLabel: 'QR Code Phishing (Quishing)',
    readingTimeMinutes: 3,
    whatItIs: 'Quishing is the use of deceptive QR codes in emails, PDF attachments, or physical locations (such as parking meters, restaurant menus, or office posters) to direct users to phishing websites.',
    howItWorks: [
      'Instead of placing a clickable text link in an email—which corporate email scanners easily inspect—the attacker embeds an image of a QR code inside the email body or a PDF attachment.',
      'In physical spaces, attackers paste fraudulent QR stickers directly over legitimate QR codes on parking kiosks or EV chargers.',
      'Because the user scans the QR code with their personal smartphone, the attack bypasses corporate desktop security filters and exploits smaller mobile browser URL bars.',
    ],
    warningSigns: [
      {
        signal: 'Emails or PDFs Asking You to Scan a QR Code to Sign In',
        explanation: 'Routine password resets, HR document reviews, and Microsoft/Google re-authentication do not require scanning a QR code from an email.',
      },
      {
        signal: 'Physical Stickers Placed Over Existing Signs',
        explanation: 'Raised edges, misaligned stickers, or unbranded URLs on public payment kiosks.',
      },
      {
        signal: 'Unfamiliar Domain in Camera Preview',
        explanation: 'Modern phone cameras show a small domain preview banner when pointing at a QR code—check it carefully before tapping.',
      },
    ],
    fictionalExample: {
      title: 'The "MFA Token Re-Sync" PDF',
      context: 'An employee receives an email attachment titled "Mandatory_2FA_Upgrade.pdf".',
      artifactText: 'PDF Content: "Your Authenticator certificate expires today. Scan the QR code below with your mobile camera and enter your corporate email and password to retain access." -> Decodes to: https://auth-sync-mobile.example.org/login',
      deceptionBreakdown: 'Legitimate authenticator QR codes are only scanned from inside an authenticated security settings page you opened yourself—never from an unsolicited PDF email attachment.',
    },
    whatToDo: [
      'Always read the full URL preview displayed by your camera app before tapping to open any QR link.',
      'Inspect physical QR codes on parking meters or kiosks for signs of tampering or overlay stickers.',
      'Access corporate portals or payment services directly by typing the known official website address.',
    ],
    whatNotToDo: [
      'Never enter corporate credentials or banking passwords on a webpage opened via an emailed or printed QR code.',
      'Do not assume QR codes inside PDF attachments have been checked by email antivirus tools.',
    ],
    knowledgeCheck: {
      question: 'Why do attackers embed QR codes inside PDF attachments instead of sending standard clickable links?',
      options: [
        {
          id: 'kc-4-a',
          text: 'To hide the URL from automated text-link scanners and shift the victim from a protected desktop to a personal phone.',
          isCorrect: true,
          feedback: 'Spot on! It conceals the URL inside an image and moves the interaction onto a mobile browser.',
        },
        {
          id: 'kc-4-b',
          text: 'Because PDF files cannot contain clickable text hyperlinks.',
          isCorrect: false,
          feedback: 'PDFs support standard text hyperlinks, which security gateways routinely scan.',
        },
        {
          id: 'kc-4-c',
          text: 'Because QR codes automatically log you in without needing a password.',
          isCorrect: false,
          feedback: 'The QR code simply opens a phishing webpage that asks you to type your password.',
        },
      ],
    },
  },
  {
    id: 'mod-5',
    slug: 'social-engineering',
    title: 'Social Engineering',
    subtitle: 'Recognizing psychological manipulation: pretexting, authority, urgency, and familiarity.',
    attackType: 'social_engineering',
    attackTypeLabel: 'Live Social Engineering & Pretexting',
    readingTimeMinutes: 4,
    whatItIs: 'Social engineering is the art of manipulating people into bypassing normal security procedures. Rather than exploiting software vulnerabilities, social engineers exploit human traits: helpfulness, respect for authority, fear of consequences, and urgency.',
    howItWorks: [
      'Reconnaissance: The attacker gathers real context from public sources (LinkedIn org charts, vendor names, conference schedules) or leaked databases.',
      'Pretexting: They contact you posing as an executive, IT administrator, auditor, or supplier with a plausible story.',
      'Pressure & Isolation: They create a time-critical scenario and discourage you from verifying through normal channels ("The CEO is in a board meeting and needs these gift cards / wire details in 15 minutes").',
    ],
    warningSigns: [
      {
        signal: 'Requests to Bypass Standard Approval Workflows',
        explanation: 'Any request asking you to skip verification because of an "emergency", "confidential acquisition", or "system outage".',
      },
      {
        signal: 'Context Dropping Used as Proof of Identity',
        explanation: 'Assuming someone is trustworthy just because they know your manager’s name, office location, or employee ID.',
      },
      {
        signal: 'MFA Push Bombing + Helpdesk Outreach',
        explanation: 'Receiving repeated MFA prompts followed by a chat or call from "IT" asking you to tap Approve.',
      },
    ],
    fictionalExample: {
      title: 'The Executive Urgent Wire / Gift Card Pretext',
      context: 'A new operations coordinator receives a message from an external number claiming to be the VP of Operations.',
      artifactText: '"Hi Sam, I’m stepped out of the client summit in Chicago and my corporate card isn’t authenticating on roaming. Can you urgently process 5 digital vendor vouchers and email me the redemption codes in the next 20 minutes? I’ll have Finance reimburse you at 3 PM."',
      deceptionBreakdown: 'Combines executive authority, a plausible reason why they cannot be reached by phone ("in a client summit"), and a 20-minute deadline.',
    },
    whatToDo: [
      'Verify any sensitive financial, data, or credential request out-of-band using a known phone number or in-person conversation.',
      'Slow down whenever a message triggers sudden anxiety, excitement, or time pressure.',
      'Remember that knowing public directory details (names, titles) does not verify someone’s identity.',
    ],
    whatNotToDo: [
      'Never share passwords, one-time passcodes (OTPs), or session tokens with anyone for any reason.',
      'Never verify a suspicious request by replying within the same message thread or calling a phone number provided inside the suspicious message.',
    ],
    knowledgeCheck: {
      question: 'A caller claiming to be from IT Security knows your full name, department, and manager’s name, and asks for your 6-digit MFA code. What is the right conclusion?',
      options: [
        {
          id: 'kc-5-a',
          text: 'They must be legitimate internal staff since they know your org chart details.',
          isCorrect: false,
          feedback: 'Org chart details are easily scraped from LinkedIn or corporate directories.',
        },
        {
          id: 'kc-5-b',
          text: 'It is a social engineering attack; background details are easy to find, and real IT never asks for an MFA code.',
          isCorrect: true,
          feedback: 'Correct! Never equate familiarity with authentication, and never share an OTP.',
        },
        {
          id: 'kc-5-c',
          text: 'Share the code, then change your password afterward.',
          isCorrect: false,
          feedback: 'Sharing the code gives the attacker immediate access to lock you out and register their own MFA device.',
        },
      ],
    },
  },
  {
    id: 'mod-6',
    slug: 'password-mfa',
    title: 'Password Security & Multi-Factor Authentication',
    subtitle: 'Why password reuse, SMS codes, and MFA fatigue attacks matter—and how passkeys stop spoofing.',
    attackType: 'password_mfa',
    attackTypeLabel: 'Password & MFA Resilience',
    readingTimeMinutes: 4,
    whatItIs: 'Strong authentication combines unique, high-entropy credentials with phishing-resistant Multi-Factor Authentication (MFA). Understanding how attackers bypass basic MFA helps you choose stronger defenses.',
    howItWorks: [
      'Credential Stuffing: When one third-party website is breached, attackers test those leaked email/password pairs across corporate, banking, and email portals.',
      'Real-Time Phishing Proxies (AiTM): Modern fake login pages ask for your password and 6-digit code, forwarding both to the real service in milliseconds to steal the resulting session cookie.',
      'Domain-Bound Protection: Password managers and FIDO2 Passkeys check the actual browser domain cryptographically—refusing to auto-fill or sign in on a lookalike domain.',
    ],
    warningSigns: [
      {
        signal: 'Password Manager Refuses to Auto-Fill',
        explanation: 'If your password manager normally fills your login on a site but stays blank, stop immediately—the domain name in the address bar is likely a spoof!',
      },
      {
        signal: 'Uninitiated MFA Push Prompts',
        explanation: 'Receiving an "Approve Sign-In?" prompt when you aren’t logging in means someone else just entered your password.',
      },
    ],
    fictionalExample: {
      title: 'When Auto-Fill Saves the Day',
      context: 'A user clicks a link to `https://northstar-portal.example.net` instead of `https://northstar.example.com`.',
      artifactText: 'Observation: The user opens their password manager, which shows "No matching logins for northstar-portal.example.net". Instead of manually copying and pasting their password, the user realizes the domain does not match.',
      deceptionBreakdown: 'Humans are easily fooled by visual lookalikes (`rn` vs `m`, hyphenated domains), but password managers compare the exact registered domain string.',
    },
    whatToDo: [
      'Use a reputable password manager and generate unique 16+ character passwords for every account.',
      'Prefer FIDO2 Passkeys or hardware security keys where supported, followed by authenticator apps with number-matching.',
      'If your password manager does not auto-fill on a login page, treat it as a warning sign and inspect the URL.',
    ],
    whatNotToDo: [
      'Never manually copy-and-paste your password into a page where your password manager refused to auto-fill without first verifying the domain.',
      'Never reuse your work or primary email password on any other website.',
      'Never approve an MFA push notification you did not personally trigger seconds ago.',
    ],
    knowledgeCheck: {
      question: 'You land on what looks like your work login page, but your password manager says "No saved logins for this website." What should you do?',
      options: [
        {
          id: 'kc-6-a',
          text: 'Open the password manager vault, copy the password manually, and paste it into the form.',
          isCorrect: false,
          feedback: 'Manually pasting overrides the domain check that is trying to protect you!',
        },
        {
          id: 'kc-6-b',
          text: 'Stop and inspect the URL—your password manager detected that the domain name does not match the official site.',
          isCorrect: true,
          feedback: 'Correct! Password managers bind credentials to the exact domain name and won’t be fooled by lookalike URLs.',
        },
        {
          id: 'kc-6-c',
          text: 'Click "Forgot Password" on that same page.',
          isCorrect: false,
          feedback: 'Interacting with a phishing page still gives the attacker information.',
        },
      ],
    },
  },
  {
    id: 'mod-7',
    slug: 'malware-basics',
    title: 'Malware Basics & Attachment Traps',
    subtitle: 'How malicious attachments, double file extensions, and fake browser updates trick users into running code.',
    attackType: 'malware_basics',
    attackTypeLabel: 'Malware & Attachment Traps',
    readingTimeMinutes: 3,
    whatItIs: 'Malware (malicious software) includes info-stealers, ransomware, and remote-access trojans. Rather than breaking through network firewalls directly, most malware relies on tricking a user into opening a disguised file or executing a command.',
    howItWorks: [
      'Disguised File Extensions: Attackers name an executable file `Invoice_Q4.pdf.exe` or package it inside a password-protected `.zip` or `.iso` archive so email scanners cannot inspect it.',
      'Macro & Script Lures: Documents display a blurred preview image claiming "Protected Document — Click Enable Content / Enable Editing to view".',
      'Fake Browser / Codec Updates: Compromised websites display a convincing banner claiming "Your Chrome/Edge browser or video codec is out of date" to make you download an info-stealer.',
    ],
    warningSigns: [
      {
        signal: 'Password-Protected Archives (.zip, .7z) with the Password in the Email Body',
        explanation: 'Attackers encrypt attachments and give you the password in the email solely so automated antivirus gateways cannot scan the file inside.',
      },
      {
        signal: 'Double Extensions or Unexpected File Types',
        explanation: 'An "invoice" or "voicemail" arriving as `.exe`, `.scr`, `.iso`, `.lnk`, `.vbs`, or `.html` instead of a standard PDF.',
      },
      {
        signal: 'Prompts to "Enable Macros" or Run Terminal Commands',
        explanation: 'A legitimate PDF or spreadsheet invoice never requires enabling macros or pasting a command into PowerShell/Terminal.',
      },
    ],
    fictionalExample: {
      title: 'The Encrypted Archive Invoice',
      context: 'An accounting clerk receives an email with `Remittance_8821.zip` and the note: "Archive password: 2026pay".',
      artifactText: 'Inside Remittance_8821.zip -> "Remittance_Statement_PDF      .scr" (Screen saver executable disguised with trailing spaces)',
      deceptionBreakdown: 'By encrypting the ZIP file, the attacker bypassed the company’s email gateway scanner. Inside, a Windows `.scr` executable mimics a PDF.',
    },
    whatToDo: [
      'Verify unexpected attachments (especially `.zip` archives or links to file-sharing sites) with the sender via a separate channel.',
      'Update web browsers only through the browser’s built-in Settings -> About menu, never via a webpage popup.',
      'Keep operating systems and applications patched with automatic security updates.',
    ],
    whatNotToDo: [
      'Never open password-protected ZIP attachments from unsolicited or unverified emails.',
      'Never click "Enable Content" or "Enable Macros" on documents downloaded from email.',
      'Never copy and paste commands from a webpage verification prompt into Windows Run or macOS Terminal.',
    ],
    knowledgeCheck: {
      question: 'Why do attackers often send malicious attachments inside a password-protected ZIP file and write the password right in the email?',
      options: [
        {
          id: 'kc-7-a',
          text: 'To protect your privacy while the email travels across the internet.',
          isCorrect: false,
          feedback: 'Anyone who intercepts the email also sees the password written in the body.',
        },
        {
          id: 'kc-7-b',
          text: 'To prevent automated email antivirus scanners from unlocking and inspecting the malicious file inside.',
          isCorrect: true,
          feedback: 'Correct! Encryption blocks automated security gateways from scanning the payload until you manually unlock it.',
        },
        {
          id: 'kc-7-c',
          text: 'Because email servers compress encrypted files faster.',
          isCorrect: false,
          feedback: 'Encryption does not improve compression; it is purely an evasion technique.',
        },
      ],
    },
  },
  {
    id: 'mod-8',
    slug: 'account-security',
    title: 'Account Security & Session Hygiene',
    subtitle: 'Protecting your primary email hub, auditing active sessions, and responding quickly if you click a link.',
    attackType: 'account_security',
    attackTypeLabel: 'Account Recovery & Session Hygiene',
    readingTimeMinutes: 3,
    whatItIs: 'Account security encompasses the ongoing habits and rapid-response steps that keep your digital identity resilient—even if you accidentally click a suspicious link.',
    howItWorks: [
      'Your primary email account is the "master key" to your digital life because every other service sends password-reset links there.',
      'When attackers gain access to an account, they often hide their presence by creating silent inbox forwarding rules or registering an extra authenticator device.',
      'Rapid containment—reporting immediately, revoking active sessions, and rotating credentials—prevents a momentary mistake from becoming a full breach.',
    ],
    warningSigns: [
      {
        signal: 'Unexpected Password Reset or "New Device Signed In" Alerts',
        explanation: 'Treat legitimate security alerts inside your official account dashboard seriously—check your active sessions.',
      },
      {
        signal: 'Missing Security Emails or Mysterious Inbox Rules',
        explanation: 'Attackers often add an inbox filter that automatically deletes or forwards emails containing words like "security", "password", or "invoice".',
      },
    ],
    fictionalExample: {
      title: 'Fast Recovery After a Mistake',
      context: 'An employee realizes 30 seconds after submitting their login on a link that the URL looked wrong.',
      artifactText: 'Immediate Response: Instead of hiding the mistake out of embarrassment, the employee immediately calls the IT Security hotline, revokes active sessions from their official security settings, and changes their password. Total attacker dwell time: under 2 minutes—zero data lost.',
      deceptionBreakdown: 'Cybersecurity is not about perfection; fast, honest reporting after a mistake neutralizes the vast majority of phishing incidents before attackers can act.',
    },
    whatToDo: [
      'Protect your primary personal and work email accounts with your strongest unique passwords and phishing-resistant MFA.',
      'Periodically review "Active Devices / Sessions" and "Connected OAuth Apps" in your account security settings.',
      'If you ever click a phishing link or enter credentials on a suspicious site, report it immediately and revoke active sessions.',
    ],
    whatNotToDo: [
      'Never hide a suspected phishing click out of embarrassment—speed of reporting is critical.',
      'Do not grant broad "Read and Send Email" OAuth permissions to untrusted third-party apps.',
    ],
    knowledgeCheck: {
      question: 'What is the single most effective action if you realize you just entered your password on a suspected phishing page?',
      options: [
        {
          id: 'kc-8-a',
          text: 'Close the browser window and hope the attacker doesn’t notice your account.',
          isCorrect: false,
          feedback: 'Automated phishing kits harvest and test credentials within seconds.',
        },
        {
          id: 'kc-8-b',
          text: 'Immediately change your password on the official website, revoke active sessions, and report the incident to IT Security.',
          isCorrect: true,
          feedback: 'Correct! Fast containment—changing the password, revoking sessions, and reporting—stops attackers before they can pivot.',
        },
        {
          id: 'kc-8-c',
          text: 'Go back to the phishing page and enter a fake password to overwrite the real one.',
          isCorrect: false,
          feedback: 'The attacker records every submission; entering a second fake password does not erase the first.',
        },
      ],
    },
  },
];

export function getPublicQuestions(type: 'baseline' | 'final'): PublicQuestion[] {
  const source = type === 'baseline' ? BASELINE_QUESTIONS : FINAL_QUESTIONS;
  return source.map(({ internalCorrectOptionId: _correct, explanation: _exp, ...pub }) => pub);
}

export function getPublicScenarios(): PublicScenario[] {
  return SCENARIOS.map(({ internalScoringData: _internal, ...pub }) => pub);
}

export function getPublicScenarioById(id: string): PublicScenario | undefined {
  const found = SCENARIOS.find((s) => s.id === id);
  if (!found) return undefined;
  const { internalScoringData: _internal, ...pub } = found;
  return pub;
}
