/**
 * Static poster for the R1 scene. Shown as the Suspense fallback, under
 * prefers-reduced-motion, and on touch / small screens where the live scene is skipped.
 * Pure CSS + inline SVG dot field, theme-aware, no JS cost.
 */
export function HeroPoster({ dark = true }: { dark?: boolean }) {
  const dot = dark ? "rgba(120,200,224,0.45)" : "rgba(31,58,77,0.4)";
  const glow = dark
    ? "radial-gradient(60% 60% at 62% 45%, oklch(0.82 0.13 210 / 0.28), transparent 70%)"
    : "radial-gradient(60% 60% at 62% 45%, oklch(0.55 0.12 220 / 0.18), transparent 70%)";
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: glow }} />
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 400"
      >
        <defs>
          <radialGradient id="poster-fade" cx="60%" cy="45%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="poster-mask">
            <rect width="400" height="400" fill="url(#poster-fade)" />
          </mask>
        </defs>
        <g mask="url(#poster-mask)">
          {Array.from({ length: 90 }).map((_, i) => {
            const seed = (i * 9301 + 49297) % 233280;
            const x = 60 + ((seed % 320) + (i % 7) * 11);
            const y = 40 + (((seed >> 3) % 320) + (i % 5) * 13);
            const cx = x % 400;
            const cy = y % 400;
            const r = 0.7 + ((seed >> 5) % 18) / 10;
            const pulse = i % 17 === 0;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill={pulse ? (dark ? "#9fe8ff" : "#0e7fa8") : dot}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}