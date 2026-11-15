import React from 'react';

export function Eyebrow({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'night' }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] ${tone === 'night' ? 'text-brand-soft' : 'text-brand'}`}>
      <span className="h-px w-6 bg-current" aria-hidden />
      {children}
    </span>
  );
}
