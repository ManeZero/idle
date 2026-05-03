/**
 * Форматирование меток станций под P&ID-стиль.
 * id=1 → "PIT-001", "W-01"
 */
export function pitCode(id: number): string {
  return `PIT-${id.toString().padStart(3, "0")}`;
}

export function wellCode(id: number): string {
  return `W-${id.toString().padStart(2, "0")}`;
}

/** Форматирование таймера: 80 → "01:20", 8 → "00:08" */
export function formatTimer(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
