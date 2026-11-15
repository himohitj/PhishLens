import type { LabImage, WebPage } from '../types.ts';

export interface ParsedUrl {
  href: string;
  host: string;
  path: string;
}

export function parseUrl(raw: string): ParsedUrl | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    return { href: u.href, host: u.hostname.toLowerCase(), path: u.pathname || '/' };
  } catch {
    return null;
  }
}

export type Resolution =
  | { kind: 'page'; page: WebPage; url: ParsedUrl; redirectedFrom?: string }
  | { kind: 'refused'; url: ParsedUrl }
  | { kind: 'egress_blocked'; url: ParsedUrl }
  | { kind: 'invalid'; raw: string };

function stripScheme(href: string): string {
  return href.replace(/^[a-z]+:\/\//i, '').replace(/\/$/, '').toLowerCase();
}

/**
 * The container's entire "internet". Only hosts declared in the lab image
 * exist; everything else is dropped at the virtual egress firewall.
 */
export function resolveUrl(image: LabImage, raw: string, depth = 0): Resolution {
  const url = parseUrl(raw);
  if (!url) return { kind: 'invalid', raw };

  const shortKey = Object.keys(image.shortLinks).find((k) => stripScheme(k) === stripScheme(url.href));
  if (shortKey && depth < 3) {
    const next = resolveUrl(image, image.shortLinks[shortKey], depth + 1);
    if (next.kind === 'page') return { ...next, redirectedFrom: url.href };
    return next;
  }

  const sameHost = image.web.filter((p) => parseUrl(p.url)?.host === url.host);
  if (sameHost.length > 0) {
    const exact = sameHost.find((p) => parseUrl(p.url)?.path === url.path);
    return { kind: 'page', page: exact ?? sameHost[0], url };
  }
  if (image.dns[url.host]) return { kind: 'refused', url };
  return { kind: 'egress_blocked', url };
}

export function hostOf(raw: string): string {
  return parseUrl(raw)?.host ?? raw;
}
