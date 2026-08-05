import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const config = { runtime: "edge" };

const COPY = {
  pt: {
    brand: "Alef Devops",
    tagline: "Sites e Sistemas Web sob Medida",
  },
  en: {
    brand: "Alef Devops",
    tagline: "Custom Websites & Web Systems",
  },
} as const;

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "pt";
  const { brand, tagline } = COPY[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#070b10",
          color: "#f4c542",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#22d3c5",
            marginBottom: 24,
          }}
        >
          {brand}
        </div>
        <div style={{ display: "flex", fontSize: 64, color: "#f4c542", maxWidth: 900 }}>
          {tagline}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
