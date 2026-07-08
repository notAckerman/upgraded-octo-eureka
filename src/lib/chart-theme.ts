/**
 * Recharts custom theme for NeonLLM.
 * One accent + two neutrals. 1px grid lines at 6% opacity.
 * Mount animation under 400ms. No rainbow palettes.
 */

export const CHART_THEME = {
  light: {
    bg: "transparent",
    grid: "rgba(0, 0, 0, 0.06)",
    text: "#475569",
    accent: "oklch(0.55 0.12 220)",
    accentLight: "oklch(0.55 0.12 220 / 0.15)",
    neutral1: "#94a3b8",
    neutral2: "#cbd5e1",
    positive: "oklch(0.78 0.14 160)",
    warning: "oklch(0.82 0.15 85)",
    danger: "oklch(0.66 0.2 25)",
    tooltipBg: "#ffffff",
    tooltipBorder: "rgba(0, 0, 0, 0.09)",
    tooltipText: "#0f172a",
  },
  dark: {
    bg: "transparent",
    grid: "rgba(255, 255, 255, 0.06)",
    text: "#94a3b8",
    accent: "oklch(0.82 0.13 210)",
    accentLight: "oklch(0.82 0.13 210 / 0.15)",
    neutral1: "#475569",
    neutral2: "#64748b",
    positive: "oklch(0.78 0.14 160)",
    warning: "oklch(0.82 0.15 85)",
    danger: "oklch(0.66 0.2 25)",
    tooltipBg: "#14141e",
    tooltipBorder: "rgba(255, 255, 255, 0.08)",
    tooltipText: "#f1f5f9",
  },
} as const;

export type ChartThemeKey = keyof typeof CHART_THEME;

/**
 * Returns Recharts-compatible style objects for a given theme key.
 */
export function getChartStyles(theme: ChartThemeKey) {
  const t = CHART_THEME[theme];
  return {
    cartesianGrid: {
      stroke: t.grid,
      strokeDasharray: "0",
    },
    axis: {
      tick: { fill: t.text, fontSize: 12, fontFamily: "JetBrains Mono, monospace" },
      axisLine: { stroke: t.grid },
      tickLine: false,
    },
    tooltip: {
      contentStyle: {
        backgroundColor: t.tooltipBg,
        border: `1px solid ${t.tooltipBorder}`,
        borderRadius: 10,
        color: t.tooltipText,
        fontSize: 13,
        fontFamily: "Onest, Inter, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
    colors: {
      accent: t.accent,
      accentLight: t.accentLight,
      neutral1: t.neutral1,
      neutral2: t.neutral2,
      positive: t.positive,
      warning: t.warning,
      danger: t.danger,
    },
  };
}