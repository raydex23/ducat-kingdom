import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Ranking() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("ducat_game_en"));
    const yourName = "You";

    const mock = [
      { name: "Lord_Tarin", power: 310, level: 4, balance: 8000 },
      { name: "Lady_Anya", power: 260, level: 3, balance: 6000 },
      { name: "Baron_Gor", power: 180, level: 2, balance: 4000 },
      { name: "Sir_Eryk", power: 120, level: 2, balance: 2500 },
      { name: yourName, power: local?.miningPower || 50, level: local?.kingdomLevel || 1, balance: local?.balance || 0 },
      { name: "Duke_Rhen", power: 75, level: 1, balance: 1200 },
    ];

    mock.sort((a, b) => b.power - a.power);
    setPlayers(mock);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1a17] via-[#2a2520] to-[#1a1713] text-gray-200 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400">🏆 Kingdom Ranking</h1>
          <Link
            to="/"
            className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-black font-semibold transition"
          >
            ← Back to Game
          </Link>
        </div>

        <div className="bg-[#2a2520]/80 backdrop-blur rounded-2xl border border-[#3b332b] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead className="bg-[#3b332b]/70 text-amber-300">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Player</th>
                <th className="p-3 text-right">Power</th>
                <th className="p-3 text-right">Kingdom</th>
                <th className="p-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={p.name}
                  className={`border-t border-[#3b332b] ${
                    p.name === "You" ? "bg-amber-700/20 text-amber-200 font-semibold" : "hover:bg-[#3b332b]/30"
                  }`}
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-right">{p.power}</td>
                  <td className="p-3 text-right">Lv {p.level}</td>
                  <td className="p-3 text-right">{Math.floor(p.balance)} $DUCAT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}