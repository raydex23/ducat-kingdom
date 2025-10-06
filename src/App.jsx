import { Routes, Route } from "react-router-dom";
import Game from "./Game";
import Ranking from "./Ranking";
import WalletConnectionProvider from "./WalletConnectionProvider";

export default function App() {
  return (
    <WalletConnectionProvider>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </WalletConnectionProvider>
  );
}
