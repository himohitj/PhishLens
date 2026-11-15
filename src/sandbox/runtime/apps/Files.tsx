import React, { useState } from 'react';
import { FileArchive, FileCode2, FileImage, FileText, FileType2, Eye, EyeOff, Trash2, X, Cog } from 'lucide-react';
import { useOs } from '../store.tsx';
import type { VirtualFile } from '../../types.ts';

function iconFor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'exe' || ext === 'scr' || ext === 'js' || ext === 'lnk') return <Cog size={18} />;
  if (ext === 'html' || ext === 'htm') return <FileCode2 size={18} />;
  if (ext === 'zip' || ext === 'iso') return <FileArchive size={18} />;
  if (ext === 'png' || ext === 'jpg') return <FileImage size={18} />;
  if (ext === 'pdf') return <FileType2 size={18} />;
  return <FileText size={18} />;
}

export function FilesApp() {
  const { state, dispatch, emit, openUrl } = useOs();
  const [viewing, setViewing] = useState<VirtualFile | null>(null);
  const visible = state.files.filter((f) => !f.hidden);

  const realName = (f: VirtualFile) => f.path.split('/').pop() ?? f.displayName;
  const shownName = (f: VirtualFile) => (state.showExtensions ? realName(f) : f.displayName);

  const open = (f: VirtualFile, enabled = false) => {
    emit({ type: 'file_open', path: realName(f), kind: f.kind, enabled });
    if (f.kind === 'html' && f.opensUrl) {
      openUrl(f.opensUrl, 'file');
      return;
    }
    if (f.kind === 'executable') return; // the runtime's trap handler takes over
    setViewing(f);
  };

  return (
    <div className="files">
      <div className="toolbar">
        <strong>Downloads</strong>
        <span className="spacer" />
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'toggle_extensions' });
            emit({ type: 'toggle_extensions', visible: !state.showExtensions });
          }}
        >
          {state.showExtensions ? <EyeOff size={14} /> : <Eye size={14} />}
          {state.showExtensions ? 'Hide file extensions' : 'Show file extensions'}
        </button>
      </div>
      {visible.length === 0 ? (
        <div className="empty">Downloads is empty. Attachments you save from Mail land here.</div>
      ) : (
        <table className="file-table">
          <thead>
            <tr><th>Name</th><th>Size</th><th>Type</th><th /></tr>
          </thead>
          <tbody>
            {visible.map((f) => (
              <tr key={f.path}>
                <td>
                  <button type="button" className="file-name" onDoubleClick={() => open(f)} onClick={() => open(f)}>
                    {iconFor(shownName(f))}
                    <span className="mono">{shownName(f)}</span>
                  </button>
                </td>
                <td className="muted">{f.size}</td>
                <td className="muted small">{state.showExtensions ? f.magic.split(',')[0] : `${shownName(f).split('.').pop()?.toUpperCase()} file`}</td>
                <td>
                  <button
                    type="button"
                    className="icon"
                    aria-label={`Delete ${shownName(f)}`}
                    onClick={() => {
                      dispatch({ type: 'delete_file', path: f.path });
                      emit({ type: 'file_delete', path: realName(f), kind: f.kind });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {viewing && (
        <div className="modal" role="dialog" aria-label={shownName(viewing)}>
          <div className="modal-card wide">
            <div className="modal-head">
              <strong className="mono">{shownName(viewing)}</strong>
              <button type="button" className="icon" onClick={() => setViewing(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            {viewing.kind === 'macro_doc' && viewing.onOpen?.requiresEnableContent && (
              <div className="banner warn">
                PROTECTED VIEW: This file came from the internet. Editing and macros are disabled.
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    setViewing(null);
                    open(viewing, true);
                  }}
                >
                  Enable Content
                </button>
              </div>
            )}
            <pre className="doc">{viewing.content ?? '(binary file — nothing readable)'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
