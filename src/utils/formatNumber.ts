export function formatNumber(value: number, decimals = 1): string {
  if (value >= 1e6) return value.toExponential(2).replace("e+", "e");
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(decimals);
}
