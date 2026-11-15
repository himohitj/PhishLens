import React, { useCallback, useRef } from 'react';

interface TrustedHtmlProps {
  html: string;
  className?: string;
  onLink: (href: string) => void;
  onHover?: (href: string | null) => void;
  onSubmit?: (form: string, filledFields: string[]) => void;
  onAction?: (action: string, label: string) => void;
}

/**
 * Renders image-authored HTML and routes every interaction through the
 * container runtime. Links never navigate the real frame, forms never submit,
 * and typed values never leave this component: only the *names* of filled
 * fields are reported.
 */
export function TrustedHtml({ html, className, onLink, onHover, onSubmit, onAction }: TrustedHtmlProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHover = useRef<string | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const submit = target.closest<HTMLElement>('[data-pl-submit]');
      if (submit) {
        e.preventDefault();
        const form = submit.closest<HTMLElement>('[data-pl-form]');
        const name = form?.dataset.plForm ?? 'form';
        const filled = form
          ? Array.from(form.querySelectorAll<HTMLInputElement>('input, textarea, select'))
              .filter((el) => (el.type === 'checkbox' ? el.checked : el.value.trim().length > 0))
              .map((el) => el.name || el.id || el.type)
          : [];
        onSubmit?.(name, filled);
        return;
      }
      const action = target.closest<HTMLElement>('[data-pl-action]');
      if (action) {
        e.preventDefault();
        onAction?.(action.dataset.plAction ?? 'action', (action.textContent ?? '').trim().slice(0, 60));
        return;
      }
      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (link) {
        e.preventDefault();
        onLink(link.getAttribute('href') ?? '');
      }
    },
    [onLink, onSubmit, onAction]
  );

  const handleOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
      const href = link ? link.getAttribute('href') : null;
      if (href !== lastHover.current) {
        lastHover.current = href;
        onHover?.(href);
      }
    },
    [onHover]
  );

  return (
    <div
      ref={ref}
      className={className}
      onClick={handleClick}
      onMouseOver={handleOver}
      onMouseLeave={() => {
        lastHover.current = null;
        onHover?.(null);
      }}
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
          e.preventDefault();
          const form = (e.target as HTMLElement).closest('[data-pl-form]');
          form?.querySelector<HTMLElement>('[data-pl-submit]')?.click();
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
