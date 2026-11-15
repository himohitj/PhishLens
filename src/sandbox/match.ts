import type { EventMatcher, SandboxEvent } from './types.ts';

/** Pure matcher shared by the guest (timeline triggers) and host (grading). */
export function matchesEvent(matcher: EventMatcher, event: SandboxEvent): boolean {
  if (matcher.anyOf && matcher.anyOf.length > 0) {
    return matcher.anyOf.some((m) => matchesEvent(m, event));
  }
  if (matcher.type && matcher.type !== event.type) return false;
  if (matcher.where) {
    for (const [key, expected] of Object.entries(matcher.where)) {
      const actual = event[key];
      if (actual === undefined) return false;
      if (typeof expected === 'string') {
        if (!String(actual).toLowerCase().includes(expected.toLowerCase())) return false;
      } else if (actual !== expected) {
        return false;
      }
    }
  }
  return Boolean(matcher.type || matcher.where);
}
