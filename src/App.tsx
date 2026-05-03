import { DesktopApp } from "@/components/desktop/DesktopApp";
import { MobileApp } from "@/components/mobile/MobileApp";
import { useGameTick } from "@/hooks/useGameTick";
import { useIsMobile } from "@/hooks/useIsMobile";
import "./App.css";

function App() {
  useGameTick();
  const isMobile = useIsMobile();
  return isMobile ? <MobileApp /> : <DesktopApp />;
}

export default App;
