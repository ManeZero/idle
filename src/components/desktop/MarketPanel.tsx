import { OIL_SELL_PRICE } from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";

export function MarketPanel() {
  const oil = useGameStore((s) => s.oil);
  const sellOil = useGameStore((s) => s.sellOil);
  const value = oil * OIL_SELL_PRICE;
  const disabled = oil < 1;

  return (
    <div className="bp-panel">
      <div className="bp-panel__head">
        <span className="bp-panel__title">БИРЖА</span>
        <span className="bp-panel__sub">${OIL_SELL_PRICE.toFixed(2)} / барр</span>
      </div>
      <div className="bp-market__value tnum">
        {Math.round(oil).toLocaleString("ru-RU")} барр
        <span className="bp-market__money">= ${Math.round(value).toLocaleString("ru-RU")}</span>
      </div>
      <div className="bp-market__actions">
        <button type="button" className="bp-btn" disabled={disabled} onClick={() => sellOil(0.1)}>
          10%
        </button>
        <button type="button" className="bp-btn" disabled={disabled} onClick={() => sellOil(0.5)}>
          50%
        </button>
        <button
          type="button"
          className="bp-btn bp-btn--primary"
          disabled={disabled}
          onClick={() => sellOil(1)}
        >
          ПРОДАТЬ ВСЁ
        </button>
      </div>
    </div>
  );
}
