/**
 * /emos-platform/subscribe/success
 *
 * Shown after a successful Stripe checkout. Stripe redirects here with
 * ?session_id=... The webhook (which fires asynchronously) handles the
 * actual invite; this page just tells the user to check their inbox.
 *
 * Public route — no Clerk auth.
 */

const INK   = "#1a1410";
const PAPER = "#f1ebde";
const YEL   = "#f5b81f";
const GREEN = "#5c9166";
const GROT  = "Arial, 'Helvetica Neue', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

export default function SubscribeSuccessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        fontFamily: SERIF,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>

        {/* Wordmark: amber square + ink text (accessible on paper) */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: SERIF, fontWeight: 700, fontSize: 14, width: 28, height: 28, lineHeight: "28px", textAlign: "center", verticalAlign: "middle" }}>
            E
          </span>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: INK, verticalAlign: "middle", marginLeft: 9 }}>
            EMOS Platform
          </span>
        </div>

        {/* Card */}
        <div style={{ background: INK, color: PAPER, textAlign: "center", padding: "52px 44px 46px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 30, color: GREEN, marginBottom: 22, lineHeight: 1 }}>
            ✓
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em", margin: "0 0 16px" }}>
            Payment confirmed.
          </h1>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "rgba(241,235,222,.88)", margin: "0 0 28px" }}>
            Your EMOS subscription is active. We&rsquo;ve just emailed your invite to create your account.
          </p>

          {/* Prominent next step */}
          <div style={{ background: "rgba(245,184,31,.12)", border: "1px solid rgba(245,184,31,.5)", padding: "16px 20px", margin: "0 0 30px" }}>
            <p style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, margin: "0 0 6px" }}>
              Next step
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: "rgba(241,235,222,.92)", margin: 0, lineHeight: 1.5 }}>
              Check your inbox and click the link to set your password.
            </p>
          </div>

          <div style={{ borderTop: "1px solid rgba(241,235,222,.18)", paddingTop: 24 }}>
            <p style={{ fontFamily: GROT, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(241,235,222,.72)", margin: "0 0 18px", lineHeight: 1.7 }}>
              Didn&rsquo;t get the email? Check your spam folder,<br />or write to{" "}
              <a href="mailto:sia@syedirfanajmal.com" style={{ color: YEL, textDecoration: "none", fontWeight: 700 }}>
                sia@syedirfanajmal.com
              </a>
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(241,235,222,.85)",
                textDecoration: "none",
                border: "1px solid rgba(241,235,222,.42)",
                padding: "11px 24px",
              }}
            >
              Back to homepage
            </a>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 22, fontFamily: SERIF, fontSize: 13, color: "rgba(26,20,16,.68)", lineHeight: 1.5 }}>
          While you wait,{" "}
          <a href="/tools" style={{ color: INK, fontWeight: 700, textDecoration: "underline" }}>
            explore the free tools →
          </a>
        </p>

        <p style={{ textAlign: "center", marginTop: 14, fontFamily: GROT, fontSize: 10, color: "rgba(26,20,16,.6)", letterSpacing: ".08em", textTransform: "uppercase" }}>
          EMOS Platform · syedirfanajmal.com
        </p>

      </div>
    </div>
  );
}
