import React, { useEffect, useRef, useState } from 'react';
import { useOs } from '../store.tsx';
import { parseUrl, resolveUrl } from '../net.ts';
import type { LabImage, VirtualFile } from '../../types.ts';

interface Line {
  kind: 'in' | 'out' | 'err';
  text: string;
}

const HELP = `PhishLens forensic shell — every command runs inside this container only.

  ls [dir]              list files (Downloads lives in ~)
  file <path>           identify a file by its contents, not its name
  sha256sum <path>      fingerprint a file
  strings <path>        printable text hidden in a file
  cat <path>            print a text file
  intel <hash|domain>   query the offline threat-intel feed
  whois <domain>        domain registration record
  dig <domain> [type]   DNS lookup (A, MX, TXT, NS, CNAME)
  curl -I <url>         fetch response headers only
  expand <url>          follow a short link without opening it
  base64 -d <text>      decode base64
  history | clear | whoami | hostname`;

function findFile(files: VirtualFile[], arg: string): VirtualFile | undefined {
  const clean = arg.replace(/^~\//, '').replace(/^\/home\/[^/]+\//, '').replace(/^"|"$/g, '');
  return files.find(
    (f) => !f.hidden && (f.path === arg || f.path.endsWith(`/${clean}`) || f.path.split('/').pop() === clean)
  );
}

function run(image: LabImage, files: VirtualFile[], raw: string, hist: string[]): { out: Line[]; clear?: boolean } {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const arg = args.join(' ');
  const out = (text: string): Line => ({ kind: 'out', text });
  const err = (text: string): Line => ({ kind: 'err', text });

  switch (cmd) {
    case 'help':
      return { out: [out(HELP)] };
    case 'clear':
      return { out: [], clear: true };
    case 'whoami':
      return { out: [out(image.persona.email.split('@')[0])] };
    case 'hostname':
      return { out: [out(image.persona.hostname)] };
    case 'history':
      return { out: [out(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n'))] };
    case 'pwd':
      return { out: [out(`/home/${image.persona.email.split('@')[0]}`)] };
    case 'ls': {
      const visible = files.filter((f) => !f.hidden);
      if (visible.length === 0) return { out: [out('Downloads/')] };
      const dir = arg.replace(/\/$/, '');
      if (!dir || dir === '~' || dir === '.') return { out: [out('Downloads/')] };
      return {
        out: [out(visible.map((f) => `${f.size.padStart(8)}  ${f.path.split('/').pop()}`).join('\n'))],
      };
    }
    case 'file': {
      const f = findFile(files, arg);
      return f ? { out: [out(`${f.path.split('/').pop()}: ${f.magic}`)] } : { out: [err(`file: ${arg || '?'}: No such file`)] };
    }
    case 'sha256sum': {
      const f = findFile(files, arg);
      return f ? { out: [out(`${f.sha256}  ${f.path.split('/').pop()}`)] } : { out: [err(`sha256sum: ${arg || '?'}: No such file`)] };
    }
    case 'strings': {
      const f = findFile(files, arg);
      if (!f) return { out: [err(`strings: ${arg || '?'}: No such file`)] };
      return { out: [out((f.strings ?? ['(no printable strings)']).join('\n'))] };
    }
    case 'cat': {
      const f = findFile(files, arg);
      if (!f) return { out: [err(`cat: ${arg || '?'}: No such file`)] };
      if (f.kind === 'text' || f.kind === 'html') return { out: [out(f.content ?? '')] };
      return { out: [err(`cat: ${f.path.split('/').pop()}: binary file — try 'file' or 'strings'`)] };
    }
    case 'intel': {
      const key = Object.keys(image.threatIntel).find((k) => k.toLowerCase() === arg.toLowerCase());
      return {
        out: [out(key ? image.threatIntel[key] : `intel: no record for "${arg}". Unknown is not the same as safe.`)],
      };
    }
    case 'whois': {
      const domain = arg.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
      const rec = image.whois[domain];
      return { out: [rec ? out(rec) : err(`whois: no match for "${domain}"`)] };
    }
    case 'dig':
    case 'nslookup': {
      const [d, type = 'A'] = args;
      const domain = (d ?? '').toLowerCase();
      const rec = image.dns[domain];
      if (!rec) return { out: [out(`;; ->>HEADER<<- status: NXDOMAIN\n;; QUESTION: ${domain}. IN ${type.toUpperCase()}`)] };
      const t = type.toUpperCase() as keyof typeof rec;
      const values = rec[t];
      if (!values || values.length === 0) return { out: [out(`;; status: NOERROR, ANSWER: 0\n;; no ${t} records for ${domain}`)] };
      return { out: [out(`;; status: NOERROR, ANSWER: ${values.length}\n${values.map((v) => `${domain}.\t300\tIN\t${t}\t${v}`).join('\n')}`)] };
    }
    case 'curl': {
      const target = args.filter((a) => !a.startsWith('-'))[0];
      if (!args.includes('-I') && !args.includes('--head')) {
        return { out: [err('curl: body downloads are disabled in this lab. Use curl -I <url> to inspect headers.')] };
      }
      if (!target) return { out: [err('curl: no URL specified')] };
      const short = Object.keys(image.shortLinks).find((k) => k.replace(/^https?:\/\//, '') === target.replace(/^https?:\/\//, ''));
      if (short) {
        return { out: [out(`HTTP/2 301\nlocation: ${image.shortLinks[short]}\nserver: shortener-edge`)] };
      }
      const r = resolveUrl(image, target);
      if (r.kind === 'page') {
        return {
          out: [out(`HTTP/2 200\n${Object.entries(r.page.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}`)],
        };
      }
      if (r.kind === 'egress_blocked') return { out: [err(`curl: (7) egress to ${r.url.host} blocked by sandbox firewall`)] };
      return { out: [err(`curl: (6) Could not resolve host: ${parseUrl(target)?.host ?? target}`)] };
    }
    case 'expand': {
      const key = Object.keys(image.shortLinks).find((k) => k.replace(/^https?:\/\//, '') === arg.replace(/^https?:\/\//, ''));
      return { out: [key ? out(`${arg}\n  └─ 301 → ${image.shortLinks[key]}`) : out(`${arg} is not a known short link (no redirect).`)] };
    }
    case 'base64': {
      if (args[0] !== '-d') return { out: [err('usage: base64 -d <text>')] };
      try {
        return { out: [out(atob(args.slice(1).join('')))] };
      } catch {
        return { out: [err('base64: invalid input')] };
      }
    }
    case 'ping':
    case 'wget':
    case 'ssh':
    case 'nc':
      return { out: [err(`${cmd}: network egress is disabled inside PhishLens containers`)] };
    case 'sudo':
      return { out: [err(`${image.persona.email.split('@')[0]} is not in the sudoers file. This incident will be reported. (Not really.)`)] };
    case '':
      return { out: [] };
    default:
      return { out: [err(`${cmd}: command not found. Type 'help'.`)] };
  }
}

export function TerminalApp() {
  const { image, state, emit } = useOs();
  const user = image.persona.email.split('@')[0];
  const prompt = `${user}@${image.persona.hostname}:~$`;
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: `Connected to ${image.persona.hostname} (isolated). Type 'help' for forensic commands.` },
  ]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const submit = () => {
    const raw = input;
    const nextHist = raw.trim() ? [...hist, raw] : hist;
    const result = run(image, state.files, raw, nextHist);
    const [name = '', ...rest] = raw.trim().split(/\s+/);
    if (name) emit({ type: 'cmd', name, args: rest.join(' '), raw: raw.trim().slice(0, 160) });
    setLines((l) => (result.clear ? [] : [...l, { kind: 'in', text: `${prompt} ${raw}` }, ...result.out]));
    setHist(nextHist);
    setCursor(null);
    setInput('');
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="term-scroll">
        {lines.map((l, i) => (
          <pre key={i} className={`term-${l.kind}`}>{l.text}</pre>
        ))}
        <div className="term-input">
          <span className="term-prompt">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            autoFocus
            spellCheck={false}
            aria-label="Terminal input"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'ArrowUp' && hist.length) {
                e.preventDefault();
                const c = cursor === null ? hist.length - 1 : Math.max(0, cursor - 1);
                setCursor(c);
                setInput(hist[c]);
              }
              if (e.key === 'ArrowDown' && cursor !== null) {
                e.preventDefault();
                const c = cursor + 1;
                if (c >= hist.length) {
                  setCursor(null);
                  setInput('');
                } else {
                  setCursor(c);
                  setInput(hist[c]);
                }
              }
            }}
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
