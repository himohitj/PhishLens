import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Code2, Globe, KeyRound, Lock, RotateCw, ShieldOff, Unlock, X } from 'lucide-react';
import { useOs } from '../store.tsx';
import { TrustedHtml } from '../TrustedHtml.tsx';
import { resolveUrl, type Resolution } from '../net.ts';

export function BrowserApp() {
  const { image, state, emit, dispatch } = useOs();
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [res, setRes] = useState<Resolution | null>(null);
  const [panel, setPanel] = useState<'cert' | 'vault' | 'source' | null>(null);
  const [hoverHref, setHoverHref] = useState<string | null>(null);
  const hovered = useRef(new Set<string>());

  const load = (raw: string, push = true) => {
    const r = resolveUrl(image, raw);
    setRes(r);
    setPanel(null);
    setHoverHref(null);
    if (r.kind === 'invalid') return;
    setInput(r.url.href);
    if (push) setHistory((h) => [...h, r.url.href]);
    if (r.kind === 'page') {
      emit({
        type: 'navigate',
        url: r.url.href,
        host: r.url.host,
        status: 200,
        redirectedFrom: r.redirectedFrom ?? '',
      });
    } else if (r.kind === 'egress_blocked') {
      emit({ type: 'egress_blocked', host: r.url.host, url: r.url.href });
    } else {
      emit({ type: 'navigate', url: r.url.href, host: r.url.host, status: 0, redirectedFrom: '' });
    }
  };

  useEffect(() => {
    if (state.browserUrl) load(state.browserUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.browserNonce]);

  const back = () => {
    if (history.length < 2) return;
    const next = history.slice(0, -1);
    setHistory(next);
    load(next[next.length - 1], false);
  };

  const page = res?.kind === 'page' ? res.page : null;
  const host = res && res.kind !== 'invalid' ? res.url.host : '';

  const applyEffect = (effect?: { navigate?: string; toast?: string }) => {
    if (!effect) return;
    if (effect.toast) dispatch({ type: 'toast', toast: { title: host, text: effect.toast } });
    if (effect.navigate) load(effect.navigate);
  };

  return (
    <div className="browser">
      <div className="browser-bar">
        <button type="button" className="icon" onClick={back} disabled={history.length < 2} aria-label="Back">
          <ArrowLeft size={15} />
        </button>
        <button type="button" className="icon" onClick={() => res && res.kind !== 'invalid' && load(res.url.href, false)} aria-label="Reload">
          <RotateCw size={14} />
        </button>
        <form
          className="omnibox"
          onSubmit={(e) => {
            e.preventDefault();
            load(input);
          }}
        >
          <button
            type="button"
            className={`lock ${page?.tls ? 'secure' : 'insecure'}`}
            disabled={!page}
            title="View site information"
            onClick={() => {
              if (!page) return;
              setPanel(panel === 'cert' ? null : 'cert');
              emit({ type: 'cert_view', host, issuer: page.tls?.issuer ?? 'none', ageDays: page.tls?.ageDays ?? -1 });
            }}
          >
            {page?.tls ? <Lock size={13} /> : page ? <Unlock size={13} /> : <Globe size={13} />}
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} aria-label="Address" placeholder="Enter a URL" />
        </form>
        <button
          type="button"
          className="icon"
          disabled={!page}
          title="Password vault"
          onClick={() => {
            if (!page) return;
            setPanel(panel === 'vault' ? null : 'vault');
            emit({ type: 'vault_check', host, matched: Boolean(page.vaultHasLogin) });
          }}
        >
          <KeyRound size={15} />
        </button>
        <button
          type="button"
          className="icon"
          disabled={!page}
          title="View page source"
          onClick={() => {
            if (!page) return;
            setPanel(panel === 'source' ? null : 'source');
            emit({ type: 'view_source', host });
          }}
        >
          <Code2 size={15} />
        </button>
      </div>

      <div className="browser-viewport">
        {!res && (
          <div className="newtab">
            <Globe size={28} />
            <p>This browser can only reach hosts that exist inside the lab. Everything else is dropped at the container firewall.</p>
          </div>
        )}
        {res?.kind === 'invalid' && <div className="neterr"><h3>That doesn’t look like a URL</h3></div>}
        {res?.kind === 'egress_blocked' && (
          <div className="neterr">
            <ShieldOff size={30} />
            <h3>Blocked by sandbox firewall</h3>
            <p className="mono">{res.url.host}</p>
            <p>This container has no route to the real internet. Requests outside the lab network are dropped and logged.</p>
          </div>
        )}
        {res?.kind === 'refused' && (
          <div className="neterr">
            <h3>This site can’t be reached</h3>
            <p className="mono">{res.url.host} refused to connect.</p>
          </div>
        )}
        {page && res?.kind === 'page' && (
          <>
            {res.redirectedFrom && (
              <div className="banner info small mono">Redirected from {res.redirectedFrom}</div>
            )}
            <TrustedHtml
              key={page.url + state.browserNonce}
              html={page.html}
              className="pg"
              onHover={(href) => {
                setHoverHref(href);
                if (href && !hovered.current.has(href)) {
                  hovered.current.add(href);
                  emit({ type: 'link_hover', href, source: 'browser', host });
                }
              }}
              onLink={(href) => {
                emit({ type: 'link_click', href, source: 'browser', host });
                load(href);
              }}
              onSubmit={(form, fields) => {
                emit({ type: 'form_submit', form, host, url: page.url, fields: fields.join(','), filled: fields.length });
                applyEffect(page.forms?.[form]);
              }}
              onAction={(action, label) => {
                emit({ type: 'page_action', action, label, host });
                applyEffect(page.actions?.[action]);
              }}
            />
          </>
        )}

        {panel && page && (
          <div className="browser-panel">
            <div className="modal-head">
              <strong>{panel === 'cert' ? 'Connection & certificate' : panel === 'vault' ? 'Password vault' : 'Page source'}</strong>
              <button type="button" className="icon" onClick={() => setPanel(null)} aria-label="Close">
                <X size={14} />
              </button>
            </div>
            {panel === 'cert' &&
              (page.tls ? (
                <dl className="kv">
                  <dt>Issued to</dt><dd className="mono">{page.tls.subject}</dd>
                  <dt>Organisation</dt><dd>{page.tls.organization ?? <em>Not validated (domain-only certificate)</em>}</dd>
                  <dt>Issuer</dt><dd>{page.tls.issuer}</dd>
                  <dt>Valid from</dt><dd>{page.tls.validFrom} <span className={page.tls.ageDays < 14 ? 'bad' : 'muted'}>({page.tls.ageDays} {page.tls.ageDays === 1 ? 'day' : 'days'} old)</span></dd>
                  <dt>Valid to</dt><dd>{page.tls.validTo}</dd>
                  <dt>Also covers</dt><dd className="mono">{page.tls.san.join(', ')}</dd>
                  <dd className="note">A padlock only means the connection is encrypted. It says nothing about who owns the site.</dd>
                </dl>
              ) : (
                <p className="bad">Connection is not encrypted.</p>
              ))}
            {panel === 'vault' &&
              (page.vaultHasLogin ? (
                <p className="good">1 saved login matches <span className="mono">{host}</span>. Autofill is available.</p>
              ) : (
                <p className="bad">
                  No saved logins for <span className="mono">{host}</span>. Your vault only fills passwords on the exact domain you saved them for. If it stays empty on a page that looks familiar, treat that as a warning.
                </p>
              ))}
            {panel === 'source' && (
              <div>
                <pre className="raw small">{page.html.replace(/\s+/g, ' ').slice(0, 900)}…</pre>
                {page.sourceNotes?.map((n) => (
                  <p key={n} className="note">⚑ {n}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="statusbar mono">{hoverHref ? `→ ${hoverHref}` : page ? page.title : ' '}</div>
    </div>
  );
}
