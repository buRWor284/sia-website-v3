"use client";

import { useState, useTransition } from "react";
import { undoLastAiWrite } from "@/app/emos-platform/actions/ai-activity";

const INK = "#1a1410";
const YEL = "#f5b81f";
const GROT = "Arial, 'Helvetica Neue', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

export function UndoButton({ label }: { label: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [armed, setArmed] = useState(false);

  return (
    <div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
      {!armed ? (
        <button
          type="button"
          onClick={() => setArmed(true)}
          style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "7px 12px", cursor: "pointer" }}
        >
          Undo this
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: SERIF, fontSize: 13 }}>Reverse “{label}”?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await undoLastAiWrite();
                setMsg({ ok: r.ok, text: r.message });
                setArmed(false);
              })
            }
            style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: YEL, color: INK, border: `1px solid ${INK}`, padding: "7px 12px", cursor: pending ? "default" : "pointer" }}
          >
            {pending ? "Undoing…" : "Yes, undo"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setArmed(false)}
            style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", color: INK, border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Cancel
          </button>
        </div>
      )}
      {msg && <p style={{ fontFamily: SERIF, fontSize: 13, margin: 0, color: msg.ok ? INK : "#8a1c1c" }}>{msg.text}</p>}
    </div>
  );
}
