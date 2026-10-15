import { useEffect, useRef, useState } from "react";

/** Decorative demos only run while visible, and respect the visitor's motion setting. */
export function useDemoClock(interval = 260) {
  const ref = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (visible && !motion.matches && !document.hidden)
        timer = setInterval(() => setTick((n) => n + 1), interval);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [interval]);
  return { ref, tick };
}

export function ForwardMarch() {
  const { ref, tick } = useDemoClock();
  const head = tick === 0 ? 10 : (tick % 25) - 2;
  return (
    <div className="ts-forward-march" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 400 400">
        {Array.from({ length: 225 }, (_, i) => {
          const x = i % 15;
          const y = Math.floor(i / 15);
          const distance = head - Math.abs(y - 7) - x;
          const opacity =
            Math.abs(y - 7) <= 4 && distance >= 0 && distance <= 5
              ? [1, 1, 0.45, 0.28, 0.16, 0.08][distance]
              : 0;
          return (
            <g key={i}>
              <rect
                x={x * 26.6}
                y={y * 26.6}
                width="23"
                height="23"
                fill="var(--ts-chip)"
              />
              {opacity > 0 && (
                <rect
                  x={x * 26.6}
                  y={y * 26.6}
                  width="23"
                  height="23"
                  fill="var(--ts-ink)"
                  opacity={opacity}
                />
              )}
            </g>
          );
        })}
        <text
          x="6"
          y="391"
          fill="var(--ts-subtle)"
          fontSize="11"
          fontFamily="Tessera Mono, monospace"
        >
          deploy #{128 + tick} ✓
        </text>
      </svg>
    </div>
  );
}

const commands = [
  'table("posts", { id, title, author, createdAt })',
  "INSERT INTO posts VALUES (…) ",
  'posts.where({ author: "ada" }).all()',
  "posts.subscribe(onChange)",
];
export function PixelDemo() {
  const { ref, tick } = useDemoClock(100);
  const elapsed = tick % 135;
  const active = elapsed < 30 ? 0 : elapsed < 56 ? 1 : elapsed < 88 ? 2 : 3;
  const columns = [
    { label: "id", start: 0, span: 2 },
    { label: "title", start: 3, span: 6 },
    { label: "author", start: 10, span: 3 },
    { label: "createdAt", start: 14, span: 3 },
  ];
  return (
    <div
      className="ts-pixel-demo"
      ref={ref}
      aria-label="Schema, data, query and live subscription demonstration"
    >
      <div className="ts-pixel-line">
        <code>
          {commands[active].slice(
            0,
            tick === 0
              ? undefined
              : Math.min(
                  commands[active].length,
                  (elapsed - [0, 30, 56, 88][active]) * 3 + 1,
                ),
          )}
        </code>
        <span className="ts-cursor" />
      </div>
      <svg
        className="ts-schema-pixels"
        viewBox="0 0 420 340"
        aria-hidden="true"
      >
        {columns.map((col, ci) => (
          <g key={col.label}>
            <text
              x={24 + col.start * 22}
              y="28"
              fontSize="10"
              fill="var(--ts-subtle)"
              fontFamily="Tessera Mono, monospace"
            >
              {col.label}
            </text>
            {Array.from({ length: col.span * 11 }, (_, i) => {
              const row = Math.floor(i / col.span),
                x = i % col.span;
              const hasValue =
                row === 0 || x < 1 + ((row * 7 + ci * 11) % col.span);
              const filled =
                hasValue &&
                (row === 0 || (active > 0 && row <= Math.max(0, elapsed - 30)));
              const selected = active === 2 && [1, 4, 7].includes(row);
              const inserted = active === 3 && row === 1;
              return (
                <rect
                  key={i}
                  x={24 + (col.start + x) * 22}
                  y={40 + row * 23}
                  width="18"
                  height="18"
                  fill={
                    inserted
                      ? "#c4825e"
                      : filled
                        ? "var(--ts-ink)"
                        : "var(--ts-chip)"
                  }
                  opacity={
                    filled && active === 2 && !selected && row > 0
                      ? 0.14
                      : filled && row > 0
                        ? 0.78
                        : 1
                  }
                />
              );
            })}
          </g>
        ))}
        <text
          x="24"
          y="322"
          fontSize="11"
          fill="var(--ts-subtle)"
          fontFamily="Tessera Mono, monospace"
        >
          {
            [
              "4 columns · typed",
              "posts · 10 rows",
              "3 rows · Post[]",
              "● insert → 2 subscribers · 38 ms",
            ][active]
          }
        </text>
      </svg>
      <div className="ts-pixel-stages" aria-hidden="true">
        {["schema", "data", "query", "live"].map((label, i) => (
          <span key={label} className={i === active ? "is-active" : ""}>
            {i + 1} {label}
          </span>
        ))}
      </div>
    </div>
  );
}
