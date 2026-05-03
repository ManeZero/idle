import { OIL_SELL_PRICE } from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";

export function SellStrip() {
  const oil = useGameStore((s) => s.oil);
  const sellOil = useGameStore((s) => s.sellOil);
  const value = oil * OIL_SELL_PRICE;
  const disabled = oil < 1;

  return (
    <div className="bp-mobile-sell">
      <div className="bp-mobile-sell__info">
        <div className="bp-mobile-sell__lbl">БИРЖА · ${OIL_SELL_PRICE.toFixed(2)} / барр</div>
        <div className="bp-mobile-sell__val tnum">
          {Math.round(oil).toLocaleString("ru-RU")} барр
          <span className="bp-mobile-sell__money">
            = ${Math.round(value).toLocaleString("ru-RU")}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="bp-mobile-sell__btn"
        disabled={disabled}
        onClick={() => sellOil(0.1)}
      >
        10%
      </button>
      <button
        type="button"
        className="bp-mobile-sell__btn"
        disabled={disabled}
        onClick={() => sellOil(0.5)}
      >
        50%
      </button>
      <button
        type="button"
        className="bp-mobile-sell__btn bp-mobile-sell__btn--primary"
        disabled={disabled}
        onClick={() => sellOil(1)}
      >
        ВСЁ
      </button>
    </div>
  );
}
