import { Routes, Route } from "react-router-dom";
import Game from "./Game";
import Ranking from "./Ranking";
import Tavern from "./Tavern";
import PleasureHouse from "./PleasureHouse";
import WalletConnectionProvider from "./WalletConnectionProvider";

export default function App() {
  return (
    <WalletConnectionProvider>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/tavern" element={<Tavern />} />
        <Route path="/pleasure" element={<PleasureHouse />} />
      </Routes>
    </WalletConnectionProvider>
  );
}
