// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";

import Game from "./Game";
import Ranking from "./Ranking";
import Tavern from "./Tavern";
import PleasureHouse from "./PleasureHouse";
import WalletConnectionProvider from "./WalletConnectionProvider";
import Landing from "./Landing"; // <- upewnij się, że ścieżka jest poprawna

function HomeRouter() {
  const { connected } = useWallet();

  // Bez kombinacji — proste rozróżnienie
  if (connected) {
    return <Game />;
  } else {
    return <Landing />;
  }
}

export default function App() {
  return (
    <WalletConnectionProvider>
      <Routes>
        {/* root shows Landing for disconnected users, Game for connected */}
        <Route path="/" element={<HomeRouter />} />

        {/* other routes (you can protect them similarly if needed) */}
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/tavern" element={<Tavern />} />
        <Route path="/pleasure" element={<PleasureHouse />} />
      </Routes>
    </WalletConnectionProvider>
  );
}
