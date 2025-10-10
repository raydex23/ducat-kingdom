import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";

import WalletConnectionProvider from "./WalletConnectionProvider";
import Game from "./Game";
import Ranking from "./Ranking";
import Tavern from "./Tavern";
import PleasureHouse from "./PleasureHouse";
import Landing from "./Landing";

function HomeRouter() {
  const { connected } = useWallet();

  // proste sprawdzenie – jeśli wallet połączony, gra, inaczej landing
  return connected ? <Game /> : <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletConnectionProvider>
        <Routes>
          <Route path="/" element={<HomeRouter />} />
          <Route path="/game" element={<Game />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/tavern" element={<Tavern />} />
          <Route path="/pleasure" element={<PleasureHouse />} />
          <Route path="*" element={<HomeRouter />} />
        </Routes>
      </WalletConnectionProvider>
    </BrowserRouter>
  );
}