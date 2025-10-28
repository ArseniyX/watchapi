export const chartTheme = {
  axisColor: "hsl(var(--muted-foreground))",
  gridColor: "hsl(var(--border))",
} as const;

export const chartTooltipStyles = {
  content: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  },
  label: {
    color: "hsl(var(--foreground))",
  },
} as const;
