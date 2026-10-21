const PURPLE = "#9e77ed";
const SKY = "#0ea5e9";
const ROSE = "#f43f5e";
const AMBER = "#f59e0b";
const GREEN = "#10b981";

function StepOne() {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden="true">
      <circle
        cx="100"
        cy="60"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeDasharray="4 6"
      />
      <circle cx="100" cy="60" r="30" fill="currentColor" />
      <text x="100" y="56" textAnchor="middle" fontSize="16">
        🧠
      </text>
      <text
        x="100"
        y="74"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="var(--background)"
      >
        My Mind
      </text>
    </svg>
  );
}

function StepTwo() {
  const kids = [
    { x: 40, y: 30, c: PURPLE },
    { x: 160, y: 28, c: SKY },
    { x: 166, y: 94, c: ROSE },
    { x: 38, y: 92, c: AMBER },
  ];
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden="true">
      {kids.map((kid) => (
        <line
          key={kid.c}
          x1="100"
          y1="60"
          x2={kid.x}
          y2={kid.y}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="2"
        />
      ))}
      {kids.map((kid) => (
        <circle key={kid.c} cx={kid.x} cy={kid.y} r="14" fill={kid.c} />
      ))}
      <circle cx="100" cy="60" r="22" fill="currentColor" />
    </svg>
  );
}

function StepThree() {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden="true">
      <g stroke="currentColor" strokeOpacity="0.25" strokeWidth="2">
        <line x1="100" y1="60" x2="40" y2="30" />
        <line x1="100" y1="60" x2="160" y2="28" />
        <line x1="160" y1="28" x2="166" y2="94" />
        <line x1="40" y1="30" x2="38" y2="92" />
      </g>
      <path
        d="M 166 94 Q 100 125 38 92"
        fill="none"
        stroke={GREEN}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="40" cy="30" r="13" fill={PURPLE} />
      <circle cx="160" cy="28" r="13" fill={SKY} />
      <circle cx="166" cy="94" r="12" fill={ROSE} />
      <circle cx="38" cy="92" r="12" fill={AMBER} />
      <circle cx="100" cy="60" r="20" fill="currentColor" />
      <circle cx="102" cy="110" r="4" fill={GREEN} />
    </svg>
  );
}

const STEPS = [
  {
    title: "Start with what's on your mind",
    body: "Name the center bubble: your life, a project, a big decision. Pick an emoji, or start from a template.",
    art: <StepOne />,
  },
  {
    title: "Branch it out",
    body: "Add Areas, Goals, Blockers, Root causes and Actions. Each type has its own color, so the shape of your thinking shows at a glance.",
    art: <StepTwo />,
  },
  {
    title: "Tie it together with threads",
    body: "Connect bubbles across branches and write why they're linked. That's where the real patterns, and the real answers, show up.",
    art: <StepThree />,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <div className="reveal max-w-2xl">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          How it works
        </p>
        <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          From a tangle to a plan in three steps.
        </h2>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="reveal border-border bg-card/80 relative flex flex-col rounded-3xl border p-6 shadow-sm backdrop-blur"
          >
            <span
              className="font-display text-muted-foreground/40 absolute top-4 right-6 text-6xl leading-none font-medium"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="bg-paper bg-muted/40 text-foreground mb-6 rounded-2xl p-4">
              {step.art}
            </div>
            <h3 className="text-lg font-semibold">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
