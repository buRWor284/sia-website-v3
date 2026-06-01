"use client";

import { useEffect, useRef } from "react";

/**
 * Invisible Cloudflare Turnstile widget.
 *
 * Renders nothing visible. On solve, calls `onToken` with the
 * verification token to include in the form submission.
 *
 * Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local / Vercel.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          size?: "invisible" | "normal" | "compact";
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onToken: (token: string) => void;
}

export function Turnstile({ onToken }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return;
      // Avoid double-rendering
      if (widgetIdRef.current !== null) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey!,
        callback: onToken,
        "expired-callback": () => onToken(""),
        size: "invisible",
      });
    }

    // If the script is already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Load the script
    const existing = document.querySelector(
      'script[src*="turnstile"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      // Script exists but turnstile not yet loaded — poll briefly
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken]);

  return <div ref={containerRef} />;
}
