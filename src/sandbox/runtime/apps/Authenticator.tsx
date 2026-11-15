import React from 'react';
import { MapPin, ShieldAlert, Smartphone } from 'lucide-react';
import { useOs } from '../store.tsx';

export function AuthenticatorApp() {
  const { state, dispatch, emit } = useOs();
  const pending = state.pushes.filter((p) => p.status === 'pending');
  const done = state.pushes.filter((p) => p.status !== 'pending');

  return (
    <div className="auth-app">
      <div className="pane-head"><strong>Authenticator</strong><span className="muted small">{pending.length} pending</span></div>
      {state.pushes.length === 0 && <div className="empty">No sign-in requests. Requests appear here when someone signs in with your password.</div>}
      {pending.map((p) => (
        <div key={p.id} className="push-card">
          <div className="push-title"><ShieldAlert size={16} /> Approve sign-in?</div>
          <div className="muted small">{p.app} · {p.account}</div>
          <dl className="kv compact">
            <dt><MapPin size={12} /> Location</dt><dd>{p.location}</dd>
            <dt>IP</dt><dd className="mono">{p.ip}</dd>
            <dt><Smartphone size={12} /> Device</dt><dd>{p.device}</dd>
            <dt>Time</dt><dd>{p.time}</dd>
          </dl>
          {p.numberMatch !== undefined && (
            <div className="number-match">
              Enter the number shown on the sign-in screen: <span className="mono big">??</span>
              <div className="muted small">You can’t see that screen, so you aren’t the one signing in.</div>
            </div>
          )}
          <div className="push-actions">
            <button type="button" onClick={() => { dispatch({ type: 'push_status', id: p.id, status: 'denied' }); emit({ type: 'mfa_deny', id: p.id, location: p.location }); }}>
              Deny
            </button>
            <button type="button" className="danger" onClick={() => { dispatch({ type: 'push_status', id: p.id, status: 'reported' }); emit({ type: 'mfa_report', id: p.id, location: p.location }); }}>
              It’s not me, report
            </button>
            <button type="button" className="primary" onClick={() => { dispatch({ type: 'push_status', id: p.id, status: 'approved' }); emit({ type: 'mfa_approve', id: p.id, location: p.location }); }}>
              Approve
            </button>
          </div>
        </div>
      ))}
      {done.length > 0 && (
        <div className="push-history">
          <div className="muted small">History</div>
          {done.map((p) => (
            <div key={p.id} className="push-row">
              <span>{p.location}</span>
              <span className={`tag ${p.status === 'approved' ? 'tag-bad' : 'tag-ok'}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
