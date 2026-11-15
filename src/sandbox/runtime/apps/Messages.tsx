import React, { useEffect, useRef, useState } from 'react';
import { Flag, Send } from 'lucide-react';
import { useOs } from '../store.tsx';
import type { MessageThread } from '../../types.ts';

const URL_RE = /((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;

function Linkified({ text, onLink, onHover }: { text: string; onLink: (h: string) => void; onHover: (h: string) => void }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={p}
            onMouseEnter={() => onHover(p)}
            onClick={(e) => {
              e.preventDefault();
              onLink(p);
            }}
          >
            {p}
          </a>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}

export function MessagesApp() {
  const { state, dispatch, emit, openUrl } = useOs();
  const [activeId, setActiveId] = useState<string | null>(state.threads[0]?.id ?? null);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const hovered = useRef(new Set<string>());
  const active: MessageThread | undefined = state.threads.find((t) => t.id === activeId);

  useEffect(() => {
    if (active) {
      dispatch({ type: 'thread_read', id: active.id });
      emit({ type: 'sms_open', id: active.id, title: active.title, channel: active.channel });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [active?.messages.length]);

  const send = () => {
    if (!active || !draft.trim()) return;
    const text = draft.trim();
    dispatch({ type: 'add_sms', threadId: active.id, message: { from: 'me', text, time: 'now' }, unread: false });
    emit({ type: 'chat_send', thread: active.id, containsCode: /\b\d{6}\b/.test(text), length: text.length });
    setDraft('');
    const reply = active.autoReplies?.find((r) => new RegExp(r.pattern, 'i').test(text));
    if (reply) {
      setTimeout(() => {
        dispatch({ type: 'add_sms', threadId: active.id, message: { from: 'them', text: reply.reply, time: 'now' }, unread: false });
      }, 1100);
    }
  };

  const reported = active ? state.reported.includes(active.id) : false;

  return (
    <div className="messages">
      <aside className="thread-list">
        <div className="pane-head"><strong>Messages</strong></div>
        {state.threads.map((t) => (
          <button key={t.id} type="button" className={`thread-row ${t.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(t.id)}>
            <span className="thread-title">
              {t.title}
              {state.unreadThreads.includes(t.id) && <span className="dot" />}
            </span>
            <span className="muted small clamp">{t.messages[t.messages.length - 1]?.text}</span>
          </button>
        ))}
      </aside>
      {active ? (
        <section className="thread">
          <div className="thread-head">
            <div>
              <strong>{active.title}</strong>
              {active.badge && <span className={`tag ${active.badgeTone === 'warn' ? 'tag-warn' : ''}`}>{active.badge}</span>}
              <div className="muted small mono">{active.subtitle}</div>
            </div>
            <button
              type="button"
              className={reported ? 'ok' : 'danger'}
              disabled={reported}
              onClick={() => {
                dispatch({ type: 'reported', target: active.id });
                emit({ type: 'report', target: active.id, channel: active.channel, subject: active.title, suspicious: Boolean(active.suspicious) });
                dispatch({ type: 'toast', toast: { title: 'Reported', text: `${active.title} was reported and blocked.` } });
              }}
            >
              <Flag size={14} /> {reported ? 'Reported' : active.channel === 'sms' ? 'Report junk' : 'Report user'}
            </button>
          </div>
          <div className="bubbles">
            {active.messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>
                <Linkified
                  text={m.text}
                  onHover={(h) => {
                    if (!hovered.current.has(h)) {
                      hovered.current.add(h);
                      emit({ type: 'link_hover', href: h, source: active.channel, id: active.id });
                    }
                  }}
                  onLink={(h) => {
                    emit({ type: 'link_click', href: h, source: active.channel, id: active.id });
                    openUrl(h, active.channel);
                  }}
                />
                <span className="bubble-time">{m.time}</span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message (stays inside the container)" aria-label="Message" />
            <button type="submit" className="primary icon" aria-label="Send"><Send size={14} /></button>
          </form>
        </section>
      ) : (
        <div className="empty">No conversations.</div>
      )}
    </div>
  );
}
