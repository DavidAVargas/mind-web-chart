import type { CSSProperties } from "react";

type Bubble = {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  type: string;
  color: string;
  parent?: string;
};

/**
 * A small web that grows itself: My Mind in the middle, then an Area, Goal,
 * Blocker, Root cause and Action branch out one by one, and finally a thread
 * ties two branches together. Pure SVG + CSS, so it costs nothing to load.
 */
const BUBBLES: Bubble[] = [
  { id: "mind", x: 260, y: 215, r: 58, label: "My Mind", type: "", color: "" },
  {
    id: "dreams",
    x: 112,
    y: 96,
    r: 40,
    label: "Dreams",
    type: "Area",
    color: "#9e77ed",
    parent: "mind",
  },
  {
    id: "travel",
    x: 66,
    y: 242,
    r: 32,
    label: "Travel",
    type: "Goal",
    color: "#0ea5e9",
    parent: "dreams",
  },
  {
    id: "career",
    x: 410,
    y: 92,
    r: 40,
    label: "Career",
    type: "Area",
    color: "#9e77ed",
    parent: "mind",
  },
  {
    id: "business",
    x: 458,
    y: 238,
    r: 33,
    label: "Own business",
    type: "Goal",
    color: "#0ea5e9",
    parent: "career",
  },
  {
    id: "savings",
    x: 362,
    y: 352,
    r: 30,
    label: "No savings",
    type: "Blocker",
    color: "#f43f5e",
    parent: "business",
  },
  {
    id: "spending",
    x: 218,
    y: 392,
    r: 27,
    label: "Spending",
    type: "Root cause",
    color: "#f59e0b",
    parent: "savings",
  },
  {
    id: "budget",
    x: 92,
    y: 362,
    r: 26,
    label: "Budget weekly",
    type: "Action",
    color: "#10b981",
    parent: "spending",
  },
];

const byId = new Map(BUBBLES.map((bubble) => [bubble.id, bubble]));
/** Seconds between each bubble appearing. */
const STEP = 0.28;
const THREAD_DELAY = BUBBLES.length * STEP + 0.3;

function delay(seconds: number) {
  return { "--delay": `${seconds}s` } as CSSProperties;
}

export default function HeroWeb() {
  return (
    <svg
      viewBox="0 0 520 440"
      className="hero-web h-auto w-full"
      role="img"
      aria-label="A Thoughtspun chart: My Mind in the center, branching into areas, goals, a blocker, its root cause and an action, with a thread linking two branches."
    >
      {/* Branch lines, drawn just before each child bubble appears. */}
      <g
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {BUBBLES.map((bubble, i) => {
          const parent = bubble.parent ? byId.get(bubble.parent) : undefined;
          if (!parent) return null;
          return (
            <line
              key={bubble.id}
              className="hero-web-line"
              x1={parent.x}
              y1={parent.y}
              x2={bubble.x}
              y2={bubble.y}
              pathLength={1}
              style={delay(i * STEP - 0.15)}
            />
          );
        })}
      </g>

      {/* The thread: "No savings" is also what's in the way of Travel. */}
      <path
        className="hero-web-thread"
        d="M 362 352 Q 180 300 66 242"
        fill="none"
        stroke="#10b981"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength={1}
        style={delay(THREAD_DELAY)}
      />
      <g className="hero-web-pop" style={delay(THREAD_DELAY + 0.7)}>
        <rect x="160" y="282" width="104" height="26" rx="13" fill="#10b981" />
        <text
          x="212"
          y="299.5"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="white"
        >
          also blocks Travel
        </text>
      </g>

      {BUBBLES.map((bubble, i) => {
        const isMind = bubble.id === "mind";
        return (
          <g key={bubble.id} className="hero-web-pop" style={delay(i * STEP)}>
            <circle
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.r}
              fill={isMind ? "var(--foreground)" : bubble.color}
              className={isMind ? undefined : "hero-web-bubble"}
            />
            {isMind && (
              <text
                x={bubble.x}
                y={bubble.y - 10}
                textAnchor="middle"
                fontSize="22"
              >
                🧠
              </text>
            )}
            <text
              x={bubble.x}
              y={isMind ? bubble.y + 18 : bubble.y + 4}
              textAnchor="middle"
              fontSize={isMind ? 16 : bubble.r > 30 ? 12 : 10.5}
              fontWeight={600}
              fill={isMind ? "var(--background)" : "white"}
            >
              {bubble.label}
            </text>
            {!isMind && (
              <text
                x={bubble.x}
                y={bubble.y - bubble.r - 7}
                textAnchor="middle"
                fontSize="10"
                fontWeight={500}
                fill="currentColor"
                opacity="0.55"
              >
                {bubble.type}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
