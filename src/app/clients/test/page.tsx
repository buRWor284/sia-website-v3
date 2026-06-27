import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";

export const metadata = {
  title: "Test Workspace",
  robots: { index: false, follow: false },
};

export default function TestWorkspacePage() {
  return (
    <div style={{ minHeight: "100vh", background: INK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, background: YEL, padding: "4px 8px" }}>
        Private Workspace
      </span>
      <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: PAPER, margin: 0, letterSpacing: "-0.02em" }}>
        Clerk auth works.
      </h1>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "rgba(250,250,250,.5)", margin: 0 }}>
        This page is Clerk-gated. Delete it after testing.
      </p>
    </div>
  );
}
