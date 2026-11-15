import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import css from './styles.css';
import { Desktop } from './Desktop.tsx';
import { SANDBOX_PROTOCOL, type BootMessage, type HostToGuest, type SandboxAppId, type SandboxEvent } from '../types.ts';

/**
 * Guest entry point. Runs inside an opaque-origin, script-only sandboxed
 * iframe with a CSP that forbids every network fetch. The only channel to
 * the outside world is the MessagePort handed over during the boot handshake.
 */

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

function Guest({ boot, port }: { boot: BootMessage; port: MessagePort }) {
  const [focus, setFocus] = useState<SandboxAppId | null>(null);

  useEffect(() => {
    port.onmessage = (e: MessageEvent<HostToGuest>) => {
      if (e.data?.kind === 'focus-app') setFocus(e.data.app);
    };
  }, [port]);

  const send = (event: SandboxEvent) => {
    port.postMessage({ protocol: SANDBOX_PROTOCOL, kind: 'event', nonce: boot.nonce, event });
  };

  return <Desktop image={boot.image} containerId={boot.containerId} send={send} focusRequest={focus} />;
}

let booted = false;
window.addEventListener('message', (e: MessageEvent) => {
  if (booted || e.source !== window.parent) return;
  const data = e.data as BootMessage | undefined;
  if (!data || data.protocol !== SANDBOX_PROTOCOL || data.kind !== 'boot' || !e.ports[0]) return;
  booted = true;
  const root = document.getElementById('root');
  if (!root) return;
  createRoot(root).render(<Guest boot={data} port={e.ports[0]} />);
});

window.parent.postMessage({ protocol: SANDBOX_PROTOCOL, kind: 'ready' }, '*');
