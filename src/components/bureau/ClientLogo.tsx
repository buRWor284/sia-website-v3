"use client";

import { useState } from "react";
import type { Client } from "@/data/clients";
import { GROT, INK, SERIF } from "@/lib/tokens";

type Props = {
  client: Client;
  height?: number;
  maxWidth?: number;
};

export function ClientLogo({ client, height = 56, maxWidth = 200 }: Props) {
  const [errored, setErrored] = useState(false);
  const showWordmark = !client.logo || errored;

  if (showWordmark) {
    return (
      <div
        style={{
          height,
          minHeight: height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 14px",
          maxWidth,
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: Math.min(height * 0.42, 24),
            letterSpacing: "-0.01em",
            color: INK,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {client.wordmark || client.name}
        </div>
        {client.countryLabel && height >= 56 && (
          <div
            style={{
              marginTop: 4,
              fontFamily: GROT,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(26,20,16,.55)",
              whiteSpace: "nowrap",
            }}
          >
            {client.country === "DK"
              ? "Copenhagen"
              : client.country === "DE"
                ? "Bonn · Eschborn"
                : client.country === "EU"
                  ? "London"
                  : ""}
          </div>
        )}
      </div>
    );
  }

  return (
    // Cross-origin client logos; mixBlendMode requires plain <img>.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={client.logo as string}
      alt={client.name}
      onError={() => setErrored(true)}
      style={{
        height,
        maxHeight: height,
        maxWidth,
        width: "auto",
        objectFit: "contain",
        display: "block",
        // Many of these logos are originally on white. Multiply blends them
        // onto the cream paper without halos. Keeps full color visible.
        mixBlendMode: "multiply",
      }}
    />
  );
}
