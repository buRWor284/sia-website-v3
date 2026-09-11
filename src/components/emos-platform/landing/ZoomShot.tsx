"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Click-to-enlarge wrapper for the product screenshots on /emos-platform
 * (build note added after Claude Design handoff 4, 2026-09-11: the step
 * screenshots render at about a third of the row on desktop, too small to read).
 *
 * The thumbnail is a real <button>, so it is keyboard focusable and announces
 * itself. The enlarged view is a native <dialog> opened with showModal(), which
 * gives Esc-to-close and a focus trap for free. Clicking the dark backdrop also
 * closes it, and focus goes back to the thumbnail that opened it.
 *
 * `children` is the thumbnail as the page draws it (a plain image, or one of the
 * two crossfade cards). The dialog always shows `full`, the final still, so the
 * enlarged view never animates.
 */
export function ZoomShot({
  full,
  caption,
  children,
}: {
  full: { src: string; alt: string; width: number; height: number };
  caption: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const restore = () => openerRef.current?.focus();
    d.addEventListener("close", restore);
    return () => d.removeEventListener("close", restore);
  }, []);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="emp-zoom"
        aria-haspopup="dialog"
        aria-label={`Enlarge screenshot: ${full.alt}`}
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        className="emp-lightbox"
        aria-label={full.alt}
        onClick={(e) => {
          // A click that lands on the <dialog> itself (not its content) is a
          // click on the backdrop.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="emp-lightbox-bar">
          <span>{caption}</span>
          <button type="button" className="emp-lightbox-close" onClick={() => dialogRef.current?.close()}>
            Close ✕
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={full.src} alt={full.alt} width={full.width} height={full.height} loading="lazy" decoding="async" />
      </dialog>
    </>
  );
}
