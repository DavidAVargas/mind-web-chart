import {
  Check,
  Lock,
  Redo2,
  Search,
  Smartphone,
  Sparkles,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import TemplateArt from "@/components/charts/template-art";
import { KEY_COLORS, KEY_ICONS, LIFE_KEY } from "@/lib/mind-map/chart-key";
import { TEMPLATES, type TemplateId } from "@/lib/mind-map/templates";
import { cn } from "@/lib/utils";

function Card({
  title,
  body,
  children,
  className,
}: {
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "reveal border-border bg-card/80 flex flex-col overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur",
        className,
      )}
    >
      {children && <div className="mb-6 flex-1">{children}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
        {body}
      </p>
    </li>
  );
}

function TypeChips() {
  return (
    <ul className="flex flex-wrap gap-2">
      {LIFE_KEY.map((type) => {
        const Icon = KEY_ICONS[type.icon];
        const color = KEY_COLORS[type.color].hex;
        return (
          <li
            key={type.id}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white shadow-sm"
            style={{ background: color }}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {type.label}
          </li>
        );
      })}
    </ul>
  );
}

function ThreadArt() {
  return (
    <svg viewBox="0 0 260 120" className="w-full" aria-hidden="true">
      <path
        d="M 40 30 L 130 60 M 130 60 Q 170 60 220 28 M 130 60 Q 170 64 214 98"
        fill="none"
        stroke="#10b981"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="130" cy="60" r="6" fill="#10b981" />
      <circle cx="40" cy="30" r="16" fill="#f43f5e" />
      <circle cx="220" cy="28" r="14" fill="#0ea5e9" />
      <circle cx="214" cy="98" r="14" fill="#0ea5e9" />
      <g>
        <rect
          x="58"
          y="78"
          width="118"
          height="30"
          rx="10"
          fill="var(--card)"
          stroke="#10b981"
          strokeWidth="2"
        />
        <text
          x="117"
          y="97"
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
        >
          blocks both goals
        </text>
      </g>
    </svg>
  );
}

function DoneArt() {
  const actions = [
    { label: "Budget weekly", done: true },
    { label: "Open savings", done: true },
    { label: "Side project", done: false },
  ];
  return (
    <div className="flex flex-col gap-2">
      {actions.map(({ label, done }) => (
        <div
          key={label}
          className="border-border bg-background flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm"
        >
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full border-2 border-emerald-500",
              done ? "bg-emerald-500 text-white" : "text-transparent",
            )}
          >
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className={cn(done && "text-muted-foreground line-through")}>
            {label}
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-2">
        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
          <div className="h-full w-2/3 rounded-full bg-emerald-500" />
        </div>
        <span className="text-muted-foreground text-xs">2/3</span>
      </div>
    </div>
  );
}

function TemplatesArt() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(TEMPLATES) as TemplateId[]).map((id) => (
        <div key={id} className="text-center">
          <div className="bg-paper bg-muted/50 text-foreground aspect-[5/3] rounded-xl p-1.5">
            <TemplateArt template={id} />
          </div>
          <span className="text-muted-foreground mt-1 block text-xs">
            {TEMPLATES[id].label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ToolsArt() {
  const tools = [
    { icon: Undo2, label: "Undo" },
    { icon: Redo2, label: "Redo" },
    { icon: Search, label: "Search" },
    { icon: Sparkles, label: "Tidy up" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tools.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="border-border bg-background flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm"
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <div className="reveal max-w-2xl">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Features
        </p>
        <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          Everything you need to think clearly. Nothing you don’t.
        </h2>
      </div>

      <ul className="mt-12 grid gap-5 md:grid-cols-6">
        <Card
          title="A key for every chart"
          body="Every chart has its own key of bubble types, each with a color and icon: Areas and Goals for your life, Options, Pros and Cons for a trip, or your own. Bubbles shrink the further out they go, so your map always reads like a web."
          className="md:col-span-4"
        >
          <TypeChips />
        </Card>
        <Card
          title="Threads"
          body="One thread can tie many bubbles together, with a note on why. Hover it and everything it touches lights up."
          className="md:col-span-2"
        >
          <ThreadArt />
        </Card>
        <Card
          title="Actions you can tick off"
          body="Turn insight into steps, mark them done, and watch your progress on every chart."
          className="md:col-span-2"
        >
          <DoneArt />
        </Card>
        <Card
          title="Start from a template"
          body="A blank page, a Life map, or a Problem solver that walks you from goal to first step."
          className="md:col-span-2"
        >
          <TemplatesArt />
        </Card>
        <Card
          title="Fast to shape"
          body="Drag a bubble onto another to move a whole branch. Collapse, search, tidy up, and undo anything."
          className="md:col-span-2"
        >
          <ToolsArt />
        </Card>
        <Card
          title="Yours, and only yours"
          body="Your charts are saved to your account, so your work is there whenever you sign in. They're private to you and never shared."
          className="md:col-span-3"
        >
          <Lock className="size-8 text-[#9e77ed]" aria-hidden="true" />
        </Card>
        <Card
          title="Made for your phone too"
          body="Pinch, drag and tap: every control works by touch, so your web is with you wherever a thought hits."
          className="md:col-span-3"
        >
          <Smartphone className="size-8 text-[#0ea5e9]" aria-hidden="true" />
        </Card>
      </ul>
    </section>
  );
}
