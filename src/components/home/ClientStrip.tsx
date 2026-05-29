import Link from "next/link";
import {
  GROT,
  INK,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
} from "@/lib/tokens";
import { DoubleRule, HRule, Pill, SCaps } from "@/components/bureau/primitives";

// =========================================================================
// DATA — 6 featured clients shown on the homepage strip
// =========================================================================
interface FeaturedClient {
  name: string;
  flag: string;   // emoji flag
  country: string;
  logo: string | null;
  wordmark?: string;
}

const FEATURED: ReadonlyArray<FeaturedClient> = [
  { name: "GIZ",               flag: "🇩🇪", country: "Germany",        logo: null,                                wordmark: "GIZ"             },
  { name: "Dunlop Tyres",      flag: "🇬🇧", country: "UK",             logo: "/assets/clients/dunlop.png"                                     },
  { name: "Centriq",           flag: "🇺🇸", country: "USA",            logo: "/assets/clients/centriq.png"                                    },
  { name: "Ridester",          flag: "🇺🇸", country: "USA",            logo: "/assets/clients/ridester.png"                                   },
  { name: "ALRUG",             flag: "🇺🇸", country: "USA",            logo: "/assets/clients/alrug.png"                                      },
  { name: "Physicians Thrive", flag: "🇺🇸", country: "USA",            logo: "/assets/clients/physicians_thrive.png"                          },
];

// =========================================================================
// COMPONENT
// =========================================================================
export const ClientStrip = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 24, paddingBottom: 36 }}>
    <DoubleRule />

    {/* Header row */}
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "18px 0 20px",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Pill size={11} ls="0.22em">Clients →</Pill>
        <SCaps size={11} ls="0.22em" color={INK70}>
          Selected from the full roster
        </SCaps>
      </div>
      <Link
        href="/clients"
        style={{
          fontFamily: GROT,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: INK,
          textDecoration: "none",
          borderBottom: `1px solid ${INK}`,
          paddingBottom: 2,
          whiteSpace: "nowrap",
        }}
      >
        The full roster of clients →
      </Link>
    </div>

    {/* 6-cell client grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        border: `1px solid ${INK}`,
      }}
    >
      {FEATURED.map((c, i) => (
        <div
          key={c.name}
          style={{
            padding: "22px 16px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: PAPER,
            borderLeft: i > 0 ? `1px solid ${INK35}` : "none",
            minHeight: 110,
          }}
        >
          {/* Logo or wordmark */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {c.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={c.logo}
                alt={c.name}
                style={{
                  maxHeight: 36,
                  maxWidth: 100,
                  objectFit: "contain",
                  filter: "grayscale(1)",
                  opacity: 0.85,
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: GROT,
                  fontWeight: 900,
                  fontSize: 22,
                  letterSpacing: "0.06em",
                  color: INK,
                }}
              >
                {c.wordmark ?? c.name}
              </span>
            )}
          </div>

          {/* Name + flag */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: GROT,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: INK55,
                lineHeight: 1.3,
              }}
            >
              {c.name}
            </div>
            <div style={{ marginTop: 3, fontSize: 13 }}>{c.flag}</div>
          </div>
        </div>
      ))}
    </div>

    <HRule style={{ marginTop: 18 }} />
  </section>
);
