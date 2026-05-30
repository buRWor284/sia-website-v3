'use client';

import { useState, useEffect } from 'react';

export function ScrollButtons() {
  const [atBottom, setAtBottom] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      setAtBottom(scrolled >= total - 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        style={{
          width: 44, height: 44, background: 'var(--INK)', color: 'var(--Y)', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center',
          justifyContent: 'center', opacity: atBottom ? 1 : 0.85, transition: 'opacity .2s',
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        }}
      >↑</button>
      <button
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        title="Jump to bottom"
        style={{
          width: 44, height: 44, background: 'var(--INK)', color: 'var(--Y)', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center',
          justifyContent: 'center', opacity: atBottom ? 0.4 : 0.85, transition: 'opacity .2s',
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        }}
      >↓</button>
    </div>
  );
}
