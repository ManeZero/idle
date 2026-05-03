import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 900;

/**
 * Возвращает true если ширина окна меньше mobile-breakpoint.
 * Подписывается на resize и обновляет состояние.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isMobile;
}
