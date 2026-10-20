import type { TemplateId } from "@/lib/mind-map/templates";

const AREA = "#9e77ed";
const GOAL = "#0ea5e9";
const BLOCKER = "#f43f5e";
const CAUSE = "#f59e0b";
const ACTION = "#10b981";

/** A small drawing of what each template starts with. */
export default function TemplateArt({ template }: { template: TemplateId }) {
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true">
      {template === "blank" && (
        <>
          <circle
            cx="60"
            cy="36"
            r="17"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeDasharray="3 4"
          />
          <circle cx="60" cy="36" r="11" fill="currentColor" />
        </>
      )}

      {template === "life" && (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            const x = 60 + Math.cos(angle) * 27;
            const y = 36 + Math.sin(angle) * 24;
            return (
              <g key={i}>
                <line
                  x1="60"
                  y1="36"
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="1.5"
                />
                <circle cx={x} cy={y} r="6" fill={AREA} />
              </g>
            );
          })}
          <circle cx="60" cy="36" r="10" fill="currentColor" />
        </>
      )}

      {template === "problem" && (
        <>
          <path
            d="M18 36 L42 22 L66 46 L90 24 L108 40"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="36" r="9" fill="currentColor" />
          <circle cx="42" cy="22" r="7" fill={GOAL} />
          <circle cx="66" cy="46" r="6.5" fill={BLOCKER} />
          <circle cx="90" cy="24" r="6" fill={CAUSE} />
          <circle cx="108" cy="40" r="5.5" fill={ACTION} />
        </>
      )}
    </svg>
  );
}
