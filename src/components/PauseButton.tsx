import { useGameStore } from "@/stores/gameStore";

export function PauseButton() {
  const paused = useGameStore((state) => state.paused);
  const togglePause = useGameStore((state) => state.togglePause);

  return (
    <button
      className={`pause-button${paused ? " pause-button--paused" : ""}`}
      onClick={togglePause}
      type="button"
    >
      {paused ? "Продолжить" : "Пауза"}
    </button>
  );
}
