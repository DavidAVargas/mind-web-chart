import { ImageResponse } from "next/og";
import { APP_NAME, HEADLINE, SITE_URL, TAGLINE } from "@/lib/brand";

// The picture shown when a Thoughtspun link is shared in messages and social
// apps. It's drawn from code at build time, so it follows the name in brand.ts.

export const alt = `${APP_NAME}: ${HEADLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#18181b";
const MUTED = "#52525b";

type Bubble = {
  x: number;
  y: number;
  r: number;
  label: string;
  color: string;
  parent?: number;
};

/** A small web like the one on the landing page: My Mind with branches. */
const BUBBLES: Bubble[] = [
  { x: 260, y: 250, r: 74, label: "My Mind", color: INK },
  { x: 108, y: 104, r: 50, label: "Dreams", color: "#9e77ed", parent: 0 },
  { x: 62, y: 300, r: 40, label: "Travel", color: "#0ea5e9", parent: 1 },
  { x: 420, y: 100, r: 50, label: "Career", color: "#9e77ed", parent: 0 },
  { x: 466, y: 286, r: 54, label: "Own business", color: "#0ea5e9", parent: 3 },
  { x: 372, y: 440, r: 44, label: "No savings", color: "#f43f5e", parent: 4 },
  { x: 214, y: 466, r: 44, label: "Spending", color: "#f59e0b", parent: 5 },
  { x: 76, y: 470, r: 36, label: "Budget", color: "#10b981", parent: 6 },
];

/** Fonts as TrueType from Google Fonts; the image renderer can't read woff2. */
async function loadFont(family: string, weight: number) {
  const params = family === "Fraunces" ? "opsz,wght@144," : "wght@";
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:${params}${weight}`,
  ).then((response) => response.text());
  const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
  if (!url) throw new Error(`No TrueType file for ${family}`);
  return fetch(url).then((response) => response.arrayBuffer());
}

function Web() {
  const lines = BUBBLES.flatMap((bubble, i) =>
    bubble.parent === undefined
      ? []
      : [{ from: BUBBLES[bubble.parent], to: bubble, key: i }],
  );
  const travel = BUBBLES[2];
  const savings = BUBBLES[5];

  return (
    <div style={{ position: "relative", display: "flex", width: 540, height: 530 }}>
      <svg width="540" height="530" style={{ position: "absolute", top: 0, left: 0 }}>
        {lines.map(({ from, to, key }) => (
          <line
            key={key}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={INK}
            strokeOpacity="0.22"
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
        {/* A thread tying a goal to what's blocking it. */}
        <path
          d={`M ${travel.x} ${travel.y} Q 250 360 ${savings.x} ${savings.y}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="5"
          strokeDasharray="2 12"
          strokeLinecap="round"
        />
      </svg>
      {BUBBLES.map((bubble) => (
        <div
          key={bubble.label}
          style={{
            position: "absolute",
            left: bubble.x - bubble.r,
            top: bubble.y - bubble.r,
            width: bubble.r * 2,
            height: bubble.r * 2,
            borderRadius: "50%",
            background: bubble.color,
            border: "5px solid white",
            boxShadow: "0 12px 28px rgba(24, 24, 27, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            fontFamily: "Inter",
            fontWeight: 600,
            // Long names get smaller text so they stay inside the bubble.
            fontSize: bubble.r > 60 ? 24 : bubble.label.length > 7 ? 15 : bubble.r > 42 ? 18 : 15,
            lineHeight: 1.1,
            padding: 8,
          }}
        >
          {bubble.label}
        </div>
      ))}
    </div>
  );
}

function Mark() {
  return (
    <svg width="56" height="56" viewBox="0 0 32 32">
      <g stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.45">
        <line x1="16" y1="16" x2="6" y2="7.5" />
        <line x1="16" y1="16" x2="26.5" y2="9" />
        <line x1="16" y1="16" x2="22" y2="27" />
      </g>
      <path d="M6 7.5 Q 10 22 22 27" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="6" cy="7.5" r="3.2" fill="#9e77ed" />
      <circle cx="26.5" cy="9" r="3.6" fill="#0ea5e9" />
      <circle cx="22" cy="27" r="3" fill="#f43f5e" />
      <circle cx="16" cy="16" r="6.5" fill={INK} />
    </svg>
  );
}

export default async function Image() {
  const [fraunces, interMedium, interSemiBold] = await Promise.all([
    loadFont("Fraunces", 500),
    loadFont("Inter", 500),
    loadFont("Inter", 600),
  ]);
  const host = new URL(SITE_URL).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 56px 0 80px",
          backgroundColor: "#fcfcfd",
          // Soft color glows, then the dotted paper the app uses.
          backgroundImage: [
            "radial-gradient(circle at 8% 0%, rgba(158, 119, 237, 0.30), transparent 42%)",
            "radial-gradient(circle at 92% 10%, rgba(14, 165, 233, 0.24), transparent 40%)",
            "radial-gradient(circle at 60% 100%, rgba(16, 185, 129, 0.18), transparent 45%)",
            "radial-gradient(circle, rgba(24, 24, 27, 0.13) 1.5px, transparent 1.5px)",
          ].join(", "),
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 26px 26px",
          color: INK,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark />
            <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 38, letterSpacing: -1 }}>
              {APP_NAME}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontFamily: "Fraunces",
              fontSize: 80,
              lineHeight: 1.04,
              letterSpacing: -1,
            }}
          >
            {HEADLINE}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 28,
              lineHeight: 1.35,
              color: MUTED,
            }}
          >
            {TAGLINE}
          </div>

          <div style={{ display: "flex", marginTop: 44 }}>
            <div
              style={{
                display: "flex",
                padding: "12px 26px",
                borderRadius: 999,
                background: INK,
                color: "white",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 22,
              }}
            >
              {host}
            </div>
          </div>
        </div>

        <Web />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
        { name: "Inter", data: interSemiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
