import React, { useState } from 'react';
import { BadgeCheck, Phone, X } from 'lucide-react';
import { useOs } from '../store.tsx';
import type { Contact } from '../../types.ts';

export function DirectoryApp() {
  const { image, emit } = useOs();
  const [calling, setCalling] = useState<Contact | null>(null);
  const [q, setQ] = useState('');
  const list = image.contacts.filter((c) => `${c.name} ${c.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="directory">
      <div className="pane-head">
        <strong>Company directory</strong>
        <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people or teams" aria-label="Search directory" />
      </div>
      <p className="muted small pad">Numbers here come from HR records, not from any email. Use them when you need to check that a request is real.</p>
      <div className="contact-grid">
        {list.map((c) => (
          <div key={c.id} className="contact">
            <div className="avatar">{c.name.charAt(0)}</div>
            <div className="contact-body">
              <strong>{c.name} {c.verified && <BadgeCheck size={13} className="good" />}</strong>
              <span className="muted small">{c.role}</span>
              <span className="mono small">{c.phone}</span>
            </div>
            <button
              type="button"
              className="primary icon"
              aria-label={`Call ${c.name}`}
              onClick={() => {
                setCalling(c);
                emit({ type: 'call', contactId: c.id, name: c.name });
              }}
            >
              <Phone size={14} />
            </button>
          </div>
        ))}
      </div>
      {calling && (
        <div className="modal" role="dialog" aria-label={`Call with ${calling.name}`}>
          <div className="modal-card">
            <div className="modal-head">
              <strong><Phone size={14} /> {calling.name} · {calling.phone}</strong>
              <button type="button" className="icon" onClick={() => setCalling(null)} aria-label="Hang up"><X size={16} /></button>
            </div>
            <div className="call-transcript">
              {(image.calls[calling.id] ?? [`${calling.name.split(' ')[0]}: Hi, this is ${calling.name}. How can I help?`]).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <button type="button" className="danger" onClick={() => setCalling(null)}>Hang up</button>
          </div>
        </div>
      )}
    </div>
  );
}
