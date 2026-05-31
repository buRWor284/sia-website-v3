/**
 * CredibilityTicker — the publications / speaking / podcast strip.
 * Mounted in layout.tsx so it appears on every page, directly below SiteHeader.
 */
export const CredibilityTicker = () => (
  <div className="sia-ticker" aria-label="Publications · Speaking · Podcast">
    {[0, 1].map((i) => (
      <span key={i} className="sia-ticker-track" aria-hidden={i > 0 ? true : undefined}>
        <span>Forbes · HBR · SEMrush · TNW · Entrepreneur · SERPed · Search Engine Journal · World Bank</span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span>SPOKEN IN PK · MY · ID · AE</span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span>4 PODCAST SEASONS</span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span className="sia-ticker__sep">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </span>
    ))}
  </div>
);
