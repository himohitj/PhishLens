import { matchesEvent } from './match.ts';
import type { LabImage, SandboxEvent } from './types.ts';

export interface ObjectiveResult {
  id: string;
  label: string;
  why: string;
  points: number;
  completed: boolean;
  completedAt: number | null;
}

export interface TrapResult {
  id: string;
  label: string;
  consequence: string;
  penalty: number;
  triggered: boolean;
  triggeredAt: number | null;
}

export type LabOutcome = 'secured' | 'contained' | 'incomplete' | 'compromised';

export interface LabEvaluation {
  objectives: ObjectiveResult[];
  traps: TrapResult[];
  score: number;
  maxScore: number;
  outcome: LabOutcome;
  verdictReached: boolean;
  compromised: boolean;
  investigationDepth: number;
}

function firstMatchTime(events: SandboxEvent[], test: (e: SandboxEvent) => boolean): number | null {
  const hit = events.find(test);
  return hit ? hit.t : null;
}

/**
 * Grades a container's event log against its lab image. Pure and deterministic:
 * the same log always yields the same evaluation, so the host can re-grade
 * live as events stream in and again when the mission ends.
 */
export function evaluateLab(image: LabImage, events: SandboxEvent[]): LabEvaluation {
  const objectives: ObjectiveResult[] = image.objectives.map((o) => {
    const at = firstMatchTime(events, (e) => matchesEvent(o.match, e));
    return {
      id: o.id,
      label: o.label,
      why: o.why,
      points: o.points,
      completed: at !== null,
      completedAt: at,
    };
  });

  const traps: TrapResult[] = image.traps.map((t) => {
    const at = firstMatchTime(events, (e) => matchesEvent(t.match, e));
    return {
      id: t.id,
      label: t.label,
      consequence: t.consequence,
      penalty: t.penalty,
      triggered: at !== null,
      triggeredAt: at,
    };
  });

  const maxScore = image.objectives.reduce((s, o) => s + o.points, 0);
  const earned = objectives.filter((o) => o.completed).reduce((s, o) => s + o.points, 0);
  const penalty = traps.filter((t) => t.triggered).reduce((s, t) => s + t.penalty, 0);
  const raw = maxScore === 0 ? 0 : ((earned - penalty) / maxScore) * 100;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const verdictIds = new Set(image.objectives.filter((o) => o.verdict).map((o) => o.id));
  const verdictReached = objectives.some((o) => verdictIds.has(o.id) && o.completed);
  const compromised =
    traps.some((t) => t.triggered) || events.some((e) => e.type === 'compromised');

  const investigative = objectives.filter((o) => !verdictIds.has(o.id));
  const investigationDepth =
    investigative.length === 0
      ? 0
      : Math.round((investigative.filter((o) => o.completed).length / investigative.length) * 100);

  let outcome: LabOutcome;
  if (compromised && verdictReached) outcome = 'contained';
  else if (compromised) outcome = 'compromised';
  else if (verdictReached) outcome = 'secured';
  else outcome = 'incomplete';

  return { objectives, traps, score, maxScore, outcome, verdictReached, compromised, investigationDepth };
}

export const OUTCOME_COPY: Record<LabOutcome, { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral'; summary: string }> = {
  secured: {
    label: 'Threat neutralised',
    tone: 'good',
    summary: 'You identified the attack and escalated it without handing the attacker anything.',
  },
  contained: {
    label: 'Compromised, then contained',
    tone: 'warn',
    summary: 'The attacker got a foothold, but you recognised it and raised the alarm. Fast reporting limits real damage.',
  },
  compromised: {
    label: 'Container compromised',
    tone: 'bad',
    summary: 'The attack succeeded and was never reported. Inside this sandbox it was harmless. Outside, it would not be.',
  },
  incomplete: {
    label: 'No verdict reached',
    tone: 'neutral',
    summary: 'You stayed safe but never reported the threat, so colleagues receiving the same lure remain exposed.',
  },
};

/** Human-readable line for the debrief timeline. */
export function describeEvent(e: SandboxEvent): string | null {
  const s = (k: string) => String(e[k] ?? '');
  switch (e.type) {
    case 'boot':
      return 'Container booted from a clean image';
    case 'app_open':
      return `Opened ${s('app')}`;
    case 'mail_open':
      return `Read email “${s('subject')}”`;
    case 'mail_headers':
      return e.view === 'sender'
        ? `Revealed the real sender address of “${s('subject')}”`
        : `Inspected raw headers of “${s('subject')}”`;
    case 'mail_reply':
      return `Replied to “${s('subject')}”`;
    case 'link_hover':
      return `Previewed link destination ${s('href')}`;
    case 'link_click':
      return `Clicked a link to ${s('href')}`;
    case 'navigate':
      return `Browser loaded ${s('url')}`;
    case 'egress_blocked':
      return `Sandbox blocked outbound request to ${s('host')}`;
    case 'cert_view':
      return `Inspected TLS certificate for ${s('host')}`;
    case 'vault_check':
      return e.matched ? `Password vault recognised ${s('host')}` : `Password vault had no login for ${s('host')}`;
    case 'view_source':
      return `Viewed page source of ${s('host')}`;
    case 'form_submit':
      return `Submitted the “${s('form')}” form on ${s('host')}`;
    case 'page_action':
      return `Pressed “${s('label')}” on ${s('host')}`;
    case 'attachment_save':
      return `Saved attachment ${s('name')}`;
    case 'toggle_extensions':
      return e.visible ? 'Turned on full file extensions' : 'Hid file extensions';
    case 'file_open':
      return `Opened file ${s('path')}`;
    case 'file_delete':
      return `Deleted ${s('path')}`;
    case 'cmd':
      return `$ ${s('raw')}`;
    case 'report':
      return `Reported ${s('target')} as phishing`;
    case 'sms_open':
      return `Opened conversation with ${s('title')}`;
    case 'chat_send':
      return e.containsCode ? 'Sent a one-time code in chat' : 'Sent a chat reply';
    case 'mfa_approve':
      return `Approved MFA push from ${s('location')}`;
    case 'mfa_deny':
      return `Denied MFA push from ${s('location')}`;
    case 'mfa_report':
      return `Reported MFA push from ${s('location')} as fraud`;
    case 'call':
      return `Called ${s('name')} on a verified number`;
    case 'compromised':
      return `Compromise: ${s('reason')}`;
    default:
      return null;
  }
}
