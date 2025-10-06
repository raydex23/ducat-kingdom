import { Routes, Route } from "react-router-dom";
import Game from "./Game";
import Ranking from "./Ranking";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="/ranking" element={<Ranking />} />
    </Routes>
  );
}