/**
 * CTATicker — the dark availability / offer strip.
 * Add selectively to high-intent pages: homepage, /speaking, /fractional-cmo, /emos.
 *
 * Props:
 *   topOnly  — removes top/bottom margin (for placement at page top, e.g. below SiteHeader)
 */
interface CTATickerProps {
  topOnly?: boolean;
}

export const CTATicker = ({ topOnly = false }: CTATickerProps) => (
  <div
    className={`sia-ticker sia-ticker--cta${topOnly ? " sia-ticker--cta-top" : ""}`}
    aria-label="Availability, EMOS, and Speaking"
  >
    {[0, 1].map((i) => (
      <span key={i} className="sia-ticker-track" aria-hidden={i > 0 ? true : undefined}>
        <span className="sia-ticker__dot">●</span>
        <span className="sia-ticker__bold">
          <a href="/fractional-cmo">1 FRACTIONAL CMO SPOT · Q3 2026</a>
        </span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span>
          <a href="https://dmr.agency/earnedmediaos/" target="_blank" rel="noopener noreferrer">
            GET CITED BEFORE YOUR SERIES A · EMOS FOUNDING CLASS
          </a>
        </span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span>
          <a href="/speaking">INVITE ME TO YOUR STAGE · KEYNOTES &amp; WORKSHOPS</a>
        </span>
        <span className="sia-ticker__sep">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </span>
    ))}
  </div>
);
