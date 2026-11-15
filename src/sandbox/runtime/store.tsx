import React, { createContext, useContext } from 'react';
import type {
  LabImage,
  MailMessage,
  MessageThread,
  MfaPush,
  SandboxAppId,
  SandboxEvent,
  SmsMessage,
  VirtualFile,
} from '../types.ts';

export type PushState = MfaPush & { status: 'pending' | 'approved' | 'denied' | 'reported' };

export interface Toast {
  id: number;
  title: string;
  text: string;
  app?: SandboxAppId;
}

export interface OsState {
  app: SandboxAppId;
  mail: MailMessage[];
  threads: MessageThread[];
  unreadThreads: string[];
  files: VirtualFile[];
  pushes: PushState[];
  reported: string[];
  toasts: Toast[];
  compromise: { label: string; consequence: string } | null;
  browserUrl: string | null;
  browserNonce: number;
  showExtensions: boolean;
}

export type OsAction =
  | { type: 'open_app'; app: SandboxAppId }
  | { type: 'browse'; url: string }
  | { type: 'mark_read'; id: string }
  | { type: 'thread_read'; id: string }
  | { type: 'add_mail'; mail: MailMessage }
  | { type: 'add_sms'; threadId: string; message: SmsMessage; unread: boolean }
  | { type: 'add_push'; push: MfaPush }
  | { type: 'push_status'; id: string; status: PushState['status'] }
  | { type: 'reveal_file'; path: string }
  | { type: 'delete_file'; path: string }
  | { type: 'reported'; target: string }
  | { type: 'toast'; toast: Omit<Toast, 'id'> }
  | { type: 'dismiss_toast'; id: number }
  | { type: 'compromise'; label: string; consequence: string }
  | { type: 'clear_compromise' }
  | { type: 'toggle_extensions' };

let toastSeq = 1;

export function initialState(image: LabImage): OsState {
  return {
    app: image.startApp,
    mail: image.mail.map((m) => ({ ...m })),
    threads: image.threads.map((t) => ({ ...t, messages: [...t.messages] })),
    unreadThreads: image.threads.filter((t) => t.messages.some((m) => m.from === 'them')).map((t) => t.id),
    files: image.files.map((f) => ({ ...f })),
    pushes: [],
    reported: [],
    toasts: [],
    compromise: null,
    browserUrl: null,
    browserNonce: 0,
    showExtensions: false,
  };
}

export function reducer(state: OsState, action: OsAction): OsState {
  switch (action.type) {
    case 'open_app':
      return { ...state, app: action.app };
    case 'browse':
      return { ...state, app: 'browser', browserUrl: action.url, browserNonce: state.browserNonce + 1 };
    case 'mark_read':
      return { ...state, mail: state.mail.map((m) => (m.id === action.id ? { ...m, unread: false } : m)) };
    case 'thread_read':
      return { ...state, unreadThreads: state.unreadThreads.filter((id) => id !== action.id) };
    case 'add_mail':
      return { ...state, mail: [{ ...action.mail, unread: true }, ...state.mail] };
    case 'add_sms':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === action.threadId ? { ...t, messages: [...t.messages, action.message] } : t
        ),
        unreadThreads:
          action.unread && !state.unreadThreads.includes(action.threadId)
            ? [...state.unreadThreads, action.threadId]
            : state.unreadThreads,
      };
    case 'add_push':
      return { ...state, pushes: [{ ...action.push, status: 'pending' }, ...state.pushes] };
    case 'push_status':
      return { ...state, pushes: state.pushes.map((p) => (p.id === action.id ? { ...p, status: action.status } : p)) };
    case 'reveal_file':
      return { ...state, files: state.files.map((f) => (f.path === action.path ? { ...f, hidden: false } : f)) };
    case 'delete_file':
      return { ...state, files: state.files.filter((f) => f.path !== action.path) };
    case 'reported':
      return state.reported.includes(action.target) ? state : { ...state, reported: [...state.reported, action.target] };
    case 'toast':
      return { ...state, toasts: [...state.toasts.slice(-2), { ...action.toast, id: toastSeq++ }] };
    case 'dismiss_toast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'compromise':
      return state.compromise ? state : { ...state, compromise: { label: action.label, consequence: action.consequence } };
    case 'clear_compromise':
      return { ...state, compromise: null };
    case 'toggle_extensions':
      return { ...state, showExtensions: !state.showExtensions };
    default:
      return state;
  }
}

export type EmitFn = (event: Omit<SandboxEvent, 't'> & { type: SandboxEvent['type'] }) => void;

export interface OsContextValue {
  image: LabImage;
  containerId: string;
  state: OsState;
  dispatch: React.Dispatch<OsAction>;
  emit: EmitFn;
  openUrl: (url: string, source: string) => void;
}

export const OsContext = createContext<OsContextValue | null>(null);

export function useOs(): OsContextValue {
  const ctx = useContext(OsContext);
  if (!ctx) throw new Error('useOs outside container');
  return ctx;
}
