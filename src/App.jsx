// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";

import Game from "./Game";
import Ranking from "./Ranking";
import Tavern from "./Tavern";
import PleasureHouse from "./PleasureHouse";
import Landing from "./Landing"; // upewnij się, że ścieżka i nazwa pliku są dokładne!

export default function App() {
  const { connected } = useWallet();

  return (
    <Routes>
      {/* Strona główna */}
      <Route
        path="/"
        element={connected ? <Navigate to="/game" replace /> : <Landing />}
      />

      {/* Główna gra */}
      <Route path="/game" element={<Game />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/tavern" element={<Tavern />} />
      <Route path="/pleasure" element={<PleasureHouse />} />

      {/* fallback — przekierowanie */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
