import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Archive, Code2, Flag, Paperclip, Reply, ShieldCheck, X } from 'lucide-react';
import { useOs } from '../store.tsx';
import { TrustedHtml } from '../TrustedHtml.tsx';
import type { AuthResult, MailMessage } from '../../types.ts';

function AuthPill({ label, value }: { label: string; value: AuthResult }) {
  return <span className={`auth-pill auth-${value}`}>{label}: {value}</span>;
}

export function MailApp() {
  const { state, dispatch, emit, openUrl, image } = useOs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [senderRevealed, setSenderRevealed] = useState<string[]>([]);
  const [hoverHref, setHoverHref] = useState<string | null>(null);
  const [composing, setComposing] = useState<MailMessage | null>(null);
  const [draft, setDraft] = useState('');
  const hovered = useRef(new Set<string>());

  const inbox = state.mail.filter((m) => m.folder === 'inbox');
  const selected = useMemo(() => state.mail.find((m) => m.id === selectedId) ?? null, [state.mail, selectedId]);

  useEffect(() => {
    setShowRaw(false);
    setHoverHref(null);
    setComposing(null);
  }, [selectedId]);

  const open = (m: MailMessage) => {
    setSelectedId(m.id);
    dispatch({ type: 'mark_read', id: m.id });
    emit({ type: 'mail_open', id: m.id, subject: m.subject, suspicious: Boolean(m.suspicious) });
  };

  const onHover = (href: string | null) => {
    setHoverHref(href);
    if (href && selected && !hovered.current.has(`${selected.id}|${href}`)) {
      hovered.current.add(`${selected.id}|${href}`);
      emit({ type: 'link_hover', href, source: 'mail', id: selected.id });
    }
  };

  const report = () => {
    if (!selected) return;
    dispatch({ type: 'reported', target: selected.id });
    emit({ type: 'report', target: selected.id, channel: 'mail', subject: selected.subject, suspicious: Boolean(selected.suspicious) });
    dispatch({ type: 'toast', toast: { title: 'Report sent', text: 'The security team received the full message with headers.' } });
  };

  const isReported = selected ? state.reported.includes(selected.id) : false;

  return (
    <div className="mail">
      <aside className="mail-list" aria-label="Inbox">
        <div className="pane-head">
          <strong>Inbox</strong>
          <span className="muted">{inbox.filter((m) => m.unread).length} unread</span>
        </div>
        {inbox.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`mail-row ${m.id === selectedId ? 'active' : ''} ${m.unread ? 'unread' : ''}`}
            onClick={() => open(m)}
          >
            <span className="mail-row-top">
              <span className="mail-from">{m.fromName}</span>
              <span className="muted small">{m.date}</span>
            </span>
            <span className="mail-subject">{m.subject}</span>
            <span className="muted small clamp">{m.preview}</span>
            {state.reported.includes(m.id) && <span className="tag tag-ok">Reported</span>}
          </button>
        ))}
      </aside>

      <section className="mail-read">
        {!selected ? (
          <div className="empty">Select a message to read it.</div>
        ) : (
          <>
            <div className="toolbar">
              <button type="button" onClick={() => { setComposing(selected); setDraft(''); }}>
                <Reply size={14} /> Reply
              </button>
              <button type="button" onClick={() => { setShowRaw(true); emit({ type: 'mail_headers', id: selected.id, subject: selected.subject, view: 'raw' }); }}>
                <Code2 size={14} /> Show original
              </button>
              <button type="button" className={isReported ? 'ok' : 'danger'} disabled={isReported} onClick={report}>
                <Flag size={14} /> {isReported ? 'Reported' : 'Report phishing'}
              </button>
              <button type="button" disabled title="Archive is disabled in this lab">
                <Archive size={14} />
              </button>
            </div>

            <div className="mail-body-wrap">
              {selected.externalBanner && (
                <div className="banner warn">
                  <AlertTriangle size={14} /> CAUTION: This email originated outside {image.persona.email.split('@')[1]}. Do not click links or open attachments unless you recognise the sender.
                </div>
              )}
              <h2 className="mail-title">{selected.subject}</h2>
              <div className="mail-meta">
                <div className="avatar">{selected.fromName.charAt(0)}</div>
                <div>
                  <button
                    type="button"
                    className="sender"
                    title="Show sender address"
                    onClick={() => {
                      if (!senderRevealed.includes(selected.id)) setSenderRevealed([...senderRevealed, selected.id]);
                      emit({ type: 'mail_headers', id: selected.id, subject: selected.subject, view: 'sender' });
                    }}
                  >
                    {selected.fromName}
                    {senderRevealed.includes(selected.id) ? (
                      <span className="mono addr"> &lt;{selected.fromAddress}&gt;</span>
                    ) : (
                      <span className="muted small"> · show address</span>
                    )}
                  </button>
                  <div className="muted small">
                    to {selected.to} · {selected.date}
                  </div>
                </div>
              </div>

              <TrustedHtml
                html={selected.bodyHtml}
                className="mail-body"
                onHover={onHover}
                onLink={(href) => {
                  emit({ type: 'link_click', href, source: 'mail', id: selected.id });
                  openUrl(href, 'mail');
                }}
              />

              {selected.attachments && selected.attachments.length > 0 && (
                <div className="attachments">
                  {selected.attachments.map((a) => {
                    const file = state.files.find((f) => f.path === a.savesTo);
                    const saved = file && !file.hidden;
                    return (
                      <div key={a.id} className="attachment">
                        <Paperclip size={14} />
                        <span className="mono">{a.name}</span>
                        <span className="muted small">{a.size}</span>
                        <button
                          type="button"
                          disabled={saved}
                          onClick={() => {
                            dispatch({ type: 'reveal_file', path: a.savesTo });
                            emit({ type: 'attachment_save', id: a.id, name: a.name, path: a.savesTo });
                            dispatch({ type: 'toast', toast: { title: 'Download complete', text: `${a.name} saved to Downloads`, app: 'files' } });
                          }}
                        >
                          {saved ? 'Saved' : 'Save to Downloads'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {composing && (
                <div className="compose">
                  <div className="compose-head">
                    <span>
                      To: <span className="mono">{composing.replyTo ?? composing.fromAddress}</span>
                    </span>
                    <button type="button" className="icon" onClick={() => setComposing(null)} aria-label="Discard">
                      <X size={14} />
                    </button>
                  </div>
                  {composing.replyTo && composing.replyTo !== composing.fromAddress && (
                    <div className="banner warn small">
                      Replies go to <span className="mono">{composing.replyTo}</span>, not the address this email claims to be from.
                    </div>
                  )}
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write your reply… (nothing typed here leaves the container)"
                  />
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      emit({ type: 'mail_reply', id: composing.id, subject: composing.subject, to: composing.replyTo ?? composing.fromAddress });
                      dispatch({ type: 'toast', toast: { title: 'Sent', text: `Reply delivered to ${composing.replyTo ?? composing.fromAddress}` } });
                      setComposing(null);
                    }}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>

            <div className="statusbar mono">{hoverHref ? `→ ${hoverHref}` : ' '}</div>
          </>
        )}
      </section>

      {showRaw && selected && (
        <div className="modal" role="dialog" aria-label="Original message">
          <div className="modal-card wide">
            <div className="modal-head">
              <strong>Original message</strong>
              <button type="button" className="icon" onClick={() => setShowRaw(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="auth-row">
              <ShieldCheck size={14} />
              <AuthPill label="SPF" value={selected.auth.spf} />
              <AuthPill label="DKIM" value={selected.auth.dkim} />
              <AuthPill label="DMARC" value={selected.auth.dmarc} />
            </div>
            <pre className="raw">{selected.rawHeaders}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
