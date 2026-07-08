/**
 * Узел brand mark: three connected nodes (a small "knot"/hub).
 * Single simple geometric glyph, uses currentColor for strokes and --accent for the hub.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden
      role="presentation"
    >
      <path
        d="M6 6 L12 12 L18 5 M12 12 L7 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="18" cy="5" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="7" cy="19" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="12" r="2.6" fill="var(--accent)" />
    </svg>
  );
}