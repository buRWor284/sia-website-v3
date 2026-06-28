/**
 * /emos/subscribe/success
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
const GREEN  = "#3e6b45";
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
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Wordmark */}
        <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: YEL, marginBottom: 32, textAlign: "center" }}>
          EMOS Platform
        </div>

        {/* Card */}
        <div style={{ background: INK, color: PAPER, textAlign: "center" }}>
          <div style={{ padding: "48px 40px 44px" }}>
            <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 32, color: GREEN, marginBottom: 20, lineHeight: 1 }}>
              ✓
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, lineHeight: 1.2, letterSpacing: "-.02em", margin: "0 0 18px" }}>
              Payment confirmed.
            </h1>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.65, color: "rgba(241,235,222,.65)", margin: "0 0 32px" }}>
              Check your inbox — your invite to create an EMOS account is on its way.
              Click the link in the email to get started.
            </p>
            <div style={{ borderTop: "1px solid rgba(241,235,222,.1)", paddingTop: 24 }}>
              <p style={{ fontFamily: GROT, fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase", color: "rgba(241,235,222,.3)", margin: "0 0 16px", lineHeight: 1.6 }}>
                Didn&rsquo;t get the email?<br />Check your spam folder or email{" "}
                <a
                  href="mailto:contact@syedirfanajmal.com"
                  style={{ color: "rgba(241,235,222,.45)", textDecoration: "none" }}
                >
                  contact@syedirfanajmal.com
                </a>
              </p>
              <a
                href="/"
                style={{
                  display: "inline-block",
                  fontFamily: GROT,
                  fontWeight: 800,
                  fontSize: 9.5,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "rgba(241,235,222,.3)",
                  textDecoration: "none",
                  border: "1px solid rgba(241,235,222,.15)",
                  padding: "8px 20px",
                }}
              >
                Back to site
              </a>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontFamily: GROT, fontSize: 10, color: "rgba(26,20,16,.35)", letterSpacing: ".08em", textTransform: "uppercase" }}>
          EMOS Platform · syedirfanajmal.com
        </p>

      </div>
    </div>
  );
}
