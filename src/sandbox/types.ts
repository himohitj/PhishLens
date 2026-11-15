/**
 * PhishLens Sandbox — shared contract between the host application and the
 * isolated guest runtime that boots inside each lab container.
 *
 * A "lab image" is pure data. It describes the virtual workstation the learner
 * is dropped into: mailbox, messages, files, a fake DNS / WHOIS / web, scripted
 * events, and the objectives used to grade the investigation. Nothing in an
 * image executes; the guest runtime interprets it.
 */

export type SandboxAppId =
  | 'mail'
  | 'browser'
  | 'messages'
  | 'files'
  | 'terminal'
  | 'authenticator'
  | 'directory';

/* ------------------------------------------------------------------ */
/* Telemetry: everything the learner does inside the container        */
/* ------------------------------------------------------------------ */

export type SandboxEventType =
  | 'boot'
  | 'app_open'
  | 'mail_open'
  | 'mail_headers'
  | 'mail_reply'
  | 'link_hover'
  | 'link_click'
  | 'navigate'
  | 'egress_blocked'
  | 'cert_view'
  | 'vault_check'
  | 'view_source'
  | 'form_submit'
  | 'page_action'
  | 'attachment_save'
  | 'toggle_extensions'
  | 'file_open'
  | 'file_delete'
  | 'cmd'
  | 'report'
  | 'sms_open'
  | 'chat_send'
  | 'mfa_approve'
  | 'mfa_deny'
  | 'mfa_report'
  | 'call'
  | 'compromised';

export interface SandboxEvent {
  type: SandboxEventType;
  /** Milliseconds since container boot. */
  t: number;
  /** Free-form, flat, primitive-only payload. Never contains typed secrets. */
  [field: string]: string | number | boolean;
}

/**
 * Matches an event when `type` equals and every listed field matches.
 * String fields match case-insensitively by substring, other primitives by
 * strict equality. `anyOf` lets one objective accept several routes.
 */
export interface EventMatcher {
  type?: SandboxEventType;
  where?: Record<string, string | number | boolean>;
  anyOf?: EventMatcher[];
}

/* ------------------------------------------------------------------ */
/* Lab image                                                           */
/* ------------------------------------------------------------------ */

export interface MailAttachment {
  id: string;
  name: string;
  size: string;
  /** Path of the file created in the virtual FS when saved. */
  savesTo: string;
}

export interface MailMessage {
  id: string;
  folder: 'inbox' | 'archive';
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  to: string;
  subject: string;
  date: string;
  preview: string;
  /** Trusted, image-authored HTML. Links are intercepted by the runtime. */
  bodyHtml: string;
  auth: { spf: AuthResult; dkim: AuthResult; dmarc: AuthResult };
  rawHeaders: string;
  attachments?: MailAttachment[];
  unread?: boolean;
  /** Marks the message the lab is about (used by the debrief). */
  suspicious?: boolean;
  externalBanner?: boolean;
}

export type AuthResult = 'pass' | 'fail' | 'softfail' | 'none';

export interface SmsMessage {
  from: 'them' | 'me';
  text: string;
  time: string;
}

export interface MessageThread {
  id: string;
  channel: 'sms' | 'chat';
  title: string;
  subtitle: string;
  badge?: string;
  badgeTone?: 'neutral' | 'warn';
  messages: SmsMessage[];
  /** Scripted reply keyed by the first matching regex (case-insensitive). */
  autoReplies?: { pattern: string; reply: string }[];
  suspicious?: boolean;
}

export type VirtualFileKind =
  | 'pdf'
  | 'text'
  | 'image'
  | 'html'
  | 'executable'
  | 'macro_doc'
  | 'archive';

export interface VirtualFile {
  path: string;
  /** What the learner actually sees when extensions are hidden. */
  displayName: string;
  kind: VirtualFileKind;
  size: string;
  /** Output of `file`. */
  magic: string;
  sha256: string;
  strings?: string[];
  content?: string;
  /** For html attachments: the virtual URL opened in the browser. */
  opensUrl?: string;
  /** Effect of opening/enabling it. */
  onOpen?: { compromise?: string; requiresEnableContent?: boolean };
  /** Files that only appear after an attachment is saved. */
  hidden?: boolean;
}

export interface TlsInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  ageDays: number;
  san: string[];
  organization?: string;
}

export interface PageEffect {
  compromise?: string;
  navigate?: string;
  toast?: string;
}

export interface WebPage {
  url: string;
  title: string;
  /** Trusted, image-authored HTML; style with inline styles or `.pg-*` classes. */
  html: string;
  tls: TlsInfo | null;
  headers: Record<string, string>;
  /** Whether the password vault has a saved login for this origin. */
  vaultHasLogin?: boolean;
  forms?: Record<string, PageEffect>;
  actions?: Record<string, PageEffect>;
  /** Shown in "view source" — highlights what the HTML is hiding. */
  sourceNotes?: string[];
}

export interface DnsRecordSet {
  A?: string[];
  MX?: string[];
  TXT?: string[];
  NS?: string[];
  CNAME?: string[];
}

export interface MfaPush {
  id: string;
  app: string;
  account: string;
  location: string;
  ip: string;
  device: string;
  time: string;
  numberMatch?: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  verified: boolean;
}

export type TimelineEffect =
  | { kind: 'push'; push: MfaPush }
  | { kind: 'sms'; threadId: string; message: SmsMessage }
  | { kind: 'mail'; mail: MailMessage }
  | { kind: 'toast'; text: string };

export interface TimelineEntry {
  id: string;
  trigger: { afterSeconds: number } | { on: EventMatcher; delaySeconds?: number };
  effect: TimelineEffect;
}

export interface LabObjective {
  id: string;
  label: string;
  hint: string;
  why: string;
  points: number;
  match: EventMatcher;
  /** Completing this ends the investigation as a correct verdict. */
  verdict?: boolean;
}

export interface LabTrap {
  id: string;
  label: string;
  consequence: string;
  penalty: number;
  match: EventMatcher;
}

export interface LabImage {
  id: string;
  version: string;
  order: number;
  codename: string;
  title: string;
  tagline: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  attackFamily: string;
  relatedModuleSlug: string;
  persona: { name: string; role: string; email: string; hostname: string };
  briefing: string[];
  apps: SandboxAppId[];
  startApp: SandboxAppId;
  mail: MailMessage[];
  threads: MessageThread[];
  files: VirtualFile[];
  web: WebPage[];
  dns: Record<string, DnsRecordSet>;
  whois: Record<string, string>;
  shortLinks: Record<string, string>;
  threatIntel: Record<string, string>;
  contacts: Contact[];
  calls: Record<string, string[]>;
  timeline: TimelineEntry[];
  objectives: LabObjective[];
  traps: LabTrap[];
  debrief: {
    whatHappened: string;
    redFlags: string[];
    rightMove: string;
    realWorld: string;
  };
}

/* ------------------------------------------------------------------ */
/* Host <-> guest wire protocol                                        */
/* ------------------------------------------------------------------ */

export const SANDBOX_PROTOCOL = 'phishlens.sandbox/1';

export type GuestToHost =
  | { protocol: typeof SANDBOX_PROTOCOL; kind: 'ready' }
  | { protocol: typeof SANDBOX_PROTOCOL; kind: 'event'; nonce: string; event: SandboxEvent };

export interface BootMessage {
  protocol: typeof SANDBOX_PROTOCOL;
  kind: 'boot';
  nonce: string;
  containerId: string;
  image: LabImage;
}

export type HostToGuest = { kind: 'focus-app'; app: SandboxAppId } | { kind: 'shutdown' };
