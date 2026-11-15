import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Bell, Contact2, FolderOpen, Globe, KeyRound, Mail, MessageSquare, ShieldCheck, Skull, SquareTerminal, WifiOff, X } from 'lucide-react';
import { OsContext, initialState, reducer, type EmitFn, type OsContextValue } from './store.tsx';
import { matchesEvent } from '../match.ts';
import type { LabImage, SandboxAppId, SandboxEvent, TimelineEntry } from '../types.ts';
import { MailApp } from './apps/Mail.tsx';
import { BrowserApp } from './apps/Browser.tsx';
import { TerminalApp } from './apps/Terminal.tsx';
import { FilesApp } from './apps/Files.tsx';
import { MessagesApp } from './apps/Messages.tsx';
import { AuthenticatorApp } from './apps/Authenticator.tsx';
import { DirectoryApp } from './apps/Directory.tsx';

const APP_META: Record<SandboxAppId, { label: string; icon: React.ReactNode }> = {
  mail: { label: 'Mail', icon: <Mail size={18} /> },
  browser: { label: 'Browser', icon: <Globe size={18} /> },
  messages: { label: 'Messages', icon: <MessageSquare size={18} /> },
  files: { label: 'Files', icon: <FolderOpen size={18} /> },
  terminal: { label: 'Terminal', icon: <SquareTerminal size={18} /> },
  authenticator: { label: 'Authenticator', icon: <KeyRound size={18} /> },
  directory: { label: 'Directory', icon: <Contact2 size={18} /> },
};

interface DesktopProps {
  image: LabImage;
  containerId: string;
  send: (event: SandboxEvent) => void;
  focusRequest: SandboxAppId | null;
}

export function Desktop({ image, containerId, send, focusRequest }: DesktopProps) {
  const [state, dispatch] = useReducer(reducer, image, initialState);
  const bootAt = useRef(performance.now());
  const fired = useRef(new Set<string>());
  const timers = useRef<number[]>([]);
  const [clock, setClock] = useState(() => new Date());

  const applyTimeline = useCallback((entry: TimelineEntry) => {
    if (fired.current.has(entry.id)) return;
    fired.current.add(entry.id);
    const e = entry.effect;
    if (e.kind === 'push') {
      dispatch({ type: 'add_push', push: e.push });
      dispatch({ type: 'toast', toast: { title: 'Authenticator', text: `Approve sign-in from ${e.push.location}?`, app: 'authenticator' } });
    } else if (e.kind === 'sms') {
      dispatch({ type: 'add_sms', threadId: e.threadId, message: e.message, unread: true });
      const t = image.threads.find((th) => th.id === e.threadId);
      dispatch({ type: 'toast', toast: { title: t?.title ?? 'Message', text: e.message.text.slice(0, 90), app: 'messages' } });
    } else if (e.kind === 'mail') {
      dispatch({ type: 'add_mail', mail: e.mail });
      dispatch({ type: 'toast', toast: { title: e.mail.fromName, text: e.mail.subject, app: 'mail' } });
    } else {
      dispatch({ type: 'toast', toast: { title: 'Notification', text: e.text } });
    }
  }, [image]);

  const emit: EmitFn = useCallback(
    (partial) => {
      const event = { ...partial, t: Math.round(performance.now() - bootAt.current) } as SandboxEvent;
      send(event);
      for (const trap of image.traps) {
        if (matchesEvent(trap.match, event)) {
          dispatch({ type: 'compromise', label: trap.label, consequence: trap.consequence });
          break;
        }
      }
      for (const entry of image.timeline) {
        if ('on' in entry.trigger && !fired.current.has(entry.id) && matchesEvent(entry.trigger.on, event)) {
          const delay = (entry.trigger.delaySeconds ?? 0) * 1000;
          timers.current.push(window.setTimeout(() => applyTimeline(entry), delay));
        }
      }
    },
    [image, send, applyTimeline]
  );

  useEffect(() => {
    emit({ type: 'boot', image: image.id, version: image.version });
    for (const entry of image.timeline) {
      if ('afterSeconds' in entry.trigger) {
        timers.current.push(window.setTimeout(() => applyTimeline(entry), entry.trigger.afterSeconds * 1000));
      }
    }
    const tick = window.setInterval(() => setClock(new Date()), 15000);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (focusRequest) dispatch({ type: 'open_app', app: focusRequest });
  }, [focusRequest]);

  useEffect(() => {
    emit({ type: 'app_open', app: state.app });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.app]);

  useEffect(() => {
    if (state.toasts.length === 0) return;
    const latest = state.toasts[state.toasts.length - 1];
    const id = window.setTimeout(() => dispatch({ type: 'dismiss_toast', id: latest.id }), 6500);
    return () => window.clearTimeout(id);
  }, [state.toasts]);

  const openUrl = useCallback((url: string) => dispatch({ type: 'browse', url }), []);

  const ctx: OsContextValue = useMemo(
    () => ({ image, containerId, state, dispatch, emit, openUrl }),
    [image, containerId, state, emit, openUrl]
  );

  const badge = (app: SandboxAppId): number => {
    if (app === 'mail') return state.mail.filter((m) => m.unread && m.folder === 'inbox').length;
    if (app === 'messages') return state.unreadThreads.length;
    if (app === 'authenticator') return state.pushes.filter((p) => p.status === 'pending').length;
    return 0;
  };

  return (
    <OsContext.Provider value={ctx}>
      <div className="os">
        <header className="os-top">
          <span className="os-chip"><ShieldCheck size={12} /> {containerId}</span>
          <span className="os-title">{APP_META[state.app].label} · {image.persona.name}</span>
          <span className="os-right">
            <span className="os-chip muted"><WifiOff size={12} /> lab network only</span>
            <span className="mono">{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </header>
        <div className="os-main">
          <nav className="dock" aria-label="Apps">
            {image.apps.map((app) => (
              <button
                key={app}
                type="button"
                className={`dock-btn ${state.app === app ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'open_app', app })}
                title={APP_META[app].label}
              >
                {APP_META[app].icon}
                <span className="dock-label">{APP_META[app].label}</span>
                {badge(app) > 0 && <span className="badge">{badge(app)}</span>}
              </button>
            ))}
          </nav>
          <main className="window">
            {state.app === 'mail' && <MailApp />}
            {state.app === 'browser' && <BrowserApp />}
            {state.app === 'terminal' && <TerminalApp />}
            {state.app === 'files' && <FilesApp />}
            {state.app === 'messages' && <MessagesApp />}
            {state.app === 'authenticator' && <AuthenticatorApp />}
            {state.app === 'directory' && <DirectoryApp />}
          </main>
        </div>

        <div className="toasts" aria-live="polite">
          {state.toasts.map((t) => (
            <div key={t.id} className="toast">
              <button type="button" className="toast-body" onClick={() => { if (t.app) dispatch({ type: 'open_app', app: t.app }); dispatch({ type: 'dismiss_toast', id: t.id }); }}>
                <Bell size={14} />
                <span><strong>{t.title}</strong><span className="small">{t.text}</span></span>
              </button>
              <button type="button" className="icon" aria-label="Dismiss" onClick={() => dispatch({ type: 'dismiss_toast', id: t.id })}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {state.compromise && (
          <div className="pwned" role="alertdialog" aria-label="Simulated compromise">
            <div className="pwned-card">
              <Skull size={34} />
              <h2>Simulated compromise</h2>
              <p className="pwned-label">{state.compromise.label}</p>
              <p>{state.compromise.consequence}</p>
              <p className="muted small">
                This happened inside container <span className="mono">{containerId}</span>. It has no network, no access to your real browser data, and it is thrown away when you reset. Nothing left the sandbox.
              </p>
              <p className="small">You can still contain it: report what happened before you end the mission.</p>
              <button type="button" className="primary" onClick={() => dispatch({ type: 'clear_compromise' })}>
                Keep investigating
              </button>
            </div>
          </div>
        )}
      </div>
    </OsContext.Provider>
  );
}
