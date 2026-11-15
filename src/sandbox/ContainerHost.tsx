import React, { useEffect, useMemo, useRef, useState } from 'react';
import runtimeCode from 'virtual:phishlens-sandbox-runtime';
import { SANDBOX_PROTOCOL, type BootMessage, type GuestToHost, type LabImage, type SandboxEvent } from './types.ts';

/**
 * Content-Security-Policy for every container. No network of any kind:
 * no fetch/XHR/WebSocket, no images or fonts from URLs, no frames, no forms.
 */
const CONTAINER_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src data: blob:',
  'font-src data:',
  "connect-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ');

function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function mintContainerId(): string {
  return `plc-${randomHex(4)}`;
}

function buildSrcdoc(): string {
  const safe = runtimeCode.replace(/<\/(script)/gi, '<\\/$1');
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CONTAINER_CSP}"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script>${safe}</script></body></html>`;
}

export type ContainerStatus = 'booting' | 'running' | 'stopped';

interface ContainerHostProps {
  image: LabImage;
  containerId: string;
  running: boolean;
  onEvent: (event: SandboxEvent) => void;
  onStatus?: (status: ContainerStatus) => void;
  className?: string;
}

/**
 * One isolated, disposable lab container.
 *
 * Isolation comes from the browser, not from trust in the lab content:
 *  - sandbox="allow-scripts" only, so the frame gets an opaque origin with no
 *    access to PhishLens cookies, localStorage, or the parent DOM;
 *  - no allow-forms, allow-popups, allow-top-navigation or allow-modals;
 *  - a CSP that blocks every outbound request;
 *  - a per-container nonce and a private MessagePort as the only channel.
 * Changing `containerId` destroys the frame and boots a clean one.
 */
export function ContainerHost({ image, containerId, running, onEvent, onStatus, className }: ContainerHostProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcdoc = useMemo(buildSrcdoc, []);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const [status, setStatus] = useState<ContainerStatus>('booting');

  useEffect(() => {
    onStatus?.(status);
  }, [status, onStatus]);

  useEffect(() => {
    if (!running) {
      setStatus('stopped');
      return;
    }
    setStatus('booting');
    const nonce = randomHex(16);
    let port: MessagePort | null = null;

    const onWindowMessage = (e: MessageEvent) => {
      const frame = frameRef.current;
      if (!frame || e.source !== frame.contentWindow) return;
      const data = e.data as GuestToHost | undefined;
      if (!data || data.protocol !== SANDBOX_PROTOCOL || data.kind !== 'ready' || port) return;
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = (msg: MessageEvent<GuestToHost>) => {
        const m = msg.data;
        if (m?.protocol === SANDBOX_PROTOCOL && m.kind === 'event' && m.nonce === nonce) {
          onEventRef.current(m.event);
        }
      };
      const boot: BootMessage = { protocol: SANDBOX_PROTOCOL, kind: 'boot', nonce, containerId, image };
      // The frame has an opaque origin, so '*' is the only usable target. The
      // nonce plus the transferred port make sure only this frame's guest is trusted.
      frame.contentWindow?.postMessage(boot, '*', [channel.port2]);
      setStatus('running');
    };

    window.addEventListener('message', onWindowMessage);
    return () => {
      window.removeEventListener('message', onWindowMessage);
      port?.close();
    };
  }, [containerId, image, running]);

  if (!running) return null;

  return (
    <iframe
      key={containerId}
      ref={frameRef}
      title={`PhishLens lab container ${containerId}`}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      allow="camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; payment 'none'; usb 'none'"
      srcDoc={srcdoc}
      className={className}
    />
  );
}
